module.exports = {
	/**
	 * 获取工作日历中已有的年份列表
	 * @url admin/hrm/attendance/sys/calendar/getYearList
	 */
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let {
			vk
		} = util;
		let res = {
			code: 0,
			msg: 'ok'
		};

		const dbName = 'hrm-attendance-calendar';
		// 查询所有记录的年份字段
		const result = await vk.baseDao.selects({
			dbName,
			fieldJson: {
				year: true
			},
			sortArr: [{
				name: 'year',
				type: 'desc'
			}]
		});

		// 手动去重并排序
		const yearSet = new Set();
		result.rows.forEach(item => {
			if (item.year) yearSet.add(item.year);
		});
		const rows = Array.from(yearSet)
			.sort((a, b) => b - a)
			.map(year => ({
				value: year,
				label: `${year}年`
			}));

		res.rows = rows;
		return res;
	}
};