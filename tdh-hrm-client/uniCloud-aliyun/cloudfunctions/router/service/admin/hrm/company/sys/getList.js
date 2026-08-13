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
		let dbName = "hrm-companys"; // 表名		

		res = await vk.baseDao.selects({
			dbName,
			pageIndex: 1,
			pageSize: 500,
			whereJson: filterWhereJson,
			// whereJson: {
			// 	parent_company_id: _.in([null, ""]),
			// 	company_id: _.exists(true).and(),
			// },
			sortArr: [{
				name: "sort",
				type: "asc"
			}], // 主节点的排序规则
			// 树状结构参数
			treeProps: {
				id: "company_id", // 唯一标识字段，默认为 _id		
				parent_id: "parent_company_id", // 父级标识字段，默认为 parent_id
				children: "children", // 自定义返回的下级字段名，默认为 children
				level: 2, // 查询返回的树的最大层级。超过设定层级的节点不会返回。默认10级，最大15，最小1				
				sortArr: [{
					name: "sort",
					type: "asc"
				}], // 所有子节点的排序规则
				// whereJson: filterWhereJson
			},
			// 副表
			foreignDB: [{
				dbName: "uni-id-users",
				localKey: "update_id",
				foreignKey: "_id",
				as: "users",
				limit: 1
			}, {
				dbName: "hrm-companys",
				localKey: "parent_company_id",
				foreignKey: "company_id",
				as: "parentCompanys",
				limit: 1
			}],
		});
		return res;
	}

}