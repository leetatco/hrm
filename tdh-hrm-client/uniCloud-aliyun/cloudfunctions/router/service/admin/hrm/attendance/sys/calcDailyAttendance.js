// admin/hrm/attendance/sys/calcDailyAttendance
module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk,
			db,
			_
		} = util;
		const {
			employee_ids = [], start_date, end_date
		} = data;

		// ========== 1. 日期范围 ==========
		const dates = buildDateList(vk, start_date, end_date);
		if (dates.length === 0) return {
			code: -1,
			msg: '日期范围为空'
		};

		// ========== 2. 员工列表 ==========
		const employees = await loadEmployees(util, employee_ids);
		if (employees.length === 0) return {
			code: -1,
			msg: '没有需要计算的员工'
		};

		console.log('计算范围：员工数=', employees.length, '日期数=', dates.length);

		// ========== 3. 考勤参数 ==========
		const paramsRes = await vk.callFunction({
			url: 'admin/hrm/attendance/pub/getParams',
			data: {}
		});
		const params = paramsRes.code === 0 ? paramsRes.rows : {};

		// ========== 4. 按天分片并发预加载 ==========
		const preload = await preloadByDay(util, employees, dates);

		// ========== 5. 预加载考勤组、班次、打卡规则 ==========
		const cache = await preloadGroupAndShift(util, preload);

		// ========== 6. 预加载员工信息 ==========
		const empInfoMap = await loadEmployeeInfoMap(util, employees);

		// ========== 7. 预加载豁免规则 ==========
		const exemptionMap = await buildExemptionMap(util, employees, dates[0], dates[dates.length - 1]);

		// ========== 8. 预加载已有日考勤（判断封存） ==========
		const existDailyMap = await loadExistDailyMap(util, employees, dates);

		// ========== 9. 清理未封存旧数据 ==========
		const delCount = await clearUnsealedRecords(util, employees, dates);
		console.log('[清理旧数据] 删除:', delCount);

		// ========== 10. 逐员工逐天计算 ==========
		const stats = {
			total: 0,
			success: 0,
			skipped: {
				no_data: 0,
				error: 0,
				exempted: 0,
				sealed: 0
			},
			errors: []
		};
		const addList = [];

		for (const empId of employees) {
			for (const dateStr of dates) {
				stats.total++;
				try {
					const result = calcOneDay(
						empId, dateStr, util, params,
						exemptionMap, empInfoMap, preload, cache, existDailyMap
					);
					if (result.status === 'success') {
						stats.success++;
						addList.push(result.record);
					} else if (stats.skipped[result.status] !== undefined) {
						stats.skipped[result.status]++;
					} else {
						stats.skipped.error++;
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

		console.log('[计算完成] addList:', addList.length);
		console.log('[统计]', stats);

		// ========== 11. 批量写入 ==========
		if (addList.length > 0) await batchAdd(util, addList);

		return {
			code: 0,
			msg: `成功计算${stats.success}条记录，跳过${stats.total - stats.success}条（豁免${stats.skipped.exempted}，已封存${stats.skipped.sealed}）`,
			total: stats.total,
			stats
		};
	}
};

// ==================== 日期列表 ====================
function buildDateList(vk, start_date, end_date) {
	const dates = [];
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
	return dates;
}

// ==================== 员工列表 ====================
async function loadEmployees(util, employee_ids) {
	const {
		vk
	} = util;
	if (employee_ids.length > 0) return employee_ids;
	const empRes = await vk.baseDao.select({
		dbName: 'hrm-employees',
		whereJson: {
			status: 1
		},
		fieldJson: {
			employee_id: true
		},
		pageSize: -1
	});
	return empRes.rows.map(e => e.employee_id);
}

// ==================== 按天分片预加载 ====================
async function preloadByDay(util, employees, dates) {
	const {
		vk
	} = util;
	const BATCH_SIZE = 10;
	const allResults = [];

	for (let i = 0; i < dates.length; i += BATCH_SIZE) {
		const batchDates = dates.slice(i, i + BATCH_SIZE);
		const tasks = batchDates.map(date => {
			return vk.callFunction({
				url: 'admin/hrm/attendance/pub/preloadOneDay',
				data: {
					date,
					employee_ids: employees
				}
			}).then(res => res.code === 0 ? res.data : {
				date,
				error: res.msg
			});
		});
		const batchResults = await Promise.all(tasks);

		allResults.push(...batchResults);
	}

	console.log('========== [preloadByDay 结果] ==========');
	allResults.forEach(dayData => {
		if (!dayData) {
			console.log('  [空]', dayData);
			return;
		}
		if (dayData.error) {
			console.log(`  [失败] date=${dayData.date} error=${dayData.error}`);
			return;
		}
		console.log(
			`  [成功] date=${dayData.date} 打卡${(dayData.clockRows||[]).length} 加班${(dayData.overtimeRows||[]).length} 外出${(dayData.outingRows||[]).length} 排班${(dayData.scheduleRows||[]).length}`
		);
	});
	console.log('==========================================');

	const preload = {
		leaveMap: {},
		tripMap: {},
		compMap: {},
		remedyMap: {},
		overtimeMap: {},
		scheduleMap: {},
		clockMap: {},
		outingMap: {}
	};

	for (const dayData of allResults) {
		if (!dayData || dayData.error) {
			console.warn('预加载失败:', dayData);
			continue;
		}
		const {
			date,
			leaveRows,
			tripRows,
			compRows,
			remedyRows,
			overtimeRows,
			scheduleRows,
			clockRows,
			outingRows
		} = dayData;

		mergeEmpDateRows(vk, preload.leaveMap, leaveRows, date, 'leave_date');
		mergeTripRows(vk, preload.tripMap, tripRows, date);
		mergeEmpDateRows(vk, preload.compMap, compRows, date, 'compensatory_date');
		mergeEmpDateRows(vk, preload.remedyMap, remedyRows, date);
		mergeEmpDateRows(vk, preload.overtimeMap, overtimeRows, date, 'overtime_date');
		mergeScheduleRows(preload.scheduleMap, scheduleRows, date);
		mergeEmpDateRows(vk, preload.clockMap, clockRows, date, 'clockintime');
		mergeEmpDateRows(vk, preload.outingMap, outingRows, date);
	}

	console.log('[合并后] overtimeMap keys:', Object.keys(preload.overtimeMap));
	console.log('[合并后] outingMap keys:', Object.keys(preload.outingMap));
	console.log('[合并后] clockMap keys:', Object.keys(preload.clockMap));

	return preload;
}

// ==================== 合并数据到索引 ====================
function mergeEmpDateRows(vk, map, rows, date, timestampKey) {
	for (const row of rows) {
		let dateStr = date;
		if (timestampKey) {
			dateStr = vk.pubfn.timeFormat(new Date(row[timestampKey]), 'yyyy-MM-dd');
		}
		const empId = row.employee_id || row.applicant_id;
		const key = `${empId}_${dateStr}`;
		if (!map[key]) map[key] = [];
		map[key].push(row);
	}
}

function mergeTripRows(vk, map, rows, date) {
	for (const row of rows) {
		const empId = row.employee_id;
		const key = `${empId}_${date}`;
		if (!map[key]) map[key] = [];
		map[key].push(row);
	}
}

function mergeScheduleRows(map, rows, date) {
	for (const row of rows) {
		map[`${row.employee_id}_${date}`] = row;
	}
}

// ==================== 预加载考勤组、班次、打卡规则 ====================
async function preloadGroupAndShift(util, preload) {
	const {
		vk,
		_
	} = util;

	const groupIds = [...new Set(
		Object.values(preload.scheduleMap).map(s => s.attendance_group_id).filter(Boolean)
	)];
	if (groupIds.length === 0) return {
		groupMap: {},
		shiftMap: {},
		ruleMap: {}
	};

	const groupRes = await vk.baseDao.select({
		dbName: 'hrm-attendance-group',
		whereJson: {
			_id: _.in(groupIds)
		},
		pageSize: -1
	});
	const groupMap = {};
	for (const g of groupRes.rows) groupMap[g._id] = g;

	const shiftIds = [...new Set(groupRes.rows.map(g => g.shift_id).filter(Boolean))];
	const ruleIds = [...new Set(groupRes.rows.map(g => g.punch_rule_id).filter(Boolean))];

	console.log(groupRes, ruleIds, shiftIds)

	const [shiftRes, ruleRes] = await Promise.all([
		shiftIds.length > 0 ? vk.baseDao.select({
			dbName: 'hrm-attendance-shift',
			whereJson: {
				_id: _.in(shiftIds)
			},
			pageSize: -1
		}) : {
			rows: []
		},
		ruleIds.length > 0 ? vk.baseDao.select({
			dbName: 'hrm-attendance-punchrule',
			whereJson: {
				_id: _.in(ruleIds)
			},
			pageSize: -1
		}) : {
			rows: []
		}
	]);

	const shiftMap = {};
	for (const s of shiftRes.rows) shiftMap[s._id] = s;
	const ruleMap = {};
	for (const r of ruleRes.rows) ruleMap[r._id] = r;

	return {
		groupMap,
		shiftMap,
		ruleMap
	};
}

// ==================== 预加载员工信息 ====================
async function loadEmployeeInfoMap(util, employees) {
	const {
		vk,
		_
	} = util;
	const map = {};
	const empRes = await vk.baseDao.select({
		dbName: 'hrm-employees',
		whereJson: {
			employee_id: _.in(employees)
		},
		fieldJson: {
			employee_id: true,
			card: true,
			employee_name: true,
			department_id: true
		},
		pageSize: -1
	});
	for (const e of empRes.rows) map[e.employee_id] = e;
	return map;
}

// ==================== 预加载豁免规则 ====================
async function buildExemptionMap(util, employees, startDateStr, endDateStr) {
	const {
		vk,
		_
	} = util;
	const map = {};

	const exempRes = await vk.baseDao.select({
		dbName: 'hrm-attendance-exemption',
		whereJson: {
			status: true,
			start_date: _.lte(endDateStr),
			$or: [{
					end_date: _.exists(false)
				},
				{
					end_date: ''
				},
				{
					end_date: _.gte(startDateStr)
				}
			]
		},
		pageSize: -1
	});
	const rules = exempRes.rows || [];
	if (rules.length === 0) return map;

	const empRes = await vk.baseDao.select({
		dbName: 'hrm-employees',
		whereJson: {
			employee_id: _.in(employees)
		},
		fieldJson: {
			employee_id: true,
			department_id: true
		},
		pageSize: -1
	});
	const empDeptMap = {};
	for (const e of empRes.rows) empDeptMap[e.employee_id] = e.department_id || '';

	const empRules = rules.filter(r => r.exemption_type === 1);
	const deptRules = rules.filter(r => r.exemption_type === 2);
	const groupRules = rules.filter(r => r.exemption_type === 3);

	for (const empId of employees) {
		const matched = [];
		for (const r of empRules) {
			if (Array.isArray(r.employee_ids) && r.employee_ids.includes(empId)) matched.push(r);
		}
		const deptId = empDeptMap[empId];
		if (deptId) {
			for (const r of deptRules) {
				if (Array.isArray(r.department_ids) && r.department_ids.includes(deptId)) matched.push(r);
			}
		}
		if (groupRules.length > 0) {
			for (const r of groupRules) matched.push(r);
		}
		if (matched.length > 0) map[empId] = matched;
	}
	return map;
}

// ==================== 预加载已有日考勤 ====================
async function loadExistDailyMap(util, employees, dates) {
	const {
		vk,
		db,
		_
	} = util;
	const startTs = new Date(dates[0] + 'T00:00:00').getTime();
	const endTs = new Date(dates[dates.length - 1] + 'T23:59:59.999').getTime();

	const res = await selectAll(util, 'hrm-attendance-daily', {
		employee_id: _.in(employees),
		attendance_date: db.command.gte(startTs).and(db.command.lte(endTs))
	}, {
		fieldJson: {
			_id: true,
			employee_id: true,
			attendance_date: true,
			sealed: true
		}
	});

	const map = {};
	for (const r of res.rows) {
		const dateStr = vk.pubfn.timeFormat(new Date(r.attendance_date), 'yyyy-MM-dd');
		map[`${r.employee_id}_${dateStr}`] = r;
	}
	return map;
}

// ==================== 清理未封存记录 ====================
async function clearUnsealedRecords(util, employees, dates) {
	const {
		vk,
		db,
		_
	} = util;
	const startTs = new Date(dates[0] + 'T00:00:00').getTime();
	const endTs = new Date(dates[dates.length - 1] + 'T23:59:59.999').getTime();

	const res = await vk.baseDao.del({
		dbName: 'hrm-attendance-daily',
		whereJson: {
			employee_id: db.command.in(employees),
			attendance_date: db.command.gte(startTs).and(db.command.lte(endTs)),
			sealed: _.neq(true)
		}
	});
	return res;
}

// ==================== 批量新增 ====================
async function batchAdd(util, addList) {
	const {
		vk
	} = util;
	const BATCH_SIZE = 500;
	for (let i = 0; i < addList.length; i += BATCH_SIZE) {
		await vk.baseDao.adds({
			dbName: 'hrm-attendance-daily',
			dataJson: addList.slice(i, i + BATCH_SIZE)
		});
	}
}

// ==================== 分页查询 ====================
async function selectAll(util, dbName, whereJson, options = {}) {
	const {
		vk
	} = util;
	const pageSize = options.pageSize || 1000;
	const allRows = [];
	let pageIndex = 1;

	while (true) {
		const res = await vk.baseDao.select({
			dbName,
			whereJson,
			sortArr: options.sortArr || [],
			fieldJson: options.fieldJson || {},
			pageIndex,
			pageSize
		});
		const rows = res.rows || [];
		allRows.push(...rows);
		if (rows.length < pageSize) break;
		pageIndex++;
		if (pageIndex > 1000) break;
	}
	return {
		rows: allRows
	};
}

// ==================== 单日计算（纯内存） ====================
function calcOneDay(employeeId, dateStr, util, params, exemptionMap, empInfoMap, preload, cache, existDailyMap) {
	const {
		vk
	} = util;
	const empInfo = empInfoMap[employeeId] || {};
	const card = empInfo.card || '';
	const employeeName = empInfo.employee_name || '';

	const dayStartTs = new Date(dateStr + 'T00:00:00').getTime();
	const dayEndTs = new Date(dateStr + 'T23:59:59.999').getTime();

	let allSegmentsMissing = false;
	let hasAnyMissing = false;

	const leaveRows = preload.leaveMap[`${employeeId}_${dateStr}`] || [];
	const tripRows = preload.tripMap[`${employeeId}_${dateStr}`] || [];
	const compRows = preload.compMap[`${employeeId}_${dateStr}`] || [];
	const remedyRows = preload.remedyMap[`${employeeId}_${dateStr}`] || [];
	const overtimeRows = preload.overtimeMap[`${employeeId}_${dateStr}`] || [];
	const schedule = preload.scheduleMap[`${employeeId}_${dateStr}`];
	const clockRows = preload.clockMap[`${employeeId}_${dateStr}`] || [];
	const outingRows = preload.outingMap[`${employeeId}_${dateStr}`] || [];

	const abnormalRule = {
		single_punch_rule: 1,
		late_early_coexist_rule: 1,
		out_office_cancel_absence: true,
		out_office_cancel_late: false,
		out_office_cancel_early: false,
		overtime_cancel_early: false
	};

	// 封存检查
	const existRec = existDailyMap[`${employeeId}_${dateStr}`];
	if (existRec && existRec.sealed === true) {
		return {
			status: 'sealed'
		};
	}

	// 考勤组、班次
	let shift = null;
	let segments = [];
	let punchRule = null;
	let attendanceGroupId = '';
	let attendanceGroupName = '';
	let groupRes = null;

	if (schedule && schedule.attendance_group_id) {
		attendanceGroupId = schedule.attendance_group_id;
		groupRes = cache.groupMap[attendanceGroupId];
		if (groupRes) {
			attendanceGroupName = groupRes.group_name || '';
			if (groupRes.shift_id) {
				shift = cache.shiftMap[groupRes.shift_id];
				if (shift && shift.status) segments = shift.segments || [];
				else shift = null;
			}
			if (groupRes.punch_rule_id) {
				punchRule = cache.ruleMap[groupRes.punch_rule_id];
				if (punchRule && !punchRule.status) punchRule = null;
			}
		}
	}

	// 配置快照
	const configSnapshot = {
		schedule: schedule ? {
			_id: schedule._id,
			attendance_group_id: schedule.attendance_group_id,
			version: schedule.version || 0
		} : null,
		group: groupRes ? {
			_id: groupRes._id,
			group_name: groupRes.group_name,
			shift_id: groupRes.shift_id,
			punch_rule_id: groupRes.punch_rule_id,
			version: groupRes.version || 0
		} : null,
		shift: shift ? {
			_id: shift._id,
			shift_name: shift.shift_name,
			segments: shift.segments || [],
			version: shift.version || 0
		} : null
	};

	// 豁免判断
	const exemptionRes = checkExemptionInMemory(employeeId, dateStr, attendanceGroupId, exemptionMap);
	if (exemptionRes.exempted) return {
		status: 'exempted'
	};

	// 解析外出
	const outingRecords = outingRows.map(r => ({
		outing_title: r.form_data?.outing_title || '',
		outing_type: r.form_data?.outing_type || '',
		start_time: r.form_data?.start_time || '',
		end_time: r.form_data?.end_time || '',
		total_minutes: parseFloat(r.form_data?.total_minutes) || 0,
		outing_reason: r.form_data?.outing_reason || '',
		remark: r.form_data?.remarks || ''
	}));
	const outingRanges = outingRecords
		.filter(r => r.start_time && r.end_time)
		.map(r => ({
			start: toMinutes(r.start_time),
			end: toMinutes(r.end_time)
		}));
	const outingMinutes = outingRecords.reduce((sum, r) => sum + (r.total_minutes || 0), 0);

	// 汇总其他记录
	const leaveMinutes = leaveRows.reduce((sum, r) => sum + (r.total_minutes || 0), 0);
	const tripMinutes = tripRows.reduce((sum, r) => sum + calcOverlapMinutes(r.start_time, r.end_time, dayStartTs,
		dayEndTs), 0);
	const compMinutes = compRows.reduce((sum, r) => sum + (r.total_minutes || 0), 0);

	// 加班分类汇总
	let overtimeCompensatoryMinutes = 0;
	let overtimePaidMinutes = 0;
	for (const r of overtimeRows) {
		if (r.overtime_type === 'compensatory') {
			overtimeCompensatoryMinutes += r.total_minutes || 0;
		} else if (r.overtime_type === 'paid') {
			overtimePaidMinutes += r.total_minutes || 0;
		}
	}
	const overtimeMinutesFromRecord = overtimeCompensatoryMinutes + overtimePaidMinutes;

	const leaveRecords = leaveRows.map(r => ({
		leave_type: r.leave_type,
		leave_name: r.leave_name,
		total_minutes: r.total_minutes,
		reason: r.reason || '',
		leave_date: r.leave_date
	}));
	const tripRecords = tripRows.map(r => ({
		trip_location: r.trip_location,
		start_time: r.start_time,
		end_time: r.end_time,
		total_minutes: r.total_minutes,
		trip_type: r.trip_type || 'domestic',
		reason: r.reason || ''
	}));
	const compRecords = compRows.map(r => ({
		total_minutes: r.total_minutes,
		reason: r.reason || '',
		items: r.items || []
	}));
	const overtimeRecords = overtimeRows.map(r => ({
		overtime_date: r.overtime_date,
		total_minutes: r.total_minutes,
		overtime_type: r.overtime_type,
		morning_range: r.morning_range || null,
		afternoon_range: r.afternoon_range || null
	}));

	// 补卡
	let remedyList = remedyRows
		.map(r => r.form_data)
		.filter(fd => fd && fd.miss_time && (fd.miss_type === 'clock_in' || fd.miss_type === 'clock_out'))
		.map(fd => ({
			miss_type: fd.miss_type,
			miss_time: fd.miss_time,
			miss_reason: fd.miss_reason || '',
			used: false
		}));

	const {
		inBefore,
		inAfter,
		outBefore,
		outAfter
	} = getPunchWindow(punchRule);
	const shouldAttendMinutes = calcShouldAttendMinutes(segments);

	// ========== 无排班但有特殊记录 ==========
	// console.log('[分支判断]', {
	// 	employeeId,
	// 	dateStr,
	// 	hasShift: !!shift,
	// 	segmentsLen: segments.length,
	// 	leaveMinutes,
	// 	tripMinutes,
	// 	compMinutes,
	// 	overtimeMinutesFromRecord,
	// 	outingMinutes,
	// 	hasSpecialRecord: leaveMinutes > 0 || tripMinutes > 0 || compMinutes > 0 ||
	// 		overtimeMinutesFromRecord > 0 || outingMinutes > 0
	// });

	// ========== 无排班但有特殊记录 ==========
	if (!shift || segments.length === 0) {
		const hasSpecialRecord = leaveMinutes > 0 || tripMinutes > 0 || compMinutes > 0 ||
			overtimeMinutesFromRecord > 0 || outingMinutes > 0;

		if (!hasSpecialRecord) return {
			status: 'no_data'
		};

		// ========== 优先处理加班（加班优先于外出） ==========
		if (overtimeMinutesFromRecord > 0) {
			const overtimeSegments = [];
			overtimeRecords.forEach(r => {
				if (r.morning_range && r.morning_range.length === 2) {
					overtimeSegments.push({
						name: '上午',
						start_time: r.morning_range[0],
						end_time: r.morning_range[1]
					});
				}
				if (r.afternoon_range && r.afternoon_range.length === 2) {
					overtimeSegments.push({
						name: '下午',
						start_time: r.afternoon_range[0],
						end_time: r.afternoon_range[1]
					});
				}
			});

			// 加班时段应有出勤分钟数
			let overtimeShouldMinutes = 0;
			for (const seg of overtimeSegments) {
				overtimeShouldMinutes += toMinutes(seg.end_time) - toMinutes(seg.start_time);
			}

			const outingRangesForOt = outingRecords
				.filter(r => r.start_time && r.end_time)
				.map(r => ({
					start: toMinutes(r.start_time),
					end: toMinutes(r.end_time)
				}));

			const otResult = matchSegments(
				clockRows, overtimeSegments, remedyList, outingRangesForOt,
				inBefore, inAfter, outBefore, outAfter, params
			);

			// ===== 计算实际出勤分钟数和缺卡分钟数 =====
			let actualWorkMinutes = 0;
			let absentFromMissing = 0;

			for (const seg of otResult.segmentResults) {
				const segStart = toMinutes(seg.start_time);
				const segEnd = toMinutes(seg.end_time);
				const segTotalMinutes = segEnd - segStart;

				// 计算该段实际出勤
				if (seg.clock_in && seg.clock_out) {
					const inMin = toMinutes(seg.clock_in);
					const outMin = toMinutes(seg.clock_out);
					if (outMin > inMin) {
						actualWorkMinutes += (outMin - inMin);
					}
				} else if (seg.clock_in && !seg.clock_out) {
					// 只有签到，算到下班时间（或者算 0，取决于规则，这里保守算 0）
					// actualWorkMinutes += 0; 
				}

				// 计算该段缺卡时长
				if (seg.missing_in && seg.missing_out) {
					absentFromMissing += segTotalMinutes;
				} else if (seg.missing_in || seg.missing_out) {
					// 缺一半（签退或签到），简单按半个时段算旷工
					absentFromMissing += Math.floor(segTotalMinutes / 2);
				}
			}

			// ===== 状态判定 =====
			const absentThreshold = params.absent_threshold_minutes || 30;
			let absentMinutes = 0;
			let otAttendanceStatus = 6;

			const allMissingAndNoLeave = otResult.allMissing &&
				leaveMinutes === 0 && tripMinutes === 0 &&
				compMinutes === 0 && outingMinutes === 0;

			if (allMissingAndNoLeave) {
				absentMinutes = overtimeShouldMinutes; // 全缺，旷工=加班总时长
			} else if (otResult.hasMissing) {
				absentMinutes = absentFromMissing;
			}

			if (absentMinutes >= absentThreshold) {
				otAttendanceStatus = 5; // 旷工
			} else if (otResult.hasMissing) {
				otAttendanceStatus = 0; // 异常
			} else {
				otAttendanceStatus = 6; // 加班
			}

			const record = buildRecord({
				employeeId,
				employeeName,
				card,
				dayStartTs,
				attendanceGroupId,
				attendanceGroupName,
				shift: null,
				segments: otResult.segmentResults,
				shouldAttendMinutes: overtimeShouldMinutes, // ★ 应出勤 = 加班时段总长
				actualAttendMinutes: actualWorkMinutes, // ★ 实际出勤 = 真实在岗时长
				lateMinutes: otResult.totalLate,
				earlyMinutes: otResult.totalEarly,
				absentMinutes, // ★ 动态旷工时长
				overtimeMinutes: roundOvertimeMinutes(overtimeMinutesFromRecord),
				overtimeCompensatoryMinutes,
				overtimePaidMinutes,
				leaveMinutes: 0,
				tripMinutes: 0,
				compMinutes: 0,
				outingMinutes,
				leaveRecords: [],
				tripRecords: [],
				compRecords: [],
				outingRecords,
				overtimeRecords,
				remedyRecords: remedyList.filter(r => r.used).map(r => ({
					miss_type: r.miss_type,
					miss_time: r.miss_time,
					miss_reason: r.miss_reason
				})),
				remedyFlag: remedyList.some(r => r.used),
				attendanceStatus: otAttendanceStatus,
				configSnapshot
			});
			return {
				status: 'success',
				record
			};
		}

		// ========== 其次是请假/出差/调休/外出 ==========
		if (leaveMinutes > 0 || tripMinutes > 0 || compMinutes > 0 || outingMinutes > 0) {
			let attendanceStatus = 0;
			if (leaveMinutes > 0) attendanceStatus = 2;
			else if (tripMinutes > 0) attendanceStatus = 3;
			else if (compMinutes > 0) attendanceStatus = 4;

			const record = buildRecord({
				employeeId,
				employeeName,
				card,
				dayStartTs,
				attendanceGroupId,
				attendanceGroupName,
				shift: null,
				segments: [],
				shouldAttendMinutes: 0,
				actualAttendMinutes: 0,
				lateMinutes: 0,
				earlyMinutes: 0,
				absentMinutes: 0,
				overtimeMinutes: roundOvertimeMinutes(overtimeMinutesFromRecord),
				overtimeCompensatoryMinutes,
				overtimePaidMinutes,
				leaveMinutes,
				tripMinutes,
				compMinutes,
				outingMinutes,
				leaveRecords,
				tripRecords,
				compRecords,
				outingRecords,
				overtimeRecords,
				remedyRecords: [],
				remedyFlag: false,
				attendanceStatus,
				configSnapshot
			});
			return {
				status: 'success',
				record
			};
		}
	}

	// ========== 有排班，优先处理特殊状态 ==========
	if (leaveMinutes > 0 || tripMinutes > 0 || compMinutes > 0) {
		let status = 0;
		if (leaveMinutes > 0) status = 2;
		else if (tripMinutes > 0) status = 3;
		else if (compMinutes > 0) status = 4;

		const actualAttendMinutes = calcActualAttendMinutes({
			shouldAttendMinutes,
			punchWorkMinutes: 0,
			tripMinutes,
			outingMinutes,
			compMinutes,
			leaveMinutes,
			absentMinutes: 0
		});

		const record = buildRecord({
			employeeId,
			employeeName,
			card,
			dayStartTs,
			attendanceGroupId,
			attendanceGroupName,
			shift,
			segments: [],
			shouldAttendMinutes,
			actualAttendMinutes,
			lateMinutes: 0,
			earlyMinutes: 0,
			absentMinutes: 0,
			overtimeMinutes: roundOvertimeMinutes(overtimeMinutesFromRecord),
			overtimeCompensatoryMinutes,
			overtimePaidMinutes,
			leaveMinutes,
			tripMinutes,
			compMinutes,
			outingMinutes,
			leaveRecords,
			tripRecords,
			compRecords,
			outingRecords,
			overtimeRecords,
			remedyRecords: [],
			remedyFlag: false,
			attendanceStatus: status,
			configSnapshot
		});
		return {
			status: 'success',
			record
		};
	}

	// ========== 正常打卡（有排班） ==========
	const matchResult = matchSegments(clockRows, segments, remedyList, outingRanges, inBefore, inAfter, outBefore,
		outAfter, params);

	const minWorkMinutes = punchRule?.missing_punch_min_work_minutes || 0;
	if (minWorkMinutes > 0) {
		for (const seg of matchResult.segmentResults) {
			const onlyOne = (seg.clock_in && !seg.clock_out) || (!seg.clock_in && seg.clock_out);
			if (onlyOne) {
				const worked = seg.clock_in && seg.clock_out ? toMinutes(seg.clock_out) - toMinutes(seg.clock_in) : 0;
				if (worked < minWorkMinutes) {
					seg.missing_in = false;
					seg.missing_out = false;
				}
			}
		}
	}

	// 应用异常判定规则
	let totalLate = matchResult.segmentResults.reduce((sum, s) => sum + s.late_minutes, 0);
	let totalEarly = matchResult.segmentResults.reduce((sum, s) => sum + s.early_minutes, 0);

	// 迟到早退共存规则
	if (totalLate > 0 && totalEarly > 0) {
		switch (abnormalRule.late_early_coexist_rule) {
			case 1:
				break;
			case 2:
				if (totalLate >= totalEarly) totalEarly = 0;
				else totalLate = 0;
				break;
			case 3:
				totalEarly = 0;
				break;
			case 4:
				totalLate = 0;
				break;
		}
	}

	// 出差、外出：清除迟到早退
	if (abnormalRule.out_office_cancel_late && (tripMinutes > 0 || outingMinutes > 0)) {
		totalLate = 0;
		for (const seg of matchResult.segmentResults) seg.late_minutes = 0;
	}
	if (abnormalRule.out_office_cancel_early && (tripMinutes > 0 || outingMinutes > 0)) {
		totalEarly = 0;
		for (const seg of matchResult.segmentResults) seg.early_minutes = 0;
	}
	if (abnormalRule.overtime_cancel_early && overtimeMinutesFromRecord > 0) {
		totalEarly = 0;
		for (const seg of matchResult.segmentResults) seg.early_minutes = 0;
	}

	// 只打一次卡处理
	let singlePunchAbsent = 0;
	for (const seg of matchResult.segmentResults) {
		const onlyOne = (seg.clock_in && !seg.clock_out) || (!seg.clock_in && seg.clock_out);
		if (onlyOne) {
			switch (abnormalRule.single_punch_rule) {
				case 1:
					if (leaveMinutes > 0 || tripMinutes > 0 || outingMinutes > 0) {
						seg.missing_in = false;
						seg.missing_out = false;
					} else singlePunchAbsent += 8 * 60;
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
				case 4:
					break;
			}
		}
	}

	totalLate = matchResult.segmentResults.reduce((sum, s) => sum + s.late_minutes, 0);
	totalEarly = matchResult.segmentResults.reduce((sum, s) => sum + s.early_minutes, 0);

	let realMissingCount = 0;
	for (const seg of matchResult.segmentResults) {
		if (seg.missing_in || seg.missing_out) realMissingCount++;
	}

	const absentThreshold = params.absent_threshold_minutes || 30;

	let absentMinutes = singlePunchAbsent;
	let attendanceStatus = 1;

	// 状态判定
	if (allSegmentsMissing && leaveMinutes === 0 && tripMinutes === 0 && compMinutes === 0 && outingMinutes === 0) {
		absentMinutes = 8 * 60;
		attendanceStatus = 5;
	} else if (totalLate >= absentThreshold || totalEarly >= absentThreshold) {
		absentMinutes = Math.max(absentMinutes, Math.max(totalLate, totalEarly));
		attendanceStatus = 5;
	} else if (realMissingCount > 0) {
		attendanceStatus = 0;
	} else if (overtimeMinutesFromRecord > 0) {
		attendanceStatus = 6;
	} else {
		attendanceStatus = 1;
	}

	let punchWorkMinutes = 0;
	for (const seg of matchResult.segmentResults) {
		if (seg.clock_in && seg.clock_out) {
			punchWorkMinutes += toMinutes(seg.clock_out) - toMinutes(seg.clock_in);
		}
	}

	const actualAttendMinutes = calcActualAttendMinutes({
		shouldAttendMinutes,
		punchWorkMinutes,
		tripMinutes,
		outingMinutes,
		compMinutes,
		leaveMinutes,
		absentMinutes
	});

	const usedRemedyRecords = remedyList
		.filter(r => r.used)
		.map(r => ({
			miss_type: r.miss_type,
			miss_time: r.miss_time,
			miss_reason: r.miss_reason
		}));

	const record = buildRecord({
		employeeId,
		employeeName,
		card,
		dayStartTs,
		attendanceGroupId,
		attendanceGroupName,
		shift,
		segments: matchResult.segmentResults,
		shouldAttendMinutes,
		actualAttendMinutes,
		lateMinutes: totalLate,
		earlyMinutes: totalEarly,
		absentMinutes,
		overtimeMinutes: roundOvertimeMinutes(overtimeMinutesFromRecord),
		overtimeCompensatoryMinutes,
		overtimePaidMinutes,
		leaveMinutes,
		tripMinutes,
		compMinutes,
		outingMinutes,
		leaveRecords,
		tripRecords,
		compRecords,
		outingRecords,
		overtimeRecords,
		remedyRecords: usedRemedyRecords,
		remedyFlag: usedRemedyRecords.length > 0,
		attendanceStatus,
		configSnapshot
	});
	return {
		status: 'success',
		record
	};
}

// ==================== 匹配时段 ====================
function matchSegments(clockRows, segments, remedyList, outingRanges, inBefore, inAfter, outBefore, outAfter, params) {
	const segmentResults = [];
	const usedPunchIndexes = new Set();

	// 打印输入
	console.log('[matchSegments] 输入 clockRows=', clockRows.map(c => extractHHmmFromTimestamp(c.clockintime)),
		'segments=', segments, '窗口=', {
			inBefore,
			inAfter,
			outBefore,
			outAfter
		});

	for (const seg of segments) {

		const segStartMin = toMinutes(seg.start_time);
		const segEndMin = toMinutes(seg.end_time);
		const inWindow = [segStartMin - inBefore, segStartMin + inAfter];
		const outWindow = [segEndMin - outBefore, segEndMin + outAfter];
		console.log(
			`[matchSegments] 段=${seg.name} ${seg.start_time}-${seg.end_time} 签到窗口=[${inWindow[0]},${inWindow[1]}] 签退窗口=[${outWindow[0]},${outWindow[1]}]`
		);

		// const segStartMin = toMinutes(seg.start_time);
		// const segEndMin = toMinutes(seg.end_time);
		let inPunch = null,
			outPunch = null;
		let bestInDiff = Infinity,
			bestOutDiff = Infinity;
		let bestInIdx = -1,
			bestOutIdx = -1;

		for (let i = 0; i < clockRows.length; i++) {
			if (usedPunchIndexes.has(i)) continue;
			const hhmm = extractHHmmFromTimestamp(clockRows[i].clockintime);
			const pMin = toMinutes(hhmm);
			if (pMin >= segStartMin - inBefore && pMin <= segStartMin + inAfter) {
				const diff = Math.abs(pMin - segStartMin);
				if (diff < bestInDiff) {
					bestInDiff = diff;
					bestInIdx = i;
					inPunch = hhmm;
				}
			}
			if (pMin >= segEndMin - outBefore && pMin <= segEndMin + outAfter) {
				const diff = Math.abs(pMin - segEndMin);
				if (diff < bestOutDiff) {
					bestOutDiff = diff;
					bestOutIdx = i;
					outPunch = hhmm;
				}
			}
		}

		if (!inPunch) {

			console.log(
				`[matchSegments] 段=${seg.name} 未命中签到卡！检查：打卡[${clockRows.map(c => extractHHmmFromTimestamp(c.clockintime))}] 是否在窗口[${inWindow}]内，usedIndexes=${[...usedPunchIndexes]}`
				);

			for (const rem of remedyList) {
				if (rem.used || rem.miss_type !== 'clock_in') continue;
				const remMin = toMinutes(rem.miss_time);
				if (remMin >= segStartMin - inBefore && remMin <= segStartMin + inAfter) {
					inPunch = rem.miss_time;
					rem.used = true;
					break;
				}
			}
		}
		if (!outPunch) {
			console.log(`[matchSegments] 段=${seg.name} 未命中签退卡！窗口=[${outWindow}]`);
			for (const rem of remedyList) {
				if (rem.used || rem.miss_type !== 'clock_out') continue;
				const remMin = toMinutes(rem.miss_time);
				if (remMin >= segEndMin - outBefore && remMin <= segEndMin + outAfter) {
					outPunch = rem.miss_time;
					rem.used = true;
					break;
				}
			}
		}

		if (!inPunch) {
			const outingIn = outingRanges.find(r => r.start <= segStartMin + inAfter && r.end >= segStartMin -
				inBefore);
			if (outingIn) inPunch = minutesToHHmm(Math.max(outingIn.start, segStartMin - inBefore));
		}
		if (!outPunch) {
			const outingOut = outingRanges.find(r => r.start <= segEndMin + outAfter && r.end >= segEndMin - outBefore);
			if (outingOut) outPunch = minutesToHHmm(Math.min(outingOut.end, segEndMin + outAfter));
		}

		if (bestInIdx !== -1) usedPunchIndexes.add(bestInIdx);
		if (bestOutIdx !== -1) usedPunchIndexes.add(bestOutIdx);

		let segLate = 0,
			segEarly = 0;
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
			missing_in: !inPunch,
			missing_out: !outPunch
		});
	}

	const totalLate = segmentResults.reduce((sum, s) => sum + s.late_minutes, 0);
	const totalEarly = segmentResults.reduce((sum, s) => sum + s.early_minutes, 0);
	const hasMissing = segmentResults.some(s => s.missing_in || s.missing_out);
	const allMissing = segmentResults.length > 0 && segmentResults.every(s => s.missing_in && s.missing_out);

	return {
		segmentResults,
		totalLate,
		totalEarly,
		hasMissing,
		allMissing
	};
}

// ==================== 构建 record ====================
function buildRecord(data) {
	return {
		employee_id: data.employeeId,
		employee_name: data.employeeName,
		card: data.card,
		attendance_date: data.dayStartTs,
		attendance_group_id: data.attendanceGroupId,
		attendance_group_name: data.attendanceGroupName,
		shift_id: data.shift ? data.shift._id : null,
		shift_name: data.shift ? data.shift.shift_name : '',
		segments: data.segments,
		should_attend_minutes: data.shouldAttendMinutes,
		actual_attend_minutes: data.actualAttendMinutes,
		late_minutes: data.lateMinutes,
		early_minutes: data.earlyMinutes,
		absent_minutes: data.absentMinutes,
		overtime_minutes: data.overtimeMinutes,
		overtime_compensatory_minutes: data.overtimeCompensatoryMinutes || 0,
		overtime_paid_minutes: data.overtimePaidMinutes || 0,
		leave_minutes: data.leaveMinutes,
		trip_minutes: data.tripMinutes,
		compensatory_minutes: data.compMinutes,
		outing_minutes: data.outingMinutes,
		leave_records: data.leaveRecords,
		trip_records: data.tripRecords,
		compensatory_records: data.compRecords,
		outing_records: data.outingRecords,
		overtime_records: data.overtimeRecords,
		remedy_records: data.remedyRecords,
		remedy_flag: data.remedyFlag,
		attendance_status: data.attendanceStatus,
		sealed: false,
		config_snapshot: data.configSnapshot,
		update_id: 'system',
		update_date: Date.now()
	};
}

// ==================== 豁免内存判断 ====================
function checkExemptionInMemory(employeeId, dateStr, attendanceGroupId, exemptionMap) {
	const rules = exemptionMap[employeeId];
	if (!rules || rules.length === 0) return {
		exempted: false
	};
	for (const rule of rules) {
		const endDate = rule.end_date || '9999-12-31';
		if (dateStr < rule.start_date || dateStr > endDate) continue;
		if (rule.exemption_type === 1 && Array.isArray(rule.employee_ids) && rule.employee_ids.includes(employeeId)) {
			return {
				exempted: true,
				reason: rule.reason || '员工豁免'
			};
		}
		if (rule.exemption_type === 2) {
			return {
				exempted: true,
				reason: rule.reason || '部门豁免'
			};
		}
		if (rule.exemption_type === 3 && attendanceGroupId && Array.isArray(rule.attendance_group_ids) && rule
			.attendance_group_ids.includes(attendanceGroupId)) {
			return {
				exempted: true,
				reason: rule.reason || '考勤组豁免'
			};
		}
	}
	return {
		exempted: false
	};
}

// ==================== 工具函数 ====================
function extractHHmmFromTimestamp(timestamp) {
	if (!timestamp) return null;
	const date = new Date(timestamp);
	return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function toMinutes(hhmm) {
	if (!hhmm) return 0;
	const [h, m] = hhmm.split(':').map(Number);
	return h * 60 + m;
}

function minutesToHHmm(minutes) {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function calcOverlapMinutes(start1, end1, start2, end2) {
	const s = Math.max(start1, start2);
	const e = Math.min(end1, end2);
	if (s >= e) return 0;
	return Math.round((e - s) / (1000 * 60));
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
	return {
		inBefore: 60,
		inAfter: 30,
		outBefore: 30,
		outAfter: 120
	};
}

function roundOvertimeMinutes(minutes) {
	const unit = 30;
	if (!minutes || minutes <= 0) return 0;
	return Math.floor(minutes / unit) * unit;
}

function calcShouldAttendMinutes(segments) {
	let total = 0;
	if (Array.isArray(segments)) {
		for (const seg of segments) {
			if (seg.start_time && seg.end_time) total += toMinutes(seg.end_time) - toMinutes(seg.start_time);
		}
	}
	return total;
}

function calcActualAttendMinutes({
	shouldAttendMinutes,
	punchWorkMinutes,
	tripMinutes,
	outingMinutes,
	compMinutes,
	leaveMinutes,
	absentMinutes
}) {
	if (!shouldAttendMinutes || shouldAttendMinutes <= 0) return 0;
	const absenceTotal = leaveMinutes + compMinutes + absentMinutes;
	if (absenceTotal >= shouldAttendMinutes) return 0;
	const deemed = tripMinutes + outingMinutes + compMinutes;
	return Math.min(shouldAttendMinutes, deemed + punchWorkMinutes);
}