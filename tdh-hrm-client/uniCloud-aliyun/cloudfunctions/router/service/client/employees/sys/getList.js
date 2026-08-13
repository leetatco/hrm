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
			otherWhereJson,
			filterWhereJson
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		let dbName = "hrm-employees"; // 表名
		// 业务逻辑开始-----------------------------------------------------------				
		const whereJson = {
			...(filterWhereJson || {}),
			...(otherWhereJson || {})
		};

		// 设置 pageSize 为 -1 获取所有记录（不分页）
		data.pageSize = -1;
		data.pageIndex = 1;

		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson,
			sortArr: [{
				name: "center_id",
				type: "asc"
			}, {
				name: "company_id",
				type: "asc"
			}, {
				name: "department_id",
				type: "asc"
			}, {
				name: "employee_id",
				type: "asc"
			}],
			// 副表
			foreignDB: [{
					dbName: "hrm-bank",
					localKey: "bank_id",
					foreignKey: "bank_id",
					as: "banks",
					limit: 1
				},
				{
					dbName: "hrm-banklocation",
					localKey: "location_id",
					foreignKey: "location_id",
					as: "locations",
					limit: 1
				},
				{
					dbName: "hrm-center",
					localKey: "center_id",
					foreignKey: "center_id",
					as: "centers",
					limit: 1
				},
				{
					dbName: "hrm-point",
					localKey: "point_id",
					foreignKey: "point_id",
					as: "points",
					limit: 1
				},
				{
					dbName: "opendb-nation-china",
					localKey: "nation_id",
					foreignKey: "_id",
					as: "nations",
					limit: 1
				},
				{
					dbName: "hrm-contract",
					localKey: "contract_id",
					foreignKey: "contract_id",
					as: "contracts",
					limit: 1
				},
				{
					dbName: "hrm-educational",
					localKey: "educational_id",
					foreignKey: "educational_id",
					as: "educationals",
					limit: 1
				},
				{
					dbName: "hrm-insurance",
					localKey: "insurance_id",
					foreignKey: "insurance_id",
					as: "insurances",
					limit: 1
				},
				{
					dbName: "hrm-employees",
					localKey: "internal_id",
					foreignKey: "employee_id",
					as: "internals",
					limit: 1
				},
				{
					dbName: "hrm-positions",
					localKey: "position_id",
					foreignKey: "position_id",
					as: "positions",
					limit: 1
				},
				{
					dbName: "hrm-resigntypes",
					localKey: "type_id",
					foreignKey: "type_id",
					as: "resigntypes",
					limit: 1
				},
				{
					dbName: "hrm-companys",
					localKey: "company_id",
					foreignKey: "company_id",
					as: "companys",
					limit: 1
				},
				{
					dbName: "hrm-departments",
					localKey: "department_id",
					foreignKey: "department_id",
					as: "departments",
					limit: 1,
					foreignDB: [{
						dbName: "hrm-employees",
						localKey: "department_manager_id",
						foreignKey: "employee_id",
						as: "deptmanagers",
						limit: 1
					}]
				},
				{
					dbName: "hrm-employees",
					localKey: "manager_id",
					foreignKey: "employee_id",
					as: "managers",
					limit: 1
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
		console.log("whereJson:", whereJson)
		return res;
	}

}