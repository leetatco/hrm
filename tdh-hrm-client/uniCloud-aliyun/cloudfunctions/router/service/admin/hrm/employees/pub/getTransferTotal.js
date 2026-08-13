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

		//统计本年度离职用户的数量
		let {
			yearStart,
			yearEnd
		} = vk.pubfn.getCommonTime();
		// console.log(yearStart,yearEnd);
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-employees-transfer"; // 表名
		const whereJson = {			
			transfer_date: _.gte(yearStart).lte(yearEnd), // 只查询本年，不加此条件则查全表,			
		};

		if (companys && Array.isArray(companys) && companys.length > 0) {
			whereJson.company_id = _.in(companys);
		}
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson
		});
		return res;
	}

}