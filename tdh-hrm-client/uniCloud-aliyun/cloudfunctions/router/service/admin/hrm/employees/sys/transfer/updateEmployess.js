module.exports = {
	/**
	 * 修改数据
	 * @url admin/hrm/employees/sys/transfer/update 前端调用的url参数地址
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
			employee_id,
			new_company_id,
			new_department_id,
			new_position_id,
			update_date,
			update_id
		} = data;
		// 参数验证开始

		// 参数验证结束
		new_company_id = new_company_id.startsWith('company_') ? new_company_id.substring(8) : new_company_id;
		let dbName = "hrm-employees"; // 表名
		// 执行 数据库 update 命令
		await vk.baseDao.update({
			dbName,
			whereJson: {
				employee_id
			},
			dataJson: {
				employee_id,
				company_id: new_company_id,
				department_id: new_department_id,
				position_id: new_position_id,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

}