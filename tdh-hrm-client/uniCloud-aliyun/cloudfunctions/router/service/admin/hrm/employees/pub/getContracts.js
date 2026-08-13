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
			$,
			_
		} = util;
		let {
			uid,
			companys
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-employees"; // 表名
		const whereJson = {
			status: 1,
		};

		if (companys && Array.isArray(companys) && companys.length > 0) {
			whereJson.company_id = _.in(companys);
		}
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson,
			groupJson: {
				_id: "$contract_id", // _id是分组id（_id:为固定写法，必填属性），这里指按contract_id字段进行分组
				contract_id: $.first("$contract_id"), // 这里是为了把contract_id原样输出					
				count: $.sum(1), // count记录条数
			},
			sortArr: [{
				name: "_id",
				type: "desc"
			}],
			// 副表
			foreignDB: [{
				dbName: "hrm-contract",
				localKey: "contract_id",
				foreignKey: "contract_id",
				as: "contracts",
				limit: 1
			}],
		});
		return res;
	}

}