// admin/hrm/attendance/pub/getParams
/**
 * 获取考勤全局参数
 * 调用方式：vk.callFunction({ url: 'admin/hrm/attendance/pub/getParams', data: {} })
 * 返回：{ code: 0, msg: 'ok', rows: { ...参数 } }
 */
const DEFAULT_PARAMS = {
	late_threshold_minutes: 3, // 迟到阈值(分钟)
	early_threshold_minutes: 3, // 早退阈值(分钟)
	absent_threshold_minutes: 30, // 旷工阈值(分钟)
	monthly_period_type: 1, // 统计周期类型：1=自然月，2=固定日期段
	period_start_day: 1, // 周期起始日	
	allow_overtime_application: true, // 是否允许加班申请
	probation_months: 3 // 默认试用期(月)
};

module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk
		} = util;
		let res = {
			code: 0,
			msg: 'ok'
		};

		let params = {
			...DEFAULT_PARAMS
		};

		try {
			const dbRes = await vk.baseDao.selects({
				dbName: 'hrm-attendance-params',
				whereJson: {
					status: true
				},
				limit: 1
			});			
			
			if (dbRes.code == 0 && dbRes.total > 0) {
				// 数据库参数覆盖默认值
				params = Object.assign(params, dbRes.rows[0]);
			}
		} catch (e) {
			console.error('读取考勤参数失败，使用默认参数:', e.message);
		}

		res.rows = params;
		return res;
	}
};