// cloudfunctions/admin/bpmn/application-form/sys/detail.js
module.exports = {
	/**
	 * 获取申请详情
	 * @url admin/bpmn/application-form/sys/detail 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {String} _id 申请ID
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
	 * @params {Object} data 申请详情数据
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
			uid
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		// 业务逻辑开始-----------------------------------------------------------
		const {
			_id,
			userInfo
		} = data;

		if (!_id) {
			return {
				code: -1,
				msg: '申请ID不能为空'
			};
		}

		try {
			// 1. 获取申请详情
			const application = await vk.baseDao.findById({
				dbName: "bpmn-application-form",
				id: _id
			});


			if (vk.pubfn.isNull(application)) {
				return {
					code: -1,
					msg: '申请记录不存在'
				};
			}

			// 2. 权限检查
			const hasPermission = await checkPermission(application, userInfo, db, vk);
			if (!hasPermission) {
				return {
					code: -1,
					msg: '无权查看此申请'
				};
			}

			// 3. 获取审批历史记录
			const history = await getApprovalHistory(_id, db);

			// 4. 获取当前待办任务
			const currentTasks = await getCurrentTasks(_id, db);

			// 5. 获取表单类型信息
			const formTypeInfo = await getFormTypeInfo(application.form_type_code, db);

			// 6. 获取流程实例信息（可选）
			const processInstance = await getProcessInstance(_id, db);

			// 7. 获取附件信息（如果有）
			const attachments = await getAttachments(_id, db);

			res.data = {
				application: application,
				history: history,
				current_tasks: currentTasks,
				form_type: formTypeInfo,
				process_instance: processInstance,
				attachments: attachments
			};

			res.msg = '获取详情成功';

		} catch (error) {
			console.error('获取申请详情失败:', error);
			return {
				code: -1,
				msg: error.message || '获取详情失败'
			};
		}

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}

/**
 * 检查查看权限
 */
async function checkPermission(application, userInfo, db, vk) {
	const {
		username: uid,
		role: userRoles = []
	} = userInfo;

	// 1. 申请人可以查看自己的申请
	if (application.applicant_id === uid) {
		return true;
	}

	// 2. 管理员可以查看所有申请
	if (userRoles.includes('admin')) {
		return true;
	}

	// 3. 当前任务处理人可以查看
	const currentTasks = await getCurrentTasks(application._id, db);
	const isCurrentHandler = currentTasks.some(task =>
		task.assignee === uid ||
		(task.candidate_users && task.candidate_users.includes(uid)) ||
		(task.candidate_groups && task.candidate_groups.some(group =>
			userRoles.includes(group)))
	);

	if (isCurrentHandler) {
		return true;
	}

	// 4. 历史任务处理人可以查看（可选配置）
	const hasHistoryTask = await checkHistoryTask(application._id, uid, db);
	if (hasHistoryTask) {
		return true;
	}

	// 5. 部门主管可以查看本部门申请
	if (userRoles.includes('dept_manager') &&
		application.applicant_department === userInfo.department) {
		return true;
	}

	// 6. 特定角色可以查看（如hr_manager可以查看所有人事相关申请）
	const hasRolePermission = await checkRolePermission(application, userRoles, db);
	if (hasRolePermission) {
		return true;
	}

	return false;
}

/**
 * 检查用户是否处理过此申请的历史任务
 */
async function checkHistoryTask(applicationId, userId, db) {
	try {
		const historyRes = await db.collection('bpmn-task-history')
			.where({
				application_id: applicationId,
				operator_id: userId
			})
			.limit(1)
			.get();

		return historyRes.data.length > 0;
	} catch (error) {
		console.error('检查历史任务失败:', error);
		return false;
	}
}

/**
 * 检查角色权限
 */
async function checkRolePermission(application, userRoles, db) {
	try {
		// 获取表单类型配置
		const formTypeRes = await db.collection('bpmn-form-type')
			.where({
				code: application.form_type_code
			})
			.get();

		if (formTypeRes.data.length === 0) {
			return false;
		}

		const formType = formTypeRes.data[0];

		// 检查表单类型配置中是否有查看权限设置
		if (formType.view_permissions && Array.isArray(formType.view_permissions)) {
			const hasPermission = formType.view_permissions.some(permission =>
				userRoles.includes(permission)
			);

			if (hasPermission) {
				return true;
			}
		}

		// 默认角色权限映射
		const rolePermissionMap = {
			'hr_manager': ['LEAVE_APPLY', 'OVERTIME_APPLY'], // 人事经理可以查看请假、加班申请
			'finance_manager': ['REIMBURSE_APPLY', 'PURCHASE_APPLY'], // 财务经理可以查看报销、采购申请
			'seal_manager': ['SEAL_APPLY'], // 印章管理员可以查看用印申请
			'general_manager': ['*'] // 总经理可以查看所有申请
		};

		for (const [role, formTypes] of Object.entries(rolePermissionMap)) {
			if (userRoles.includes(role)) {
				if (formTypes.includes('*') || formTypes.includes(application.form_type_code)) {
					return true;
				}
			}
		}

		return false;
	} catch (error) {
		console.error('检查角色权限失败:', error);
		return false;
	}
}

/**
 * 获取审批历史记录
 */
async function getApprovalHistory(applicationId, db) {
	try {
		const historyRes = await db.collection('bpmn-task-history')
			.where({
				application_id: applicationId,
				action: db.command.neq("create")
			})
			.orderBy('operation_time', 'asc')
			.get();

		// 格式化历史记录
		const formattedHistory = historyRes.data.map(record => {
			const formattedRecord = {
				_id: record._id,
				task_id: record.task_id,
				operator_id: record.operator_id,
				operator_name: record.operator_name,
				action: record.action,
				comment: record.comment,
				operation_time: record.operation_time,
				form_snapshot: record.form_snapshot,
				ip_address: record.ip_address,
				user_agent: record.user_agent
			};

			// 添加任务信息（如果可能）
			if (record.task_id) {
				// 这里可以关联查询任务表的更多信息
			}

			return formattedRecord;
		});

		return formattedHistory;
	} catch (error) {
		console.error('获取审批历史失败:', error);
		return [];
	}
}

/**
 * 获取当前待办任务
 */
async function getCurrentTasks(applicationId, db) {
	try {
		const tasksRes = await db.collection('bpmn-task')
			.where({
				application_id: applicationId,
				status: 'pending'
			})
			.orderBy('create_time', 'asc')
			.get();

		// 格式化任务信息
		const formattedTasks = tasksRes.data.map(task => {
			return {
				_id: task._id,
				task_key: task.task_key,
				task_name: task.task_name,
				assignee: task.assignee,
				assignee_name: task.assignee_name,
				candidate_users: task.candidate_users,
				candidate_groups: task.candidate_groups,
				create_time: task.create_time,
				due_date: task.due_date,
				priority: task.priority,
				task_data: task.task_data,
				actions: task.actions || ['approve', 'reject'] // 默认操作
			};
		});

		return formattedTasks;
	} catch (error) {
		console.error('获取当前任务失败:', error);
		return [];
	}
}

/**
 * 获取表单类型信息
 */
async function getFormTypeInfo(formTypeCode, db) {
	try {
		const formTypeRes = await db.collection('bpmn-form-type')
			.where({
				code: formTypeCode
			})
			.get();

		if (formTypeRes.data.length === 0) {
			return null;
		}

		const formType = formTypeRes.data[0];

		// 返回必要的信息，避免返回完整的form_schema
		return {
			_id: formType._id,
			name: formType.name,
			code: formType.code,
			description: formType.description,
			form_schema: formType.form_schema // 可以按需返回，或者只返回部分结构
		};
	} catch (error) {
		console.error('获取表单类型信息失败:', error);
		return null;
	}
}

/**
 * 获取流程实例信息
 */
async function getProcessInstance(applicationId, db) {
	try {
		const instanceRes = await db.collection('bpmn-instance')
			.where({
				application_id: applicationId
			})
			.get();

		if (instanceRes.data.length === 0) {
			return null;
		}

		const instance = instanceRes.data[0];

		return {
			_id: instance._id,
			process_definition_id: instance.process_definition_id,
			business_key: instance.business_key,
			start_time: instance.start_time,
			end_time: instance.end_time,
			status: instance.status,
			current_tasks: instance.current_tasks,
			variables: instance.variables
		};
	} catch (error) {
		console.error('获取流程实例失败:', error);
		return null;
	}
}

/**
 * 获取附件信息
 */
async function getAttachments(applicationId, db) {
	try {
		// 检查是否有专门的附件表
		const attachmentRes = await db.collection('bpmn-attachment')
			.where({
				application_id: applicationId
			})
			.orderBy('upload_time', 'asc')
			.get();

		if (attachmentRes.data.length > 0) {
			return attachmentRes.data;
		}

		// 如果没有专门的附件表，尝试从form_data中提取附件信息
		const applicationRes = await db.collection('bpmn-application-form')
			.doc(applicationId)
			.get();

		if (!applicationRes.data[0] || !applicationRes.data[0].form_data) {
			return [];
		}

		const formData = applicationRes.data[0].form_data;
		const attachments = [];

		// 遍历form_data，查找包含文件信息的字段
		Object.keys(formData).forEach(key => {
			const value = formData[key];

			if (Array.isArray(value)) {
				// 检查数组中的元素是否包含文件信息
				value.forEach(item => {
					if (item && typeof item === 'object' && item.file_url) {
						attachments.push({
							field_name: key,
							file_name: item.file_name || '未知文件',
							file_url: item.file_url,
							file_size: item.file_size,
							file_type: item.file_type,
							upload_time: item.upload_time || applicationRes.data[0]
								.create_date
						});
					}
				});
			} else if (value && typeof value === 'object' && value.file_url) {
				// 单个文件对象
				attachments.push({
					field_name: key,
					file_name: value.file_name || '未知文件',
					file_url: value.file_url,
					file_size: value.file_size,
					file_type: value.file_type,
					upload_time: value.upload_time || applicationRes.data[0].create_date
				});
			}
		});

		return attachments;
	} catch (error) {
		console.error('获取附件信息失败:', error);
		return [];
	}
}

/**
 * 获取流程定义信息（可选）
 */
async function getProcessDefinition(processDefinitionId, db) {
	try {
		if (!processDefinitionId) return null;

		const definitionRes = await db.collection('bpmn-definition')
			.doc(processDefinitionId)
			.get();

		if (!definitionRes.data[0]) {
			return null;
		}

		const definition = definitionRes.data[0];

		return {
			_id: definition._id,
			name: definition.name,
			key: definition.key,
			version: definition.version,
			description: definition.description
		};
	} catch (error) {
		console.error('获取流程定义失败:', error);
		return null;
	}
}