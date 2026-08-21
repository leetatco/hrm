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
			uid
		} = data;
		
		let res = await vk.baseDao.getTableData({
			dbName: 'hrm-attendance-daily',
			data,
			sortArr: [{
				name: 'attendance_date',
				type: 'desc'
			}, {
				name: 'employee_id',
				type: 'asc'
			}],
			foreignDB: [{
				dbName: 'hrm-employees',
				localKey: 'employee_id',
				foreignKey: 'employee_id',
				as: 'employeeInfo',
				limit: 1
			}]
		});

		return res;
	}
};