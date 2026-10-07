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
				name: 'attendance_ym',
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