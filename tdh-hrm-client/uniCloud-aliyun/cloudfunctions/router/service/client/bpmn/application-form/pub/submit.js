const HrmService = require('../../../../common/pub/class/hrm-service.js');
module.exports = {
	/**
	 * 提交签核申请 - 一次性确定完整流程
	 * @url admin/bpmn/application-form/sys/submit 前端调用的url参数地址
	 */
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

		// 业务逻辑开始-----------------------------------------------------------
		const {
			form_type_code,
			form_data,
			calculated_values,
			title,
			_id
		} = data;

		// 参数验证
		if (!form_type_code) {
			return {
				code: -1,
				msg: '表单类型编码不能为空'
			};
		}

		if (!form_data) {
			return {
				code: -1,
				msg: '表单数据不能为空'
			};
		}

		try {
			const hrmService = new HrmService(vk, db);
			const employeeInfo = await hrmService.getEmployeeInfoByUsername(userInfo.username);

			form_data.employeeInfo = employeeInfo;

			// 验证表单类型是否存在
			const formTypeRes = await db.collection('bpmn-form-type')
				.where({
					code: form_type_code,
					status: 'active'
				})
				.get();

			if (formTypeRes.data.length === 0) {
				return {
					code: -1,
					msg: '表单类型不存在或已停用'
				};
			}

			const formType = formTypeRes.data[0];

			// 生成申请标题
			const applicationTitle = `${employeeInfo.employee_name}-${title}`;

			// 创建申请记录
			const applicationData = {
				form_type_code: form_type_code,
				applicant_id: employeeInfo.employee_id,
				applicant_name: employeeInfo.employee_name,
				applicant_department: employeeInfo.department_name || '',
				applicant_level: employeeInfo.position_level || '',
				applicant_roles: userInfo.role || [],
				title: applicationTitle,
				form_data: form_data,
				calculated_values: calculated_values || {},
				status: 'pending',
				update_date: Date.now(),
				updat_id: uid
			};

			// 保存申请(如果是有id就更新)			
			let form_id = _id;
			console.log("保存申请(如果是有id就更新):", form_id);
			if (vk.pubfn.isNotNull(form_id)) {
				await vk.baseDao.updateById({
					dbName: "bpmn-application-form",
					id: form_id,
					dataJson: applicationData
				});
			} else {
				form_id = await vk.baseDao.add({
					dbName: "bpmn-application-form",
					dataJson: applicationData
				});
			}

			if (form_id) {
				// 一次性创建完整签核流程
				const processResult = await createCompleteProcess(
					form_id,
					form_type_code,
					form_data,
					calculated_values,
					uid,
					vk,
					db,
					userInfo
				);

				if (processResult.success) {
					// 更新申请记录的流程信息
					await vk.baseDao.updateById({
						dbName: "bpmn-application-form",
						id: form_id,
						dataJson: {
							process_definition_key: processResult.process_definition_key,
							current_task: processResult.current_task,
							process_instance_id: processResult.instance_id
						}
					});

					// 发送通知给第一个任务处理人
					await sendTaskNotification(form_id, processResult.first_task, formType.name, processResult
						.first_task.assignee.id, applicationTitle, vk);

					res.data = {
						application_id: form_id,
						process_instance_id: processResult.instance_id,
						tasks: processResult.tasks
					};
					res.msg = `${formType.name}提交成功`;
				} else {
					// 流程创建失败，删除申请记录
					await vk.baseDao.deleteById({
						dbName: "bpmn-application-form",
						id: form_id
					});
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

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}

/**
 * 创建完整签核流程 - 一次性创建所有任务
 */
async function createCompleteProcess(applicationId, formTypeCode, formData, calculatedValues, uid, vk, db, userInfo) {
	try {
		// 1. 调用试算流程云函数获取完整的流程模拟结果
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

		if (simulateResult.code !== 0) {
			return {
				success: false,
				message: simulateResult.msg
			};
		}

		const simulationData = simulateResult.data;
		const processDefinitionKey = simulationData.process_definition.key;

		// 2. 创建流程实例
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
			simulation_result: simulationData, // 保存完整的试算结果
			complete_flow_path: simulationData.path, // 保存完整流程路径
			all_nodes: simulationData.nodes, // 保存所有节点信息
			current_tasks: [],
			update_date: Date.now()
		};

		const instanceId = await vk.baseDao.add({
			dbName: "bpmn-instance",
			dataJson: instanceData
		});

		// 3. 一次性创建所有任务节点（除了开始和结束节点）
		const tasks = [];
		let firstTask = null;
		let currentTask = null;

		// 获取所有需要处理的任务节点
		const taskNodes = simulationData.nodes.filter(node =>
			(node.node_type === 'userTask' || node.node_type === 'approval') &&
			node.estimated_assignee
		);

		console.log(`找到 ${taskNodes.length} 个任务节点需要创建`);

		// 创建所有任务，但只有第一个任务是pending状态，其他都是waiting状态
		for (let i = 0; i < taskNodes.length; i++) {
			const taskNode = taskNodes[i];
			const isFirstTask = i === 0;

			const taskData = {
				instance_id: instanceId,
				application_id: applicationId,
				task_key: taskNode.node_key,
				task_name: taskNode.node_name,
				node_type: taskNode.node_type,
				assignee: taskNode.estimated_assignee.id,
				assignee_name: taskNode.estimated_assignee.name,
				assignee_type: taskNode.assignee_type,
				candidate_users: taskNode.candidate_users || [],
				candidate_groups: taskNode.candidate_groups || [],
				status: isFirstTask ? 'pending' : 'waiting', // 只有第一个任务待处理，其他等待中
				actions: taskNode.actions || ['approve', 'reject'],
				sequence: i + 1, // 任务顺序
				total_tasks: taskNodes.length, // 总任务数
				update_date: Date.now(),
				due_date: taskNode.duration_estimate ?
					Date.now() + (taskNode.duration_estimate * 60 * 60 * 1000) : null,
				task_data: {
					node_info: taskNode,
					previous_tasks: i > 0 ? [taskNodes[i - 1].node_key] : [],
					next_tasks: i < taskNodes.length - 1 ? [taskNodes[i + 1].node_key] : []
				}
			};

			const taskId = await vk.baseDao.add({
				dbName: "bpmn-task",
				dataJson: taskData
			});

			const taskInfo = {
				task_id: taskId,
				task_name: taskNode.node_name,
				assignee: taskNode.estimated_assignee,
				status: isFirstTask ? 'pending' : 'waiting',
				sequence: i + 1
			};

			tasks.push(taskInfo);

			// 记录第一个任务
			if (isFirstTask) {
				firstTask = taskInfo;
				currentTask = taskNode.node_name;
			}

			// 记录任务创建历史
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
						sequence: i + 1,
						total: taskNodes.length,
						node_info: taskNode
					}
				}
			});
		}

		// 4. 更新实例的当前任务（只设置第一个任务为当前任务）
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
			current_task: currentTask,
			first_task: firstTask,
			tasks: tasks,
			total_tasks: taskNodes.length
		};

	} catch (error) {
		console.error('创建完整签核流程失败:', error);
		return {
			success: false,
			message: error.message
		};
	}
}

/**
 * 发送任务通知给处理人
 */
async function sendTaskNotification(applicationId, task, formTypeName, recipients, title, vk) {
	if (!task) return;

	try {
		await vk.callFunction({
			url: 'admin/bpmn/notification/pub/add',
			title: '发送通知...',
			data: {
				type: 'task_assigned',
				title: `${title}待处理`,
				content: `${title}需要审批，请及时处理`,
				recipients: [recipients],
				data: {
					application_id: applicationId,
					task_id: task.task_id,
					task_name: task.task_name,
					form_type: formTypeName,
					timestamp: Date.now()
				}
			}
		});

		console.log(`已发送通知给任务处理人: ${task.assignee.name}`);
	} catch (error) {
		console.error('发送任务通知失败:', error);
	}
}