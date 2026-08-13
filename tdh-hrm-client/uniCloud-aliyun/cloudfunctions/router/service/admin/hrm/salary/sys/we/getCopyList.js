module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/salary/sys/we/getList 前端调用的url参数地址
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
			attendance_ym
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-salary-we"; // 表名
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson:{
				attendance_ym
			},
			sortArr: [{
				name: "attendance_ym",
				type: "desc"
			}, {
				name: "location",
				type: "asc"
			}, {
				name: "dorm_id",
				type: "asc"
			}]
		});
		return res;
	}

}