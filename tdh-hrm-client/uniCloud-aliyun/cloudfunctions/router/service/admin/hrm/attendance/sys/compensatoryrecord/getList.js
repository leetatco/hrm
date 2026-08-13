module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: '' };

		let dbName = 'hrm-attendance-compensatoryrecord';
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			sortArr: [{ name: 'update_date', type: 'desc' }],
			foreignDB: [
				{
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