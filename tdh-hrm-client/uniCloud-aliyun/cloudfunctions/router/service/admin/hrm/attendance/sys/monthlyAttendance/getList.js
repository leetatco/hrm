module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk
		} = util;
		let res = await vk.baseDao.getTableData({
			dbName: 'hrm-attendance-monthly',
			data,
			sortArr: [{
				name: 'year',
				type: 'desc'
			}, {
				name: 'month',
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