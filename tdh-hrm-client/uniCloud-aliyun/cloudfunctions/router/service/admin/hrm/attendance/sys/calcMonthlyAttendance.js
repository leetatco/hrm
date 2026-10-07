// admin/hrm/attendance/sys/calcMonthlyAttendance
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
			attendance_ym,
			employee_ids = []
		} = data;

		if (!attendance_ym) {
			return {
				code: -1,
				msg: '考勤月份不能为空'
			};
		}

		// 解析 attendance_ym
		const [yearStr, monthStr] = attendance_ym.split('-');
		const year = parseInt(yearStr);
		const month = parseInt(monthStr);
		if (!year || !month || month < 1 || month > 12) {
			return {
				code: -1,
				msg: '考勤月份格式不正确，应为 yyyy-MM'
			};
		}

		// ========== 1. 考勤参数 ==========
		const paramsRes = await vk.callFunction({
			url: 'admin/hrm/attendance/pub/getParams',
			data: {}
		});
		const params = paramsRes.code === 0 ? paramsRes.rows : {};

		// ========== 2. 统计周期 ==========
		const periodRange = getMonthlyPeriodRange(year, month, params);
		console.log('[统计周期]', periodRange.startStr, '~', periodRange.endStr);

		// ========== 3. 员工列表 ==========
		let allEmployees = [];
		if (employee_ids.length > 0) {
			allEmployees = employee_ids;
		} else {
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
			allEmployees = empRes.rows.map(e => e.employee_id);
		}
		if (allEmployees.length === 0) {
			return {
				code: -1,
				msg: '没有需要汇总的员工'
			};
		}
		console.log('[员工数]', allEmployees.length);

		// ========== 4. 按日期区间批量查日考勤 ==========
		const startTs = new Date(periodRange.startStr + 'T00:00:00').getTime();
		const endTs = new Date(periodRange.endStr + 'T23:59:59.999').getTime();

		const dailyRes = await selectAll(util, 'hrm-attendance-daily', {
			attendance_date: db.command.gte(startTs).and(db.command.lte(endTs))
		}, {
			pageSize: 1000
		});

		console.log('[日考勤记录数]', dailyRes.rows.length);

		// 按员工分组
		const dailyMap = {};
		for (const row of dailyRes.rows) {
			if (!dailyMap[row.employee_id]) dailyMap[row.employee_id] = [];
			dailyMap[row.employee_id].push(row);
		}
		const employeesWithDaily = Object.keys(dailyMap);

		// ========== 5. 预加载员工信息、定薪信息 ==========
		const empInfoMap = await loadEmployeeInfoMap(util, allEmployees);
		const salaryMap = await loadSalaryMap(util, allEmployees, empInfoMap);

		// ========== 6. 预加载已有月汇总（判断已签单） ==========
		const existMonthlyMap = await loadExistMonthlyMap(util, allEmployees, attendance_ym);

		// ========== 7. 预加载豁免规则 ==========
		const employeesWithoutDaily = allEmployees.filter(id => !employeesWithDaily.includes(id));
		let exemptionMap = {};
		if (employeesWithoutDaily.length > 0) {
			exemptionMap = await buildExemptionMapForMonthly(
				util, employeesWithoutDaily, periodRange.startStr, periodRange.endStr
			);
		}

		// ========== 8. 逐员工汇总 ==========
		const stats = {
			total: 0,
			normalCount: 0,
			exemptedCount: 0,
			skippedSigned: 0,
			errors: []
		};

		const addList = [];
		const updateList = [];

		// 8.1 有日考勤的员工
		for (const empId of employeesWithDaily) {
			stats.total++;
			try {
				const rows = dailyMap[empId] || [];
				const empInfo = empInfoMap[empId] || {};
				const salaryInfo = salaryMap[empId] || {};
				const existRec = existMonthlyMap[empId];

				const record = buildMonthlyRecord({
					empId,
					empInfo,
					salaryInfo,
					rows,
					attendance_ym,
					periodRange,
					params
				});

				if (existRec && existRec.sign_status === 1) {
					// 已签单：不覆盖签单相关字段
					stats.skippedSigned++;
					delete record.contract_days;
					delete record.diff_days;
					delete record.sign_status;
					updateList.push({
						_id: existRec._id,
						record
					});
				} else if (existRec) {
					updateList.push({
						_id: existRec._id,
						record
					});
				} else {
					addList.push(record);
				}
				stats.normalCount++;
			} catch (e) {
				stats.errors.push({
					empId,
					error: e.message
				});
				console.error(`[月汇总异常] ${empId}:`, e.message);
			}
		}

		// 8.2 无日考勤但属于豁免的员工
		for (const empId of employeesWithoutDaily) {
			stats.total++;
			try {
				const rules = exemptionMap[empId] || [];
				let exempted = false;
				let exemptionReason = '';

				for (const rule of rules) {
					const endDate = rule.end_date || '9999-12-31';
					if (rule.start_date <= periodRange.startStr && endDate >= periodRange.endStr) {
						exempted = true;
						exemptionReason = rule.reason || '考勤豁免';
						break;
					}
				}

				if (!exempted) continue;

				const empInfo = empInfoMap[empId] || {};
				const salaryInfo = salaryMap[empId] || {};
				const existRec = existMonthlyMap[empId];

				if (existRec && existRec.sign_status === 1) {
					stats.skippedSigned++;
					stats.exemptedCount++;
					continue;
				}

				const record = buildExemptedRecord({
					empId,
					empInfo,
					salaryInfo,
					attendance_ym,
					periodRange,
					exemptionReason
				});

				if (existRec) {
					updateList.push({
						_id: existRec._id,
						record
					});
				} else {
					addList.push(record);
				}
				stats.exemptedCount++;
			} catch (e) {
				stats.errors.push({
					empId,
					error: e.message
				});
				console.error(`[豁免补记录异常] ${empId}:`, e.message);
			}
		}

		console.log('[计算完成] addList:', addList.length, 'updateList:', updateList.length);
		console.log('[统计]', stats);

		// ========== 9. 批量写入 ==========
		if (addList.length > 0) {
			await batchAdd(util, addList);
			console.log('[写入新增]', addList.length);
		}
		if (updateList.length > 0) {
			await batchUpdate(util, updateList);
			console.log('[写入更新]', updateList.length);
		}

		const msg = stats.exemptedCount > 0 ?
			`成功汇总 ${attendance_ym} 共 ${stats.normalCount} 名员工，豁免 ${stats.exemptedCount} 人` :
			`成功汇总 ${attendance_ym} 共 ${stats.normalCount} 名员工`;

		return {
			code: 0,
			msg,
			total: stats.normalCount,
			exemptedCount: stats.exemptedCount,
			stats
		};
	}
};

// ==================== 构建正常月汇总记录 ====================
function buildMonthlyRecord({
	empId,
	empInfo,
	salaryInfo,
	rows,
	attendance_ym,
	periodRange,
	params
}) {
	const salaryType = salaryInfo.salary_type || 1;
	const salary = salaryInfo.salary || 0;
	const contractDays = salaryInfo.contract_days || 0;
	const card = empInfo.card || '';
	const employeeName = empInfo.employee_name || '';

	let shouldDays = 0,
		actualDays = 0,
		restDays = 0;
	let lateCount = 0,
		lateMinutes = 0;
	let earlyCount = 0,
		earlyMinutes = 0;
	let absentCount = 0,
		absentMinutes = 0;
	let overtimeMinutes = 0,
		overtimeCompensatoryMinutes = 0,
		overtimePaidMinutes = 0,
		leaveMinutes = 0,
		tripMinutes = 0,
		outingMinutes = 0,
		compensatoryMinutes = 0;
	let remedyCount = 0;
	let shouldMinutes = 0,
		actualMinutes = 0;

	let noPunchCount = 0;

	for (const day of rows) {
		const dayShould = day.should_attend_minutes || 0;
		const dayActual = day.actual_attend_minutes || 0;

		shouldMinutes += dayShould;
		actualMinutes += dayActual;

		if (dayShould > 0) shouldDays++;
		else restDays++;

		if (dayShould > 0 && dayActual >= dayShould) actualDays++;
		else if (dayShould === 0 && dayActual > 0) actualDays++;

		if (day.late_minutes > 0) {
			lateCount++;
			lateMinutes += day.late_minutes;
		}
		if (day.early_minutes > 0) {
			earlyCount++;
			earlyMinutes += day.early_minutes;
		}
		if (day.absent_minutes > 0) {
			absentCount++;
			absentMinutes += day.absent_minutes;
		}
		if (day.remedy_flag) remedyCount++;
		overtimeMinutes += day.overtime_minutes || 0;
		overtimeCompensatoryMinutes += day.overtime_compensatory_minutes || 0;
		overtimePaidMinutes += day.overtime_paid_minutes || 0;

		leaveMinutes += day.leave_minutes || 0;
		tripMinutes += day.trip_minutes || 0;
		outingMinutes += day.outing_minutes || 0;
		compensatoryMinutes += day.compensatory_minutes || 0;

		// 缺卡次数：当天只要有一个时段缺签到或缺签退，就算 1 次
		if (day.segments && Array.isArray(day.segments)) {
			const hasMissing = day.segments.some(seg => seg.missing_in || seg.missing_out);
			if (hasMissing) noPunchCount++;
		}

	}

	// 计薪天数/小时
	let payDays = 0,
		payHours = 0;
	if (salaryType === 2) {
		const standardMinutes = params.standard_work_minutes || 8 * 60;
		payDays = standardMinutes > 0 ?
			Math.round((actualMinutes / standardMinutes) * 100) / 100 :
			0;
	} else if (salaryType === 3) {
		payHours = Math.round((actualMinutes / 60) * 100) / 100;
	}

	// 合同天数差异（仅月薪）
	let diffDays = 0;
	let signStatus = 2;
	if (salaryType === 1 && contractDays > 0) {
		diffDays = contractDays - shouldDays;
		if (diffDays < 0) diffDays = 0;
		if (diffDays > 0) signStatus = 0;
	}

	// 全勤判定
	const fullAttendance = (
		lateCount === 0 && earlyCount === 0 && absentCount === 0 &&
		leaveMinutes === 0 && compensatoryMinutes === 0 && remedyCount === 0 &&
		shouldDays > 0 && actualDays >= shouldDays
	);

	return {
		employee_id: empId,
		employee_name: employeeName,
		card: card,
		attendance_ym: attendance_ym,
		period_start: periodRange.startStr,
		period_end: periodRange.endStr,
		salary_type: salaryType,
		salary: salary,
		pay_days: payDays,
		pay_hours: payHours,
		should_days: shouldDays,
		actual_days: actualDays,
		rest_days: restDays,
		should_minutes: shouldMinutes,
		actual_minutes: actualMinutes,
		late_count: lateCount,
		late_minutes: lateMinutes,
		early_count: earlyCount,
		early_minutes: earlyMinutes,
		absent_count: absentCount,
		no_punch_count: noPunchCount,
		absent_minutes: absentMinutes,
		overtime_minutes: overtimeMinutes,
		overtime_compensatory_minutes: overtimeCompensatoryMinutes,
		overtime_paid_minutes: overtimePaidMinutes,
		leave_minutes: leaveMinutes,
		trip_minutes: tripMinutes,
		outing_minutes: outingMinutes,
		compensatory_minutes: compensatoryMinutes,
		remedy_count: remedyCount,
		full_attendance: fullAttendance,
		contract_days: contractDays,
		diff_days: diffDays,
		sign_status: signStatus,
		exempted: false,
		exemption_reason: '',
		update_id: 'system',
		update_date: Date.now()
	};
}

// ==================== 构建豁免月汇总记录 ====================
function buildExemptedRecord({
	empId,
	empInfo,
	salaryInfo,
	attendance_ym,
	periodRange,
	exemptionReason
}) {
	return {
		employee_id: empId,
		employee_name: empInfo.employee_name || '',
		card: empInfo.card || '',
		attendance_ym: attendance_ym,
		period_start: periodRange.startStr,
		period_end: periodRange.endStr,
		salary_type: salaryInfo.salary_type || 1,
		salary: salaryInfo.salary || 0,
		pay_days: 0,
		pay_hours: 0,
		should_days: 0,
		actual_days: 0,
		rest_days: getDaysBetween(periodRange.startStr, periodRange.endStr),
		should_minutes: 0,
		actual_minutes: 0,
		late_count: 0,
		late_minutes: 0,
		early_count: 0,
		early_minutes: 0,
		absent_count: 0,
		absent_minutes: 0,
		no_punch_count: 0,
		overtime_minutes: 0,
		leave_minutes: 0,
		trip_minutes: 0,
		outing_minutes: 0,
		compensatory_minutes: 0,
		remedy_count: 0,
		full_attendance: true,
		contract_days: 0,
		diff_days: 0,
		sign_status: 2,
		exempted: true,
		exemption_reason: exemptionReason,
		update_id: 'system',
		update_date: Date.now()
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

// ==================== 预加载定薪信息（按 card 关联） ====================
async function loadSalaryMap(util, employees, empInfoMap) {
	const {
		vk,
		_
	} = util;
	const map = {};
	if (employees.length === 0) return map;

	const empCardMap = {};
	const cards = [];
	for (const empId of employees) {
		const empInfo = empInfoMap[empId] || {};
		const card = empInfo.card || '';
		empCardMap[empId] = card;
		if (card) cards.push(card);
	}
	if (cards.length === 0) return map;

	const salaryRes = await selectAll(util, 'hrm-salary-employees', {
		card: _.in(cards)
	}, {
		sortArr: [{
			name: 'update_date',
			type: 'desc'
		}],
		fieldJson: {
			card: true,
			salary_type: true,
			salary: true,
			contract_days: true
		}
	});

	const cardSalaryMap = {};
	for (const s of salaryRes.rows) {
		if (!cardSalaryMap[s.card]) cardSalaryMap[s.card] = s;
	}

	for (const empId of employees) {
		const card = empCardMap[empId];
		if (card && cardSalaryMap[card]) {
			map[empId] = cardSalaryMap[card];
		}
	}
	return map;
}

// ==================== 预加载已有月汇总 ====================
async function loadExistMonthlyMap(util, employees, attendance_ym) {
	const {
		vk,
		_
	} = util;
	const map = {};

	const res = await selectAll(util, 'hrm-attendance-monthly', {
		employee_id: _.in(employees),
		attendance_ym
	}, {
		fieldJson: {
			_id: true,
			employee_id: true,
			sign_status: true
		}
	});

	for (const r of res.rows) {
		map[r.employee_id] = r;
	}
	return map;
}

// ==================== 预加载豁免规则 ====================
async function buildExemptionMapForMonthly(util, employees, startDateStr, endDateStr) {
	const {
		vk,
		_
	} = util;
	const map = {};
	if (employees.length === 0) return map;

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
		if (matched.length > 0) map[empId] = matched;
	}
	return map;
}

// ==================== 批量新增 ====================
async function batchAdd(util, addList) {
	const {
		vk
	} = util;
	const BATCH_SIZE = 500;
	for (let i = 0; i < addList.length; i += BATCH_SIZE) {
		await vk.baseDao.adds({
			dbName: 'hrm-attendance-monthly',
			dataJson: addList.slice(i, i + BATCH_SIZE)
		});
	}
}

// ==================== 批量更新 ====================
async function batchUpdate(util, updateList) {
	const {
		vk
	} = util;
	const BATCH_SIZE = 100;
	for (let i = 0; i < updateList.length; i += BATCH_SIZE) {
		const batch = updateList.slice(i, i + BATCH_SIZE);
		await Promise.all(batch.map(item =>
			vk.baseDao.updateById({
				dbName: 'hrm-attendance-monthly',
				id: item._id,
				dataJson: item.record
			})
		));
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

// ==================== 月度周期 ====================
function getMonthlyPeriodRange(year, month, params) {
	if (params.monthly_period_type === 2) {
		const startDay = params.period_start_day || 26;
		let startDate, endDate;
		if (startDay > 1) {
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
		return {
			startStr: fmt(startDate),
			endStr: fmt(endDate)
		};
	} else {
		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 0);
		const fmt = (d) => {
			const yy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			return `${yy}-${mm}-${dd}`;
		};
		return {
			startStr: fmt(startDate),
			endStr: fmt(endDate)
		};
	}
}

// ==================== 计算日期区间天数 ====================
function getDaysBetween(startStr, endStr) {
	const start = new Date(startStr + 'T00:00:00');
	const end = new Date(endStr + 'T00:00:00');
	return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}