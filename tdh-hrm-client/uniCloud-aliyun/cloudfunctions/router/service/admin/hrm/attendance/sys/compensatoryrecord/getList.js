module.exports = {
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let {
			vk,
			db
		} = util;
		let {
			uid,
			company_ids = [],
			otherWhereJson,
			filterWhereJson
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		// 是否需要过滤公司别
		// filterWhereJson、company_ids是在云函数拦截器加载，otherWhereJson是在前端应用加载 		
		const whereJson = {
			...(filterWhereJson || {}),
			...(otherWhereJson || {})
		};		

		let dbName = 'hrm-attendance-compensatoryrecord';
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			sortArr: [{
				name: 'update_date',
				type: 'desc'
			}],
			foreignDB: [{
					dbName: 'hrm-employees',
					localKey: 'employee_id',
					foreignKey: 'employee_id',
					as: 'employees',
					limit: 1
				},
				{
					dbName: "uni-id-users",
					localKey: "update_id",
					foreignKey: "_id",
					as: "users",
					limit: 1
				}
			]
		});
		return res;
	}
};