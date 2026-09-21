module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/dorm/sys/getList 前端调用的url参数地址
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
			company_id
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-employees"; // 表名

		let max = await vk.baseDao.max({
			dbName,
			fieldName: 'employee_id', // 需要取最大值的字段名
			whereJson: {
				company_id: company_id,
				employee_id: new RegExp(`${company_id.substring(0, 2).toUpperCase()}-`),				
			}
		});

		let prefix = company_id.substring(0, 2).toUpperCase() + '-';
		let num = 0;
		let padLen = 5; // 兜底位数	

		if (max) {
			const idx = max.indexOf('-'); // 只有一个 '-'，直接用第一个
			prefix = max.substring(0, idx + 1); // 'TD-'，含 '-'
			const numStr = max.substring(idx + 1); // '00005'
			num = parseInt(numStr, 10);
			padLen = numStr.length; // 沿用原位数补零
		}

		const nextNo = prefix + String(num + 1).padStart(padLen, '0');

		res.nextNo = nextNo;

		return res;
	}

}