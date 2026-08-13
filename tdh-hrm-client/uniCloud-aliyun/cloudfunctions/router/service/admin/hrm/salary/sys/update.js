module.exports = {
	/**
	 * 修改数据
	 * @url admin/hrm/salary/sys/update 前端调用的url参数地址
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
		let dbName = "hrm-salary"; // 表名
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			_id,
			attendance_ym,
			attendance_ym_key,
			resign_month,
			employee_id,
			card,
			total_salary,
			salary_type,
			rest_type,
			base_salary,
			performance_salary,
			overtime_fee,
			penalty_fund,
			housing_fund,
			annual_allowance,
			floating_bonus,
			confidentiality_fee,
			work_days,
			real_days,
			gross_salary,
			overtime_cost,
			free_cost,
			grant,
			agency_fee,
			other_cost,
			we_cost,
			clothes_cost,
			earlytime_cost,
			missed_cost,
			loan_cost,
			last_month_sb,
			last_month_gjj,
			last_month_dk,
			this_month_sb,
			this_month_dk,			
			dkgs,
			real_salary,
			company_sb,
			company_gjj,
			comment,
			enable_fd1,
			enable_fd2,
			update_date,
			update_id
		} = data;
		// 参数验证开始
		if (vk.pubfn.isNull(_id)) return {
			code: -1,
			msg: 'id不能为空'
		};
		let checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: {
				attendance_ym_key,
				card
			}
		});
		if (checkRes) {
			if (_id !== checkRes._id)
				return {
					code: -1,
					msg: "员工重复",
					rows: checkRes
				}
		}
		// 参数验证结束		
		// 执行 数据库 updateById 命令
		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: {
				attendance_ym,
				attendance_ym_key,
				resign_month,
				employee_id,
				card,
				total_salary,
				salary_type,
				rest_type,
				base_salary,
				performance_salary,
				overtime_fee,
				penalty_fund,
				housing_fund,
				annual_allowance,
				floating_bonus,
				confidentiality_fee,
				work_days,
				real_days,
				gross_salary,
				overtime_cost,
				free_cost,
				grant,
				agency_fee,
				other_cost,
				we_cost,
				clothes_cost,
				earlytime_cost,
				missed_cost,
				loan_cost,
				last_month_sb,
				last_month_dk,
				last_month_gjj,
				this_month_sb,
				this_month_dk,
				dkgs,
				real_salary,
				company_sb,
				company_gjj,
				comment,
				enable_fd1,
				enable_fd2,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

}