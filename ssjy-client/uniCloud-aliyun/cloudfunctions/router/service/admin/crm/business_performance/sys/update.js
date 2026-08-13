module.exports = {
	/**
	 * 修改数据
	 * @url admin/business_performance/sys/update 前端调用的url参数地址
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
			_id,
			customer_id,
			year,
			is_audited,
			debt_ratio,
			accounts_receivable,
			accounts_payable,
			fixed_assets_original,
			fixed_assets_net,
			monetary_funds,
			payment_terms,
			top1_customer_revenue,
			top2_customer_revenue,
			external_financial_revenue,
			external_financial_profit,
			external_financial_netprofit,
			internal_financial_revenue,
			internal_financial_totalprofit,
			internal_financial_netprofit,
			update_date,
			updat_id
		} = data;
		// 参数验证开始
		if (vk.pubfn.isNull(_id)) return {
			code: -1,
			msg: 'id不能为空'
		};


		// 参数验证结束
		let dbName = "business_performance"; // 表名
		// 执行 数据库 updateById 命令
		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: {
				customer_id,
				year,
				is_audited,
				debt_ratio,
				accounts_receivable,
				accounts_payable,
				fixed_assets_original,
				fixed_assets_net,
				monetary_funds,
				payment_terms,
				top1_customer_revenue,
				top2_customer_revenue,
				external_financial_revenue,
				external_financial_profit,
				external_financial_netprofit,
				internal_financial_revenue,
				internal_financial_totalprofit,
				internal_financial_netprofit,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

}