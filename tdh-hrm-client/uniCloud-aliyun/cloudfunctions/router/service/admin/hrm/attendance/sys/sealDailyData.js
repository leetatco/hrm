// admin/hrm/attendance/sys/sealDailyData
module.exports = {
	/**
	 * 封存日考勤数据
	 * @url admin/hrm/attendance/sys/sealDailyData
	 * data: {
	 *   seal_date: '2026-09-30',   // 封存到哪一天（含当天）
	 *   employee_ids: []           // 员工工号列表，为空表示全体
	 * }
	 */
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, db, _ } = util;
		const { seal_date, employee_ids = [], uid } = data;

		if (!seal_date) {
			return { code: -1, msg: '封存日期不能为空' };
		}

		const dbName = 'hrm-attendance-daily';

		// 1. 构建查询条件
		const whereJson = {
			attendance_date: db.command.lte(new Date(seal_date + 'T23:59:59.999').getTime()),
			sealed: _.neq(true)
		};
		if (employee_ids.length > 0) {
			whereJson.employee_id = _.in(employee_ids);
		}

		// 2. 先统计未封存的数据量
		const countRes = await vk.baseDao.count({
			dbName,
			whereJson
		});

		if (countRes === 0) {
			return {
				code: 0,
				msg: '没有需要封存的数据',
				count: 0
			};
		}

		// 3. 批量更新为已封存
		const nowTime = Date.now();
		const updateRes = await vk.baseDao.update({
			dbName,
			whereJson,
			dataJson: {
				sealed: true,
				sealed_date: seal_date,
				update_id: uid,
				update_date: nowTime
			}
		});

		return {
			code: 0,
			msg: `已封存 ${seal_date} 及之前的 ${countRes} 条日考勤数据`,
			count: countRes
		};
	}
};