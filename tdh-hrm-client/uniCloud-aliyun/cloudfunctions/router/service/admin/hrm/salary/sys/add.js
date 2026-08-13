module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/salary/sys/add 前端调用的url参数地址
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
			//考勤日期
			attendance_ym,
			attendance_ym_key,
			//离职月份
			resign_month,
			//身份证号码
			employee_id,
			//综合工资
			total_salary,
			//休息类型
			rest_type,
			//工资类型
			salary_type,
			//基本工资
			base_salary,
			//绩效工资
			performance_salary,
			//固定加班
			overtime_fee,
			//社保补偿金
			penalty_fund,
			//公积补偿金
			housing_fund,
			//年度补偿金
			annual_allowance,
			//浮动奖励
			floating_bonus,
			//保密费
			confidentiality_fee,
			//应勤天数
			work_days,
			//实际出勤
			real_days,
			//应发工资
			gross_salary,
			//加班费
			overtime_cost,
			//放假补助
			free_cost,
			//补助金
			grant,
			//介绍费
			agency_fee,
			//其他费用
			other_cost,
			//水电费
			we_cost,
			//工衣费用
			clothes_cost,
			//迟/早退费
			earlytime_cost,
			//未打卡费
			missed_cost,
			//借款
			loan_cost,
			//上月社保
			last_month_sb,
			last_month_gjj,
			//上月社保代扣部份
			last_month_dk,
			//本月社保
			this_month_sb,
			//本月社保代扣部份
			this_month_dk,
			//代扣个税
			dkgs,
			//实发工资
			real_salary,
			//公司社保
			company_sb,
			//公司公积金
			company_gjj,
			comment,
			enable_fd1,
			enable_fd2,
			update_date,
			update_id
		} = data;
		// 参数验证开始
		let checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: {
				attendance_ym_key,
				employee_id
			}
		});
		if (checkRes) {
			return {
				code: -1,
				msg: "员工重复"
			}
		}
		// 参数验证结束		
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				attendance_ym,
				attendance_ym_key,
				resign_month,
				employee_id,
				total_salary,
				rest_type,
				salary_type,
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
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}