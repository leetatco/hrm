module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk
		} = util;
		let {
			uid,
			company_ids = [],
			otherWhereJson,
			filterWhereJson
		} = data;

		// 是否需要过滤公司别
		// filterWhereJson、company_ids是在云函数拦截器加载，otherWhereJson是在前端应用加载 		
		const whereJson = {
			...(filterWhereJson || {}),
			...(otherWhereJson || {})
		};		

		let res = await vk.baseDao.getTableData({
			dbName: 'hrm-attendance-monthly',
			data,
			sortArr: [{
				name: 'attendance_ym',
				type: 'desc'
			}, {
				name: 'employee_id',
				type: 'asc'
			}],
			foreignDB: [
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