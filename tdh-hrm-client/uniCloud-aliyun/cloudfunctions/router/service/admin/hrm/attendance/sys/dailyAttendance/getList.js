module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk,
			db
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
			dbName: 'hrm-attendance-daily',
			data,
			sortArr: [{
				name: 'employee_id',
				type: 'asc'
			}, {
				name: 'attendance_date',
				type: 'asc'
			}]
		});

		return res;
	}
};