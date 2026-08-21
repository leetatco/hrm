module.exports = {
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
			start_date,
			end_date
		} = data;

		// ========== 1. 日期范围生成（本地日期，避免UTC偏移） ==========
		let dates = [];
		if (start_date && end_date) {
			const start = new Date(start_date);
			const end = new Date(end_date);
			for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
				dates.push(vk.pubfn.timeFormat(d, 'yyyy-MM-dd'));
			}
		} else {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			dates.push(vk.pubfn.timeFormat(yesterday, 'yyyy-MM-dd'));
		}

		// ========== 2. 获取员工列表 ==========
		let employees = [];
		if (employee_id) {
			employees = [employee_id];
		} else {
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

		console.log('计算范围：员工数=', employees.length, '日期数=', dates.length);

		const stats = {
			total: 0,
			success: 0,
			skipped: {
				no_data: 0,
				error: 0
			},
			errors: []
		};

		for (const empId of employees) {
			for (const dateStr of dates) {
				stats.total++;
				try {
					const result = await calcOneDay(empId, dateStr, util);
					if (result.status === 'success') {
						stats.success++;
					} else {
						stats.skipped[result.status]++;
					}
				} catch (e) {
					stats.skipped.error++;
					stats.errors.push({
						empId,
						dateStr,
						error: e.message
					});
					console.error(`计算异常 ${empId} ${dateStr}:`, e.message);
				}
			}
		}

		console.log('统计结果:', stats);
		return {
			code: 0,
			msg: `成功计算${stats.success}条记录，跳过${stats.total - stats.success}条`,
			total: stats.total,
			stats
		};
	}
};

// ==================== 辅助函数 ====================
function extractHHmmFromTimestamp(timestamp) {
	if (!timestamp) return null;
	const date = new Date(timestamp);
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
}

function toMinutes(hhmm) {
	const [h, m] = hhmm.split(':').map(Number);
	return h * 60 + m;
}

function diffMinutes(a, b) {
	return toMinutes(b) - toMinutes(a);
}

function calcOverlapHours(start1, end1, start2, end2) {
	const overlapStart = Math.max(start1, start2);
	const overlapEnd = Math.min(end1, end2);
	if (overlapStart >= overlapEnd) return 0;
	return (overlapEnd - overlapStart) / (1000 * 60 * 60);
}

// ==================== 单日计算 ====================
async function calcOneDay(employeeId, dateStr, util) {
	const {
		vk,
		db
	} = util;

	const dayStartTs = new Date(dateStr + 'T00:00:00').getTime();
	const dayEndTs = new Date(dateStr + 'T23:59:59.999').getTime();

	// ========== 1. 并行查询请假、出差、调休、补卡、加班、排班、打卡（独立查询） ==========
	const [leaveRes, tripRes, compRes, remedyRes, overtimeRes, scheduleRes, clockRes] = await Promise.all([
		vk.baseDao.selects({
			dbName: 'hrm-attendance-leaverecord',
			whereJson: {
				employee_id: employeeId,
				leave_date: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs))
			}
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-triprecord',
			whereJson: {
				employee_id: employeeId,
				start_time: db.command.lte(dayEndTs),
				end_time: db.command.gte(dayStartTs)
			}
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-compensatoryrecord',
			whereJson: {
				employee_id: employeeId,
				compensatory_date: dateStr
			}
		}),
		vk.baseDao.selects({
			dbName: 'bpmn-application-form',
			whereJson: {
				applicant_id: employeeId,
				form_type_code: 'MISS_PUNCH_RECORD',
				status: 'approved',
				'form_data.remedy_date': dateStr
			}
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-overtimerecord',
			whereJson: {
				employee_id: employeeId,
				overtime_date: dateStr,
				import_status: 1
			}
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-schedule',
			whereJson: {
				employee_id: employeeId,
				schedule_date: dateStr
			},
			limit: 1
		}),
		vk.baseDao.selects({
			dbName: 'hrm-clockin',
			whereJson: {
				employee_id: employeeId,
				type: '公司卡',
				clockintime: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs))
			},
			sortArr: [{
				name: 'clockintime',
				type: 'asc'
			}]
		})
	]);

	// 计算各类小时数
	const leaveHours = leaveRes.rows.reduce((sum, r) => sum + (r.total_hours || 0), 0);
	const tripHours = tripRes.rows.reduce((sum, r) => {
		return sum + calcOverlapHours(r.start_time, r.end_time, dayStartTs, dayEndTs);
	}, 0);
	const compHours = compRes.rows.reduce((sum, r) => sum + (r.total_hours || 0), 0);
	const overtimeHoursFromRecord = overtimeRes.rows.reduce((sum, r) => sum + (r.total_hours || 0), 0);

	const remedyRecords = remedyRes.rows;
	let remedyIn, remedyOut;
	if (remedyRecords.length > 0) {
		const last = remedyRecords[0];
		remedyIn = last.form_data && last.form_data.actual_clock_in;
		remedyOut = last.form_data && last.form_data.actual_clock_out;
	}

	// 排班与班次信息
	const schedule = scheduleRes.rows[0];
	let shift = null;
	let segments = [];
	if (schedule && schedule.shift_id) {
		// 此处班次查询依赖于排班结果，单独查询
		const shiftRes = await vk.baseDao.findById({
			dbName: 'hrm-attendance-shift',
			id: schedule.shift_id
		});
		if (shiftRes && shiftRes.status) {
			shift = shiftRes;
			segments = shift.segments || [];
		}
	}

	// ========== 2. 无排班但有特殊记录（请假/出差/调休/加班） ==========
	if (!shift || segments.length === 0) {
		const hasSpecialRecord = leaveHours > 0 || tripHours > 0 || compHours > 0 || overtimeHoursFromRecord > 0;
		if (!hasSpecialRecord) {
			console.log(`[跳过] ${employeeId} ${dateStr} 无排班且无特殊记录`);
			return {
				status: 'no_data'
			};
		}

		// 按优先级确定状态
		let attendanceStatus = 0;
		if (leaveHours > 0) attendanceStatus = 2;
		else if (tripHours > 0) attendanceStatus = 3;
		else if (compHours > 0) attendanceStatus = 4;
		else if (overtimeHoursFromRecord > 0) attendanceStatus = 6;

		const record = {
			employee_id: employeeId,
			attendance_date: dayStartTs,
			shift_id: null,
			shift_name: '',
			segments: [],
			late_minutes: 0,
			early_minutes: 0,
			absent_minutes: 0,
			overtime_hours: overtimeHoursFromRecord,
			leave_hours: leaveHours,
			trip_hours: tripHours,
			compensatory_hours: compHours,
			remedy_flag: false,
			attendance_status: attendanceStatus,
			update_id: 'system',
			update_date: Date.now()
		};

		await upsertDailyRecord(employeeId, dayStartTs, record, util);
		console.log(`[成功] ${employeeId} ${dateStr} 状态=${attendanceStatus} (无排班特殊记录)`);
		return {
			status: 'success'
		};
	}

	// ========== 3. 有排班，优先处理特殊状态（忽略打卡） ==========
	if (leaveHours > 0) {
		await createSpecialRecord(employeeId, dayStartTs, shift, leaveHours, tripHours, compHours,
			overtimeHoursFromRecord, 2, util);
		console.log(`[成功] ${employeeId} ${dateStr} 状态=2 (请假)`);
		return {
			status: 'success'
		};
	}

	if (tripHours > 0) {
		await createSpecialRecord(employeeId, dayStartTs, shift, leaveHours, tripHours, compHours,
			overtimeHoursFromRecord, 3, util);
		console.log(`[成功] ${employeeId} ${dateStr} 状态=3 (出差)`);
		return {
			status: 'success'
		};
	}

	if (compHours > 0) {
		await createSpecialRecord(employeeId, dayStartTs, shift, leaveHours, tripHours, compHours,
			overtimeHoursFromRecord, 4, util);
		console.log(`[成功] ${employeeId} ${dateStr} 状态=4 (调休)`);
		return {
			status: 'success'
		};
	}

	// ========== 4. 正常打卡计算 ==========
	const punches = clockRes.rows;
	console.log(`[计算] ${employeeId} ${dateStr} 打卡记录数=${punches.length}`);

	const PUNCH_WINDOW = 90; // 分钟
	const segmentResults = [];
	const usedPunchIndexes = new Set();

	for (const seg of segments) {
		const segStartMin = toMinutes(seg.start_time);
		const segEndMin = toMinutes(seg.end_time);

		let inPunch = null,
			outPunch = null;
		let missingIn = false,
			missingOut = false;
		let bestInDiff = Infinity,
			bestOutDiff = Infinity;
		let bestInIdx = -1,
			bestOutIdx = -1;

		// 找签到卡
		for (let i = 0; i < punches.length; i++) {
			if (usedPunchIndexes.has(i)) continue;
			const hhmm = extractHHmmFromTimestamp(punches[i].clockintime);
			const pMin = toMinutes(hhmm);
			const diff = Math.abs(pMin - segStartMin);
			if (diff <= PUNCH_WINDOW && diff < bestInDiff) {
				bestInDiff = diff;
				bestInIdx = i;
				inPunch = hhmm;
			}
		}

		// 找签退卡
		for (let i = 0; i < punches.length; i++) {
			if (usedPunchIndexes.has(i)) continue;
			if (i === bestInIdx) continue;
			const hhmm = extractHHmmFromTimestamp(punches[i].clockintime);
			const pMin = toMinutes(hhmm);
			const diff = Math.abs(pMin - segEndMin);
			if (diff <= PUNCH_WINDOW && diff < bestOutDiff) {
				bestOutDiff = diff;
				bestOutIdx = i;
				outPunch = hhmm;
			}
		}

		if (bestInIdx !== -1) usedPunchIndexes.add(bestInIdx);
		if (bestOutIdx !== -1) usedPunchIndexes.add(bestOutIdx);

		if (!inPunch) missingIn = true;
		if (!outPunch) missingOut = true;

		let segLate = 0,
			segEarly = 0;
		if (inPunch) {
			const inMin = toMinutes(inPunch);
			const startMin = toMinutes(seg.start_time);
			if (inMin > startMin) segLate = inMin - startMin;
		}
		if (outPunch) {
			const outMin = toMinutes(outPunch);
			const endMin = toMinutes(seg.end_time);
			if (outMin < endMin) segEarly = endMin - outMin;
		}

		segmentResults.push({
			segment_name: seg.name,
			start_time: seg.start_time,
			end_time: seg.end_time,
			clock_in: inPunch,
			clock_out: outPunch,
			late_minutes: segLate,
			early_minutes: segEarly,
			missing_in: missingIn,
			missing_out: missingOut
		});
	}

	// 补卡修正
	if (remedyRecords.length > 0) {
		for (const seg of segmentResults) {
			if (seg.missing_in && remedyIn) {
				seg.clock_in = remedyIn;
				seg.missing_in = false;
			}
			if (seg.missing_out && remedyOut) {
				seg.clock_out = remedyOut;
				seg.missing_out = false;
			}
		}
	}

	const totalLate = segmentResults.reduce((sum, s) => sum + s.late_minutes, 0);
	const totalEarly = segmentResults.reduce((sum, s) => sum + s.early_minutes, 0);
	const totalMissingCount = segmentResults.filter(s => s.missing_in || s.missing_out).length;
	const hasAnyMissing = totalMissingCount > 0;

	// 旷工判断
	const absentThreshold = 30;
	let absentMinutes = 0;
	const allSegmentsMissing = segmentResults.every(s => s.missing_in && s.missing_out);
	if (allSegmentsMissing && leaveHours === 0 && tripHours === 0 && compHours === 0) {
		absentMinutes = 8 * 60;
	} else if (totalLate >= absentThreshold || totalEarly >= absentThreshold) {
		absentMinutes = Math.max(totalLate, totalEarly);
	}

	// 加班：使用审批记录
	const finalOvertime = overtimeHoursFromRecord;

	// 出勤状态
	let attendanceStatus = 0;
	if (absentMinutes > 0) attendanceStatus = 5;
	else if (!hasAnyMissing && totalLate === 0 && totalEarly === 0) attendanceStatus = 1;
	else attendanceStatus = 0;

	const record = {
		employee_id: employeeId,
		attendance_date: dayStartTs,
		shift_id: shift._id,
		shift_name: shift.shift_name,
		segments: segmentResults,
		late_minutes: totalLate,
		early_minutes: totalEarly,
		absent_minutes: absentMinutes,
		overtime_hours: finalOvertime,
		leave_hours: leaveHours,
		trip_hours: tripHours,
		compensatory_hours: compHours,
		remedy_flag: remedyRecords.length > 0,
		attendance_status: attendanceStatus,
		update_id: 'system',
		update_date: Date.now()
	};

	await upsertDailyRecord(employeeId, dayStartTs, record, util);
	console.log(`[成功] ${employeeId} ${dateStr} 状态=${attendanceStatus}`);
	return {
		status: 'success'
	};
}

// 创建特殊状态记录（请假/出差/调休）
async function createSpecialRecord(employeeId, dayStartTs, shift, leaveHours, tripHours, compHours, overtimeHours,
	status, util) {
	const record = {
		employee_id: employeeId,
		attendance_date: dayStartTs,
		shift_id: shift._id,
		shift_name: shift.shift_name,
		segments: [],
		late_minutes: 0,
		early_minutes: 0,
		absent_minutes: 0,
		overtime_hours: overtimeHours,
		leave_hours: leaveHours,
		trip_hours: tripHours,
		compensatory_hours: compHours,
		remedy_flag: false,
		attendance_status: status,
		update_id: 'system',
		update_date: Date.now()
	};
	await upsertDailyRecord(employeeId, dayStartTs, record, util);
}

// 写入或更新日考勤记录
async function upsertDailyRecord(employeeId, attendanceDateTs, record, util) {
	const {
		vk,
		db
	} = util;
	const existRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-daily',
		whereJson: {
			employee_id: employeeId,
			attendance_date: attendanceDateTs
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