// cloudfunctions/admin/bpmn/process-route-config/getConditionRules/index.js
module.exports = {
	main: async (event) => {
		let {
			data = {}, userInfo, util, filterResponse, originalParam
		} = event;
		let {
			vk,
			db
		} = util;

		let {
			uid,
			code
		} = data;

		let res = {
			code: 0,
			msg: ''
		};

		try {
			let dbName = "bpmn-condition-rule"; // 表名
			data.pageIndex = 1;
			data.pageSize = -1;
			res = await vk.baseDao.getTableData({
				dbName,
				data,
				whereJson: {
					status: "active"
				},
				fieldJson: {
					_id: true,
					name: true,
					code: true,
					description: true
				}
			})

		} catch (error) {
			console.error('获取条件规则失败:', error);
			res.code = -1;
			res.msg = `获取失败: ${error.message}`;
		}

		return res;
	}
};