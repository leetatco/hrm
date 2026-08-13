// cloudfunctions/admin/system/notification/sys/markAllAsRead.js
module.exports = {
	/**
	 * 全部标记为已读
	 * @url admin/system/notification/sys/markAllAsRead 前端调用的url参数地址
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

		try {
			// 获取当前用户的所有未读通知
			const unreadNotificationsRes = await db.collection('bpmn-notification')
				.where({
					recipients: userInfo.username,
					'read_status': {
						$elemMatch: {
							user_id: userInfo.username,
							status: 'unread'
						}
					}
				})
				.get();

			if (!unreadNotificationsRes.data || unreadNotificationsRes.data.length === 0) {
				res.msg = '没有未读通知';
				return res;
			}

			// 批量更新所有未读通知
			const updatePromises = unreadNotificationsRes.data.map(notification => {
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

				return db.collection('bpmn-notification')
					.doc(notification._id)
					.update({
						read_status: updatedReadStatus
					});
			});

			await Promise.all(updatePromises);

			res.msg = `成功标记 ${unreadNotificationsRes.data.length} 条通知为已读`;

		} catch (error) {
			console.error('全部标记为已读失败:', error);
			return {
				code: -1,
				msg: error.message
			};
		}

		return res;
	}
}