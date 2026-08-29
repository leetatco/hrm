module.exports = {
	/**
	 * 修改数据
	 * @url admin/hrm/employees/sys/update 前端调用的url参数地址
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
		let dbName = "hrm-employees"; // 表名
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			_id,
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
			handover_person_id,
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
			update_date,
			update_id
		} = data;
				
		// 参数验证开始
		if (vk.pubfn.isNull(_id) && vk.pubfn.isNull(employee_id)) {
		  return { code: -1, msg: 'id或工号不能为空' };
		}
		
		// 检查工号是否重复（新增时检查）
		let checkRes = await vk.baseDao.findByWhereJson({
		  dbName,
		  whereJson: { employee_id }
		});
		
		if (checkRes) {
		  // 如果有 _id 且不是同一条记录，则工号重复
		  if (_id && _id !== checkRes._id) {
		    return { code: -1, msg: "员工工号重复！", rows: checkRes };
		  }
		  // 如果没有 _id（新增），说明工号已存在
		  if (!_id) {
		    return { code: -1, msg: "员工工号已存在！", rows: checkRes };
		  }
		  // 有 _id 且是同一记录，继续更新
		}
		
		// 如果传了身份证号，也检查是否重复（可选）
		if (card) {
		  let cardCheck = await vk.baseDao.findByWhereJson({
		    dbName,
		    whereJson: { card, status: 1 }
		  });
		  if (cardCheck) {
		    if (_id && _id !== cardCheck._id) {
		      return { code: -1, msg: "身份证号已被使用！", rows: cardCheck };
		    }
		    if (!_id) {
		      return { code: -1, msg: "身份证号已存在！", rows: cardCheck };
		    }
		  }
		}	

		// 参数验证结束		
		// 执行 数据库 updateById 命令
		await vk.baseDao.updateById({
			dbName,
			id: _id,
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
				handover_person_id,
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