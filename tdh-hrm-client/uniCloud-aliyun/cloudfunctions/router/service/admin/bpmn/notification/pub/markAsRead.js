// cloudfunctions/admin/system/notification/sys/markAsRead.js
module.exports = {
	/**
	 * 标记通知为已读
	 * @url admin/system/notification/sys/markAsRead 前端调用的url参数地址
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

		const {
			notification_id
		} = data;

		if (!notification_id) {
			return {
				code: -1,
				msg: '通知ID不能为空'
			};
		}

		try {
			// 先获取通知记录
			const notificationRes = await db.collection('bpmn-notification')
				.doc(notification_id)
				.get();

			if (!notificationRes.data) {
				return {
					code: -1,
					msg: '通知不存在'
				};
			}

			const notification = notificationRes.data[0];

			// 检查用户是否有权限阅读此通知
			if (!notification.recipients.includes(userInfo.username)) {
				return {
					code: -1,
					msg: '无权操作此通知'
				};
			}

			// 更新当前用户的阅读状态
			const updatedReadStatus = notification.read_status.map(item => {
				if (item.user_id === userInfo.username) {
					return {
						...item,
						status: 'read',
						read_time: Date.now()
					};
				}
				return item;
			});

			// 如果当前用户的状态不存在，则添加
			const userStatusExists = notification.read_status.some(item => item.user_id === userInfo.username);
			if (!userStatusExists) {
				updatedReadStatus.push({
					user_id: userInfo.username,
					status: 'read',
					read_time: Date.now()
				});
			}

			// 更新通知记录
			await db.collection('bpmn-notification')
				.doc(notification_id)
				.update({
					read_status: updatedReadStatus
				});

			res.msg = '标记为已读成功';

		} catch (error) {
			console.error('标记通知为已读失败:', error);
			return {
				code: -1,
				msg: error.message
			};
		}

		return res;
	}
}