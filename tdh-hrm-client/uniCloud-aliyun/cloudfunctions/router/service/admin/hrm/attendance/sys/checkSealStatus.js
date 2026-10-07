// admin/hrm/attendance/sys/checkSealStatus
module.exports = {
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, db, _ } = util;
		const { employee_ids = [] } = data;

		const dbName = 'hrm-attendance-daily';

		const whereJson = {
			sealed: _.neq(true)
		};
		if (employee_ids.length > 0) {
			whereJson.employee_id = _.in(employee_ids);
		}

		const countRes = await vk.baseDao.count({
			dbName,
			whereJson
		});

		if (countRes === 0) {
			return {
				code: 0,
				hasUnsealed: false,
				unsealedCount: 0
			};
		}

		// 查最早的未封存日期
		const earliestRes = await vk.baseDao.selects({
			dbName,
			whereJson,
			sortArr: [{ name: 'attendance_date', type: 'asc' }],
			limit: 1
		});
		const earliestDate = vk.pubfn.timeFormat(new Date(earliestRes.rows[0].attendance_date), 'yyyy-MM-dd');

		// 查最晚的未封存日期
		const latestRes = await vk.baseDao.selects({
			dbName,
			whereJson,
			sortArr: [{ name: 'attendance_date', type: 'desc' }],
			limit: 1
		});
		const latestDate = vk.pubfn.timeFormat(new Date(latestRes.rows[0].attendance_date), 'yyyy-MM-dd');

		return {
			code: 0,
			hasUnsealed: true,
			unsealedCount: countRes,
			earliestUnsealedDate: earliestDate,
			latestUnsealedDate: latestDate,
			suggestedSealDate: latestDate   // 建议封存日期 = 最晚未封存日期
		};
	}
};