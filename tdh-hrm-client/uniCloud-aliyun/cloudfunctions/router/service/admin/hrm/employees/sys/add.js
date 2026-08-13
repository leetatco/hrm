module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/employees/sys/add 前端调用的url参数地址
	 * data 请求参数 说明
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: 'ok' };
		let dbName = "hrm-employees"; // 表名
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			employee_id,
			center_id,
			point_id,
			employee_name,
			bank_card,
			bank_id,
			location_id,
			gender = 1,
			nation_id,
			department_id,
			manager_id,
			company_id,
			position_id,
			hire_date = {"$env":"now"},
			resign_date,
			mobile,
			educational_id,
			insurance_id,
			stay = 1,
			contract_id,
			contract_date,
			contract_desc,
			registration = 1,
			card,
			birth_date,
			birth_month,
			age,
			expiration_date,
			card_location,
			emergency_contact,
			emergency_mobile,
			internal_id,
			handover_person_id,
			marital_status = 1,
			no_crime = 1,
			comment,
			avatar,
			avatar_file,
			file_attachments,
			type_id,
			resign_desc,
			status = 1,		
			rest_type,
			expected_salary,
			update_date,
			update_id
		} = data;
		// 参数验证开始
		let checkRes = await vk.baseDao.findByWhereJson({
					dbName,
					whereJson: _.or([
					  {
					    employee_id
					  },
					  {
					    card,
						status:1
					  }
					])			
				});
				if (checkRes) {
					return {
						code: -1,
						msg: "员工工号或身份证号码重复！"
					}
				}
		
		// 参数验证结束		
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				employee_id,
				center_id,
				point_id,
				employee_name,
				bank_card,
				bank_id,
				location_id,
				gender,
				nation_id,
				department_id,
				manager_id,
				company_id,
				position_id,
				hire_date,
				resign_date,
				mobile,
				educational_id,
				insurance_id,
				handover_person_id,
				stay,
				contract_id,
				contract_date,
				contract_desc,
				registration,
				card,
				birth_date,
				birth_month,
				age,
				expiration_date,
				card_location,
				emergency_contact,
				emergency_mobile,
				internal_id,
				marital_status,
				no_crime,
				comment,
				avatar,
				avatar_file,
				file_attachments,
				type_id,
				resign_desc,
				rest_type,
				expected_salary,
				status,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}
