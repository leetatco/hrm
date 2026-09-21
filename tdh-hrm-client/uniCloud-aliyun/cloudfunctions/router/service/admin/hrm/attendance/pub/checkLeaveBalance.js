// admin/hrm/attendance/pub/checkLeaveBalance
module.exports = {
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, db } = util;
		const { employee_id, leave_type, total_minutes } = data;

		if (!employee_id || !leave_type || !total_minutes) {
			return { code: -1, msg: '参数不完整' };
		}

		// 1. 查询假期类型定义
		const leaveTypeRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-leave',
			whereJson: { leave_code: leave_type },
			limit: 1
		});
		const leaveTypeDef = leaveTypeRes.rows[0];
		if (!leaveTypeDef) {
			return { code: -1, msg: '假期类型不存在' };
		}

		const leaveTypeName = leaveTypeDef.leave_name || leave_type;

		// 2. 根据最小单位向上取整
		const minUnit = leaveTypeDef.min_unit || 3;
		let unitMinutes = 60;
		if (minUnit === 1) unitMinutes = 480;
		else if (minUnit === 2) unitMinutes = 240;
		const roundedMinutes = Math.ceil(total_minutes / unitMinutes) * unitMinutes;

		// 3. 无额度要求的假期直接返回
		if (!leaveTypeDef.has_quota) {
			return {
				code: 0,
				msg: 'ok',
				rounded_minutes: roundedMinutes,
				original_minutes: total_minutes,
				min_unit: minUnit,
				has_quota: false
			};
		}

		// 4. 查询额度
		const year = new Date().getFullYear();
		const balanceRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-leavebalance',
			whereJson: { employee_id, leave_type_id: leave_type, year },
			limit: 1
		});

		if (balanceRes.rows.length === 0) {
			return {
				code: -1,
				msg: `暂无${leaveTypeName}额度，请先联系HR初始化`,
				rounded_minutes: roundedMinutes,
				has_quota: true
			};
		}

		const balance = balanceRes.rows[0];
		const remaining = (balance.total_minutes || 0) - (balance.used_minutes || 0);

		if (remaining < roundedMinutes) {
			return {
				code: -1,
				msg: `${leaveTypeName}额度不足（剩余${formatMinutes(remaining)}，本次申请${formatMinutes(roundedMinutes)}）`,
				remaining,
				rounded_minutes: roundedMinutes,
				has_quota: true
			};
		}

		return {
			code: 0,
			msg: 'ok',
			remaining,
			rounded_minutes: roundedMinutes,
			original_minutes: total_minutes,
			min_unit: minUnit,
			has_quota: true
		};
	}
};

function formatMinutes(minutes) {
	if (!minutes || minutes <= 0) return '0分钟';
	minutes = Math.round(minutes);
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h > 0 && m > 0) return `${h}小时${m}分钟`;
	if (h > 0) return `${h}小时`;
	return `${m}分钟`;
}