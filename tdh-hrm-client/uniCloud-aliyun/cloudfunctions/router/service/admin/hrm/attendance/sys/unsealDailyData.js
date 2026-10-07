// admin/hrm/attendance/sys/unsealDailyData
module.exports = {
	/**
	 * 解封日考勤数据
	 * @url admin/hrm/attendance/sys/unsealDailyData
	 * data: {
	 *   seal_date: '2026-07-25',
	 *   employee_ids: []
	 * }
	 */
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, db, _ } = util;
		const { seal_date, employee_ids = [], uid } = data;

		if (!seal_date) {
			return { code: -1, msg: '解封日期不能为空' };
		}

		const dbName = 'hrm-attendance-daily';

		// 1. 构建查询条件：解封 <= seal_date 的已封存数据
		const whereJson = {
			attendance_date: db.command.lte(new Date(seal_date + 'T23:59:59.999').getTime()),
			sealed: true
		};
		if (employee_ids.length > 0) {
			whereJson.employee_id = _.in(employee_ids);
		}

		// 2. 统计已封存的数据量
		const countRes = await vk.baseDao.count({
			dbName,
			whereJson
		});

		if (countRes === 0) {
			return {
				code: 0,
				msg: '没有需要解封的数据',
				count: 0
			};
		}

		// 3. 批量更新为未封存
		const nowTime = Date.now();
		await vk.baseDao.update({
			dbName,
			whereJson,
			dataJson: {
				sealed: false,
				sealed_date: '',
				update_id: uid,
				update_date: nowTime
			}
		});

		return {
			code: 0,
			msg: `已解封 ${seal_date} 及之前的 ${countRes} 条日考勤数据`,
			count: countRes
		};
	}
};