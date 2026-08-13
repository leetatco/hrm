module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/attendance/sys/abnormalrule/add 前端调用的url参数地址
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
			single_punch_rule = 1,
				late_early_coexist_rule = 1,
				out_office_cancel_absence = true,
				overtime_cancel_early = false,
				late_forgive_minutes = 0,
				early_forgive_minutes = 0,
				status = true,
				remark,
				update_date,
				updat_id
		} = data;
		// 参数验证开始

		// 参数验证结束
		let dbName = 'hrm-attendance-abnormalrule'; // 表名
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				single_punch_rule,
				late_early_coexist_rule,
				out_office_cancel_absence,
				overtime_cancel_early,
				late_forgive_minutes,
				early_forgive_minutes,
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