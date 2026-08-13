// cloudfunctions/admin/bpmn/application-form/sys/submit.js
const HrmService = require('../../../../common/pub/class/hrm-service.js');

module.exports = {
	main: async (event) => {
		let {
			data = {}, util, filterResponse, originalParam
		} = event;
		let {
			customUtil,
			uniID,
			config,
			pubFun,
			vk,
			db,
			_
		} = util;
		let {
			uid,
			userInfo
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		const {
			form_type_code,
			form_data,
			calculated_values,
			title,
			_id
		} = data;

		if (!form_type_code) return {
			code: -1,
			msg: '表单类型编码不能为空'
		};
		if (!form_data) return {
			code: -1,
			msg: '表单数据不能为空'
		};

		try {
			const hrmService = new HrmService(vk, db);
			const employeeInfo = await hrmService.getEmployeeInfoByUsername(userInfo.username);
			form_data.employeeInfo = employeeInfo;

			const formTypeRes = await db.collection('bpmn-form-type')
				.where({
					code: form_type_code,
					status: 'active'
				})
				.get();
			if (formTypeRes.data.length === 0) return {
				code: -1,
				msg: '表单类型不存在或已停用'
			};
			const formType = formTypeRes.data[0];

			const applicationTitle = `${employeeInfo.employee_name}-${title}`;
			const applicationData = {
				form_type_code,
				applicant_id: employeeInfo.employee_id,
				applicant_name: employeeInfo.employee_name,
				applicant_department: employeeInfo.department_name || '',
				applicant_level: employeeInfo.position_level || '',
				applicant_roles: userInfo.role || [],
				title: applicationTitle,
				form_data,
				calculated_values: calculated_values || {},
				status: 'pending',
				update_date: Date.now(),
				updat_id: uid
			};

			let form_id = _id;
			if (vk.pubfn.isNull(form_id)) {
				form_id = await vk.baseDao.add({
					dbName: "bpmn-application-form",
					dataJson: applicationData
				});
			}

			if (form_id) {
				const processResult = await createCompleteProcess(
					form_id, form_type_code, form_data, calculated_values, uid, vk, db, userInfo
				);

				if (processResult.success) {
					await vk.baseDao.updateById({
						dbName: "bpmn-application-form",
						id: form_id,
						dataJson: {
							...applicationData,
							process_definition_key: processResult.process_definition_key,
							current_task: processResult.current_task,
							process_instance_id: processResult.instance_id
						}
					});

					// 通知第一个节点的所有处理人（会签时会有多个任务）
					const firstNodeTasks = processResult.tasks.filter(t => t.sequence === 1);
					for (const task of firstNodeTasks) {
						await sendTaskNotification(vk, form_id, task, formType.name,
							`您有新的待办任务：${task.task_name}`);
					}

					res.data = {
						application_id: form_id,
						process_instance_id: processResult.instance_id,
						tasks: processResult.tasks
					};
					res.msg = `${formType.name}提交成功`;
				} else {
					//不要删除原草稿状态的申请表
					// await vk.baseDao.deleteById({
					// 	dbName: "bpmn-application-form",
					// 	id: form_id
					// });
					return {
						code: -1,
						msg: `流程创建失败: ${processResult.message}`
					};
				}
			} else {
				return {
					code: -1,
					msg: '申请提交失败'
				};
			}
		} catch (error) {
			return {
				code: -1,
				msg: error.message
			};
		}
		return res;
	}
}

/**
 * 创建完整签核流程 - 支持会签、通知、角色/部门多选
 * 修改：通知节点不创建任务，只发送知会通知，流程自动跳过
 */
async function createCompleteProcess(applicationId, formTypeCode, formData, calculatedValues, uid, vk, db, userInfo) {
	try {
		const simulateResult = await vk.callFunction({
			url: 'admin/bpmn/process-engine/pub/simulate',
			title: '流程试算中...',
			data: {
				form_type_code: formTypeCode,
				form_data: formData,
				calculated_values: calculatedValues,
				userInfo: userInfo
			}
		});
		if (simulateResult.code !== 0) return {
			success: false,
			message: simulateResult.msg
		};

		const simulationData = simulateResult.data;
		const processDefinitionKey = simulationData.process_definition.key;

		const processDefRes = await db.collection('bpmn-definition')
			.where({
				key: processDefinitionKey,
				status: 'active'
			})
			.orderBy('version', 'desc')
			.limit(1)
			.get();
		if (processDefRes.data.length === 0) return {
			success: false,
			message: '流程定义不存在或已停用'
		};
		const processDefinition = processDefRes.data[0];

		const instanceData = {
			process_definition_key: processDefinitionKey,
			application_id: applicationId,
			business_key: applicationId,
			start_time: Date.now(),
			status: 'active',
			variables: {
				...formData,
				...calculatedValues,
				applicant_id: userInfo.username,
				form_type_code: formTypeCode
			},
			simulation_result: simulationData,
			complete_flow_path: simulationData.path,
			all_nodes: simulationData.nodes,
			current_tasks: [],
			update_date: Date.now()
		};
		const instanceId = await vk.baseDao.add({
			dbName: "bpmn-instance",
			dataJson: instanceData
		});

		// 过滤出需要创建任务的节点（userTask / approval / review）
		const allActionNodes = simulationData.nodes.filter(node =>
			(node.node_type === 'userTask' || node.node_type === 'approval' || node.node_type === 'review') &&
			(node.estimated_assignee || (node.estimated_assignees && node.estimated_assignees.length > 0))
		);

		let tasks = [];
		let firstTask = null;
		let currentTaskName = null;
		let taskSequence = 0;

		for (let i = 0; i < allActionNodes.length; i++) {
			const taskNode = allActionNodes[i];
			const defNode = processDefinition.nodes.find(n => n.node_key === taskNode.node_key);
			if (!defNode) continue;

			const isReview = defNode.node_type === 'review';
			const actions = isReview ? ['confirm'] : (defNode.actions || ['approve', 'reject']);
			const requiredApprovals = isReview ? 1 : (defNode.required_approvals || 1);

			// 直接使用模拟结果中的负责人
			let approvers = taskNode.estimated_assignees || [];
			if (approvers.length === 0 && taskNode.estimated_assignee) {
				approvers = [taskNode.estimated_assignee];
			}
			if (approvers.length === 0) {
				throw new Error(`节点“${defNode.node_name}”在模拟中未估算出负责人，请检查模拟逻辑`);
			}

			taskSequence++;
			const taskStatus = taskSequence === 1 ? 'pending' : 'waiting';

			for (let j = 0; j < approvers.length; j++) {
				const assignee = approvers[j];
				const taskData = buildTaskData(
					instanceId, applicationId, defNode, assignee, requiredApprovals, 0,
					actions, taskSequence, allActionNodes.length, null, false, taskStatus
				);
				taskData.participants = approvers.map(a => a.id);
				const taskId = await vk.baseDao.add({
					dbName: "bpmn-task",
					dataJson: taskData
				});

				const taskInfo = {
					task_id: taskId,
					task_name: defNode.node_name,
					assignee,
					status: taskStatus,
					sequence: taskSequence
				};
				tasks.push(taskInfo);

				if (taskSequence === 1 && j === 0) {
					firstTask = taskInfo;
					currentTaskName = defNode.node_name;
				}

				await vk.baseDao.add({
					dbName: "bpmn-task-history",
					dataJson: {
						task_id: taskId,
						application_id: applicationId,
						operator_id: uid,
						operator_name: userInfo.username,
						action: 'create',
						operation_time: Date.now(),
						task_data: {
							sequence: taskSequence,
							total: allActionNodes.length,
							node_info: defNode
						}
					}
				});
			}
		}

		if (firstTask) {
			await vk.baseDao.updateById({
				dbName: "bpmn-instance",
				id: instanceId,
				dataJson: {
					current_tasks: [{
						task_id: firstTask.task_id,
						task_name: firstTask.task_name,
						assignee: firstTask.assignee.id,
						create_time: Date.now()
					}]
				}
			});
		}

		return {
			success: true,
			instance_id: instanceId,
			process_definition_key: processDefinitionKey,
			current_task: currentTaskName,
			first_task: firstTask,
			tasks: tasks,
			total_tasks: tasks.length
		};
	} catch (error) {
		console.error('创建完整签核流程失败:', error);
		return {
			success: false,
			message: error.message
		};
	}
}

function buildTaskData(instanceId, applicationId, defNode, assignee, requiredApprovals, currentApprovals, actions,
	sequence, totalTasks, parentTaskId, isAddSign, status = 'pending') {
	return {
		instance_id: instanceId,
		application_id: applicationId,
		task_key: defNode.node_key,
		task_name: defNode.node_name,
		node_type: defNode.node_type,
		assignee: assignee.id,
		assignee_name: assignee.name,
		assignee_type: defNode.assignee_type,
		candidate_users: defNode.candidate_users || [],
		candidate_groups: defNode.candidate_groups || [],
		status: status, // 使用传入的状态
		actions: actions,
		sequence: sequence + 1,
		total_tasks: totalTasks,
		update_date: Date.now(),
		due_date: defNode.time_limit ? Date.now() + (defNode.time_limit * 60 * 60 * 1000) : null,
		task_data: {
			node_info: defNode,
			previous_tasks: sequence > 0 ? [defNode.node_key] : [],
			next_tasks: sequence < totalTasks - 1 ? [defNode.node_key] : []
		},
		required_approvals: requiredApprovals,
		current_approvals: currentApprovals,
		parent_task_id: parentTaskId || null,
		is_add_sign: isAddSign || false,
		participants: []
	};
}

async function resolveApprovers(node, variables, vk, db, employeeInfo) {
	const hrmService = new HrmService(vk, db);
	const assigneeType = node.assignee_type;
	const assigneeValue = node.assignee_value;

	let values = [];
	if (Array.isArray(assigneeValue)) {
		values = assigneeValue;
	} else if (assigneeValue) {
		values = [assigneeValue];
	}

	let approvers = [];

	for (const val of values) {
		switch (assigneeType) {
			case 'role':
				const roleUsers = await db.collection('uni-id-users')
					.where({
						role: val
					})
					.get();
				for (const u of (roleUsers.data || [])) {
					const emp = await hrmService.getEmployeeInfoByUsername(u.username);
					if (emp) approvers.push({
						id: emp.employee_id,
						name: emp.employee_name || u.username,
						type: 'role'
					});
				}
				break;

			case 'department':
				const dept = await db.collection('hrm-departments')
					.where({
						department_id: val
					})
					.get();
				if (dept.data.length > 0) {
					const deptInfo = dept.data[0];
					if (deptInfo.department_manager_id) {
						const manager = await hrmService.getEmployeeInfoByUsername(deptInfo.department_manager_id);
						if (manager) {
							approvers.push({
								id: manager.employee_id,
								name: manager.employee_name || deptInfo.department_manager_name,
								type: 'department'
							});
						}
					}
				}
				break;

			case 'variable':
				const varValue = getValueFromData(val, variables, {});
				if (Array.isArray(varValue)) {
					for (const v of varValue) {
						const emp = await hrmService.getEmployeeInfoByUsername(v);
						if (emp) approvers.push({
							id: emp.employee_id,
							name: emp.employee_name || v,
							type: 'variable'
						});
					}
				} else if (varValue) {
					const emp = await hrmService.getEmployeeInfoByUsername(varValue);
					if (emp) approvers.push({
						id: emp.employee_id,
						name: emp.employee_name || varValue,
						type: 'variable'
					});
				}
				break;

			case 'previous':
				break;
		}
	}

	if (node.candidate_users && node.candidate_users.length > 0) {
		approvers = [];
		for (const username of node.candidate_users) {
			const emp = await hrmService.getEmployeeInfoByUsername(username);
			if (emp) approvers.push({
				id: emp.employee_id,
				name: emp.employee_name || username,
				type: 'user'
			});
		}
	}

	if (approvers.length === 0) {
		const managerId = employeeInfo.manager_id;
		if (managerId && managerId !== employeeInfo.employee_id) {
			approvers.push({
				id: managerId,
				name: employeeInfo.manager_name || '部门主管',
				type: 'default'
			});
		} else {
			throw new Error(`节点“${node.node_name}”未配置负责人，且无法找到合适的默认审批人`);
		}
	}

	const uniqueMap = new Map();
	for (const a of approvers) {
		if (!uniqueMap.has(a.id)) uniqueMap.set(a.id, a);
	}
	return Array.from(uniqueMap.values());
}

function getValueFromData(field, formData, calculatedValues) {
	if (!field) return undefined;
	const fields = field.split('.');
	let value = {
		...formData,
		...calculatedValues
	};
	for (const f of fields) {
		if (value && typeof value === 'object' && f in value) value = value[f];
		else return undefined;
	}
	return value;
}

async function sendTaskNotification(vk, applicationId, task, formTypeCode, title) {
	if (!task) return;
	let recipientId = '';
	if (typeof task.assignee === 'object' && task.assignee.id) {
		recipientId = task.assignee.id;
	} else if (typeof task.assignee === 'string') {
		recipientId = task.assignee;
	}
	if (!recipientId) {
		console.error('通知发送失败：无法获取接收人ID', task);
		return;
	}
	try {
		await vk.callFunction({
			url: 'admin/bpmn/notification/pub/add',
			data: {
				type: 'task_assigned',
				title: title || '您有新的待办任务',
				content: `任务：${task.task_name}`,
				recipients: [recipientId],
				data: {
					application_id: applicationId,
					task_id: task.task_id,
					task_name: task.task_name,
					form_type: formTypeCode,
					timestamp: Date.now()
				}
			}
		});
	} catch (error) {
		console.error('发送任务通知失败:', error);
	}
}