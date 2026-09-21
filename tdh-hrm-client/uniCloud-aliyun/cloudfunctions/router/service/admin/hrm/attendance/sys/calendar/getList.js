module.exports = {
	/**
	 * 获取工作日历列表（三级树：年份 → 日历 → 日期）
	 * @url admin/hrm/attendance/sys/calendar/getList
	 */
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let { vk, _, $ } = util;
		let res = { code: 0, msg: 'ok' };

		const dbName = 'hrm-attendance-calendar';

		// 分页参数（树形结构一般不分页，但保留接口兼容）
		let {
			uid			
		} = data;
		
		data.pageSize = -1;
		data.pageIndex = 1;

		// 查询所有数据
		let listRes = await vk.baseDao.getTableData({
			dbName,
			data,
			sortArr: [
				{ name: 'year', type: 'desc' },
				{ name: 'calendar_name', type: 'asc' },
				{ name: 'calendar_date', type: 'asc' }
			]
		});		

		const list = listRes.rows || [];

		// 组装成三级树
		const yearMap = new Map();

		list.forEach(item => {
			const year = item.year;
			const calendar_name = item.calendar_name;
			const calendar_code = item.calendar_code || `${calendar_name}_${year}`;

			// 第一级：年份
			if (!yearMap.has(year)) {
				yearMap.set(year, {
					_id: `year_${year}`,
					type: "year",
					year: year,
					title: `${year}年`,
					children: []
				});
			}
			const yearNode = yearMap.get(year);

			// 第二级：工作日历
			let calendarNode = yearNode.children.find(c => c.calendar_code === calendar_code);
			if (!calendarNode) {
				calendarNode = {
					_id: `calendar_${calendar_code}`,
					type: "calendar",
					year: year,
					calendar_name: calendar_name,
					calendar_code: calendar_code,
					title: calendar_name,
					children: []
				};
				yearNode.children.push(calendarNode);
			}

			// 第三级：日期
			calendarNode.children.push({
				...item,
				_id: item._id,
				type: "date",
				title: item.calendar_date
			});
		});

		// 转成数组
		const rows = Array.from(yearMap.values())
			.sort((a, b) => b.year - a.year);

		res.rows = rows;
		res.total = rows.length;
		return res;
	}
};