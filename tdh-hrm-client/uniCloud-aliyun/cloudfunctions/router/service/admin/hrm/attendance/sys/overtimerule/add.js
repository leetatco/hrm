module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/attendance/sys/overtimerule/add 前端调用的url参数地址
	 * data 请求参数 说明
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
	 */
	main: async (event) => {
		let {
			data = {}, userInfo, util, filterResponse, originalParam
		} = event;
		let {
			customUtil,
			uniID,
			config,
			pubFun,
			vk,
			db,
			_
		} = util;
		let {
			uid
		} = data;
		let res = {
			code: 0,
			msg: 'ok'
		};
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			rule_name,
			weekday_overtime_ratio = 1.5,
			weekend_overtime_ratio = 2,
			holiday_overtime_ratio = 3,
			min_calculate_unit = 30,
			compensate_type = 1,
			max_daily_overtime = 0,
			max_monthly_overtime = 0,
			status = true,
			remark,
			update_date,
			updat_id
		} = data;
		// 参数验证开始

		// 参数验证结束
		let dbName = 'hrm-attendance-overtimerule'; // 表名
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				rule_name,
				weekday_overtime_ratio,
				weekend_overtime_ratio,
				holiday_overtime_ratio,
				min_calculate_unit,
				compensate_type,
				max_daily_overtime,
				max_monthly_overtime,
				status,
				remark,
				update_id: uid,
				update_date: new Date().getTime()
			},
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	},
};