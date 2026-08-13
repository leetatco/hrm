module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/crm/customers/sys/add 前端调用的url参数地址
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
			company_name,
			industry,
			established_date,
			registered_capital,
			paid_in_capital,
			address,
			contact_person_info,
			business_nature,
			enterprise_type,
			listing_status,
			qualifications,
			basic_bank,
			total_employees,
			monthly_payroll,
			senior_cert_count,
			mid_cert_count,
			master_count,
			doctor_count,
			legal_person,
			actual_controller,
			general_manager,
			core_personnel,
			company_intro,
			shareholder_summary,
			related_party_relationship,
			controller_shareholding,
			copyrights,
			trademark_count,
			brand_count,
			proprietary_tech,
			patent_detail,
			rnd_staff_count,
			rnd_investment_intro,
			tax_rating,
			tax_intro,
			external_guarantee_intro,
			overdue_intro,
			pledged_deposit_intro,
			bank_acceptance_intro,
			supply_chain_finance_intro,
			procurement_intro,
			finance_lease_intro,
			corporate_credit_query_half_year,
			corporate_credit_last_query_time,
			corporate_credit_result,
			actual_credit_query_half_year,
			actual_credit_last_query_time,
			actual_credit_result,
			legal_credit_query_half_year,
			legal_credit_last_query_time,
			legal_credit_result,
			water_fee_last_year,
			water_fee_last_month,
			electricity_fee_last_year,
			electricity_fee_last_month,
			rent_last_year,
			rent_last_month,
			next_year_business_intro,
			planned_revenue,
			planned_netprofit,
			new_financing_needs,
			equity_investment_is_upstream_downstream,
			equity_investment_amount,
			equity_investment_ratio,
			equity_investment_intro,
			fixed_asset_investment_amount,
			fixed_asset_investment_source,
			fixed_asset_investment_intro,
			update_date,
			updat_id
		} = data;
		// 参数验证开始


		// 参数验证结束
		let dbName = "customers"; // 表名
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				company_name,
				industry,
				established_date,
				registered_capital,
				paid_in_capital,
				address,
				contact_person_info,
				business_nature,
				enterprise_type,
				listing_status,
				qualifications,
				basic_bank,
				total_employees,
				monthly_payroll,
				senior_cert_count,
				mid_cert_count,
				master_count,
				doctor_count,
				legal_person,
				actual_controller,
				general_manager,
				core_personnel,
				company_intro,
				shareholder_summary,
				related_party_relationship,
				controller_shareholding,
				copyrights,
				trademark_count,
				brand_count,
				proprietary_tech,
				patent_detail,
				rnd_staff_count,
				rnd_investment_intro,
				tax_rating,
				tax_intro,
				external_guarantee_intro,
				overdue_intro,
				pledged_deposit_intro,
				bank_acceptance_intro,
				supply_chain_finance_intro,
				procurement_intro,
				finance_lease_intro,
				corporate_credit_query_half_year,
				corporate_credit_last_query_time,
				corporate_credit_result,
				actual_credit_query_half_year,
				actual_credit_last_query_time,
				actual_credit_result,
				legal_credit_query_half_year,
				legal_credit_last_query_time,
				legal_credit_result,
				water_fee_last_year,
				water_fee_last_month,
				electricity_fee_last_year,
				electricity_fee_last_month,
				rent_last_year,
				rent_last_month,
				next_year_business_intro,
				planned_revenue,
				planned_netprofit,
				new_financing_needs,
				equity_investment_is_upstream_downstream,
				equity_investment_amount,
				equity_investment_ratio,
				equity_investment_intro,
				fixed_asset_investment_amount,
				fixed_asset_investment_source,
				fixed_asset_investment_intro,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}