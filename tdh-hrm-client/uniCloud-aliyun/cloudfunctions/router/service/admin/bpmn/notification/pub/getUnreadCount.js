module.exports = {
	/**
	 * 获取未读通知数量
	 * @url admin/bpmn/notification/sys/getUnreadCount 前端调用的url参数地址
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
			// 查询当前用户的未读通知数量
			// 使用聚合查询来统计			
			let aggregateRes = {};
			if (vk.pubfn.isNotNull(userInfo)) {
				aggregateRes = await db.collection('bpmn-notification')
					.aggregate()
					.match({
						recipients: userInfo.username,
						'read_status': {
							$elemMatch: {
								user_id: userInfo.username,
								status: 'unread'
							}
						}
					})
					.count('count')
					.end();

				res.data = {
					count: aggregateRes.data && aggregateRes.data.length > 0 ? aggregateRes.data[0].count :
						0
				};
			} else {
				res.data = {
					count: 0
				}
			}

		} catch (error) {
			console.error('获取未读通知数量失败:', error);
			return {
				code: -1,
				msg: error.message
			};
		}

		return res;
	}
}