module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/attendance/sys/outrule/add 前端调用的url参数地址
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
			out_office_cancel_absence = true,
				out_office_cancel_late = false,
				out_office_cancel_early = false,
				business_trip_cancel_absence = true,
				business_trip_cancel_late = true,
				business_trip_cancel_early = true,
				status = true,
				remark,
				update_date,
				updat_id
		} = data;
		// 参数验证开始

		// 参数验证结束
		let dbName = 'hrm-attendance-outrule'; // 表名
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				out_office_cancel_absence,
				out_office_cancel_late,
				out_office_cancel_early,
				business_trip_cancel_absence,
				business_trip_cancel_late,
				business_trip_cancel_early,
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