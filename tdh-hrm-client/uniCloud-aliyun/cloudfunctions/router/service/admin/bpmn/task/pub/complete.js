// cloudfunctions/admin/bpmn/task/sys/complete.js
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
			task_id,
			action,
			comment,
			transfer_user,
			applicationData
		} = data;

		if (!task_id) return {
			code: -1,
			msg: '任务ID不能为空'
		};

		try {
			const taskRes = await vk.baseDao.findById({
				dbName: "bpmn-task",
				id: task_id
			});
			if (!taskRes) return {
				code: -1,
				msg: '任务不存在'
			};
			const task = taskRes;

			// 权限检查
			if (task.assignee !== userInfo.username && !userInfo.role.includes('admin')) {
				return {
					code: -1,
					msg: '无权处理此任务'
				};
			}

			// 操作允许检查
			if (!task.actions || !task.actions.includes(action)) {
				return {
					code: -1,
					msg: '当前任务不支持此操作'
				};
			}

			// 记录操作历史
			await vk.baseDao.add({
				dbName: "bpmn-task-history",
				dataJson: {
					task_id,
					application_id: task.application_id,
					operator_id: userInfo.username,
					operator_name: userInfo.nickname,
					action,
					comment: comment || '',
					transfer_user: transfer_user || null,
					operation_time: Date.now(),
					task_snapshot: task
				}
			});

			let nextTask = null;
			const title = applicationData?.title || '';

			switch (action) {
				case 'approve':
				case 'reject':
					nextTask = await handleApproveOrReject(task, action, userInfo, vk, db);
					break;
				case 'transfer':
					if (!transfer_user) return {
						code: -1,
						msg: '转办目标用户不能为空'
					};
					await handleTaskTransfer(task_id, transfer_user, userInfo, vk, db);
					res.msg = '任务转交成功';
					return res;
				case 'return':
					nextTask = await handleTaskReturn(task, userInfo, vk, db);
					res.msg = '已退回给申请人';
					break;
				case 'add_sign':
					nextTask = await handleAddSign(task, transfer_user, userInfo, vk, db);
					res.msg = '加签成功';
					break;
				case 'add_sign_complete':
					nextTask = await handleAddSignComplete(task, userInfo, vk, db);
					res.msg = '加签完成';
					break;
				case 'confirm':
					nextTask = await handleConfirm(task, userInfo, vk, db);
					res.msg = '确认完成';
					break;
				default:
					return {
						code: -1, msg: '不支持的操作'
					};
			}

			// 更新当前任务状态
			const statusMap = {
				add_sign: 'waiting_add_sign',
				add_sign_complete: 'completed',
				confirm: 'completed'
			};
			const newStatus = statusMap[action] || 'completed';
			await vk.baseDao.updateById({
				dbName: "bpmn-task",
				id: task_id,
				dataJson: {
					status: newStatus,
					action,
					comment,
					complete_time: Date.now(),
					operator_id: userInfo.username,
					operator_name: userInfo.nickname
				}
			});

			if (nextTask) {
				// 激活下一节点时已在 activateNextNode 中发送了通知，此处不再重复发送
				res.data = {
					next_task: nextTask
				}
			} else if (['approve', 'reject', 'confirm'].includes(action)) {
				// 检查是否还有非通知节点的待处理任务
				const pendingTasks = await db.collection('bpmn-task')
					.where({
						instance_id: task.instance_id,
						status: 'pending',
						node_type: db.command.neq('review') // 排除通知节点
					})
					.get();

				if (pendingTasks.data.length === 0) {
					// 流程结束
					const finalStatus = action === 'reject' ? 'rejected' : 'approved';
					await vk.baseDao.updateById({
						dbName: "bpmn-application-form",
						id: task.application_id,
						dataJson: {
							status: finalStatus,
							current_task: null,
							update_date: Date.now()
						}
					});
					await vk.baseDao.updateById({
						dbName: "bpmn-instance",
						id: task.instance_id,
						dataJson: {
							status: 'completed',
							end_time: Date.now(),
							current_tasks: []
						}
					});

					// 激活所有通知节点的 waiting 任务，让相关人员确认
					await db.collection('bpmn-task')
						.where({
							instance_id: task.instance_id,
							node_type: 'review',
							status: 'waiting'
						})
						.update({
							status: 'pending',
							update_date: Date.now()
						});

					// 通知申请人
					const applicationRes = await vk.baseDao.findById({
						dbName: "bpmn-application-form",
						id: task.application_id
					});
					const applicantId = applicationRes?.applicant_id;
					const appTitle = applicationRes?.title || '';

					// console.log("task:",task, applicantId)

					if (applicantId && task.node_type !== 'review') {
						await sendSimpleNotification(
							vk, task.application_id, [applicantId],
							action === 'reject' ? `${appTitle}未通过，请知悉！` : `${appTitle}已通过`,
							action === 'reject' ? '您的申请已被驳回' : '您的申请已审批通过'
						);
					}
					res.data = {
						process_completed: true,
						final_status: finalStatus
					};
				}
			}

		} catch (error) {
			return {
				code: -1,
				msg: error.message
			};
		}
		return res;
	}
};

// ---- 以下辅助函数与之前基本一致，仅调整通知相关调用 ----
async function handleApproveOrReject(task, action, userInfo, vk, db) {
	const instanceId = task.instance_id;
	const taskKey = task.task_key;

	const pendingTasks = await db.collection('bpmn-task')
		.where({
			instance_id: instanceId,
			task_key: taskKey,
			status: 'pending'
		})
		.get();
	const isCountersign = pendingTasks.data.length > 1;

	if (action === 'reject') {
		await db.collection('bpmn-task')
			.where({
				instance_id: instanceId,
				task_key: taskKey,
				status: 'pending'
			})
			.update({
				status: 'cancelled',
				complete_time: Date.now(),
				action: 'reject'
			});
		return null;
	}

	if (isCountersign) {
		// 会签：只增加当前任务的同意计数
		await db.collection('bpmn-task').doc(task._id).update({
			current_approvals: db.command.inc(1)
		});

		// 查询该节点所有任务（不限状态），计算总同意数
		const allNodeTasks = await db.collection('bpmn-task')
			.where({
				instance_id: instanceId,
				task_key: taskKey
			})
			.get();
		let totalApprovals = 0;
		allNodeTasks.data.forEach(t => totalApprovals += t.current_approvals || 0);
		const required = task.required_approvals || 1;

		if (totalApprovals >= required) {
			// 达标：将所有 pending 任务置为 completed，并激活下一节点
			await db.collection('bpmn-task')
				.where({
					instance_id: instanceId,
					task_key: taskKey,
					status: 'pending'
				})
				.update({
					status: 'completed',
					complete_time: Date.now(),
					action: 'approve'
				});
			return await activateNextNode(instanceId, task, db, vk);
		}
		return null;
	} else {
		// 非会签，直接完成当前任务并激活下一节点
		return await activateNextNode(instanceId, task, db, vk);
	}
}

async function handleTaskTransfer(taskId, transfer_user, userInfo, vk, db) {
	const targetUserRes = await db.collection('uni-id-users').where({
		username: transfer_user
	}).get();
	if (!targetUserRes.data || targetUserRes.data.length === 0) throw new Error('转交目标用户不存在');
	const targetUser = targetUserRes.data[0];

	const updateData = {
		assignee: transfer_user,
		assignee_name: targetUser.nickname || targetUser.username,
		update_date: Date.now()
	};

	const currentTask = await vk.baseDao.findById({
		dbName: "bpmn-task",
		id: taskId
	});
	if (currentTask) {
		updateData.previous_assignee = currentTask.assignee;
		updateData.previous_assignee_name = currentTask.assignee_name;
		updateData.transfer_time = Date.now();
		updateData.transfer_by = userInfo.username;
	}
	await vk.baseDao.updateById({
		dbName: "bpmn-task",
		id: taskId,
		dataJson: updateData
	});

	if (currentTask) {
		// 更新流程实例的当前任务信息
		await vk.baseDao.updateById({
			dbName: "bpmn-instance",
			id: currentTask.instance_id,
			dataJson: {
				'current_tasks.0.assignee': transfer_user,
				'current_tasks.0.assignee_name': targetUser.nickname || targetUser.username,
				update_date: Date.now()
			}
		});

		// 发送通知给被转办人
		const taskInfo = {
			task_id: taskId,
			task_name: currentTask.task_name,
			assignee: {
				id: transfer_user,
				name: targetUser.nickname || targetUser.username
			}
		};
		await sendTaskNotification(
			vk,
			currentTask.application_id,
			taskInfo,
			null,
			'您收到一个转办任务，请及时处理'
		);
	}
}

async function handleTaskReturn(currentTask, userInfo, vk, db) {
	const applicationRes = await vk.baseDao.findById({
		dbName: "bpmn-application-form",
		id: currentTask.application_id
	});
	if (!applicationRes) throw new Error('申请记录不存在');
	const application = applicationRes;

	const returnTaskData = {
		instance_id: currentTask.instance_id,
		application_id: currentTask.application_id,
		task_key: 'return_task',
		task_name: '申请退回处理',
		node_type: 'return',
		assignee: application.applicant_id,
		assignee_name: application.applicant_name,
		assignee_type: 'user',
		status: 'pending',
		actions: ['resubmit', 'withdraw'],
		sequence: currentTask.sequence,
		create_time: Date.now(),
		task_data: {
			return_reason: '审批退回',
			returned_from: currentTask.task_name,
			original_task_id: currentTask._id
		}
	};

	const taskRes = await vk.baseDao.add({
		dbName: "bpmn-task",
		dataJson: returnTaskData
	});

	await vk.baseDao.updateById({
		dbName: "bpmn-instance",
		id: currentTask.instance_id,
		dataJson: {
			current_tasks: [{
				task_id: taskRes.id,
				task_name: returnTaskData.task_name,
				assignee: returnTaskData.assignee,
				create_time: Date.now()
			}],
			update_date: Date.now()
		}
	});

	await vk.baseDao.updateById({
		dbName: "bpmn-application-form",
		id: currentTask.application_id,
		dataJson: {
			current_task: returnTaskData.task_name,
			update_date: Date.now()
		}
	});

	// 通知申请人（已退回）	   
	const taskInfo = {
		task_id: taskRes.id,
		task_name: returnTaskData.task_name,
		assignee: {
			id: returnTaskData.assignee,
			name: returnTaskData.assignee_name
		}
	}
	await sendTaskNotification(vk, currentTask.application_id, taskInfo, null, '您的申请已被退回，请及时处理');
	return taskInfo;
}

async function handleAddSign(currentTask, targetUser, userInfo, vk, db) {
	if (!targetUser) throw new Error('加签目标用户不能为空');
	const targetRes = await db.collection('uni-id-users').where({
		username: targetUser
	}).get();
	if (targetRes.data.length === 0) throw new Error('加签目标用户不存在');
	const target = targetRes.data[0];

	const childTask = {
		instance_id: currentTask.instance_id,
		application_id: currentTask.application_id,
		task_key: currentTask.task_key + '_addsign_' + Date.now(),
		task_name: '加签：' + currentTask.task_name,
		node_type: 'add_sign',
		assignee: targetUser,
		assignee_name: target.nickname || targetUser,
		status: 'pending',
		actions: ['add_sign_complete'],
		create_time: Date.now(),
		parent_task_id: currentTask._id,
		is_add_sign: true,
		required_approvals: 1
	};
	const task_id = await vk.baseDao.add({
		dbName: "bpmn-task",
		dataJson: childTask
	});

	// 原任务挂起
	await vk.baseDao.updateById({
		dbName: "bpmn-task",
		id: currentTask._id,
		dataJson: {
			status: 'waiting_add_sign'
		}
	});

	// 1. 通知被加签人
	const taskInfo = {
		task_id,
		task_name: childTask.task_name,
		assignee: {
			id: targetUser,
			name: target.nickname || targetUser
		}
	};
	await sendTaskNotification(
		vk,
		currentTask.application_id,
		taskInfo,
		null,
		'您有一个加签任务，请及时处理'
	);

	// 2. 可选：通知原处理人任务已挂起（如需可取消注释）
	// await sendSimpleNotification(
	//     vk,
	//     currentTask.application_id,
	//     [currentTask.assignee],
	//     '任务已加签',
	//     `您的任务“${currentTask.task_name}”已加签给 ${target.nickname || targetUser}，待其处理后您可继续审批`
	// );

	return {
		task_id,
		task_name: childTask.task_name,
		assignee: {
			id: targetUser,
			name: target.nickname || targetUser
		}
	};
}

async function handleAddSignComplete(childTask, userInfo, vk, db) {
	if (!childTask.parent_task_id) throw new Error('非加签任务');
	await vk.baseDao.updateById({
		dbName: "bpmn-task",
		id: childTask.parent_task_id,
		dataJson: {
			status: 'pending'
		}
	});

	const parentTask = await vk.baseDao.findById({
		dbName: "bpmn-task",
		id: childTask.parent_task_id
	});
	if (parentTask && parentTask.assignee) {
		const taskInfo = {
			task_id: parentTask._id,
			task_name: parentTask.task_name,
			assignee: {
				id: parentTask.assignee,
				name: parentTask.assignee_name
			}
		};
		await sendTaskNotification(vk, parentTask.application_id, taskInfo, null, '加签处理已完成，请继续审批');
	}
	return null;
}

async function handleConfirm(task, userInfo, vk, db) {
	// 统计当前实例下还有多少个 pending 的通知任务（不包括自己）
	const pendingNotifications = await db.collection('bpmn-task')
		.where({
			instance_id: task.instance_id,
			node_type: 'review',
			status: 'pending'
		})
		.get();

	// 如果除了当前这个，没有其他 pending 的通知任务，说明这是最后一个确认
	if (pendingNotifications.data.length === 1 && pendingNotifications.data[0]._id === task._id) {
		// 获取申请信息
		const instance = await db.collection('bpmn-instance').doc(task.instance_id).get();
		const application = await db.collection('bpmn-application-form').doc(instance.data[0].application_id).get();
		const applicantId = application.data?.[0]?.applicant_id;
		const title = application.data?.[0].title || '';

		if (applicantId) {
			console.log("sendSimpleNotification:", applicantId)
			await sendSimpleNotification(
				vk,
				application.data[0]._id,
				[applicantId],
				`${title} - 通知已确认`,
				`您的申请《${title}》的所有知会人员已完成确认。`
			);
		}
	}

	return null; // 不推进流程
}

async function activateNextNode(instanceId, currentTask, db, vk) {
	// 查找下一批 sequence 的 waiting 任务
	const nextTasks = await db.collection('bpmn-task')
		.where({
			instance_id: instanceId,
			sequence: currentTask.sequence + 1,
			status: 'waiting'
		})
		.limit(100)
		.get();

	if (nextTasks.data.length === 0) return null;

	const firstTask = nextTasks.data[0];

	// 如果是通知节点（review），只激活为 pending，但不阻塞流程，返回 null 让流程结束
	if (firstTask.node_type === 'review') {
		const ids = nextTasks.data.map(t => t._id);
		await db.collection('bpmn-task')
			.where({
				_id: db.command.in(ids)
			})
			.update({
				status: 'pending',
				update_date: Date.now()
			});

		// 给每个通知人员发送确认提醒
		for (const t of nextTasks.data) {
			await sendTaskNotification(vk, t.application_id, {
				task_id: t._id,
				task_name: t.task_name,
				assignee: {
					id: t.assignee,
					name: t.assignee_name
				}
			}, null, '您有一份知会通知待确认');
		}

		return null; // 告诉主流程：没有下一关任务了，可以结束
	}

	// 普通任务节点，正常激活并推进
	const ids = nextTasks.data.map(t => t._id);
	await db.collection('bpmn-task')
		.where({
			_id: db.command.in(ids)
		})
		.update({
			status: 'pending',
			update_date: Date.now()
		});

	await db.collection('bpmn-instance').doc(instanceId).update({
		current_tasks: [{
			task_id: firstTask._id,
			task_name: firstTask.task_name,
			assignee: firstTask.assignee,
			create_time: Date.now()
		}],
		update_date: Date.now()
	});

	for (const t of nextTasks.data) {
		await sendTaskNotification(vk, t.application_id, {
			task_id: t._id,
			task_name: t.task_name,
			assignee: {
				id: t.assignee,
				name: t.assignee_name
			}
		}, null, '您有一个新的待办任务');
	}

	return {
		task_id: firstTask._id,
		task_name: firstTask.task_name,
		assignee: {
			id: firstTask.assignee,
			name: firstTask.assignee_name
		}
	};
}

async function sendTaskNotification(vk, applicationId, task, formTypeCode, title) {
	if (!task) return;
	let recipientId = '';
	if (typeof task.assignee === 'object' && task.assignee.id) {
		recipientId = task.assignee.id;
	} else if (typeof task.assignee === 'string') {
		recipientId = task.assignee;
	}
	if (!recipientId) return;

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
	} catch (e) {
		console.error('发送任务通知失败:', e);
	}
}

async function sendSimpleNotification(vk, applicationId, recipients, title, content) {
	try {
		await vk.callFunction({
			url: 'admin/bpmn/notification/pub/add',
			data: {
				type: 'process_end',
				title: title,
				content: content,
				recipients: recipients,
				data: {
					application_id: applicationId,
					timestamp: Date.now()
				}
			}
		});
	} catch (e) {
		console.error('发送通知失败:', e);
	}
}