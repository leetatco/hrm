// cloudfunctions/admin/bpmn/application-form/pub/withdraw.js
const HrmService = require('../../../../common/pub/class/hrm-service.js');
module.exports = {
	/**
	 * 撤回申请
	 * @url admin/bpmn/application-form/pub/withdraw 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {String} application_id 申请ID
	 * @params {String} reason 撤回原因
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid, userInfo } = data;
		let res = { code: 0, msg: '' };

		// 业务逻辑开始-----------------------------------------------------------
		const { application_id, reason } = data;

		// 参数验证
		if (!application_id) {
			return { code: -1, msg: '申请ID不能为空' };
		}

		if (!reason) {
			return { code: -1, msg: '撤回原因不能为空' };
		}

		try {
			// 1. 获取申请详情
			const applicationRes = await vk.baseDao.findById({
				dbName: "bpmn-application-form",
				id: application_id
			});

			if (!applicationRes) {
				return { code: -1, msg: '申请记录不存在' };
			}

			const application = applicationRes;

			// 2. 权限检查 - 只有申请人可以撤回申请
			if (application.applicant_id !== userInfo.username) {
				return { code: -1, msg: '只有申请人可以撤回申请' };
			}

			// 3. 状态检查 - 只能撤回待审批或已退回的申请
			const allowedStatus = ['pending', 'returned'];
			if (!allowedStatus.includes(application.status)) {
				return { 
					code: -1, 
					msg: `当前申请状态为${application.status}，无法撤回。只能撤回待审批或已退回的申请。` 
				};
			}

			// 4. 获取流程实例信息
			const instanceRes = await db.collection('bpmn-instance')
				.where({
					application_id: application_id
				})
				.get();

			if (!instanceRes.data || instanceRes.data.length === 0) {
				return { code: -1, msg: '流程实例不存在' };
			}

			const instance = instanceRes.data[0];

			// 5. 更新申请记录状态
			await vk.baseDao.updateById({
				dbName: "bpmn-application-form",
				id: application_id,
				dataJson: {
					status: 'withdrawn',
					current_task: null,
					update_date: Date.now(),
					updat_id: uid
				}
			});

			// 6. 更新流程实例状态
			await vk.baseDao.updateById({
				dbName: "bpmn-instance",
				id: instance._id,
				dataJson: {
					status: 'terminated',
					end_time: Date.now(),
					current_tasks: [],
					update_date: Date.now(),
					variables: {
						...instance.variables,
						withdrawn: true,
						withdraw_time: Date.now(),
						withdraw_by: userInfo.username,
						withdraw_reason: reason
					}
				}
			});

			// 7. 取消所有待处理任务
			const pendingTasksRes = await db.collection('bpmn-task')
				.where({
					application_id: application_id,
					status: db.command.in(['pending', 'waiting'])
				})
				.get();

			const cancelPromises = pendingTasksRes.data.map(task => {
				return vk.baseDao.updateById({
					dbName: "bpmn-task",
					id: task._id,
					dataJson: {
						status: 'cancelled',
						update_date: Date.now(),
						cancel_reason: '申请已撤回'
					}
				});
			});

			await Promise.all(cancelPromises);

			// 8. 记录撤回操作历史
			await vk.baseDao.add({
				dbName: "bpmn-task-history",
				dataJson: {
					application_id: application_id,
					operator_id: uid,
					operator_name: userInfo.username,
					action: 'withdraw',
					comment: `申请已撤回。撤回原因：${reason}`,
					operation_time: Date.now(),
					application_snapshot: {
						title: application.title,
						form_type_code: application.form_type_code,
						applicant_name: application.applicant_name,
						status: application.status
					}
				}
			});

			// 9. 发送撤回通知
			await sendWithdrawNotification(application_id, application.title, userInfo, reason, vk, db);

			res.data = {
				application_id: application_id,
				withdraw_time: Date.now()
			};
			res.msg = '申请撤回成功';

		} catch (error) {
			console.error('撤回申请失败:', error);
			return { code: -1, msg: error.message || '撤回申请失败' };
		}

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}

/**
 * 发送撤回通知
 */
async function sendWithdrawNotification(applicationId, applicationTitle, userInfo, reason, vk, db) {
	try {
		// 获取申请相关的所有处理人（包括已完成和待处理的任务）
		const tasksRes = await db.collection('bpmn-task')
			.where({
				application_id: applicationId
			})
			.get();

		let recipients = new Set();
		
		if (tasksRes.data) {
			// 收集所有相关的处理人
			tasksRes.data.forEach(task => {
				if (task.assignee) {
					recipients.add(task.assignee);
				}
				// 同时收集候选处理人
				if (task.candidate_users && task.candidate_users.length > 0) {
					task.candidate_users.forEach(user => recipients.add(user));
				}
			});
		}

		const recipientList = Array.from(recipients);
		
		// 移除申请人自己
		const filteredRecipients = recipientList.filter(recipient => recipient !== userInfo.username);

		// 发送给相关处理人
		if (filteredRecipients.length > 0) {
			await vk.callFunction({
				url: 'admin/system/notification/sys/send',
				title: '发送通知...',
				data: {
					type: 'application_withdrawn',
					title: `申请已撤回 - ${applicationTitle}`,
					content: `申请已被申请人${userInfo.username}撤回。撤回原因：${reason}`,
					recipients: filteredRecipients,
					data: {
						application_id: applicationId,
						withdrawn_by: userInfo.username,
						withdraw_reason: reason,
						timestamp: Date.now()
					}
				}
			});

			console.log(`撤回通知已发送给 ${filteredRecipients.length} 个相关处理人`);
		}

		// 同时发送通知给申请人（确认撤回成功）
		await vk.callFunction({
			url: 'admin/system/notification/pub/add',
			title: '发送通知...',
			data: {
				type: 'withdraw_confirmation',
				title: `申请撤回成功 - ${applicationTitle}`,
				content: `您的申请已成功撤回。撤回原因：${reason}`,
				recipients: [userInfo.username],
				data: {
					application_id: applicationId,
					withdraw_time: Date.now(),
					withdraw_reason: reason
				}
			}
		});

	} catch (error) {
		console.error('发送撤回通知失败:', error);
	}
}

/**
 * 检查申请是否可以撤回
 */
async function checkWithdrawPermission(application, userInfo) {
	// 1. 权限检查 - 只有申请人可以撤回
	if (application.applicant_id !== userInfo.username) {
		return { allowed: false, message: '只有申请人可以撤回申请' };
	}

	// 2. 状态检查 - 只能撤回特定状态的申请
	const allowedStatus = ['pending', 'returned'];
	if (!allowedStatus.includes(application.status)) {
		return { 
			allowed: false, 
			message: `当前申请状态为${application.status}，无法撤回。只能撤回待审批或已退回的申请。` 
		};
	}

	// 3. 检查是否有正在处理的退回任务
	const returnTaskRes = await db.collection('bpmn-task')
		.where({
			application_id: application._id,
			node_type: 'return',
			status: 'pending'
		})
		.get();

	if (returnTaskRes.data && returnTaskRes.data.length > 0) {
		return { 
			allowed: true, 
			message: '申请有待处理的退回任务，建议先处理退回任务',
			hasReturnTask: true 
		};
	}

	return { allowed: true, message: '可以撤回申请' };
}