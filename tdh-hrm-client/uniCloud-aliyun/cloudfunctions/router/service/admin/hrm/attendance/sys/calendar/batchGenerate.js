'use strict';
module.exports = {
	/**
	 * 从 timor.tech 同步指定年份的法定节假日及调休
	 * @url admin/hrm/attendance/sys/calendar/syncHolidays
	 * data: { year: 2027, calendar_name: '研发部工作日历', saturday_work: false }
	 */
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let { vk } = util;
		let res = { code: 0, msg: '同步成功' };

		let {
			year,
			calendar_name,
			saturday_work = false,
			uid
		} = data;

		// 参数验证
		if (!year) {
			return { code: -1, msg: '年份不能为空' };
		}
		if (!calendar_name) {
			return { code: -1, msg: '工作日历名称不能为空' };
		}
		year = parseInt(year);
		if (year < 2000 || year > 2100) {
			return { code: -1, msg: '年份超出范围' };
		}

		const dbName = 'hrm-attendance-calendar';
		const calendar_code = `${calendar_name}_${year}`;

		// 1. 生成全年基础日历
		await generateBaseCalendar(
			util,
			year,
			calendar_name,
			calendar_code,
			saturday_work,
			uid || 'system'
		);

		// 2. 请求 timor.tech 获取节假日
		let holidayData;
		try {
			const apiResult = await vk.request({
				method: 'GET',
				url: `https://timor.tech/api/holiday/year/${year}`,
				contentType: 'json',
				dataType: 'json'
			});
			if (apiResult && apiResult.code === 0) {
				holidayData = apiResult.holiday || {};
			} else {
				return { code: -1, msg: '获取节假日数据失败，返回格式异常' };
			}
		} catch (err) {
			return { code: -1, msg: '请求节假日接口异常：' + err.message };
		}

		// 3. 遍历更新每一天的日期类型
		let updateCount = 0;
		const nowTime = new Date().getTime();

		for (let dateKey in holidayData) {
			const item = holidayData[dateKey];
			const calendar_date = `${year}-${dateKey}`;
			const date_type = item.holiday ? 3 : 4;
			const name = item.name || '';

			const existRes = await vk.baseDao.selects({
				dbName,
				whereJson: {
					calendar_name,
					year,
					calendar_date
				},
				limit: 1
			});

			if (existRes.rows.length > 0) {
				await vk.baseDao.update({
					dbName,
					whereJson: {
						calendar_name,
						year,
						calendar_date
					},
					dataJson: {
						date_type,
						name,
						is_default: false,
						update_id: uid,
						update_date: nowTime
					}
				});
			} else {
				await vk.baseDao.add({
					dbName,
					dataJson: {
						calendar_name,
						calendar_code,
						calendar_date,
						date_type,
						year,
						name,
						is_default: false,
						update_id: uid,
						update_date: nowTime
					}
				});
			}
			updateCount++;
		}

		res.total = updateCount;
		const satTip = saturday_work ? '周六上班' : '周六休息';
		res.msg = `已同步【${calendar_name}（${year}）】节假日/调休共 ${updateCount} 天（${satTip}）`;
		return res;
	}
};

/**
 * 生成指定年份的基础日历（工作日+周末）
 */
async function generateBaseCalendar(util, year, calendar_name, calendar_code, saturday_work, uid) {
	const { vk } = util;
	const dbName = 'hrm-attendance-calendar';
	const start = new Date(year, 0, 1);
	const end = new Date(year, 11, 31);
	const dates = [];
	const currentDate = new Date(start);
	const nowTime = new Date().getTime();

	while (currentDate <= end) {
		const dateStr = vk.pubfn.timeFormat(currentDate, 'yyyy-MM-dd');
		const dayOfWeek = currentDate.getDay();

		let date_type;
		if (dayOfWeek === 0) {
			date_type = 2;
		} else if (dayOfWeek === 6) {
			date_type = saturday_work ? 1 : 2;
		} else {
			date_type = 1;
		}

		dates.push({
			calendar_name,
			calendar_code,
			calendar_date: dateStr,
			date_type,
			year,
			name: '',
			is_default: true,
			remark: '',
			update_id: uid,
			update_date: nowTime
		});

		currentDate.setDate(currentDate.getDate() + 1);
	}

	await vk.baseDao.del({
		dbName,
		whereJson: {
			calendar_name,
			year
		}
	});

	if (dates.length > 0) {
		await vk.baseDao.adds({
			dbName,
			dataJson: dates
		});
	}

	return dates.length;
}