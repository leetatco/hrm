module.exports = {
	/**
	 * 计算日考勤结果
	 * data: {
	 *   employee_id?: string,
	 *   date?: string,        // 单个日期，或与 employee_id 配合
	 *   start_date?: string,
	 *   end_date?: string
	 * }
	 */
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk,
			db
		} = util;
		const {
			employee_id,
			date,
			start_date,
			end_date
		} = data;

		// 确定日期范围
		let dates = [];
		if (date) {
			dates = [date];
		} else if (start_date && end_date) {
			const start = new Date(start_date);
			const end = new Date(end_date);
			for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
				dates.push(d.toISOString().slice(0, 10));
			}
		} else {
			// 默认计算昨天
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			dates.push(yesterday.toISOString().slice(0, 10));
		}

		let employees = [];
		if (employee_id) {
			employees = [employee_id];
		} else {
			// 查询所有在职员工
			const empRes = await vk.baseDao.selects({
				dbName: 'hrm-employees',
				whereJson: {
					status: 1
				},
				fieldJson: {
					employee_id: true
				}
			});
			employees = empRes.rows.map(e => e.employee_id);
		}

		let total = 0;
		for (const empId of employees) {
			for (const dateStr of dates) {
				try {
					await calcOneDay(empId, dateStr, util);
					total++;
				} catch (e) {
					console.error(`计算失败 ${empId} ${dateStr}:`, e.message);
				}
			}
		}
		return {
			code: 0,
			msg: `成功计算${total}条记录`,
			total
		};
	}
};

// 计算单个员工某一天的考勤
async function calcOneDay(employeeId, dateStr, util) {
	const {
		vk,
		db
	} = util;

	// 1. 获取排班
	const scheduleRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-schedule',
		whereJson: {
			employee_id: employeeId,
			schedule_date: dateStr
		},
		limit: 1
	});
	const schedule = scheduleRes.rows[0];
	if (!schedule || !schedule.shift_id) {
		// 无排班，可能是休息日，不生成日结果（或生成休息日记录）
		return;
	}

	// 2. 获取班次信息
	const shiftRes = await vk.baseDao.findById({
		dbName: 'hrm-attendance-shift',
		id: schedule.shift_id
	});
	if (!shiftRes || shiftRes.status === false) return;
	const shift = shiftRes;
	const onTime = shift.start_time; // 如 09:00
	const offTime = shift.end_time; // 如 18:00

	// 3. 获取打卡记录（当天所有打卡）
	const clockRes = await vk.baseDao.selects({
		dbName: 'hrm-clockin',
		whereJson: {
			employee_id: employeeId,
			clockintime: db.command.gte(dateStr + ' 00:00:00').and(db.command.lte(dateStr + ' 23:59:59'))
		},
		sortArr: [{
			name: 'clockintime',
			type: 'asc'
		}]
	});
	const punches = clockRes.rows;

	// 4. 获取请假记录（当天）
	const leaveRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leaverecord',
		whereJson: {
			employee_id: employeeId,
			leave_date: new Date(dateStr).getTime() // 由于leave_date存时间戳，需转换查询
		}
	});
	const leaveRecords = leaveRes.rows;
	const leaveHours = leaveRecords.reduce((sum, r) => sum + r.total_hours, 0);

	// 5. 获取出差记录（时间范围包含当天）
	const dayStart = new Date(dateStr + 'T00:00:00').getTime();
	const dayEnd = new Date(dateStr + 'T23:59:59').getTime();
	const tripRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-triprecord',
		whereJson: {
			employee_id: employeeId,
			start_time: db.command.lte(dayEnd),
			end_time: db.command.gte(dayStart)
		}
	});
	const tripRecords = tripRes.rows;
	const tripHours = tripRecords.reduce((sum, r) => {
		// 计算该出差记录在当天的重叠小时数（简化：直接使用记录里的total_hours，或精确计算）
		return sum + (r.total_hours || 0);
	}, 0);

	// 6. 获取调休记录（当天）
	const compRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-compensatoryrecord',
		whereJson: {
			employee_id: employeeId,
			compensatory_date: dateStr
		}
	});
	const compRecords = compRes.rows;
	const compHours = compRecords.reduce((sum, r) => sum + r.total_hours, 0);

	// 7. 获取补卡记录（当天）
	const remedyRes = await vk.baseDao.selects({
		dbName: 'bpmn-application-form', // 直接查OA审批表
		whereJson: {
			applicant_id: employeeId,
			form_type_code: 'MISS_PUNCH_RECORD',
			status: 'approved',
			'form_data.remedy_date': dateStr
		}
	});
	const remedyRecords = remedyRes.rows;
	let remedyIn, remedyOut;
	if (remedyRecords.length > 0) {
		const last = remedyRecords[0]; // 取最近一条
		remedyIn = last.form_data.actual_clock_in;
		remedyOut = last.form_data.actual_clock_out;
	}

	// 8. 确定打卡时间
	let clockIn = null,
		clockOut = null;
	if (punches.length > 0) {
		const firstPunch = punches[0];
		const lastPunch = punches[punches.length - 1];
		clockIn = firstPunch.clockintime.split(' ')[1]?.slice(0, 5); // HH:mm
		clockOut = lastPunch.clockintime.split(' ')[1]?.slice(0, 5);
	}

	// 9. 应用补卡修正
	if (remedyIn && !clockIn) clockIn = remedyIn;
	if (remedyOut && !clockOut) clockOut = remedyOut;

	// 10. 计算迟到早退旷工
	let lateMinutes = 0,
		earlyMinutes = 0,
		absentMinutes = 0;
	// 迟到：有上班打卡且晚于onTime一定阈值（迟到阈值从参数配置中获取，这里简化：晚1分钟算迟到）
	if (clockIn && onTime) {
		const [onH, onM] = onTime.split(':').map(Number);
		const [inH, inM] = clockIn.split(':').map(Number);
		const onTotal = onH * 60 + onM;
		const inTotal = inH * 60 + inM;
		if (inTotal > onTotal) lateMinutes = inTotal - onTotal;
	}
	// 早退：有下班打卡且早于offTime
	if (clockOut && offTime) {
		const [offH, offM] = offTime.split(':').map(Number);
		const [outH, outM] = clockOut.split(':').map(Number);
		const offTotal = offH * 60 + offM;
		const outTotal = outH * 60 + outM;
		if (outTotal < offTotal) earlyMinutes = offTotal - outTotal;
	}
	// 旷工：既无打卡也无请假/出差/调休，或迟到早退超过一定时长（例如30分钟以上）
	const absentThreshold = 30; // 可从全局参数获取
	if (!clockIn && !clockOut && leaveHours === 0 && tripHours === 0 && compHours === 0) {
		absentMinutes = 8 * 60; // 全天旷工
	} else if (lateMinutes >= absentThreshold || earlyMinutes >= absentThreshold) {
		absentMinutes = lateMinutes >= absentThreshold ? lateMinutes : earlyMinutes;
	}

	// 11. 加班计算（简化：加班小时可暂不在此计算，或根据打卡和班次下班后时间计算）
	let overtimeHours = 0;
	if (clockOut && offTime) {
		const [offH, offM] = offTime.split(':').map(Number);
		const [outH, outM] = clockOut.split(':').map(Number);
		const offTotal = offH * 60 + offM;
		const outTotal = outH * 60 + outM;
		if (outTotal > offTotal) {
			overtimeHours = (outTotal - offTotal) / 60;
		}
	}

	// 12. 考勤状态
	let attendanceStatus = 0; // 异常
	if (leaveHours > 0) attendanceStatus = 2;
	else if (tripHours > 0) attendanceStatus = 3;
	else if (compHours > 0) attendanceStatus = 4;
	else if (absentMinutes > 0) attendanceStatus = 5;
	else if (lateMinutes === 0 && earlyMinutes === 0) attendanceStatus = 1;
	else if (lateMinutes > 0 || earlyMinutes > 0) attendanceStatus = 0; // 异常

	// 13. 构造记录
	const record = {
		employee_id: employeeId,
		attendance_date: dateStr,
		shift_id: shift._id,
		shift_name: shift.shift_name,
		schedule_type: 1, // 可进一步从日历获取
		clock_in: clockIn,
		clock_out: clockOut,
		late_minutes: lateMinutes,
		early_minutes: earlyMinutes,
		absent_minutes: absentMinutes,
		overtime_hours: overtimeHours,
		leave_hours: leaveHours,
		trip_hours: tripHours,
		compensatory_hours: compHours,
		remedy_flag: remedyRecords.length > 0,
		attendance_status: attendanceStatus
	};

	// 14. 插入或更新
	const existRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-daily',
		whereJson: {
			employee_id: employeeId,
			attendance_date: dateStr
		},
		limit: 1
	});
	if (existRes.rows.length > 0) {
		await vk.baseDao.updateById({
			dbName: 'hrm-attendance-daily',
			id: existRes.rows[0]._id,
			dataJson: record
		});
	} else {
		await vk.baseDao.add({
			dbName: 'hrm-attendance-daily',
			dataJson: record
		});
	}
}