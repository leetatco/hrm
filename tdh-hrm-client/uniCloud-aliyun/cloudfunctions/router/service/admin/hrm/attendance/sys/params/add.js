module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/attendance/sys/params/add 前端调用的url参数地址
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
			late_threshold_minutes = 1,
				early_threshold_minutes = 1,
				absent_threshold_minutes = 30,
				monthly_period_type = 1,
				period_start_day = 1,
				remedy_limit_per_month = 3,
				overtime_min_unit = 30,
				allow_overtime_application = true,
				remark,
				update_date,
				updat_id
		} = data;
		// 参数验证开始

		// 参数验证结束
		let dbName = 'hrm-attendance-params'; // 表名
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				late_threshold_minutes,
				early_threshold_minutes,
				absent_threshold_minutes,
				monthly_period_type,
				period_start_day,
				remedy_limit_per_month,
				overtime_min_unit,
				allow_overtime_application,
				remark,
				update_id: uid,
				update_date: new Date().getTime()
			},
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	},
};