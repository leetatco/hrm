// cloudfunctions/admin/bpmn/task/pub/handleReturn.js
const HrmService = require('../../../../common/pub/class/hrm-service.js');
module.exports = {
	/**
	 * 处理退回任务
	 * @url admin/bpmn/task/pub/handleReturn 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {String} task_id 退回任务ID
	 * @params {String} action 处理方式 (resubmit-重新提交, withdraw-撤回申请)
	 * @params {String} modify_comment 修改说明 (resubmit时必填)
	 * @params {String} withdraw_reason 撤回原因 (withdraw时必填)
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
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
			task_id,
			action,
			modify_comment,
			withdraw_reason
		} = data;

		// 参数验证
		if (!task_id) {
			return {
				code: -1,
				msg: '任务ID不能为空'
			};
		}

		if (!action || !['resubmit', 'withdraw'].includes(action)) {
			return {
				code: -1,
				msg: '处理方式不能为空且必须是resubmit或withdraw'
			};
		}

		try {
			// 1. 获取退回任务详情
			const taskRes = await vk.baseDao.findById({
				dbName: "bpmn-task",
				id: task_id
			});

			if (!taskRes) {
				return {
					code: -1,
					msg: '退回任务不存在',
					taskRes
				};
			}

			const returnTask = taskRes;

			// 2. 验证任务类型必须是退回任务
			if (returnTask.node_type !== 'return') {
				return {
					code: -1,
					msg: '该任务不是退回任务'
				};
			}

			// 3. 权限检查 - 只有申请人可以处理退回任务
			const applicationRes = await vk.baseDao.findById({
				dbName: "bpmn-application-form",
				id: returnTask.application_id
			});

			if (!applicationRes) {
				return {
					code: -1,
					msg: '申请记录不存在'
				};
			}

			const application = applicationRes;

			if (application.applicant_id !== userInfo.username) {
				return {
					code: -1,
					msg: '只有申请人可以处理退回任务'
				};
			}

			// 4. 根据操作类型处理
			if (action === 'resubmit') {
				await handleResubmit(returnTask, application, modify_comment, userInfo, vk, db);
				res.msg = '申请已重新提交';
			} else if (action === 'withdraw') {
				await handleWithdrawFromReturn(returnTask, application, withdraw_reason, userInfo, vk, db);
				res.msg = '申请已撤回';
			}

			// 5. 完成退回任务
			await vk.baseDao.updateById({
				dbName: "bpmn-task",
				id: task_id,
				dataJson: {
					status: 'completed',
					action: action,
					comment: action === 'resubmit' ? modify_comment : withdraw_reason,
					complete_time: Date.now(),
					operator_id: userInfo.username,
					operator_name: userInfo.nickname,
					updat_id: uid,
					update_date: Date.now()
				}
			});

			// 6. 记录操作历史
			await vk.baseDao.add({
				dbName: "bpmn-task-history",
				dataJson: {
					task_id: task_id,
					application_id: returnTask.application_id,
					operator_id: userInfo.username,
					operator_name: userInfo.nickname,
					action: action,
					comment: action === 'resubmit' ? modify_comment : withdraw_reason,
					operation_time: Date.now(),
					task_snapshot: returnTask
				}
			});

			res.data = {
				application_id: returnTask.application_id,
				action: action
			};

		} catch (error) {
			console.error('处理退回任务失败:', error);
			return {
				code: -1,
				msg: error.message || '处理退回任务失败'
			};
		}

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}

/**
 * 处理重新提交
 */
async function handleResubmit(returnTask, application, modify_comment, userInfo, vk, db) {
	// 1. 获取被退回的原始任务信息
	const originalTaskId = returnTask.task_data.original_task_id;
	if (!originalTaskId) {
		throw new Error('退回任务缺少原始任务信息');
	}

	const originalTaskRes = await vk.baseDao.findById({
		dbName: "bpmn-task",
		id: originalTaskId
	});

	if (!originalTaskRes) {
		throw new Error('原始任务不存在');
	}

	const originalTask = originalTaskRes;

	// 2. 更新申请记录状态
	await vk.baseDao.updateById({
		dbName: "bpmn-application-form",
		id: application._id,
		dataJson: {
			status: 'pending', // 重新变为审批中
			current_task: originalTask.task_name,
			update_date: Date.now(),
			updat_id: userInfo._id
		}
	});

	// 3. 重新激活原始任务
	await vk.baseDao.updateById({
		dbName: "bpmn-task",
		id: originalTaskId,
		dataJson: {
			status: 'pending',
			comment: null,
			complete_time: null,
			operator_id: null,
			operator_name: null,
			update_date: Date.now(),
			task_data: {
				...originalTask.task_data,
				resubmit_info: {
					return_task_id: returnTask._id,
					resubmit_time: Date.now(),
					modify_comment: modify_comment,
					resubmitted_by: userInfo.username
				}
			}
		}
	});

	// 4. 更新流程实例的当前任务
	await vk.baseDao.updateById({
		dbName: "bpmn-instance",
		id: returnTask.instance_id,
		dataJson: {
			current_tasks: [{
				task_id: originalTaskId,
				task_name: originalTask.task_name,
				assignee: originalTask.assignee,
				create_time: Date.now()
			}],
			status: 'active', // 重新激活流程
			update_date: Date.now(),
			variables: {
				// 更新流程变量，记录重新提交信息
				resubmitted: true,
				resubmit_time: Date.now(),
				modify_comment: modify_comment,
				resubmitted_by: userInfo.username
			}
		}
	});

	// 5. 激活后续等待中的任务
	const waitingTasksRes = await db.collection('bpmn-task')
		.where({
			instance_id: returnTask.instance_id,
			sequence: db.command.gt(originalTask.sequence),
			status: 'waiting'
		})
		.orderBy('sequence', 'asc')
		.get();

	// 将后续任务的第一个变为pending，其他保持waiting
	if (waitingTasksRes.data && waitingTasksRes.data.length > 0) {
		const nextTask = waitingTasksRes.data[0];
		await vk.baseDao.updateById({
			dbName: "bpmn-task",
			id: nextTask._id,
			dataJson: {
				status: 'pending',
				update_date: Date.now()
			}
		});
	}

	// 6. 发送通知给原始任务处理人
	await sendResubmitNotification(application._id, originalTask, application.title, userInfo, vk, db);
}

/**
 * 从退回任务处理撤回申请
 */
async function handleWithdrawFromReturn(returnTask, application, withdraw_reason, userInfo, vk, db) {
	// 1. 更新申请记录状态
	await vk.baseDao.updateById({
		dbName: "bpmn-application-form",
		id: application._id,
		dataJson: {
			status: 'withdrawn',
			current_task: null,
			update_date: Date.now(),
			updat_id: userInfo._id
		}
	});

	// 2. 更新流程实例状态
	await vk.baseDao.updateById({
		dbName: "bpmn-instance",
		id: returnTask.instance_id,
		dataJson: {
			status: 'terminated',
			end_time: Date.now(),
			current_tasks: [],
			update_date: Date.now(),
			variables: {
				withdrawn: true,
				withdraw_time: Date.now(),
				withdraw_by: userInfo.username,
				withdraw_reason: withdraw_reason,
				withdrawn_from: 'return_task'
			}
		}
	});

	// 3. 取消所有待处理任务
	const pendingTasksRes = await db.collection('bpmn-task')
		.where({
			instance_id: returnTask.instance_id,
			status: db.command.in(['pending', 'waiting'])
		})
		.get();

	const cancelPromises = pendingTasksRes.data.map(task => {
		return vk.baseDao.updateById({
			dbName: "bpmn-task",
			id: task._id,
			dataJson: {
				status: 'cancelled',
				update_date: Date.now()
			}
		});
	});

	await Promise.all(cancelPromises);

	// 4. 发送撤回通知
	await sendWithdrawNotification(application._id, application.title, userInfo, withdraw_reason, vk, db);
}

/**
 * 发送重新提交通知
 */
async function sendResubmitNotification(applicationId, task, applicationTitle, userInfo, vk, db) {
	try {
		await vk.callFunction({
			url: 'admin/bpmn/notification/pub/add',
			title: '发送通知...',
			data: {
				type: 'task_resubmitted',
				title: `申请已重新提交 - ${applicationTitle}`,
				content: `申请已被申请人${userInfo.username}修改并重新提交，请及时处理`,
				recipients: [task.assignee],
				data: {
					application_id: applicationId,
					task_id: task._id,
					task_name: task.task_name,
					resubmitted_by: userInfo.username,
					timestamp: Date.now()
				}
			}
		});

		console.log(`重新提交通知已发送给: ${task.assignee}`);
	} catch (error) {
		console.error('发送重新提交通知失败:', error);
	}
}

/**
 * 发送撤回通知
 */
async function sendWithdrawNotification(applicationId, applicationTitle, userInfo, withdraw_reason, vk, db) {
	try {
		// 获取申请相关的所有处理人
		const tasksRes = await vk.callFunction({
			url: 'admin/bpmn/task/sys/getList',
			data: {
				formData: {
					application_id: applicationId,
					status: db.command.in(['completed', 'pending'])
				}
			}
		});

		let recipients = [];
		if (tasksRes.code === 0 && tasksRes.rows) {
			// 收集所有相关的处理人
			const assignees = new Set();
			tasksRes.rows.forEach(task => {
				if (task.assignee) {
					assignees.add(task.assignee);
				}
			});
			recipients = Array.from(assignees);
		}

		// 发送给相关处理人
		if (recipients.length > 0) {
			await vk.callFunction({
				url: 'admin/bpmn/notification/pub/add',
				title: '发送通知...',
				data: {
					type: 'application_withdrawn',
					title: `申请已撤回 - ${applicationTitle}`,
					content: `申请已被申请人${userInfo.username}撤回，撤回原因：${withdraw_reason}`,
					recipients: recipients,
					data: {
						application_id: applicationId,
						withdrawn_by: userInfo.username,
						withdraw_reason: withdraw_reason,
						timestamp: Date.now()
					}
				}
			});
		}

		console.log(`撤回通知已发送给 ${recipients.length} 个相关处理人`);
	} catch (error) {
		console.error('发送撤回通知失败:', error);
	}
}