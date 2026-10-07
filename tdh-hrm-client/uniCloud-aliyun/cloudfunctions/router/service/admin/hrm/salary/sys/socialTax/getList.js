// admin/hrm/salary/sb/sys/getList
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk } = util;

		const dbName = "hrm-salary-social-tax";

		const res = await vk.baseDao.getTableData({
			dbName,
			data,
			sortArr: [
				{ name: 'attendance_ym', type: 'desc' },
				{ name: 'card', type: 'asc' }
			],
			foreignDB: [{
					dbName: 'hrm-employees',
					localKey: 'card',
					foreignKey: 'card',
					as: 'employees',
					limit: 1
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