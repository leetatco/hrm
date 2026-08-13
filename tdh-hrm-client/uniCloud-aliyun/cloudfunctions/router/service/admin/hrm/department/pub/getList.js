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
			company_id,
			department_id
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		let dbName = "hrm-departments"; // 表名
		// 业务逻辑开始-----------------------------------------------------------

		res = await vk.baseDao.selects({
			dbName,
			pageIndex: 1,
			pageSize: 500,
			whereJson: {
				parent_department_id: _.in([null, ""]),
				department_id: _.exists(true),
				company_id,
				department_id
			},
			sortArr: [{
				name: "company_id",
				type: "asc"
			}, {
				name: "sort",
				type: "asc"
			}], // 主节点的排序规则
			// 树状结构参数
			treeProps: {
				id: "department_id", // 唯一标识字段，默认为 _id		
				parent_id: "parent_department_id", // 父级标识字段，默认为 parent_id
				children: "children", // 自定义返回的下级字段名，默认为 children
				level: 1,
				limit: 1000,
				sortArr: [{
					name: "sort",
					type: "asc"
				}], // 所有子节点的排序规则
				whereJson: {}
			},
			// 副表
			foreignDB: [{
				dbName: "hrm-employees",
				localKey: "department_manager_id",
				foreignKey: "employee_id",
				as: "managers",
				limit: 1
			}, {
				dbName: "uni-id-users",
				localKey: "update_id",
				foreignKey: "_id",
				as: "users",
				limit: 1
			}, {
				dbName: "hrm-departments",
				localKey: "parent_department_id",
				foreignKey: "department_id",
				as: "parentDepartments",
				limit: 1
			}, {
				dbName: "hrm-companys",
				localKey: "company_id",
				foreignKey: "company_id",
				as: "companys",
				limit: 1
			}],
		});
		return res;
	}

}