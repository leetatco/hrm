// admin/hrm/attendance/sys/calcMonthlyAttendance
module.exports = {
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, db } = util;
		const { year, month, employee_ids = [] } = data;

		if (!year || !month) {
			return { code: -1, msg: '年度和月份不能为空' };
		}

		// 1. 获取考勤参数，确定统计周期
		const paramsRes = await vk.callFunction({
			url: 'admin/hrm/attendance/pub/getParams',
			data: {}
		});
		const params = paramsRes.code === 0 ? paramsRes.rows : {};

		// 2. 计算统计周期起止日期
		const periodRange = getMonthlyPeriodRange(year, month, params);
		console.log(`统计周期：${periodRange.startStr} ~ ${periodRange.endStr}`);

		// 3. 获取员工列表
		let employees = [];
		if (employee_ids.length > 0) {
			employees = employee_ids;
		} else {
			const empRes = await vk.baseDao.selects({
				dbName: 'hrm-employees',
				whereJson: { status: 1 },
				fieldJson: { employee_id: true }
			});
			employees = empRes.rows.map(e => e.employee_id);
		}

		// 4. 查询周期内的日考勤数据
		const startTs = new Date(periodRange.startStr + 'T00:00:00').getTime();
		const endTs = new Date(periodRange.endStr + 'T23:59:59.999').getTime();

		const dailyRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-daily',
			whereJson: {
				employee_id: db.command.in(employees),
				attendance_date: db.command.gte(startTs).and(db.command.lte(endTs))
			},
			limit: 100000
		});

		// 按员工分组
		const dailyMap = {};
		for (const row of dailyRes.rows) {
			if (!dailyMap[row.employee_id]) dailyMap[row.employee_id] = [];
			dailyMap[row.employee_id].push(row);
		}

		// 5. 逐员工汇总
		let total = 0;
		const now = Date.now();

		for (const empId of employees) {
			const rows = dailyMap[empId] || [];

			let shouldDays = 0;
			let actualDays = 0;
			let restDays = 0;
			let lateCount = 0;
			let lateMinutes = 0;
			let earlyCount = 0;
			let earlyMinutes = 0;
			let absentCount = 0;
			let absentMinutes = 0;
			let overtimeMinutes = 0;
			let leaveMinutes = 0;
			let tripMinutes = 0;
			let outingMinutes = 0;
			let compensatoryMinutes = 0;
			let remedyCount = 0;

			for (const day of rows) {
				// 应出勤：有排班且不是休息日
				if (day.schedule_type !== 2 && day.shift_id) shouldDays++;

				// 实际出勤：正常状态（1）
				if (day.attendance_status === 1) actualDays++;

				// 休息日
				if (day.schedule_type === 2) restDays++;

				// 异常统计
				if (day.late_minutes > 0) { lateCount++; lateMinutes += day.late_minutes; }
				if (day.early_minutes > 0) { earlyCount++; earlyMinutes += day.early_minutes; }
				if (day.absent_minutes > 0) { absentCount++; absentMinutes += day.absent_minutes; }
				if (day.remedy_flag) remedyCount++;

				// 各类时长
				overtimeMinutes += day.overtime_minutes || 0;
				leaveMinutes += day.leave_minutes || 0;
				tripMinutes += day.trip_minutes || 0;
				outingMinutes += day.outing_minutes || 0;
				compensatoryMinutes += day.compensatory_minutes || 0;
			}

			// 全勤判定：无迟到、早退、旷工、缺卡
			const fullAttendance = (lateCount === 0 && earlyCount === 0 && absentCount === 0);

			const record = {
				employee_id: empId,
				year,
				month,
				period_start: periodRange.startStr,
				period_end: periodRange.endStr,
				should_days: shouldDays,
				actual_days: actualDays,
				rest_days: restDays,
				late_count: lateCount,
				late_minutes: lateMinutes,
				early_count: earlyCount,
				early_minutes: earlyMinutes,
				absent_count: absentCount,
				absent_minutes: absentMinutes,
				overtime_minutes: overtimeMinutes,
				leave_minutes: leaveMinutes,
				trip_minutes: tripMinutes,
				outing_minutes: outingMinutes,
				compensatory_minutes: compensatoryMinutes,
				remedy_count: remedyCount,
				full_attendance: fullAttendance,
				update_id: 'system',
				update_date: now
			};

			// upsert
			const existRes = await vk.baseDao.selects({
				dbName: 'hrm-attendance-monthly',
				whereJson: { employee_id: empId, year, month },
				limit: 1
			});

			if (existRes.rows.length > 0) {
				await vk.baseDao.updateById({
					dbName: 'hrm-attendance-monthly',
					id: existRes.rows[0]._id,
					dataJson: record
				});
			} else {
				await vk.baseDao.add({
					dbName: 'hrm-attendance-monthly',
					dataJson: record
				});
			}
			total++;
		}

		return {
			code: 0,
			msg: `成功汇总 ${year}年${month}月 共 ${total} 名员工`,
			total
		};
	}
};

// 计算月度统计周期
function getMonthlyPeriodRange(year, month, params) {
	if (params.monthly_period_type === 2) {
		// 固定日期段，如26日-次月25日
		const startDay = params.period_start_day || 26;
		let startDate, endDate;

		if (startDay > 1) {
			// 本月 startDay 日 ~ 次月 (startDay-1) 日
			startDate = new Date(year, month - 1, startDay);
			endDate = new Date(year, month, startDay - 1);
		} else {
			startDate = new Date(year, month - 1, 1);
			endDate = new Date(year, month, 0);
		}

		const fmt = (d) => {
			const yy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			return `${yy}-${mm}-${dd}`;
		};

		return { startStr: fmt(startDate), endStr: fmt(endDate) };
	} else {
		// 自然月
		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 0);
		const fmt = (d) => {
			const yy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			return `${yy}-${mm}-${dd}`;
		};
		return { startStr: fmt(startDate), endStr: fmt(endDate) };
	}
}