// admin/hrm/salary/pub/getSumList
module.exports = {
	/**
	 * 按月汇总工资合计（用于列表底部合计行）
	 * @url admin/hrm/salary/pub/getSumList
	 * data: { attendance_ym: '2026-08' }
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
			msg: '',
			rows: []
		};

		// 参数校验
		if (!attendance_ym) {
			res.code = -1;
			res.msg = '考勤月份不能为空';
			return res;
		}

		let dbName = "hrm-salary";

		// 使用 groupJson 聚合
		let groupRes = await vk.baseDao.selects({
			dbName,
			whereJson: { attendance_ym },
			groupJson: {
				_id: null,  // 不按任何字段分组，整体聚合
				work_days: $.sum('$work_days'),
				real_days: $.sum('$real_days'),
				gross_salary: $.sum('$gross_salary'),
				overtime_cost: $.sum('$overtime_cost'),
				free_cost: $.sum('$free_cost'),
				grant: $.sum('$grant'),
				agency_fee: $.sum('$agency_fee'),
				other_cost: $.sum('$other_cost'),
				typhoon_cost: $.sum('$typhoon_cost'),
				liunian_cost: $.sum('$liunian_cost'),
				we_cost: $.sum('$we_cost'),
				clothes_cost: $.sum('$clothes_cost'),
				earlytime_cost: $.sum('$earlytime_cost'),
				missed_cost: $.sum('$missed_cost'),
				loan_cost: $.sum('$loan_cost'),
				this_month_sb: $.sum('$this_month_sb'),
				this_month_dk: $.sum('$this_month_dk'),
				dkgs: $.sum('$dkgs'),
				real_salary: $.sum('$real_salary'),
				count: $.sum(1)
			}
		});

		// 返回合计对象（一条）
		res.rows = groupRes.rows || [];
		return res;
	}
};