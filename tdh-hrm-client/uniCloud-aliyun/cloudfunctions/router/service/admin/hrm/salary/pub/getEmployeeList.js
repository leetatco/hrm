module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/attendance/sys/approve/getList 前端调用的url参数地址
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
		let dbName = "hrm-salary"; // 表名

		// 构建查询条件（保持不变）
		let whereJson = {
			attendance_ym
		};

		let sortArr = [{
			name: "attendance_ym",
			type: "asc"
		}, {
			name: "_id",
			type: "asc"
		}];

		// 副表关联配置（保持不变）
		let foreignDB = [{
			dbName: "hrm-attendance-approve",
			localKey: "card",
			foreignKey: "card",
			as: "attendances",
			whereJson,
			limit: 1
		}];

		// 手动分页获取所有数据（突破1000条限制）
		let allData = [];
		let pageSize = 500; // 每次查询条数，可根据实际情况调整（建议500~1000）
		let pageIndex = 1;
		let hasMore = true;

		while (hasMore) {
			// 调用 vk.baseDao.getTableData 进行分页查询
			let pageRes = await vk.baseDao.getTableData({
				dbName,
				data: {
					// 保留原 data 中的其他参数（如 sortRule, formData, columns 等）
					...data,
					pageSize,
					pageIndex
				},
				whereJson,
				sortArr,
				foreignDB
			});

			// 如果查询出错，直接返回错误
			if (pageRes.code !== 0) {
				return pageRes;
			}

			let rows = pageRes.rows || [];
			allData = allData.concat(rows);

			// 判断是否还有更多数据：返回的行数小于 pageSize 说明已取完
			if (rows.length < pageSize) {
				hasMore = false;
			} else {
				pageIndex++;
			}
		}

		// 组装最终返回结果
		res.rows = allData;
		res.total = allData.length;
		return res;
	}
}