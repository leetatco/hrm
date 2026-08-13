module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/company/sys/getList 前端调用的url参数地址
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
			filterWhereJson
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		let dbName = "hrm-departments"; // 表名
		let companyRes = {};
		// 业务逻辑开始-----------------------------------------------------------

		// console.log(111111111111111111)

		// 先查询所有公司		
		companyRes = await vk.baseDao.selects({
			dbName: "hrm-companys",
			whereJson: {
				...filterWhereJson,
				...(data.formData && data.formData.company_id && {
					company_id: data.formData.company_id
				}),
			},
			pageIndex: 1,
			pageSize: -1,
			sortArr: [{
				name: "sort",
				type: "asc"
			}]
		});

		// console.log(22222222222222)

		let companyList = companyRes.rows;
		let treeData = [];

		// console.log(companyList)

		// 为每个公司查询部门树
		for (let company of companyList) {
			data.pageIndex = 1
			data.pageSize = -1
			// 查询该公司下的部门树
			let departmentRes = await vk.baseDao.getTableData({
				dbName,
				data,
				whereJson: {
					company_id: company.company_id,
					parent_department_id: _.in([null, ""])
				},
				sortArr: [{
					name: "sort",
					type: "asc"
				}],
				treeProps: {
					id: "department_id",
					parent_id: "parent_department_id",
					children: "children",
					sortArr: [{
						name: "sort",
						type: "asc"
					}]
				},
				// 副表
				foreignDB: [{
					dbName: "hrm-employees",
					localKey: "department_manager_id",
					foreignKey: "employee_id",
					as: "managers",
					limit: 1
				},{
					dbName: "hrm-companys",
					localKey: "company_id",
					foreignKey: "company_id",
					as: "companys",
					limit: 1
				}]
			});

			// 构建公司节点（作为根节点）
			let companyNode = {
				...company,
				_id: `company_${company.company_id}`, // 特殊ID标识公司节点
				department_id: `company_${company.company_id}`,
				department_name: company.company_name,
				type: "company",
				children: departmentRes.rows, // 将部门树作为子节点
				companys: {
					company_name: company.company_name
				}
			}
			treeData.push(companyNode);
		}
		return {
			code: 0,
			msg: '查询成功',
			rows: treeData
		};
	}
}