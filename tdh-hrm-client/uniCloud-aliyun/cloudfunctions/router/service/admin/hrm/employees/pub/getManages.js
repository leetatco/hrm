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
			companys,
			key
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-employees";
		let allData = [];
		let pageIndex = 1;
		let pageSize = 1000; // 每批次获取1000条
		let hasMore = true;

		const whereJson = {
			status: 1,
		};

		if (companys && Array.isArray(companys) && companys.length > 0) {
			whereJson.company_id = _.in(companys);
		}

		while (hasMore) {
			let batchResult = await vk.baseDao.getTableData({
				dbName,
				data: {
					...data,
					pageIndex,
					pageSize
				},
				whereJson,
				foreignDB: [{
					dbName: "hrm-positions",
					localKey: "position_id",
					foreignKey: "position_id",
					as: "positions",
					limit: 1
				}],
				lastWhereJson: {
					"positions.job_level": _.gte(key.start).lte(key.end)
				}
			});

			if (batchResult && batchResult.rows.length > 0) {
				allData = allData.concat(batchResult.rows);

				// 如果返回的数据少于pageSize，说明没有更多数据了
				if (batchResult.rows.length < pageSize) {
					hasMore = false;
				} else {
					pageIndex++;
				}
			} else {
				hasMore = false;
			}
		}

		res = {
			code: 0,
			msg: '成功',
			total: allData.length
		};

		return res;
	}

}