module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/salary/sys/loan/getList 前端调用的url参数地址
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
			_
		} = util;
		let {
			uid,
			card,
			attendance_ym_key
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-salary-loan"; // 表名
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson:{
				card,
				attendance_ym:attendance_ym_key
			},
			// 副表
			foreignDB: [{
				dbName: "hrm-employees",
				localKey: "card",
				foreignKey: "card",
				as: "employees",
				limit: 1
			}, {
				dbName: "uni-id-users",
				localKey: "update_id",
				foreignKey: "_id",
				as: "users",
				limit: 1
			}]
		});
		//加上剩余还款总计
		for (let r of res.rows) {
			let rems = await vk.callFunction({
				url: 'admin/hrm/salary/pub/getRemaining',
				title: '请求中...',
				data: {
					card: r.card					
				}
			});
			if (rems.total > 0) {
				r.remaining_principal = r.loan_amount - rems.rows[0].total;
			} else {
				r.remaining_principal = 0;
			}
			
			r.repayment_total=rems.rows[0].total;
		}
		return res;
	}

}