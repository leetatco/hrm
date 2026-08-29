module.exports = {
	/**
	 * 查询多条记录 分页（支持超过1000条自动循环取全部）
	 * @url admin/hrm/salary/sys/payslip/getList 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {Number}         pageIndex 当前页码
	 * @params {Number}         pageSize  每页显示数量（-1 表示取全部）
	 * @params {Array<Object>}  sortRule  排序规则
	 * @params {object}         formData  查询条件数据源
	 * @params {Array<Object>}  columns   查询条件规则
	 * res 返回参数说明
	 * @params {Number}         code      错误码，0表示成功
	 * @params {String}         msg       详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _, $ } = util;
		let { uid } = data;
		let res = { code: 0, msg: '' };
		
		let dbName = "hrm-salary-payslip";
		let pageSize = data.pageSize !== undefined ? data.pageSize : 10;
		
		// 当 pageSize 为 -1 或大于 1000 时，自动循环分页取全部数据
		if (pageSize === -1 || pageSize > 1000) {
			let allRows = [];
			let currentPage = 1;
			let batchSize = 1000; // uniCloud 单次查询硬限制
			let hasMore = true;
			
			while (hasMore) {
				let pageRes = await vk.baseDao.getTableData({
					dbName,
					data: {
						...data,
						pageIndex: currentPage,
						pageSize: batchSize
					},
					sortArr: [
						{ name: "attendance_ym", type: "asc" },
						{ name: "_id", type: "asc" }
					],
					foreignDB: [{
						dbName: "hrm-employees",
						localKey: "card",
						foreignKey: "card",
						as: "employees",
						data: {
							pageIndex: 1,
							pageSize: -1,
						},
						limit: 1
					}],
					getCount: false // 循环查询不需要 count，提升性能
				});
				
				if (pageRes.rows && pageRes.rows.length > 0) {
					allRows = allRows.concat(pageRes.rows);
				}
				
				// 如果本次取满 1000 条，说明可能还有下一页
				hasMore = pageRes.rows && pageRes.rows.length === batchSize;
				currentPage++;
				
				// 安全限制：最多循环 100 次（即最多取 10 万条），防止意外死循环或超时
				if (currentPage > 100) {
					console.warn(`[payslip/getList] 数据量过大，已触发安全限制，当前已取 ${allRows.length} 条`);
					break;
				}
			}
			
			res = {
				code: 0,
				msg: '',
				rows: allRows,
				total: allRows.length,
				pageIndex: 1,
				pageSize: allRows.length
			};
		} else {
			// 正常分页查询（1000条以内，保持原有逻辑）
			res = await vk.baseDao.getTableData({
				dbName,
				data,
				sortArr: [
					{ name: "attendance_ym", type: "asc" },
					{ name: "_id", type: "asc" }
				],
				foreignDB: [{
					dbName: "hrm-employees",
					localKey: "card",
					foreignKey: "card",
					as: "employees",
					data: {
						pageIndex: 1,
						pageSize: -1,
					},
					limit: 1
				}]
			});
		}
		
		return res;
	}
};