module.exports = {
	/**
	 * 获取工作日历列表（按 calendar_name + year 去重）
	 * @url admin/hrm/attendance/sys/calendar/getCalendarList
	 */
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let { vk, _, $ } = util;
		let res = { code: 0, msg: 'ok' };

		const dbName = 'hrm-attendance-calendar';

		// 获取当前年份和明年
		const currentYear = new Date().getFullYear();
		const nextYear = currentYear + 1;

		// 按 calendar_name + year 分组，统计每个日历每年的记录数
		const result = await vk.baseDao.selects({
			dbName,
			whereJson: {
				year: _.in([currentYear, nextYear])
			},
			groupJson: {
				_id: {
					calendar_name: '$calendar_name',
					year: '$year'
				},
				calendar_name: $.first('$calendar_name'),
				calendar_code: $.first('$calendar_code'),
				year: $.first('$year'),
				count: $.sum(1)
			},
			sortArr: [
				{ name: 'calendar_name', type: 'asc' },
				{ name: 'year', type: 'desc' }
			],
			pageSize: -1
		});

		// 构建返回数据
		const rows = (result.rows || []).map(item => {
			const calendar_name = item.calendar_name || '';
			const year = item.year || '';
			const calendar_code = item.calendar_code || `${calendar_name}_${year}`;
			return {
				value: calendar_code,
				calendar_code: calendar_code,
				calendar_name: calendar_name,
				year: year,
				label: `${calendar_name}（${year}）`,
				hasData: item.count > 0,
				status: item.count > 0 ? '已设定' : '未设定',
				count: item.count || 0
			};
		});

		res.rows = rows;
		return res;
	}
};