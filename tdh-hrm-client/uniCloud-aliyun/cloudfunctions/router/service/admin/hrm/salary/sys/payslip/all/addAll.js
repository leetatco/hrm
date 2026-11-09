module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/attendance/sys/approve/add 前端调用的url参数地址
	 * data 请求参数 说明
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
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
			uid
		} = data;
		let res = {
			code: 0,
			msg: 'ok'
		};
		let dbName = "hrm-salary-payslip"; // 表名
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			cards = [],
				items = [],
				update_date,
				update_id
		} = data;
		// 参数验证开始
		const employeeCompanyMap = {};
		if (cards.length > 0) {
			const batchSize = 500;
			for (let i = 0; i < cards.length; i += batchSize) {
				const batchIds = cards.slice(i, i + batchSize);
				const empRes = await vk.baseDao.select({
					dbName: 'hrm-employees',
					whereJson: {
						card: _.in(batchIds)
					},
					fieldJson: {
						card: 1,
						company_id: 1
					},
					pageSize: batchSize
				});
				(empRes.rows || []).forEach(emp => {
					employeeCompanyMap[emp.card] = emp.company_id || '';
				});
			}
		}

		items.forEach(e => {
			e.company_id = employeeCompanyMap[e.card]
		})

		// 参数验证结束		
		// 执行 数据库adds 命令
		res.id = await vk.baseDao.adds({
			dbName,
			dataJson: items
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}