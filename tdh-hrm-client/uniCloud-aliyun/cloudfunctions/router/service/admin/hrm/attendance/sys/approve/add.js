module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/attendance/sys/approve/add 前端调用的url参数地址
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
		let dbName = "hrm-attendance-approve"; // 表名
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			attendance_ym,
			attendance_ym_key,
			share_cost,
			clothes_cost,
			reward_cost,
			punish_cost,
			// grant,
			agency_fee,
			other_cost,
			employee_id,
			card,
			employee_name,
			department_name,
			position_name,
			hire_date,
			resign_date,
			typhoon_duty,
			spring_festival_duty,
			user_confirmed,
			resign_month,
			work_days,
			real_days,
			overtime_hours,
			earlytime_hours,
			missed_count,
			overtime_cost,
			earlytime_cost,
			missed_cost,
			marriage_leave,
			maternity_leave,
			paternity_leave,
			work_injury,
			sick_leave,
			emergency_leave,
			allowance,
			attendance_correction,
			enable_hr,
			enable_fd,
			comment,
			update_date,
			update_id
		} = data;
		// 参数验证开始
		let checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: {
				attendance_ym,
				department_name,
				card
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
				share_cost,
				clothes_cost,
				reward_cost,
				punish_cost,
				// grant,
				agency_fee,
				other_cost,
				employee_id,
				card,
				employee_name,
				department_name,
				position_name,
				hire_date,
				resign_date,
				typhoon_duty,
				spring_festival_duty,
				user_confirmed,
				resign_month,
				work_days,
				real_days,
				overtime_hours,
				earlytime_hours,
				missed_count,
				overtime_cost,
				earlytime_cost,
				missed_cost,
				marriage_leave,
				maternity_leave,
				paternity_leave,
				work_injury,
				sick_leave,
				emergency_leave,
				allowance,
				attendance_correction,
				enable_hr,
				enable_fd,
				comment,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}