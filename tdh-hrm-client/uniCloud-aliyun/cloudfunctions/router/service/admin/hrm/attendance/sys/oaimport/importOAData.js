module.exports = {
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let { _id, uid } = data;
		if (!_id) return { code: -1, msg: '缺少申请ID' };

		const dbName = 'bpmn-application-form';
		let app = await vk.baseDao.findById({ dbName, id: _id });
		if (!app) return { code: -1, msg: '申请不存在' };

		if (app.status !== 'approved' || (app.import_status !== 0 && app.import_status !== 2)) {
			return { code: -1, msg: '当前状态不允许汇入' };
		}

		const configRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-importconfig',
			whereJson: {},
			limit: 1,
			fieldJson: { import_codes: true }
		});
		let allowedCodes = configRes.rows[0]?.import_codes || [];
		if (!allowedCodes.includes(app.form_type_code)) {
			return { code: -1, msg: '该表单类型未配置允许汇入' };
		}

		try {
			switch (app.form_type_code) {
				case 'OVERTIME_APPLICATION':
					await handleOvertime(app, util, userInfo);
					break;
				case 'LEAVE_APPLICATION':
					await handleLeave(app, util, userInfo);
					break;
				case 'BUSINESS_TRIP_APPLICATION':
					await handleTrip(app, util, userInfo);
					break;
				case 'COMPENSATORY_APPLICATION':
					await handleCompensatory(app, util, userInfo);
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
			return { code: 0, msg: '汇入成功' };
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
			return { code: -1, msg: e.message };
		}
	}
};

// ==================== 公共：按最小单位取整 ====================
function getMinUnitMinutes(minUnit) {
	if (minUnit === 1) return 480;   // 按天
	if (minUnit === 2) return 240;   // 按半天
	return 60;                       // 按小时
}

function roundByMinUnit(minutes, minUnit) {
	const unitMinutes = getMinUnitMinutes(minUnit);
	return Math.ceil(minutes / unitMinutes) * unitMinutes;
}

// ==================== 公共：获取调休规则 ====================
async function getCompRule(util) {
	const { vk } = util;
	const res = await vk.baseDao.selects({
		dbName: 'hrm-attendance-comprule',
		whereJson: { status: true },
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

// ==================== 公共：获取打卡窗口 ====================
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
async function handleCompensatory(app, util, userInfo) {
	const { vk, db } = util;
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
		whereJson: { employee_id: employeeId, leave_type_id: 'compensatory', year: year },
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
		dataJson: { used_minutes: newUsed, update_id: uid, update_date: Date.now() }
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
async function handleTrip(app, util, userInfo) {
	const { vk, db } = util;
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
			const nextDayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1).getTime();
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
async function handleLeave(app, util, userInfo) {
	const { vk, db } = util;
	const formData = app.form_data;
	const employeeId = app.applicant_id;

	if (!formData || !Array.isArray(formData.items) || formData.items.length === 0) {
		throw new Error('请假明细不能为空');
	}

	const leaveTypeCode = formData.leave_type;
	if (!leaveTypeCode) throw new Error('请假类型不能为空');

	const leaveTypeRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leave',
		whereJson: { leave_code: leaveTypeCode },
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
		await deductLeaveBalance(util, employeeId, leaveTypeCode, leaveTypeName, totalMinutes, app._id, userInfo);
	}

	await vk.baseDao.adds({
		dbName: 'hrm-attendance-leaverecord',
		dataJson: records
	});
}

// ==================== 加班单（含缺卡校验，补卡也算有效打卡） ====================
async function handleOvertime(app, util, userInfo) {
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

	// 无加班规则时使用默认值
	if (!overtimeRule) {
		overtimeRule = {
			min_calculate_unit: 30,
			overtime_to_comp_ratio: 1.0
		};
	}

	const { inBefore, inAfter, outBefore, outAfter } = getPunchWindow(punchRule);

	// ========== 2. 缺卡校验（含补卡） ==========
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
			if (hhmm) punchTimes.push(hhmm);
		});

		remedyRes.rows.forEach(r => {
			const fd = r.form_data;
			if (!fd || !fd.miss_time) return;
			punchTimes.push(fd.miss_time);
		});

		const checkSegment = (range, label) => {
			if (!range || !Array.isArray(range) || range.length !== 2) return;

			const segStartMin = toMinutes(range[0]);
			const segEndMin = toMinutes(range[1]);

			const hasInPunch = punchTimes.some(hhmm => {
				const pMin = toMinutes(hhmm);
				return pMin >= segStartMin - inBefore && pMin <= segStartMin + inAfter;
			});
			const hasOutPunch = punchTimes.some(hhmm => {
				const pMin = toMinutes(hhmm);
				return pMin >= segEndMin - outBefore && pMin <= segEndMin + outAfter;
			});

			if (!hasInPunch) missingErrors.push(`${overtimeDate} ${label}缺签到卡`);
			if (!hasOutPunch) missingErrors.push(`${overtimeDate} ${label}缺签退卡`);
		};

		checkSegment(item.morning_range, '上午');
		checkSegment(item.afternoon_range, '下午');
	}

	if (missingErrors.length > 0) {
		throw new Error(`加班汇入失败：${missingErrors.join('；')}`);
	}

	// ========== 3. 计算加班明细 ==========
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

		const minUnitMinutes = overtimeRule.min_calculate_unit || 30;
		totalMinutes = Math.ceil(totalMinutes / minUnitMinutes) * minUnitMinutes;

		records.push({
			employee_id: employeeId,
			oa_instance_id: app._id,
			overtime_date: overtimeDateTimestamp,
			total_minutes: totalMinutes,
			overtime_type: formData.overtime_type || 'paid',
			morning_range: item.morning_range,
			afternoon_range: item.afternoon_range,
			import_status: 1,
			update_id: uid,	
			update_date: Date.now()
		});
	}

	if (records.length > 0) {
		await vk.baseDao.adds({
			dbName: 'hrm-attendance-overtimerecord',
			dataJson: records
		});
	}

	// ========== 4. 调休类型加班 → 增加调休额度 ==========
	if (formData.overtime_type === 'compensatory') {
		const totalCompMinutes = records.reduce((sum, r) => sum + r.total_minutes, 0);
		if (totalCompMinutes > 0) {
			const compRule = await getCompRule(util);
			const ratio = compRule.overtime_to_comp_ratio || 1.0;
			const addMinutes = Math.floor(totalCompMinutes * ratio);
			await addCompLeaveBalance(util, employeeId, addMinutes, app._id, userInfo, compRule);
		}
	}
}

// ==================== 辅助函数 ====================
async function addCompLeaveBalance(util, employeeId, minutes, refId, userInfo, compRule) {
	const { vk, db } = util;
	const year = new Date().getFullYear();
	const leaveTypeCode = 'compensatory';
	const nowTime = Date.now();

	const balanceRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leavebalance',
		whereJson: { employee_id: employeeId, leave_type_id: leaveTypeCode, year: year },
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
			dataJson: { total_minutes: newTotal, update_id: uid, update_date: nowTime }
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

async function deductLeaveBalance(util, employeeId, leaveTypeCode, leaveTypeName, minutes, refId, userInfo) {
	const { vk, db } = util;
	const year = new Date().getFullYear();
	const nowTime = Date.now();

	const balanceRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leavebalance',
		whereJson: { employee_id: employeeId, leave_type_id: leaveTypeCode, year: year },
		limit: 1
	});

	if (balanceRes.rows.length === 0) {
		throw new Error(`员工${employeeId}没有${leaveTypeName || leaveTypeCode}的额度记录`);
	}

	const balance = balanceRes.rows[0];
	const oldUsed = balance.used_minutes || 0;
	const oldRemain = (balance.total_minutes || 0) - oldUsed;

	if (oldRemain < minutes) {
		throw new Error(`${leaveTypeName || leaveTypeCode}额度不足（剩余${formatMinutes(oldRemain)}，需要${formatMinutes(minutes)}）`);
	}

	const newUsed = oldUsed + minutes;
	const newRemain = (balance.total_minutes || 0) - newUsed;

	await vk.baseDao.updateById({
		dbName: 'hrm-attendance-leavebalance',
		id: balance._id,
		dataJson: { used_minutes: newUsed, update_id: uid, update_date: nowTime }
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