module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/employees/sys/transfer/add 前端调用的url参数地址
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
			transfer_date = {
					"$env": "now"
				},
				employee_id,
				employee_name,
				current_company_name,
				current_department_name,
				current_position_name,
				new_company_name,
				new_department_name,
				new_position_name,
				update_date,
				update_id
		} = data;
		let dbName = "hrm-employees-transfer"; // 表名
		// 参数验证开始
		let checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: {
				employee_id,
				transfer_date
			}
		});
		if (checkRes) {
			return {
				code: -1,
				msg: `调动员工重复(${employee_id})！`
			}
		}
		// 参数验证结束
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				transfer_date,
				employee_id,
				employee_name,
				current_company_name,
				current_department_name,
				current_position_name,
				new_company_name,
				new_department_name,
				new_position_name,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}