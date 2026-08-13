module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/attendance/sys/sign/add 前端调用的url参数地址
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
			sign_in_before_minutes = 60,
			sign_in_after_minutes = 30,
			sign_out_before_minutes = 30,
			sign_out_after_minutes = 120,
			multi_punch_strategy = 1,
			missing_punch_min_work_minutes = 0,
			status = 1,
			remark,
			update_date,
			updat_id
		} = data;
		// 参数验证开始

		// 参数验证结束
		let dbName = 'hrm-attendance-sign'; // 表名
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				rule_name,
				sign_in_before_minutes,
				sign_in_after_minutes,
				sign_out_before_minutes,
				sign_out_after_minutes,
				multi_punch_strategy,
				missing_punch_min_work_minutes,
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