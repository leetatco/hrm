module.exports = {
	/**
	 * 获取通知列表
	 * @url admin/bpmn/notification/pub/getList 前端调用的url参数地址
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
			userInfo,
			status,
			content,
			title
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		const {
			pageIndex = 1, pageSize = 10, formData = {}
		} = data;

		try {

			let dbName = "bpmn-notification"; // 表名

			let queryConditions = {
				recipients: db.command.in([userInfo.username])
			};

			// 关键词搜索
			if (content) {
				queryConditions.content = new RegExp(content);
			}

			if (title) {
				queryConditions.title = new RegExp(title);
			}

			console.log('查询条件:', JSON.stringify(queryConditions));

			// 状态筛选
			if (status && status !== 'all') {
				if (status === 'unread') {
					queryConditions['read_status'] = {
						$elemMatch: {
							user_id: userInfo.username,
							status: 'unread'
						}
					};
				} else if (status === 'read') {
					queryConditions['read_status'] = {
						$elemMatch: {
							user_id: userInfo.username,
							status: 'read'
						}
					};
				}
				console.log('添加状态筛选后的查询条件:', JSON.stringify(queryConditions));
			}

			// 获取总数
			const totalRes = await db.collection(dbName)
				.where(queryConditions)
				.count();

			console.log('总数查询结果:', totalRes);

			// 获取列表
			const listRes = await db.collection(dbName)
				.where(queryConditions)
				.orderBy('create_time', 'desc')
				.skip((pageIndex - 1) * pageSize)
				.limit(pageSize)
				.get();

			console.log('列表查询结果数量:', listRes.data ? listRes.data.length : 0);
			console.log('列表查询结果:', listRes);

			// 处理返回数据，添加当前用户的状态+			
			const processedList = listRes.data.map(notification => {
				const userStatus = notification.read_status.find(item => item.user_id === userInfo
					.username);
				return {
					...notification,
					status: userStatus ? userStatus.status : 'unread',
					read_time: userStatus ? userStatus.read_time : null
				};
			});

			console.log('处理后的列表数量:', processedList.length);

			res.data = {
				rows: processedList,
				total: totalRes.total,
				pageIndex,
				pageSize
			};

		} catch (error) {
			console.error('获取通知列表失败:', error);
			return {
				code: -1,
				msg: error.message
			};
		}

		return res;
	}
}