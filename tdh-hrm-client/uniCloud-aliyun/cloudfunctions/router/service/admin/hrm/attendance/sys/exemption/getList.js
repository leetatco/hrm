module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk
		} = util;
		let res = {
			code: 0,
			msg: ''
		};

		res = await vk.baseDao.getTableData({
			dbName: 'hrm-attendance-exemption',
			data,
			sortArr: [{
				name: 'update_date',
				type: 'desc'
			}],
			foreignDB: [{
					dbName: 'hrm-employees',
					localKey: 'employee_ids',
					localKeyType: 'array',
					foreignKey: 'employee_id',
					as: 'employeeInfo'
				},
				{
					dbName: 'hrm-departments',
					localKey: 'department_ids',
					localKeyType: 'array',
					foreignKey: 'department_id',
					as: 'departmentInfo'
				},
				{
					dbName: 'hrm-attendance-group',
					localKey: 'attendance_group_ids',
					localKeyType: 'array',
					foreignKey: '_id',
					as: 'groupInfo'
				},
				{
					dbName: 'uni-id-users',
					localKey: 'update_id',
					foreignKey: '_id',
					as: 'users',
					limit: 1
				}
			]
		});
		return res;
	}
};