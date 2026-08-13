module.exports = {
	/**
	 * 修改数据
	 * @url admin/hrm/salary/sys/loan/update 前端调用的url参数地址
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
		let dbName = "hrm-salary-loan"; // 表名
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			_id,
			attendance_ym,
			card,
			loan_date,
			loan_amount,
			repayment_amount,
			comment,
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
				attendance_ym,
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
				card,
				loan_date,
				loan_amount,
				repayment_amount,
				comment,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

}