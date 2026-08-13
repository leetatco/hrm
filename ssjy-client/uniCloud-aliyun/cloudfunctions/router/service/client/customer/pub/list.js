module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/employees/sys/getList 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {Number}         pageIndex 当前页码
	 * @params {Number}         pageSize  每页显示数量
	 * @params {Array<Object>}  sortRule  排序规则
	 * @params {object}         formData  查询条件数据源
	 * @params {Array<Object>}  columns   查询条件规则
	 * res 返回参数说明
	 * @params {Number}         code      错误码，0表示成功
	 * @params {String}         msg       详细信息
	 * @params {String}         filterWhereJson       过滤公司别
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
			keyword
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		let dbName = "customers"; // 表名
		// 业务逻辑开始-----------------------------------------------------------				
		const whereJson = {
			company_name: new RegExp(keyword)
		};

		// 设置 pageSize 为 -1 获取所有记录（不分页）
		data.pageSize = -1;
		data.pageIndex = 1;

		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson,
			// 副表
			foreignDB: [{
					dbName: "bank_flows",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "bank_flows"
				},
				{
					dbName: "shareholders",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "shareholders"
				},
				{
					dbName: "tax_records",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "tax_records"
				},
				{
					dbName: "loans",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "loans"
				},
				{
					dbName: "investments",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "investments"
				},
				{
					dbName: "properties",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "properties"
				},
				{
					dbName: "lawsuits",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "lawsuits"
				},
				{
					dbName: "business_performance",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "business_performance"
				},
				{
					dbName: "subsidies",
					localKey: "_id",
					foreignKey: "customer_id",
					as: "subsidies"
				},
				{
					dbName: "uni-id-users",
					localKey: "update_id",
					foreignKey: "_id",
					as: "users",
					limit: 1
				}
			]
		});
		return res;
	}

}