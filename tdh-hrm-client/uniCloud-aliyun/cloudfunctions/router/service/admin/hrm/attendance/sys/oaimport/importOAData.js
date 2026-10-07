module.exports = {
	main: async (event) => {
		let {
			data = {}, userInfo, util
		} = event;
		let {
			vk,
			db
		} = util;
		let {
			_id,
			uid
		} = data;
		if (!_id) return {
			code: -1,
			msg: '缺少申请ID'
		};

		const dbName = 'bpmn-application-form';
		let app = await vk.baseDao.findById({
			dbName,
			id: _id
		});
		if (!app) return {
			code: -1,
			msg: '申请不存在'
		};

		if (app.status !== 'approved' || (app.import_status !== 0 && app.import_status !== 2)) {
			return {
				code: -1,
				msg: '当前状态不允许汇入'
			};
		}

		const configRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-importconfig',
			whereJson: {},
			limit: 1,
			fieldJson: {
				import_codes: true
			}
		});
		let allowedCodes = configRes.rows[0]?.import_codes || [];
		if (!allowedCodes.includes(app.form_type_code)) {
			return {
				code: -1,
				msg: '该表单类型未配置允许汇入'
			};
		}

		try {
			switch (app.form_type_code) {
				case 'OVERTIME_APPLICATION':
					await handleOvertime(app, util, uid);
					break;
				case 'LEAVE_APPLICATION':
					await handleLeave(app, util, uid);
					break;
				case 'BUSINESS_TRIP_APPLICATION':
					await handleTrip(app, util, uid);
					break;
				case 'COMPENSATORY_APPLICATION':
					await handleCompensatory(app, util, uid);
					break;
				default:
					throw new Error('未定义的业务处理');
			}

			await vk.baseDao.updateById({
				dbName,
				id: _id,
				dataJson: {
					import_status: 1,
					import_time: Date.now(),
					import_operator: uid,
					update_id: uid,
					update_date: Date.now()
				}
			});
			return {
				code: 0,
				msg: '汇入成功'
			};
		} catch (e) {
			await vk.baseDao.updateById({
				dbName,
				id: _id,
				dataJson: {
					import_status: 2,
					import_msg: e.message,
					update_id: uid,
					update_date: Date.now()
				}
			});
			return {
				code: -1,
				msg: e.message
			};
		}
	}
};

// ==================== 公共：按最小单位取整 ====================
function getMinUnitMinutes(minUnit) {
	if (minUnit === 1) return 480; // 按天
	if (minUnit === 2) return 240; // 按半天
	return 60; // 按小时
}

function roundByMinUnit(minutes, minUnit) {
	const unitMinutes = getMinUnitMinutes(minUnit);
	return Math.ceil(minutes / unitMinutes) * unitMinutes;
}

// ==================== 公共：获取调休规则 ====================
async function getCompRule(util) {
	const {
		vk
	} = util;
	const res = await vk.baseDao.selects({
		dbName: 'hrm-attendance-comprule',
		whereJson: {
			status: true
		},
		limit: 1
	});
	if (res.rows.length > 0) {
		return res.rows[0];
	}
	return {
		min_unit: 1,
		min_unit_minutes: 60,
		max_accumulate_minutes: 0,
		overtime_to_comp_ratio: 1.0,
		valid_period: 3,
		auto_expire: true
	};
}

// ==================== 公共：获取打卡规则窗口 ====================
function getPunchWindow(punchRule) {
	if (punchRule) {
		return {
			inBefore: punchRule.sign_in_before_minutes ?? 60,
			inAfter: punchRule.sign_in_after_minutes ?? 30,
			outBefore: punchRule.sign_out_before_minutes ?? 30,
			outAfter: punchRule.sign_out_after_minutes ?? 120
		};
	}
	// 无打卡规则时使用默认值
	return {
		inBefore: 60,
		inAfter: 30,
		outBefore: 30,
		outAfter: 120
	};
}

// ==================== 调休单 ====================
async function handleCompensatory(app, util, uid) {
	const {
		vk,
		db
	} = util;
	const formData = app.form_data;
	const employeeId = app.applicant_id;

	if (!formData || !Array.isArray(formData.items) || formData.items.length === 0) {
		throw new Error('调休明细不能为空');
	}

	const compensatoryDate = formData.compensatory_date;
	if (!compensatoryDate) throw new Error('调休日期不能为空');

	const compensatoryDateTimestamp = new Date(compensatoryDate).getTime();

	const rule = await getCompRule(util);
	const unitMinutes = rule.min_unit_minutes || 60;

	let totalMinutes = 0;
	const items = [];

	for (const item of formData.items) {
		if (!item.overtime_id) throw new Error('请选择加班单');
		let deductMinutes = parseFloat(item.deduct_minutes);
		if (!deductMinutes || deductMinutes <= 0) throw new Error('调休时长必须大于0');

		deductMinutes = Math.ceil(deductMinutes / unitMinutes) * unitMinutes;

		totalMinutes += deductMinutes;
		items.push({
			overtime_id: item.overtime_id,
			overtime_title: item.overtime_title || '',
			deduct_minutes: deductMinutes
		});
	}

	if (totalMinutes <= 0) throw new Error('调休总时长无效');

	const year = new Date().getFullYear();
	const balanceRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leavebalance',
		whereJson: {
			employee_id: employeeId,
			leave_type_id: 'compensatory',
			year: year
		},
		limit: 1
	});

	if (balanceRes.rows.length === 0) {
		throw new Error('暂无调休假额度，请先通过加班申请积累调休');
	}

	const balance = balanceRes.rows[0];
	const remaining = (balance.total_minutes || 0) - (balance.used_minutes || 0);
	if (remaining < totalMinutes) {
		throw new Error(`调休假额度不足（剩余${formatMinutes(remaining)}，需要${formatMinutes(totalMinutes)}）`);
	}

	const newUsed = (balance.used_minutes || 0) + totalMinutes;
	await vk.baseDao.updateById({
		dbName: 'hrm-attendance-leavebalance',
		id: balance._id,
		dataJson: {
			used_minutes: newUsed,
			update_id: uid,
			update_date: Date.now()
		}
	});

	await vk.baseDao.add({
		dbName: 'hrm-attendance-compensatoryrecord',
		dataJson: {
			employee_id: employeeId,
			oa_instance_id: app._id,
			compensatory_date: compensatoryDateTimestamp,
			total_minutes: totalMinutes,
			items: items,
			reason: formData.remarks || '',
			import_status: 1,
			update_id: uid,
			update_date: Date.now()
		}
	});
}

// ==================== 出差单（按天拆分） ====================
async function handleTrip(app, util, uid) {
	const {
		vk,
		db
	} = util;
	const formData = app.form_data;
	const employeeId = app.applicant_id;

	if (!formData || !Array.isArray(formData.items) || formData.items.length === 0) {
		throw new Error('出差明细不能为空');
	}

	const tripType = formData.business_trip_type || 'domestic';
	const records = [];

	for (const item of formData.items) {
		const location = item.trip_location;
		const startTimeStr = item.start_time;
		const endTimeStr = item.end_time;

		if (!location) throw new Error('出差地点不能为空');
		if (!startTimeStr || !endTimeStr) throw new Error('出差开始/结束时间不能为空');

		const startTs = new Date(startTimeStr).getTime();
		const endTs = new Date(endTimeStr).getTime();
		if (isNaN(startTs) || isNaN(endTs) || startTs >= endTs) {
			throw new Error('出差时间无效');
		}

		let current = new Date(startTs);
		while (current.getTime() < endTs) {
			const dayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();
			const nextDayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)
				.getTime();
			const dayEnd = Math.min(nextDayStart, endTs);

			const segStart = Math.max(dayStart, startTs);
			const segEnd = dayEnd;

			if (segStart < segEnd) {
				const minutes = Math.round((segEnd - segStart) / (1000 * 60));
				records.push({
					employee_id: employeeId,
					oa_instance_id: app._id,
					trip_location: location,
					start_time: segStart,
					end_time: segEnd,
					total_minutes: minutes,
					trip_type: tripType,
					reason: formData.remarks || '',
					import_status: 1,
					update_id: uid,
					update_date: Date.now()
				});
			}

			current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
		}
	}

	if (records.length === 0) throw new Error('没有有效的出差时段');

	await vk.baseDao.adds({
		dbName: 'hrm-attendance-triprecord',
		dataJson: records
	});
}

// ==================== 请假单 ====================
async function handleLeave(app, util, uid) {
	const {
		vk,
		db
	} = util;
	const formData = app.form_data;
	const employeeId = app.applicant_id;

	if (!formData || !Array.isArray(formData.items) || formData.items.length === 0) {
		throw new Error('请假明细不能为空');
	}

	const leaveTypeCode = formData.leave_type;
	if (!leaveTypeCode) throw new Error('请假类型不能为空');

	const leaveTypeRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leave',
		whereJson: {
			leave_code: leaveTypeCode
		},
		limit: 1
	});
	const leaveTypeDef = leaveTypeRes.rows[0];
	if (!leaveTypeDef) throw new Error('假期类型不存在');
	const leaveTypeName = leaveTypeDef.leave_name || leaveTypeCode;
	const hasQuota = leaveTypeDef.has_quota;
	const minUnit = leaveTypeDef.min_unit || 3;

	let totalMinutes = 0;
	const records = [];

	for (const item of formData.items) {
		const leaveDateStr = item.leave_date;
		if (!leaveDateStr) continue;

		const leaveDateTimestamp = new Date(leaveDateStr).getTime();

		let dayMinutes = 0;
		if (item.morning_range && Array.isArray(item.morning_range) && item.morning_range.length === 2) {
			dayMinutes += calcMinutesBetween(item.morning_range[0], item.morning_range[1]);
		}
		if (item.afternoon_range && Array.isArray(item.afternoon_range) && item.afternoon_range.length === 2) {
			dayMinutes += calcMinutesBetween(item.afternoon_range[0], item.afternoon_range[1]);
		}
		if (dayMinutes <= 0) continue;

		dayMinutes = roundByMinUnit(dayMinutes, minUnit);
		totalMinutes += dayMinutes;

		records.push({
			employee_id: employeeId,
			oa_instance_id: app._id,
			leave_date: leaveDateTimestamp,
			leave_type: leaveTypeCode,
			leave_name: leaveTypeDef.leave_name,
			total_minutes: dayMinutes,
			morning_range: item.morning_range,
			afternoon_range: item.afternoon_range,
			reason: formData.remarks || '',
			import_status: 1,
			update_id: uid,
			update_date: Date.now()
		});
	}

	if (records.length === 0) throw new Error('没有有效的请假时段');
	if (totalMinutes <= 0) throw new Error('请假总时长为0');

	if (hasQuota) {
		await deductLeaveBalance(util, employeeId, leaveTypeCode, leaveTypeName, totalMinutes, app._id, uid);
	}

	await vk.baseDao.adds({
		dbName: 'hrm-attendance-leaverecord',
		dataJson: records
	});
}

// ==================== 加班单（口径A：上限约束原始时长，系数只用于换算） ====================
async function handleOvertime(app, util, uid) {
	const { vk, db } = util;
	const formData = app.form_data;
	const employeeId = app.applicant_id;

	if (!formData || !Array.isArray(formData.items) || formData.items.length === 0) {
		throw new Error('加班明细不能为空');
	}

	// ========== 1. 获取考勤组及绑定的加班规则、打卡规则 ==========
	const groupRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-group',
		whereJson: { employee_ids: employeeId, status: true },
		limit: 1
	});

	let overtimeRule = null;
	let punchRule = null;

	if (groupRes.rows.length > 0) {
		const group = groupRes.rows[0];

		if (group.overtime_rule_id) {
			const ruleRes = await vk.baseDao.findById({
				dbName: 'hrm-attendance-overtimerule',
				id: group.overtime_rule_id
			});
			if (ruleRes && ruleRes.status) overtimeRule = ruleRes;
		}

		if (group.punch_rule_id) {
			const punchRes = await vk.baseDao.findById({
				dbName: 'hrm-attendance-punchrule',
				id: group.punch_rule_id
			});
			if (punchRes && punchRes.status) punchRule = punchRes;
		}
	}

	if (!overtimeRule) overtimeRule = getDefaultOvertimeRule();

	// 加班系数（默认 1.5/2.0/3.0）
	const weekdayRatio = overtimeRule.weekday_overtime_ratio || 1.5;
	const weekendRatio = overtimeRule.weekend_overtime_ratio || 2.0;
	const holidayRatio = overtimeRule.holiday_overtime_ratio || 3.0;

	// 每日/每月上限（小时 -> 分钟），口径A：约束原始加班时长
	const maxDailyMinutes = (overtimeRule.max_daily_overtime || 0) * 60;
	const maxMonthlyMinutes = (overtimeRule.max_monthly_overtime || 0) * 60;

	const { inBefore, inAfter, outBefore, outAfter } = getPunchWindow(punchRule);

	// ========== 2. 缺卡校验 ==========
	const missingErrors = [];

	for (const item of formData.items) {
		const overtimeDate = item.overtime_date;
		if (!overtimeDate) continue;

		const dayStartTs = new Date(overtimeDate + 'T00:00:00').getTime();
		const dayEndTs = new Date(overtimeDate + 'T23:59:59.999').getTime();

		const clockRes = await vk.baseDao.selects({
			dbName: 'hrm-clockin',
			whereJson: {
				employee_id: employeeId,
				type: '公司卡',
				clockintime: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs))
			},
			sortArr: [{ name: 'clockintime', type: 'asc' }]
		});

		const remedyRes = await vk.baseDao.selects({
			dbName: 'bpmn-application-form',
			whereJson: {
				applicant_id: employeeId,
				form_type_code: 'MISS_PUNCH_RECORD',
				status: 'approved',
				'form_data.miss_date': overtimeDate
			}
		});

		const punchTimes = [];
		clockRes.rows.forEach(p => {
			const hhmm = extractHHmmFromTimestamp(p.clockintime);
			if (hhmm && !punchTimes.includes(hhmm)) punchTimes.push(hhmm);
		});
		remedyRes.rows.forEach(r => {
			const fd = r.form_data;
			if (!fd || !fd.miss_time) return;
			if (!punchTimes.includes(fd.miss_time)) punchTimes.push(fd.miss_time);
		});

		console.log(`[加班缺卡校验] ${overtimeDate} 打卡合并后=${punchTimes.join(',')}`);

		const usedPunchIndexes = new Set();

		const checkSegment = (range, label) => {
			if (!range || !Array.isArray(range) || range.length !== 2) return;

			const segStartMin = toMinutes(range[0]);
			const segEndMin = toMinutes(range[1]);

			let hasInPunch = false;
			let hasOutPunch = false;

			for (let i = 0; i < punchTimes.length; i++) {
				if (usedPunchIndexes.has(i)) continue;
				const pMin = toMinutes(punchTimes[i]);

				if (!hasInPunch && pMin >= segStartMin - inBefore && pMin <= segStartMin + inAfter) {
					hasInPunch = true;
					usedPunchIndexes.add(i);
				}
				if (!hasOutPunch && pMin >= segEndMin - outBefore && pMin <= segEndMin + outAfter) {
					hasOutPunch = true;
					usedPunchIndexes.add(i);
				}
				if (hasInPunch && hasOutPunch) break;
			}

			if (!hasInPunch) missingErrors.push(`${overtimeDate} ${label}缺签到卡`);
			if (!hasOutPunch) missingErrors.push(`${overtimeDate} ${label}缺签退卡`);
		};

		checkSegment(item.morning_range, '上午');
		checkSegment(item.afternoon_range, '下午');
	}

	if (missingErrors.length > 0) {
		throw new Error(`加班汇入失败：${missingErrors.join('；')}`);
	}

	// ========== 3. 计算加班明细（口径A：日上限约束原始时长，系数仅记录） ==========
	const records = [];

	for (const item of formData.items) {
		const overtimeDate = item.overtime_date;
		if (!overtimeDate) continue;

		const overtimeDateTimestamp = new Date(overtimeDate).getTime();

		let totalMinutes = 0;
		if (item.morning_range && Array.isArray(item.morning_range) && item.morning_range.length === 2) {
			totalMinutes += calcMinutesBetween(item.morning_range[0], item.morning_range[1]);
		}
		if (item.afternoon_range && Array.isArray(item.afternoon_range) && item.afternoon_range.length === 2) {
			totalMinutes += calcMinutesBetween(item.afternoon_range[0], item.afternoon_range[1]);
		}

		if (totalMinutes <= 0) continue;

		// 最小单位取整
		const minUnitMinutes = overtimeRule.min_calculate_unit || 30;
		totalMinutes = Math.ceil(totalMinutes / minUnitMinutes) * minUnitMinutes;

		// ===== 每日上限校验（口径A：用原始分钟数判断，不用系数） =====
		if (maxDailyMinutes > 0) {
			const dayStartTs = new Date(overtimeDate + 'T00:00:00').getTime();
			const dayEndTs = new Date(overtimeDate + 'T23:59:59.999').getTime();
			const existDailyRes = await vk.baseDao.selects({
				dbName: 'hrm-attendance-overtimerecord',
				whereJson: {
					employee_id: employeeId,
					overtime_date: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs)),
					import_status: 1
				}
			});
			const existDailyMinutes = existDailyRes.rows.reduce((sum, r) => sum + (r.total_minutes || 0), 0);

			if (existDailyMinutes + totalMinutes > maxDailyMinutes) {
				const allowed = Math.max(0, maxDailyMinutes - existDailyMinutes);
				if (allowed <= 0) {
					console.log(`[加班超日上限] ${employeeId} ${overtimeDate} 已加班${existDailyMinutes}分钟，日上限${maxDailyMinutes}分钟，跳过`);
					continue;
				}
				console.log(`[加班截断] ${employeeId} ${overtimeDate} 日上限${maxDailyMinutes}分钟，原始${totalMinutes}分钟截断为${allowed}分钟`);
				totalMinutes = allowed;
			}
		}
		// =====================================================

		// ===== 判断当天日期类型，取加班系数（仅记录，不参与上限判断） =====
		const dayType = await getDayType(util, overtimeDate);
		let overtimeRatio = weekdayRatio;
		if (dayType === 2) overtimeRatio = weekendRatio;
		else if (dayType === 3) overtimeRatio = holidayRatio;

		records.push({
			employee_id: employeeId,
			oa_instance_id: app._id,
			overtime_date: overtimeDateTimestamp,
			total_minutes: totalMinutes,        // 原始加班分钟数（已受日上限约束）
			overtime_type: formData.overtime_type || 'paid',
			overtime_ratio: overtimeRatio,      // 加班系数，仅用于换算
			day_type: dayType,                  // 1=工作日, 2=休息日, 3=节假日
			morning_range: item.morning_range,
			afternoon_range: item.afternoon_range,
			import_status: 1,
			update_id: uid,
			update_date: Date.now()
		});
	}

	if (records.length === 0) {
		throw new Error('加班时长为0或已超过每日加班上限');
	}

	// ===== 每月上限校验（口径A：用原始分钟数判断，不用系数） =====
	if (maxMonthlyMinutes > 0) {
		const months = new Set(records.map(r => {
			const d = new Date(r.overtime_date);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
		}));

		for (const monthStr of months) {
			const [y, m] = monthStr.split('-').map(Number);
			const monthStartTs = new Date(y, m - 1, 1).getTime();
			const monthEndTs = new Date(y, m, 0, 23, 59, 59, 999).getTime();

			const existMonthlyRes = await vk.baseDao.selects({
				dbName: 'hrm-attendance-overtimerecord',
				whereJson: {
					employee_id: employeeId,
					overtime_date: db.command.gte(monthStartTs).and(db.command.lte(monthEndTs)),
					import_status: 1
				}
			});
			const existMonthlyMinutes = existMonthlyRes.rows.reduce((sum, r) => sum + (r.total_minutes || 0), 0);

			const thisMonthRecords = records.filter(r => {
				const d = new Date(r.overtime_date);
				return d.getFullYear() === y && (d.getMonth() + 1) === m;
			});
			const thisMonthMinutes = thisMonthRecords.reduce((sum, r) => sum + r.total_minutes, 0);

			if (existMonthlyMinutes + thisMonthMinutes > maxMonthlyMinutes) {
				const allowed = Math.max(0, maxMonthlyMinutes - existMonthlyMinutes);
				console.log(`[加班超月上限] ${employeeId} ${monthStr} 已加班${existMonthlyMinutes}分钟，月上限${maxMonthlyMinutes}分钟，本次${thisMonthMinutes}分钟，允许${allowed}分钟`);

				if (allowed <= 0) {
					// 本月已满，删除该月本次所有记录
					for (let i = records.length - 1; i >= 0; i--) {
						const d = new Date(records[i].overtime_date);
						if (d.getFullYear() === y && (d.getMonth() + 1) === m) {
							records.splice(i, 1);
						}
					}
				} else {
					// 从后往前截断该月记录
					let remaining = allowed;
					for (let i = records.length - 1; i >= 0; i--) {
						const d = new Date(records[i].overtime_date);
						if (d.getFullYear() === y && (d.getMonth() + 1) === m) {
							if (records[i].total_minutes <= remaining) {
								remaining -= records[i].total_minutes;
							} else {
								records[i].total_minutes = remaining;
								remaining = 0;
							}
						}
					}
				}
			}
		}
	}
	// ============================================================

	if (records.length === 0) {
		throw new Error('加班时长已超过每月加班上限');
	}

	// ========== 4. 写入加班记录 ==========
	await vk.baseDao.adds({
		dbName: 'hrm-attendance-overtimerecord',
		dataJson: records
	});

	// ========== 5. 调休类型加班 → 增加调休额度（口径A：先算系数，再换算调休） ==========
	if (formData.overtime_type === 'compensatory') {
		// 每条记录按加班系数换算调休分钟数
		const totalCompMinutes = records.reduce((sum, r) => {
			return sum + Math.floor(r.total_minutes * (r.overtime_ratio || 1.0));
		}, 0);

		if (totalCompMinutes > 0) {
			const compRule = await getCompRule(util);
			const ratio = compRule.overtime_to_comp_ratio || 1.0;
			const addMinutes = Math.floor(totalCompMinutes * ratio);
			await addCompLeaveBalance(util, employeeId, addMinutes, app._id, uid, compRule);
		}
	}
}

// ==================== 判断日期类型 ====================
async function getDayType(util, dateStr) {
	const { vk } = util;
	try {
		const year = new Date(dateStr).getFullYear();
		const res = await vk.baseDao.selects({
			dbName: 'hrm-attendance-calendar',
			whereJson: { calendar_date: dateStr, year },
			limit: 1
		});
		if (res.rows.length > 0) {
			const t = res.rows[0].date_type;
			if (t === 2) return 2;
			if (t === 3) return 3;
			return 1;
		}
	} catch (e) {
		console.error('查询日期类型失败:', e.message);
	}
	// 兜底：按星期判断
	const day = new Date(dateStr).getDay();
	return (day === 0 || day === 6) ? 2 : 1;
}

// ==================== 辅助函数 ====================
async function addCompLeaveBalance(util, employeeId, minutes, refId, uid, compRule) {
	const {
		vk,
		db
	} = util;
	const year = new Date().getFullYear();
	const leaveTypeCode = 'compensatory';
	const nowTime = Date.now();

	const balanceRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leavebalance',
		whereJson: {
			employee_id: employeeId,
			leave_type_id: leaveTypeCode,
			year: year
		},
		limit: 1
	});

	let oldTotal = 0;
	let oldRemain = 0;
	let newTotal = minutes;

	if (balanceRes.rows.length > 0) {
		const balance = balanceRes.rows[0];
		oldTotal = balance.total_minutes || 0;
		oldRemain = oldTotal - (balance.used_minutes || 0);
		newTotal = oldTotal + minutes;

		if (compRule && compRule.max_accumulate_minutes > 0) {
			if (newTotal > compRule.max_accumulate_minutes) {
				newTotal = compRule.max_accumulate_minutes;
			}
		}

		await vk.baseDao.updateById({
			dbName: 'hrm-attendance-leavebalance',
			id: balance._id,
			dataJson: {
				total_minutes: newTotal,
				update_id: uid,
				update_date: nowTime
			}
		});
	} else {
		if (compRule && compRule.max_accumulate_minutes > 0) {
			if (newTotal > compRule.max_accumulate_minutes) {
				newTotal = compRule.max_accumulate_minutes;
			}
		}

		await vk.baseDao.add({
			dbName: 'hrm-attendance-leavebalance',
			dataJson: {
				employee_id: employeeId,
				leave_type_id: leaveTypeCode,
				year: year,
				total_minutes: newTotal,
				used_minutes: 0,
				status: true,
				update_id: uid,
				update_date: nowTime
			}
		});
	}

	// ========== 写入额度日志 ==========
	const changeAmount = newTotal - oldTotal;
	if (changeAmount !== 0) {
		await vk.baseDao.add({
			dbName: 'hrm-attendance-balancelog',
			dataJson: {
				employee_id: employeeId,
				leave_type_id: leaveTypeCode,
				year: year,
				change_type: 2,
				change_amount: changeAmount,
				before_balance: oldRemain,
				after_balance: newTotal - (balanceRes.rows[0]?.used_minutes || 0),
				ref_id: refId || '',
				ref_type: 'overtime',
				remark: `加班转调休${formatMinutes(changeAmount)}`,
				update_id: uid,
				update_date: nowTime
			}
		});
	}
}

async function deductLeaveBalance(util, employeeId, leaveTypeCode, leaveTypeName, minutes, refId, uid) {
	const {
		vk,
		db
	} = util;
	const year = new Date().getFullYear();
	const nowTime = Date.now();

	const balanceRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leavebalance',
		whereJson: {
			employee_id: employeeId,
			leave_type_id: leaveTypeCode,
			year: year
		},
		limit: 1
	});

	if (balanceRes.rows.length === 0) {
		throw new Error(`员工${employeeId}没有${leaveTypeName || leaveTypeCode}的额度记录`);
	}

	const balance = balanceRes.rows[0];
	const oldUsed = balance.used_minutes || 0;
	const oldRemain = (balance.total_minutes || 0) - oldUsed;

	if (oldRemain < minutes) {
		throw new Error(
			`${leaveTypeName || leaveTypeCode}额度不足（剩余${formatMinutes(oldRemain)}，需要${formatMinutes(minutes)}）`);
	}

	const newUsed = oldUsed + minutes;
	const newRemain = (balance.total_minutes || 0) - newUsed;

	await vk.baseDao.updateById({
		dbName: 'hrm-attendance-leavebalance',
		id: balance._id,
		dataJson: {
			used_minutes: newUsed,
			update_id: uid,
			update_date: nowTime
		}
	});

	// ========== 写入额度日志 ==========
	await vk.baseDao.add({
		dbName: 'hrm-attendance-balancelog',
		dataJson: {
			employee_id: employeeId,
			leave_type_id: leaveTypeCode,
			year: year,
			change_type: 4,
			change_amount: -minutes,
			before_balance: oldRemain,
			after_balance: newRemain,
			ref_id: refId || '',
			ref_type: leaveTypeCode === 'compensatory' ? 'compensatory' : 'leave',
			remark: `${leaveTypeName || leaveTypeCode}扣减`,
			update_id: uid,
			update_date: nowTime
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

function calcMinutesBetween(startStr, endStr) {
	if (!startStr || !endStr) return 0;
	const start = new Date(`2000-01-01T${startStr}:00`);
	const end = new Date(`2000-01-01T${endStr}:00`);
	if (end <= start) return 0;
	return (end - start) / (1000 * 60);
}

function formatMinutes(minutes) {
	if (!minutes || minutes <= 0) return '0分钟';
	minutes = Math.round(minutes);
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h > 0 && m > 0) return `${h}小时${m}分钟`;
	if (h > 0) return `${h}小时`;
	return `${m}分钟`;
}

function getDefaultOvertimeRule() {
	return {
		min_calculate_unit: 30,
		overtime_to_comp_ratio: 1.0
	};
}