module.exports = {
	/**
	 * 数据删除
	 * @url admin/hrm/attendance/sys/approve/delete 前端调用的url参数地址
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
			attendance_ym
		} = data;
		// 参数验证开始
		if (vk.pubfn.isNull(attendance_ym)) return {
			code: -1,
			msg: '考勤日期不能为空'
		};
		// 参数验证结束
		let dbName = "hrm-salary-gs"; // 表名
		// 执行数据库 delete 命令		
		await vk.baseDao.del({
			dbName,
			whereJson: {				
				attendance_ym
			}
		})
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

}