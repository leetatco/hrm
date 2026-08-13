module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/salary/sys/getList 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {Number}         pageIndex 当前页码
	 * @params {Number}         pageSize  每页显示数量
	 * @params {Array<Object>}  sortRule  排序规则
	 * @params {object}         formData  查询条件数据源
	 * @params {Array<Object>}  columns   查询条件规则
	 * res 返回参数说明
	 * @params {Number}         code      错误码，0表示成功
	 * @params {String}         msg       详细信息
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
			_,
			$
		} = util;
		let {
			uid,
			attendance_ym
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-salary"; // 表名		

		res = await vk.baseDao.getTableData({
			dbName,
			whereJson: {
				attendance_ym
			},
			groupJson: {
				_id: "$attendance_ym", // 以 attendance_ym 作为分组字段				
				work_days: $.sum('$work_days'),
				real_days: $.sum('$real_days'),
				gross_salary: $.sum('$gross_salary'),
				overtime_cost: $.sum('$overtime_cost'),
				free_cost: $.sum('$free_cost'),
				grant: $.sum('$grant'),
				agency_fee: $.sum('$agency_fee'),
				other_cost: $.sum('$other_cost'),
				we_cost: $.sum('$we_cost'),
				clothes_cost: $.sum('$clothes_cost'),
				earlytime_cost: $.sum('$earlytime_cost'),
				missed_cost: $.sum('$missed_cost'),
				loan_cost: $.sum('$loan_cost'),
				this_month_sb: $.sum('$this_month_sb'),
				this_month_dk: $.sum('$this_month_dk'),
				dkgs: $.sum('$dkgs'),
				real_salary: $.sum('$real_salary'),
			}
		});
		return res;
	}

}