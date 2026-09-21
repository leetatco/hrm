// admin/hrm/attendance/sys/leavebalance/generateByRule
module.exports = {
	main: async (event) => {
		const { data = {}, userInfo, util } = event;
		const { vk, db } = util;
		const { year, employee_ids } = data;

		if (!year) return { code: -1, msg: '年度不能为空' };

		// 1. 获取启用的年假规则
		const ruleRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-seniority',
			whereJson: { status: true },
			limit: 1
		});
		if (ruleRes.rows.length === 0) {
			return { code: -1, msg: '未配置年假规则，请先在「年假规则配置」中添加' };
		}
		const rule = ruleRes.rows[0];

		// 2. 获取员工列表
		let where = { status: 1 };
		if (employee_ids && Array.isArray(employee_ids) && employee_ids.length > 0) {
			where.employee_id = db.command.in(employee_ids);
		}
		const empRes = await vk.baseDao.selects({
			dbName: 'hrm-employees',
			whereJson: where,
			fieldJson: {
				employee_id: true,
				employee_name: true,
				hire_date: true,
				work_date: true,
				probation_months: true,
				probation_end_date: true
			}
		});
		const employees = empRes.rows;
		if (employees.length === 0) return { code: -1, msg: '没有符合条件的员工' };

		const now = Date.now();
		const uid = userInfo?.uid || 'system';
		let total = 0;
		let carryCount = 0;
		let probationCount = 0;

		for (const emp of employees) {
			// 3. 计算本年度应享年假（分钟）
			const baseMinutes = await calcAnnualLeaveMinutes(util, rule, emp, year);

			// 判断是否试用期
			const yearEndDate = new Date(year, 11, 31).getTime();
			const inProbation = await isProbation(util, emp, yearEndDate);
			if (inProbation && !rule.probational_provide) probationCount++;

			// 4. 计算上年结转额度
			let carryMinutes = 0;
			let carryExpireDate = null;

			if (rule.carry_forward) {
				const prevYear = year - 1;
				const prevRes = await vk.baseDao.selects({
					dbName: 'hrm-attendance-leavebalance',
					whereJson: { employee_id: emp.employee_id, leave_type_id: 'annual', year: prevYear, status: true },
					limit: 1
				});

				if (prevRes.rows.length > 0) {
					const prevBalance = prevRes.rows[0];
					const prevRemain = (prevBalance.total_minutes || 0) - (prevBalance.used_minutes || 0);
					if (prevRemain > 0) {
						carryMinutes = prevRemain;
						carryCount++;
					}
				}

				// 最大累积上限截断
				if (rule.max_accumulate_days > 0) {
					const maxMinutes = rule.max_accumulate_days * 480;
					const totalAfterCarry = baseMinutes + carryMinutes;
					if (totalAfterCarry > maxMinutes) {
						carryMinutes = Math.max(0, maxMinutes - baseMinutes);
					}
				}

				// 顺延过期时间
				if (carryMinutes > 0 && rule.carry_forward_months > 0) {
					const expireDate = new Date(year, rule.carry_forward_months, 1);
					carryExpireDate = expireDate.getTime();
				}
			}

			const newTotal = baseMinutes + carryMinutes;

			// 5. 查询已有额度记录
			const existRes = await vk.baseDao.selects({
				dbName: 'hrm-attendance-leavebalance',
				whereJson: { employee_id: emp.employee_id, leave_type_id: 'annual', year },
				limit: 1
			});

			const record = {
				total_minutes: newTotal,
				adjust_reason: carryMinutes > 0
					? `按年假规则生成（含上年结转${formatMinutes(carryMinutes)}）`
					: '按年假规则生成',
				carry_forward_minutes: carryMinutes,
				carry_expire_date: carryExpireDate,
				update_id: uid,
				update_date: now
			};

			let oldTotal = 0;
			let oldRemain = 0;
			let changeType = 2; // 自动发放

			if (existRes.rows.length > 0) {
				// 更新已有额度
				oldTotal = existRes.rows[0].total_minutes || 0;
				oldRemain = oldTotal - (existRes.rows[0].used_minutes || 0);
				await vk.baseDao.updateById({
					dbName: 'hrm-attendance-leavebalance',
					id: existRes.rows[0]._id,
					dataJson: record
				});
			} else {
				// 新增额度
				await vk.baseDao.add({
					dbName: 'hrm-attendance-leavebalance',
					dataJson: {
						employee_id: emp.employee_id,
						leave_type_id: 'annual',
						year,
						used_minutes: 0,
						status: true,
						...record
					}
				});
			}

			// ========== 写入额度日志 ==========
			const changeAmount = newTotal - oldTotal;
			if (changeAmount !== 0) {
				await vk.baseDao.add({
					dbName: 'hrm-attendance-balancelog',
					dataJson: {
						employee_id: emp.employee_id,
						leave_type_id: 'annual',
						year,
						change_type: changeType,
						change_amount: changeAmount,
						before_balance: oldRemain,
						after_balance: newTotal - (existRes.rows[0]?.used_minutes || 0),
						ref_id: '',
						ref_type: 'annual_rule',
						remark: record.adjust_reason,
						update_id: uid,
						update_date: now
					}
				});
			}

			total++;
		}

		return {
			code: 0,
			msg: `成功为 ${total} 名员工生成${year}年度年假额度${carryCount > 0 ? `，其中 ${carryCount} 人有上年结转` : ''}${probationCount > 0 ? `，${probationCount} 人因试用期未享有年假` : ''}`,
			total,
			carryCount,
			probationCount
		};
	}
};

/**
 * 计算员工年假分钟数（不含结转）
 */
async function calcAnnualLeaveMinutes(util, rule, emp, year) {
	// 1. 计算工龄
	let seniorityYears = 0;
	const baseDate = rule.seniority_type === 1 ? (emp.work_date || emp.hire_date) : emp.hire_date;
	if (baseDate) {
		seniorityYears = Math.floor((Date.now() - new Date(baseDate).getTime()) / (365.25 * 24 * 3600 * 1000));
	}

	// 2. 按分段规则获取年假天数
	let annualDays = 0;
	const details = rule.rule_details || [];
	for (const seg of details) {
		const min = seg.year_min || 0;
		const max = (seg.year_max === null || seg.year_max === undefined) ? Infinity : seg.year_max;
		if (seniorityYears >= min && seniorityYears <= max) {
			annualDays = seg.annual_days || 0;
			break;
		}
	}

	// 3. 入职当年折算
	const hireDate = emp.hire_date ? new Date(emp.hire_date) : null;
	if (rule.first_year_prorate && hireDate && hireDate.getFullYear() === year) {
		if (rule.prorate_method === 1) {
			const hireMonth = hireDate.getMonth() + 1;
			const remainingMonths = 13 - hireMonth;
			annualDays = annualDays * remainingMonths / 12;
		} else {
			const yearStart = new Date(year, 0, 1).getTime();
			const yearEnd = new Date(year, 11, 31).getTime();
			const totalDays = (yearEnd - yearStart) / (24 * 3600 * 1000) + 1;
			const hireTime = hireDate.getTime();
			const remainingDays = Math.max(0, (yearEnd - Math.max(hireTime, yearStart)) / (24 * 3600 * 1000) + 1);
			annualDays = annualDays * remainingDays / totalDays;
		}
	}

	// 4. 试用期判断
	const yearEndDate = new Date(year, 11, 31).getTime();
	const inProbation = await isProbation(util, emp, yearEndDate);

	if (!rule.probational_provide && inProbation) {
		annualDays = 0;
	}

	// 5. 保留1位小数，转为分钟
	annualDays = Math.round(annualDays * 10) / 10;
	return Math.round(annualDays * 480);
}

/**
 * 判断员工在指定日期是否处于试用期
 */
async function isProbation(util, emp, date) {
	const { vk } = util;

	if (emp.probation_end_date) {
		const endTs = new Date(emp.probation_end_date).getTime();
		const checkTs = typeof date === 'number' ? date : new Date(date).getTime();
		return checkTs <= endTs;
	}

	let probationMonths = emp.probation_months;

	if (!probationMonths) {
		const paramsRes = await vk.callFunction({
			url: 'admin/hrm/attendance/pub/getParams',
			data: {}
		});
		if (paramsRes.code === 0) {
			probationMonths = paramsRes.rows.probation_months || 0;
		}
	}

	if (!probationMonths || probationMonths <= 0) return false;
	if (!emp.hire_date) return false;

	const hireDate = new Date(emp.hire_date);
	const probationEnd = new Date(hireDate);
	probationEnd.setMonth(probationEnd.getMonth() + probationMonths);

	const checkTs = typeof date === 'number' ? date : new Date(date).getTime();
	return checkTs <= probationEnd.getTime();
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