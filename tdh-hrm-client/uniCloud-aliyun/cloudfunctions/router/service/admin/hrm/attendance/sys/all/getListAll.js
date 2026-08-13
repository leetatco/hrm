module.exports = {
	/**
	 * 查询全部记录（不分页）
	 * @url admin/hrm/attendance/sys/approve/getAllList 前端调用的url参数地址
	 * data 请求参数 说明
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
			filterWhereJson,
			company_ids = [],
			attendance_ym
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-attendance-detail";		
		
		// 设置 pageSize 为 -1 获取所有记录（不分页）
		data.pageSize = -1;
		data.pageIndex = 1;
		
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson: {
				attendance_ym
			}
			
		});		
		return res;
	}
}