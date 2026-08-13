'use strict';
module.exports = {
	/**
	 * 从 timor.tech 同步指定年份的法定节假日及调休
	 * @url admin/attendance/calendar/sys/syncHolidays
	 * data: { year: 2027 }
	 */
	main: async (event) => {
		let {
			data = {}, userInfo, util
		} = event;
		let {
			vk,
			db
		} = util;
		let res = {
			code: 0,
			msg: '同步成功'
		};
		let {
			year,
			uid
		} = data;

		// 参数验证
		if (!year) {
			return {
				code: -1,
				msg: '年份不能为空'
			};
		}
		year = parseInt(year);
		if (year < 2000 || year > 2100) {
			return {
				code: -1,
				msg: '年份超出范围'
			};
		}

		const dbName = 'hrm-attendance-calendar';

		// 1. 检查该年是否有基础日历（至少需要工作日/周末打底）
		const countRes = await vk.baseDao.selects({
			dbName,
			whereJson: {
				year
			}
		});
		if (countRes.total === 0) {
			// 若没有基础数据，先生成全年日历
			await generateBaseCalendar(util, year, uid || 'system');
		}

		// 2. 调用 timor.tech 接口获取节假日数据（使用 vk.request）
		let holidayData;
		try {
			const apiResult = await vk.request({
				method: 'GET',
				url: `https://timor.tech/api/holiday/year/${year}`,
				contentType: 'json',
				dataType: 'json'
			});
			// vk.request 通常直接返回接口的 JSON 数据，若成功则结构为 { code: 0, holiday: {...} }
			if (apiResult && apiResult.code === 0) {
				holidayData = apiResult.holiday || {};
			} else {
				return {
					code: -1,
					msg: '获取节假日数据失败，返回格式异常'
				};
			}
		} catch (err) {
			return {
				code: -1,
				msg: '请求节假日接口异常：' + err.message
			};
		}

		// 3. 遍历更新每一天的日期类型
		let updateCount = 0;		
		const nowTime = new Date().getTime();

		for (let dateKey in holidayData) {
			const item = holidayData[dateKey];
			// dateKey 格式 "MM-DD"，需拼接成年份
			const calendar_date = `${year}-${dateKey}`;
			// holiday 为 true -> 法定节假日(3)，holiday 为 false -> 调休工作日(4)
			const date_type = item.holiday ? 3 : 4;
			const name = item.name || '';

			// 检查记录是否存在
			const existRes = await vk.baseDao.selects({
				dbName,
				whereJson: {
					calendar_date
				},
				limit: 1
			});
			let opRes;
			if (existRes.rows.length > 0) {
				// 存在则更新
				opRes = await vk.baseDao.update({
					dbName,
					whereJson: {
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
				// 不存在则新增（理论上不会出现）
				opRes = await vk.baseDao.add({
					dbName,
					dataJson: {
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
			if (opRes.code === 0) updateCount++;
		}

		res.total = updateCount;
		res.msg = `已同步 ${year} 年节假日/调休共 ${updateCount} 天`;
		return res;
	}
};

/**
 * 生成指定年份的基础日历（工作日+周末）
 */
async function generateBaseCalendar(util, year, uid) {
	const {
		vk
	} = util;
	const dbName = 'hrm-attendance-calendar';
	const start = new Date(year, 0, 1);
	const end = new Date(year, 11, 31);
	const dates = [];
	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		const dateStr = d.toISOString().slice(0, 10);
		const dayOfWeek = d.getDay();
		const date_type = (dayOfWeek === 0 || dayOfWeek === 6) ? 2 : 1;
		dates.push({
			calendar_date: dateStr,
			date_type,
			year: year,
			name: '',
			is_default: true,
			remark: '',
			update_id: uid,
			update_date: new Date().getTime()
		});
	}	
	await vk.baseDao.del({
		dbName,
		whereJson: {
			year
		}
	});
	if (dates.length > 0) {
		await vk.baseDao.adds({
			dbName,
			dataJson: dates
		});
	}
};