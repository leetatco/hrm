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
			_id
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
					// MISS_PUNCH_RECORD 自动处理，可忽略
				default:
					throw new Error('未定义的业务处理');
			}
			// 更新汇入状态，操作人使用当前用户 uid
			await vk.baseDao.updateById({
				dbName,
				id: _id,
				dataJson: {
					import_status: 1,
					import_time: Date.now(),
					import_operator: userInfo.uid,
					update_id: userInfo.uid,
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
					update_id: userInfo.uid,
					update_date: Date.now()
				}
			});
			return {
				code: -1,
				msg: e.message
			};
		}
	}
}

//调休单
async function handleCompensatory(app, util, userInfo) {
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

	// 计算总调休小时数，并整理items
	let totalHours = 0;
	const items = [];

	for (const item of formData.items) {
		if (!item.overtime_id) throw new Error('请选择加班单');
		const deductHours = parseFloat(item.deduct_hours);
		if (!deductHours || deductHours <= 0) throw new Error('调休小时数必须大于0');

		totalHours += deductHours;
		items.push({
			overtime_id: item.overtime_id,
			overtime_title: item.overtime_title || '',
			deduct_hours: deductHours
		});
	}

	if (totalHours <= 0) throw new Error('调休总小时数无效');

	// 获取调休假期额度（leave_type_code = 'compensatory'）
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
		throw new Error('暂无调休额度，请先通过加班申请积累调休');
	}

	const balance = balanceRes.rows[0];
	const remaining = (balance.total_quota || 0) - (balance.used_quota || 0);
	if (remaining < totalHours) {
		throw new Error(`调休额度不足（剩余${remaining}小时，需要${totalHours}小时）`);
	}

	// 扣减额度
	const newUsed = (balance.used_quota || 0) + totalHours;
	await vk.baseDao.updateById({
		dbName: 'hrm-attendance-leavebalance',
		id: balance._id,
		dataJson: {
			used_quota: newUsed,
			update_id: userInfo.uid,
			update_date: Date.now()
		}
	});

	// 插入调休记录
	await vk.baseDao.add({
		dbName: 'hrm-attendance-compensatoryrecord',
		dataJson: {
			employee_id: employeeId,
			oa_instance_id: app._id,
			compensatory_date: compensatoryDate,
			total_hours: totalHours,
			items: items,
			reason: formData.remarks || '',
			import_status: 1,
			update_id: userInfo.uid,
			update_date: Date.now()
		}
	});
}

//出差单
async function handleTrip(app, util, userInfo) {
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
		const startTime = item.start_time; // 应为 "yyyy-MM-dd HH:mm" 格式
		const endTime = item.end_time;

		if (!location) throw new Error('出差地点不能为空');
		if (!startTime || !endTime) throw new Error('出差开始/结束时间不能为空');

		const startTimestamp = new Date(startTime).getTime();
		const endTimestamp = new Date(endTime).getTime();
		if (isNaN(startTimestamp) || isNaN(endTimestamp) || startTimestamp >= endTimestamp) {
			throw new Error('出差时间无效');
		}

		const hours = (endTimestamp - startTimestamp) / (1000 * 60 * 60);

		records.push({
			employee_id: employeeId,
			oa_instance_id: app._id,
			trip_location: location,
			start_time: startTimestamp,
			end_time: endTimestamp,
			total_hours: hours,
			trip_type: tripType,
			reason: formData.remarks || '',
			import_status: 1,
			update_id: userInfo.uid,
			update_date: Date.now()
		});
	}

	// 批量插入出差记录
	await vk.baseDao.adds({
		dbName: 'hrm-attendance-triprecord',
		dataJson: records
	});
}

//请假单
async function handleLeave(app, util, userInfo) {
	const {
		vk,
		db
	} = util;
	const formData = app.form_data;
	const employeeId = app.applicant_id;

	if (!formData || !Array.isArray(formData.items) || formData.items.length === 0) {
		throw new Error('请假明细不能为空');
	}

	const leaveTypeCode = formData.leave_type; // annual, sick, personal ...
	if (!leaveTypeCode) throw new Error('请假类型不能为空');

	// 1. 获取假期类型定义，判断是否需要额度
	const leaveTypeRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leave',
		whereJson: {
			leave_code: leaveTypeCode
		},
		limit: 1
	});
	const leaveTypeDef = leaveTypeRes.rows[0];
	const hasQuota = leaveTypeDef ? leaveTypeDef.has_quota : false;

	// 2. 计算总时长并构建记录
	let totalHours = 0;
	const records = [];
	for (const item of formData.items) {
		const leaveDateStr = item.leave_date; // 原始字符串 "YYYY-MM-DD"
		if (!leaveDateStr) continue;

		// 转换为时间戳存储
		const leaveDateTimestamp = new Date(leaveDateStr).getTime();

		let dayHours = 0;
		if (item.morning_range && Array.isArray(item.morning_range) && item.morning_range.length === 2) {
			dayHours += calcHoursBetween(item.morning_range[0], item.morning_range[1]);
		}
		if (item.afternoon_range && Array.isArray(item.afternoon_range) && item.afternoon_range.length === 2) {
			dayHours += calcHoursBetween(item.afternoon_range[0], item.afternoon_range[1]);
		}
		if (dayHours <= 0) continue;

		// 根据最小请假单位向上取整（天/半天/小时）
		const minUnit = leaveTypeDef ? leaveTypeDef.min_unit : 3; // 默认按小时
		let unitHours = 1; // 小时
		if (minUnit === 1) unitHours = 8; // 按天，假设一天8小时
		else if (minUnit === 2) unitHours = 4; // 按半天
		// 按小时则 unitHours = 1
		dayHours = Math.ceil(dayHours / unitHours) * unitHours;
		totalHours += dayHours;

		records.push({
			employee_id: employeeId,
			oa_instance_id: app._id,
			leave_date: leaveDateTimestamp, // 存储为时间戳
			leave_type: leaveTypeCode,
			total_hours: dayHours,
			morning_range: item.morning_range,
			afternoon_range: item.afternoon_range,
			reason: formData.remarks || '',
			import_status: 1,
			update_id: userInfo.uid,
			update_date: Date.now()
		});
	}

	if (records.length === 0) throw new Error('没有有效的请假时段');
	if (totalHours <= 0) throw new Error('请假总时长为0');

	// 3. 额度扣减（仅对有额度的假期类型）
	// console.log("hasQuota:",hasQuota);
	if (hasQuota) {
		await deductLeaveBalance(util, employeeId, leaveTypeCode, totalHours, app._id, userInfo);
	}

	// 4. 批量插入请假记录到 hrm-attendance-leaverecord
	await vk.baseDao.adds({
		dbName: 'hrm-attendance-leaverecord', // 修正后的表名
		dataJson: records
	});
}

//加班单
async function handleOvertime(app, util, userInfo) {
	const {
		vk,
		db
	} = util;
	const formData = app.form_data;
	const employeeId = app.applicant_id;

	if (!formData || !Array.isArray(formData.items) || formData.items.length === 0) {
		throw new Error('加班明细不能为空');
	}

	// 获取考勤组及规则（同前）
	const groupRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-group',
		whereJson: {
			employee_ids: employeeId,
			status: true
		},
		limit: 1
	});

	let overtimeRule = null;
	if (groupRes.rows.length > 0 && groupRes.rows[0].overtime_rule_id) {
		const ruleRes = await vk.baseDao.findById({
			dbName: 'hrm-attendance-overtimerule',
			id: groupRes.rows[0].overtime_rule_id
		});
		if (ruleRes) overtimeRule = ruleRes;
	}
	if (!overtimeRule) overtimeRule = getDefaultOvertimeRule();

	const records = [];
	for (const item of formData.items) {
		const overtimeDate = item.overtime_date;
		if (!overtimeDate) continue;

		let totalHours = 0;
		if (item.morning_range && Array.isArray(item.morning_range) && item.morning_range.length === 2) {
			totalHours += calcHoursBetween(item.morning_range[0], item.morning_range[1]);
		}
		if (item.afternoon_range && Array.isArray(item.afternoon_range) && item.afternoon_range.length === 2) {
			totalHours += calcHoursBetween(item.afternoon_range[0], item.afternoon_range[1]);
		}

		if (totalHours <= 0) continue;

		const minUnitMinutes = overtimeRule.min_calculate_unit || 30;
		const unitHours = minUnitMinutes / 60;
		totalHours = Math.ceil(totalHours / unitHours) * unitHours;

		records.push({
			employee_id: employeeId,
			oa_instance_id: app._id,
			overtime_date: new Date(overtimeDate).getTime(),
			total_hours: totalHours,
			overtime_type: formData.overtime_type || 'paid',
			morning_range: item.morning_range,
			afternoon_range: item.afternoon_range,
			import_status: 1,
			update_id: userInfo.uid, // 使用当前用户 uid
			update_date: Date.now()
		});
	}

	if (records.length > 0) {
		await vk.baseDao.adds({
			dbName: 'hrm-attendance-overtimerecord',
			dataJson: records
		});
	}

	if (formData.overtime_type === 'compensatory') {
		const totalCompHours = records.reduce((sum, r) => sum + r.total_hours, 0);
		const ratio = overtimeRule.overtime_to_comp_ratio || 1.0;
		const addHours = totalCompHours * ratio;

		await addCompLeaveBalance(util, employeeId, addHours, app._id, userInfo);
	}
}

async function addCompLeaveBalance(util, employeeId, hours, refId, userInfo) {
	const {
		vk,
		db
	} = util;
	const year = new Date().getFullYear();
	const leaveTypeCode = 'compensatory';

	const balanceRes = await vk.baseDao.selects({
		dbName: 'hrm-attendance-leavebalance',
		whereJson: {
			employee_id: employeeId,
			leave_type_id: leaveTypeCode,
			year: year
		},
		limit: 1
	});

	if (balanceRes.rows.length > 0) {
		const balance = balanceRes.rows[0];
		const newTotal = (balance.total_quota || 0) + hours;
		await vk.baseDao.updateById({
			dbName: 'hrm-attendance-leavebalance',
			id: balance._id,
			dataJson: {
				total_quota: newTotal,
				update_id: userInfo.uid, // 使用当前用户 uid
				update_date: Date.now()
			}
		});
	} else {
		await vk.baseDao.add({
			dbName: 'hrm-attendance-leavebalance',
			dataJson: {
				employee_id: employeeId,
				leave_type_id: leaveTypeCode,
				year: year,
				total_quota: hours,
				used_quota: 0,
				status: true,
				update_id: userInfo.uid, // 使用当前用户 uid
				update_date: Date.now()
			}
		});
	}
}

// 额度扣减函数（不变）
async function deductLeaveBalance(util, employeeId, leaveTypeCode, hours, refId, userInfo) {
	const {
		vk,
		db
	} = util;
	const year = new Date().getFullYear();
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
		throw new Error(`员工${employeeId}没有${leaveTypeCode}的额度记录`);
	}

	const balance = balanceRes.rows[0];
	const remaining = (balance.total_quota || 0) - (balance.used_quota || 0);
	if (remaining < hours) {
		throw new Error(`${leaveTypeCode}剩余额度不足（剩余${remaining}小时，需要${hours}小时）`);
	}

	const newUsed = (balance.used_quota || 0) + hours;
	await vk.baseDao.updateById({
		dbName: 'hrm-attendance-leavebalance',
		id: balance._id,
		dataJson: {
			used_quota: newUsed,
			update_id: userInfo.uid,
			update_date: Date.now()
		}
	});
}

/**
 * 计算两个 HH:mm 时间之间的小时差
 */
function calcHoursBetween(startStr, endStr) {
	if (!startStr || !endStr) return 0;
	const start = new Date(`2000-01-01T${startStr}:00`);
	const end = new Date(`2000-01-01T${endStr}:00`);
	if (end <= start) return 0;
	return (end - start) / (1000 * 60 * 60);
}

/**
 * 默认加班规则（当无法获取考勤组或规则时使用）
 */
function getDefaultOvertimeRule() {
	return {
		min_calculate_unit: 30,
		overtime_to_comp_ratio: 1.0
	};
}