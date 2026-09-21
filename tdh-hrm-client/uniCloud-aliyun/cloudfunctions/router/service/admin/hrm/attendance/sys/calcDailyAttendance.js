module.exports = {
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, db } = util;
		const { employee_ids = [], start_date, end_date } = data;

		// ========== 1. 日期范围生成 ==========
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

		// ========== 3. 获取考勤参数 ==========
		const paramsRes = await vk.callFunction({
			url: 'admin/hrm/attendance/pub/getParams',
			data: {}
		});
		const params = paramsRes.code === 0 ? paramsRes.rows : {};
		console.log('计算范围：员工数=', employees.length, '日期数=', dates.length, '参数=', params);

		const stats = { total: 0, success: 0, skipped: { no_data: 0, error: 0 }, errors: [] };

		await clearDailyRecords(util, employees, dates);

		for (const empId of employees) {
			for (const dateStr of dates) {
				stats.total++;
				try {
					const result = await calcOneDay(empId, dateStr, util, params);
					if (result.status === 'success') stats.success++;
					else stats.skipped[result.status]++;
				} catch (e) {
					stats.skipped.error++;
					stats.errors.push({ empId, dateStr, error: e.message });
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
async function clearDailyRecords(util, employees, dates) {
	const { vk, db } = util;
	const startTs = new Date(dates[0] + 'T00:00:00').getTime();
	const endTs = new Date(dates[dates.length - 1] + 'T23:59:59.999').getTime();
	await vk.baseDao.del({
		dbName: 'hrm-attendance-daily',
		whereJson: {
			employee_id: db.command.in(employees),
			attendance_date: db.command.gte(startTs).and(db.command.lte(endTs))
		}
	});
}

function extractHHmmFromTimestamp(timestamp) {
	if (!timestamp) return null;
	const date = new Date(timestamp);
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
}

function toMinutes(hhmm) {
	if (!hhmm) return 0;
	const [h, m] = hhmm.split(':').map(Number);
	return h * 60 + m;
}

function calcOverlapMinutes(start1, end1, start2, end2) {
	const overlapStart = Math.max(start1, start2);
	const overlapEnd = Math.min(end1, end2);
	if (overlapStart >= overlapEnd) return 0;
	return Math.round((overlapEnd - overlapStart) / (1000 * 60));
}

function getPeriodRange(dateStr, params) {
	const date = new Date(dateStr + 'T00:00:00');
	const y = date.getFullYear();
	const m = date.getMonth();
	const startDay = params.period_start_day || 1;
	let start;
	if (date.getDate() >= startDay) start = new Date(y, m, startDay);
	else start = new Date(y, m - 1, startDay);
	const end = new Date(start.getFullYear(), start.getMonth() + 1, startDay - 1);
	const fmt = (d) => {
		const yy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${yy}-${mm}-${dd}`;
	};
	return { startStr: fmt(start), endStr: fmt(end) };
}

function getPunchWindow(punchRule) {
	if (punchRule) {
		return {
			inBefore: punchRule.sign_in_before_minutes ?? 60,
			inAfter: punchRule.sign_in_after_minutes ?? 30,
			outBefore: punchRule.sign_out_before_minutes ?? 30,
			outAfter: punchRule.sign_out_after_minutes ?? 120
		};
	}
	return { inBefore: 60, inAfter: 30, outBefore: 30, outAfter: 120 };
}

function roundOvertimeMinutes(minutes) {
	const unit = 30;
	if (!minutes || minutes <= 0) return 0;
	return Math.floor(minutes / unit) * unit;
}

// 判断某个时间点是否在外出时间段内
function isInOutingRange(punchMin, outingRanges) {
	return outingRanges.some(r => punchMin >= r.start && punchMin <= r.end);
}

// ==================== 单日计算 ====================
async function calcOneDay(employeeId, dateStr, util, params) {
	const { vk, db } = util;

	const dayStartTs = new Date(dateStr + 'T00:00:00').getTime();
	const dayEndTs = new Date(dateStr + 'T23:59:59.999').getTime();

	// ========== 1. 并行查询 ==========
	const [leaveRes, tripRes, compRes, remedyRes, overtimeRes, scheduleRes, clockRes, abnormalRes, remedyRuleRes, outingRes] = await Promise.all([
		vk.baseDao.selects({
			dbName: 'hrm-attendance-leaverecord',
			whereJson: { employee_id: employeeId, leave_date: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs)) }
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-triprecord',
			whereJson: { employee_id: employeeId, start_time: db.command.lte(dayEndTs), end_time: db.command.gte(dayStartTs) }
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-compensatoryrecord',
			whereJson: { employee_id: employeeId, compensatory_date: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs)) }
		}),
		vk.baseDao.selects({
			dbName: 'bpmn-application-form',
			whereJson: {
				applicant_id: employeeId,
				form_type_code: 'MISS_PUNCH_RECORD',
				status: 'approved',
				'form_data.miss_date': dateStr
			}
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-overtimerecord',
			whereJson: { employee_id: employeeId, overtime_date: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs)), import_status: 1 }
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-schedule',
			whereJson: { employee_id: employeeId, schedule_date: dateStr },
			limit: 1
		}),
		vk.baseDao.selects({
			dbName: 'hrm-clockin',
			whereJson: { employee_id: employeeId, type: '公司卡', clockintime: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs)) },
			sortArr: [{ name: 'clockintime', type: 'asc' }]
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-abnormalrule',
			whereJson: { status: true },
			limit: 1
		}),
		vk.baseDao.selects({
			dbName: 'hrm-attendance-remedyrule',
			whereJson: { status: true },
			limit: 1
		}),
		// 外出申请单（直接读 OA 审批表，不建记录表）
		vk.baseDao.selects({
			dbName: 'bpmn-application-form',
			whereJson: {
				applicant_id: employeeId,
				form_type_code: 'OUTING_APPLICATION',
				status: 'approved',
				'form_data.outing_date': dateStr
			}
		})
	]);

	// 异常判定规则
	const abnormalRule = abnormalRes.rows[0] || {
		single_punch_rule: 1,
		late_early_coexist_rule: 1,
		out_office_cancel_absence: true,
		out_office_cancel_late: false,
		out_office_cancel_early: false,
		overtime_cancel_early: false
	};

	// 补卡规则
	const remedyRule = remedyRuleRes.rows[0] || {};

	// ========== 2. 解析外出申请单 ==========
	const outingRecords = outingRes.rows.map(r => ({
		outing_title: r.form_data?.outing_title || '',
		outing_type: r.form_data?.outing_type || '',
		start_time: r.form_data?.start_time || '',
		end_time: r.form_data?.end_time || '',
		total_minutes: parseFloat(r.form_data?.total_minutes) || 0,
		outing_reason: r.form_data?.outing_reason || '',
		remark: r.form_data?.remarks || ''
	}));

	// 外出时间段（HH:mm 转分钟区间）
	const outingRanges = outingRecords
		.filter(r => r.start_time && r.end_time)
		.map(r => ({
			start: toMinutes(r.start_time),
			end: toMinutes(r.end_time)
		}));

	// 外出总时长（分钟）
	const outingMinutes = outingRecords.reduce((sum, r) => sum + (r.total_minutes || 0), 0);

	// ========== 3. 汇总其他记录 ==========
	const leaveMinutes = leaveRes.rows.reduce((sum, r) => sum + (r.total_minutes || 0), 0);
	const tripMinutes = tripRes.rows.reduce((sum, r) => sum + calcOverlapMinutes(r.start_time, r.end_time, dayStartTs, dayEndTs), 0);
	const compMinutes = compRes.rows.reduce((sum, r) => sum + (r.total_minutes || 0), 0);
	const overtimeMinutesFromRecord = params.allow_overtime_application
		? overtimeRes.rows.reduce((sum, r) => sum + (r.total_minutes || 0), 0)
		: 0;

	// 明细
	const leaveRecords = leaveRes.rows.map(r => ({
		leave_type: r.leave_type,
		leave_name: r.leave_name,
		total_minutes: r.total_minutes,
		reason: r.reason || '',
		leave_date: r.leave_date
	}));
	const tripRecords = tripRes.rows.map(r => ({
		trip_location: r.trip_location,
		start_time: r.start_time,
		end_time: r.end_time,
		total_minutes: r.total_minutes,
		trip_type: r.trip_type || 'domestic',
		reason: r.reason || ''
	}));
	const compRecords = compRes.rows.map(r => ({
		total_minutes: r.total_minutes,
		reason: r.reason || '',
		items: r.items || []
	}));
	const overtimeRecords = overtimeRes.rows.map(r => ({
		overtime_date: r.overtime_date,
		total_minutes: r.total_minutes,
		overtime_type: r.overtime_type,
		morning_range: r.morning_range || null,
		afternoon_range: r.afternoon_range || null
	}));

	// ========== 4. 解析补卡申请 ==========
	let remedyList = remedyRes.rows
		.map(r => r.form_data)
		.filter(fd => fd && fd.miss_time && (fd.miss_type === 'clock_in' || fd.miss_type === 'clock_out'))
		.map(fd => ({
			miss_type: fd.miss_type,
			miss_time: fd.miss_time,
			miss_reason: fd.miss_reason || '',
			used: false
		}));

	if (remedyList.length > 0) {
		const period = getPeriodRange(dateStr, params);
		const periodRemedyRes = await vk.baseDao.selects({
			dbName: 'bpmn-application-form',
			whereJson: {
				applicant_id: employeeId,
				form_type_code: 'MISS_PUNCH_RECORD',
				status: 'approved',
				'form_data.miss_date': db.command.gte(period.startStr).and(db.command.lte(period.endStr))
			}
		});
		const remedyLimit = remedyRule.remedy_max_per_month ?? 3;
		if (remedyLimit > 0 && periodRemedyRes.rows.length > remedyLimit) {
			console.log(`[签卡超限] ${employeeId} ${dateStr} 周期内签卡${periodRemedyRes.rows.length}次 > 上限${remedyLimit}，签卡不生效`);
			remedyList = [];
		}
	}

	// ========== 5. 排班与班次 ==========
	const schedule = scheduleRes.rows[0];
	let shift = null;
	let segments = [];
	let punchRule = null;

	if (schedule && schedule.shift_id) {
		const shiftRes = await vk.baseDao.findById({ dbName: 'hrm-attendance-shift', id: schedule.shift_id });
		if (shiftRes && shiftRes.status) {
			shift = shiftRes;
			segments = shift.segments || [];
		}
	}

	if (schedule && schedule.attendance_group_id) {
		const groupRes = await vk.baseDao.findById({ dbName: 'hrm-attendance-group', id: schedule.attendance_group_id });
		if (groupRes && groupRes.punch_rule_id) {
			const ruleRes = await vk.baseDao.findById({ dbName: 'hrm-attendance-punchrule', id: groupRes.punch_rule_id });
			if (ruleRes && ruleRes.status) punchRule = ruleRes;
		}
	}

	const { inBefore, inAfter, outBefore, outAfter } = getPunchWindow(punchRule);

	// ========== 6. 无排班但有特殊记录 ==========
	if (!shift || segments.length === 0) {
		const hasSpecialRecord = leaveMinutes > 0 || tripMinutes > 0 || compMinutes > 0
			|| overtimeMinutesFromRecord > 0 || outingMinutes > 0;

		if (!hasSpecialRecord) {
			console.log(`[跳过] ${employeeId} ${dateStr} 无排班且无特殊记录`);
			return { status: 'no_data' };
		}

		// 优先处理请假/出差/调休/外出
		if (leaveMinutes > 0 || tripMinutes > 0 || compMinutes > 0 || outingMinutes > 0) {
			let attendanceStatus = 0;
			if (leaveMinutes > 0) attendanceStatus = 2;
			else if (tripMinutes > 0) attendanceStatus = 3;
			else if (compMinutes > 0) attendanceStatus = 4;

			const record = {
				employee_id: employeeId,
				attendance_date: dayStartTs,
				shift_id: null,
				shift_name: '',
				segments: [],
				late_minutes: 0,
				early_minutes: 0,
				absent_minutes: 0,
				overtime_minutes: roundOvertimeMinutes(overtimeMinutesFromRecord),
				leave_minutes: leaveMinutes,
				trip_minutes: tripMinutes,
				compensatory_minutes: compMinutes,
				outing_minutes: outingMinutes,
				leave_records: leaveRecords,
				trip_records: tripRecords,
				compensatory_records: compRecords,
				outing_records: outingRecords,
				overtime_records: overtimeRecords,
				remedy_records: [],
				remedy_flag: false,
				attendance_status: attendanceStatus,
				update_id: 'system',
				update_date: Date.now()
			};
			await upsertDailyRecord(employeeId, dayStartTs, record, util);
			return { status: 'success' };
		}

		// 仅加班（休息日加班）
		if (overtimeMinutesFromRecord > 0) {
			const overtimeSegments = [];
			overtimeRecords.forEach((r) => {
				if (r.morning_range && Array.isArray(r.morning_range) && r.morning_range.length === 2) {
					overtimeSegments.push({ name: '上午', start_time: r.morning_range[0], end_time: r.morning_range[1] });
				}
				if (r.afternoon_range && Array.isArray(r.afternoon_range) && r.afternoon_range.length === 2) {
					overtimeSegments.push({ name: '下午', start_time: r.afternoon_range[0], end_time: r.afternoon_range[1] });
				}
			});

			const overtimePunches = clockRes.rows;
			const otSegmentResults = [];
			const otUsedPunchIndexes = new Set();

			if (overtimeSegments.length > 0) {
				for (const seg of overtimeSegments) {
					const segStartMin = toMinutes(seg.start_time);
					const segEndMin = toMinutes(seg.end_time);
					let inPunch = null, outPunch = null;
					let bestInDiff = Infinity, bestOutDiff = Infinity;
					let bestInIdx = -1, bestOutIdx = -1;

					for (let i = 0; i < overtimePunches.length; i++) {
						if (otUsedPunchIndexes.has(i)) continue;
						const hhmm = extractHHmmFromTimestamp(overtimePunches[i].clockintime);
						const pMin = toMinutes(hhmm);
						if (pMin >= segStartMin - inBefore && pMin <= segStartMin + inAfter) {
							const diff = Math.abs(pMin - segStartMin);
							if (diff < bestInDiff) { bestInDiff = diff; bestInIdx = i; inPunch = hhmm; }
						}
						if (pMin >= segEndMin - outBefore && pMin <= segEndMin + outAfter) {
							const diff = Math.abs(pMin - segEndMin);
							if (diff < bestOutDiff) { bestOutDiff = diff; bestOutIdx = i; outPunch = hhmm; }
						}
					}
					if (bestInIdx !== -1) otUsedPunchIndexes.add(bestInIdx);
					if (bestOutIdx !== -1) otUsedPunchIndexes.add(bestOutIdx);

					// 补卡修正
					if (!inPunch) {
						for (const rem of remedyList) {
							if (rem.used || rem.miss_type !== 'clock_in') continue;
							const remMin = toMinutes(rem.miss_time);
							if (remMin >= segStartMin - inBefore && remMin <= segStartMin + inAfter) {
								inPunch = rem.miss_time; rem.used = true; break;
							}
						}
					}
					if (!outPunch) {
						for (const rem of remedyList) {
							if (rem.used || rem.miss_type !== 'clock_out') continue;
							const remMin = toMinutes(rem.miss_time);
							if (remMin >= segEndMin - outBefore && remMin <= segEndMin + outAfter) {
								outPunch = rem.miss_time; rem.used = true; break;
							}
						}
					}

					let segLate = 0, segEarly = 0;
					if (inPunch) {
						const lateDiff = toMinutes(inPunch) - segStartMin;
						if (lateDiff > (params.late_threshold_minutes || 0)) segLate = lateDiff;
					}
					if (outPunch) {
						const earlyDiff = segEndMin - toMinutes(outPunch);
						if (earlyDiff > (params.early_threshold_minutes || 0)) segEarly = earlyDiff;
					}

					otSegmentResults.push({
						segment_name: seg.name,
						start_time: seg.start_time,
						end_time: seg.end_time,
						clock_in: inPunch,
						clock_out: outPunch,
						late_minutes: segLate,
						early_minutes: segEarly,
						missing_in: !inPunch,
						missing_out: !outPunch
					});
				}
			}

			const otTotalLate = otSegmentResults.reduce((sum, s) => sum + s.late_minutes, 0);
			const otTotalEarly = otSegmentResults.reduce((sum, s) => sum + s.early_minutes, 0);
			const otHasMissing = otSegmentResults.some(s => s.missing_in || s.missing_out);
			const otAllMissing = otSegmentResults.length > 0 && otSegmentResults.every(s => s.missing_in && s.missing_out);

			let otAttendanceStatus = 6;
			if (otAllMissing) otAttendanceStatus = 5;
			else if (otHasMissing) otAttendanceStatus = 0;

			const record = {
				employee_id: employeeId,
				attendance_date: dayStartTs,
				shift_id: null,
				shift_name: '',
				segments: otSegmentResults,
				late_minutes: otTotalLate,
				early_minutes: otTotalEarly,
				absent_minutes: otAllMissing ? 8 * 60 : 0,
				overtime_minutes: roundOvertimeMinutes(overtimeMinutesFromRecord),
				leave_minutes: 0,
				trip_minutes: 0,
				compensatory_minutes: 0,
				outing_minutes: 0,
				leave_records: [],
				trip_records: [],
				compensatory_records: [],
				outing_records: [],
				overtime_records: overtimeRecords,
				remedy_records: remedyList.filter(r => r.used).map(r => ({
					miss_type: r.miss_type,
					miss_time: r.miss_time,
					miss_reason: r.miss_reason
				})),
				remedy_flag: remedyList.some(r => r.used),
				attendance_status: otAttendanceStatus,
				update_id: 'system',
				update_date: Date.now()
			};
			await upsertDailyRecord(employeeId, dayStartTs, record, util);
			return { status: 'success' };
		}
	}

	// ========== 7. 有排班，优先处理特殊状态 ==========
	if (leaveMinutes > 0) {
		await createSpecialRecord(employeeId, dayStartTs, shift, leaveMinutes, tripMinutes, compMinutes,
			outingMinutes, roundOvertimeMinutes(overtimeMinutesFromRecord), 2, leaveRecords, tripRecords,
			compRecords, outingRecords, overtimeRecords, [], util);
		return { status: 'success' };
	}
	if (tripMinutes > 0) {
		await createSpecialRecord(employeeId, dayStartTs, shift, leaveMinutes, tripMinutes, compMinutes,
			outingMinutes, roundOvertimeMinutes(overtimeMinutesFromRecord), 3, leaveRecords, tripRecords,
			compRecords, outingRecords, overtimeRecords, [], util);
		return { status: 'success' };
	}
	if (compMinutes > 0) {
		await createSpecialRecord(employeeId, dayStartTs, shift, leaveMinutes, tripMinutes, compMinutes,
			outingMinutes, roundOvertimeMinutes(overtimeMinutesFromRecord), 4, leaveRecords, tripRecords,
			compRecords, outingRecords, overtimeRecords, [], util);
		return { status: 'success' };
	}

	// ========== 8. 正常打卡计算（含外出视为打卡） ==========
	const punches = clockRes.rows;
	console.log(`[计算] ${employeeId} ${dateStr} 打卡记录数=${punches.length}, 外出时间段=${outingRanges.length}`);

	const segmentResults = [];
	const usedPunchIndexes = new Set();

	for (const seg of segments) {
		const segStartMin = toMinutes(seg.start_time);
		const segEndMin = toMinutes(seg.end_time);

		let inPunch = null, outPunch = null;
		let missingIn = false, missingOut = false;
		let bestInDiff = Infinity, bestOutDiff = Infinity;
		let bestInIdx = -1, bestOutIdx = -1;

		// 8.1 先匹配实际打卡
		for (let i = 0; i < punches.length; i++) {
			if (usedPunchIndexes.has(i)) continue;
			const hhmm = extractHHmmFromTimestamp(punches[i].clockintime);
			const pMin = toMinutes(hhmm);

			if (pMin >= segStartMin - inBefore && pMin <= segStartMin + inAfter) {
				const diff = Math.abs(pMin - segStartMin);
				if (diff < bestInDiff) { bestInDiff = diff; bestInIdx = i; inPunch = hhmm; }
			}
			if (pMin >= segEndMin - outBefore && pMin <= segEndMin + outAfter) {
				const diff = Math.abs(pMin - segEndMin);
				if (diff < bestOutDiff) { bestOutDiff = diff; bestOutIdx = i; outPunch = hhmm; }
			}
		}

		// 8.2 补卡修正
		if (!inPunch) {
			for (const rem of remedyList) {
				if (rem.used || rem.miss_type !== 'clock_in') continue;
				const remMin = toMinutes(rem.miss_time);
				if (remMin >= segStartMin - inBefore && remMin <= segStartMin + inAfter) {
					inPunch = rem.miss_time; rem.used = true; break;
				}
			}
		}
		if (!outPunch) {
			for (const rem of remedyList) {
				if (rem.used || rem.miss_type !== 'clock_out') continue;
				const remMin = toMinutes(rem.miss_time);
				if (remMin >= segEndMin - outBefore && remMin <= segEndMin + outAfter) {
					outPunch = rem.miss_time; rem.used = true; break;
				}
			}
		}

		// 8.3 外出申请单视为打卡（仅当缺卡时，且外出时间段与班次时段有重叠）
		if (!inPunch) {
			const outingInPunch = outingRanges.find(r => 
				r.start <= segStartMin + inAfter && r.end >= segStartMin - inBefore
			);
			if (outingInPunch) {
				// 用外出起始时间作为签到时间
				inPunch = minutesToHHmm(Math.max(outingInPunch.start, segStartMin - inBefore));
			}
		}
		if (!outPunch) {
			const outingOutPunch = outingRanges.find(r => 
				r.start <= segEndMin + outAfter && r.end >= segEndMin - outBefore
			);
			if (outingOutPunch) {
				// 用外出结束时间作为签退时间
				outPunch = minutesToHHmm(Math.min(outingOutPunch.end, segEndMin + outAfter));
			}
		}

		if (bestInIdx !== -1) usedPunchIndexes.add(bestInIdx);
		if (bestOutIdx !== -1) usedPunchIndexes.add(bestOutIdx);

		if (!inPunch) missingIn = true;
		if (!outPunch) missingOut = true;

		let segLate = 0, segEarly = 0;
		if (inPunch) {
			const lateDiff = toMinutes(inPunch) - segStartMin;
			if (lateDiff > (params.late_threshold_minutes || 0)) segLate = lateDiff;
		}
		if (outPunch) {
			const earlyDiff = segEndMin - toMinutes(outPunch);
			if (earlyDiff > (params.early_threshold_minutes || 0)) segEarly = earlyDiff;
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

	// 缺卡最小工作分钟数处理
	const minWorkMinutes = punchRule?.missing_punch_min_work_minutes || 0;
	if (minWorkMinutes > 0) {
		for (const seg of segmentResults) {
			const onlyOnePunch = (seg.clock_in && !seg.clock_out) || (!seg.clock_in && seg.clock_out);
			if (onlyOnePunch) {
				const workedMinutes = seg.clock_in && seg.clock_out ? toMinutes(seg.clock_out) - toMinutes(seg.clock_in) : 0;
				if (workedMinutes < minWorkMinutes) {
					seg.missing_in = false;
					seg.missing_out = false;
				}
			}
		}
	}

	// ========== 9. 应用异常判定规则 ==========
	let totalLate = segmentResults.reduce((sum, s) => sum + s.late_minutes, 0);
	let totalEarly = segmentResults.reduce((sum, s) => sum + s.early_minutes, 0);

	if (totalLate > 0 && totalEarly > 0) {
		switch (abnormalRule.late_early_coexist_rule) {
			case 1: break;
			case 2:
				if (totalLate >= totalEarly) totalEarly = 0;
				else totalLate = 0;
				break;
			case 3: totalEarly = 0; break;
			case 4: totalLate = 0; break;
		}
	}

	if (abnormalRule.out_office_cancel_absence && (tripMinutes > 0 || outingMinutes > 0)) {
		for (const seg of segmentResults) {
			seg.missing_in = false;
			seg.missing_out = false;
		}
	}

	if (abnormalRule.out_office_cancel_late && (tripMinutes > 0 || outingMinutes > 0)) {
		totalLate = 0;
		for (const seg of segmentResults) {
			seg.late_minutes = 0;
		}
	}

	if (abnormalRule.out_office_cancel_early && (tripMinutes > 0 || outingMinutes > 0)) {
		totalEarly = 0;
		for (const seg of segmentResults) {
			seg.early_minutes = 0;
		}
	}

	if (abnormalRule.overtime_cancel_early && overtimeMinutesFromRecord > 0) {
		totalEarly = 0;
		for (const seg of segmentResults) {
			seg.early_minutes = 0;
		}
	}

	// 只打一次卡处理
	let singlePunchAbsent = 0;
	for (const seg of segmentResults) {
		const onlyOnePunch = (seg.clock_in && !seg.clock_out) || (!seg.clock_in && seg.clock_out);
		if (onlyOnePunch) {
			switch (abnormalRule.single_punch_rule) {
				case 1:
					if (leaveMinutes > 0 || tripMinutes > 0 || outingMinutes > 0) {
						seg.missing_in = false;
						seg.missing_out = false;
					} else {
						singlePunchAbsent += 8 * 60;
					}
					break;
				case 2:
					singlePunchAbsent += 8 * 60;
					break;
				case 3:
					if (seg.clock_in && !seg.clock_out) {
						seg.early_minutes += seg.end_time ? toMinutes(seg.end_time) - toMinutes(seg.clock_in) : 0;
					} else {
						seg.late_minutes += seg.clock_out ? toMinutes(seg.clock_out) - toMinutes(seg.start_time) : 0;
					}
					break;
				case 4: break;
			}
		}
	}

	totalLate = segmentResults.reduce((sum, s) => sum + s.late_minutes, 0);
	totalEarly = segmentResults.reduce((sum, s) => sum + s.early_minutes, 0);

	const hasAnyMissing = segmentResults.some(s => s.missing_in || s.missing_out);
	const allSegmentsMissing = segmentResults.length > 0 && segmentResults.every(s => s.missing_in && s.missing_out);

	// ========== 10. 旷工判断 ==========
	const absentThreshold = params.absent_threshold_minutes || 30;
	let absentMinutes = singlePunchAbsent;
	let attendanceStatus = 1;

	if (allSegmentsMissing && leaveMinutes === 0 && tripMinutes === 0 && compMinutes === 0 && outingMinutes === 0) {
		absentMinutes = 8 * 60;
		attendanceStatus = 5;
	} else if (totalLate >= absentThreshold || totalEarly >= absentThreshold) {
		absentMinutes = Math.max(absentMinutes, Math.max(totalLate, totalEarly));
		attendanceStatus = 5;
	} else if (hasAnyMissing || absentMinutes > 0) {
		attendanceStatus = 0;
	}

	const usedRemedyRecords = remedyList
		.filter(r => r.used)
		.map(r => ({ miss_type: r.miss_type, miss_time: r.miss_time, miss_reason: r.miss_reason }));

	const record = {
		employee_id: employeeId,
		attendance_date: dayStartTs,
		shift_id: shift._id,
		shift_name: shift.shift_name,
		segments: segmentResults,
		late_minutes: totalLate,
		early_minutes: totalEarly,
		absent_minutes: absentMinutes,
		overtime_minutes: roundOvertimeMinutes(overtimeMinutesFromRecord),
		leave_minutes: leaveMinutes,
		trip_minutes: tripMinutes,
		compensatory_minutes: compMinutes,
		outing_minutes: outingMinutes,
		leave_records: leaveRecords,
		trip_records: tripRecords,
		compensatory_records: compRecords,
		outing_records: outingRecords,
		overtime_records: overtimeRecords,
		remedy_records: usedRemedyRecords,
		remedy_flag: usedRemedyRecords.length > 0,
		attendance_status: attendanceStatus,
		update_id: 'system',
		update_date: Date.now()
	};

	await upsertDailyRecord(employeeId, dayStartTs, record, util);
	return { status: 'success' };
}

// 分钟转 HH:mm
function minutesToHHmm(minutes) {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// 创建特殊状态记录（带明细）
async function createSpecialRecord(employeeId, dayStartTs, shift, leaveMinutes, tripMinutes, compMinutes,
	outingMinutes, overtimeMinutes, status, leaveRecords, tripRecords, compRecords, outingRecords,
	overtimeRecords, remedyRecords, util) {
	const record = {
		employee_id: employeeId,
		attendance_date: dayStartTs,
		shift_id: shift._id,
		shift_name: shift.shift_name,
		segments: [],
		late_minutes: 0,
		early_minutes: 0,
		absent_minutes: 0,
		overtime_minutes: overtimeMinutes,
		leave_minutes: leaveMinutes,
		trip_minutes: tripMinutes,
		compensatory_minutes: compMinutes,
		outing_minutes: outingMinutes,
		leave_records: leaveRecords,
		trip_records: tripRecords,
		compensatory_records: compRecords,
		outing_records: outingRecords,
		overtime_records: overtimeRecords,
		remedy_records: remedyRecords,
		remedy_flag: remedyRecords.length > 0,
		attendance_status: status,
		update_id: 'system',
		update_date: Date.now()
	};
	await upsertDailyRecord(employeeId, dayStartTs, record, util);
}

// 写入或更新日考勤记录
async function upsertDailyRecord(employeeId, attendanceDateTs, record, util) {
	const { vk, db } = util;
	const existRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-daily',
		whereJson: { employee_id: employeeId, attendance_date: attendanceDateTs },
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