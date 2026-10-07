// admin/hrm/salary/pub/getAproveList
module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/salary/pub/getAproveList 前端调用的url参数地址
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
			attendance_ym,
			enable_hr
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-attendance-monthly"; // ★ 改表名，从月汇总表取

		// 构建查询条件
		let whereJson = {
			attendance_ym
		};
		// 如果月汇总表有 enable_hr 字段，可以加上
		// if (enable_hr === true) {
		// 	whereJson.enable_hr = true;
		// }

		let sortArr = [{
			name: "attendance_ym",
			type: "asc"
		}, {
			name: "employee_id",
			type: "asc"
		}, {
			name: "_id",
			type: "asc"
		}];

		// 副表关联配置
		let foreignDB = [{
			// 定薪信息（拿 salary_type、salary、contract_days）
			dbName: "hrm-salary-employees",
			localKey: "card",
			foreignKey: "card",
			as: "salarys",
			limit: 1
		}, {
			// 员工信息（拿部门、职位、入职日期等）
			dbName: "hrm-employees",
			localKey: "card",
			foreignKey: "card",
			as: "employeeInfo",
			limit: 1,
			foreignDB: [{
				dbName: "hrm-departments",
				localKey: "department_id",
				foreignKey: "department_id",
				as: "departments",
				limit: 1,
			}, {
				dbName: "hrm-positions",
				localKey: "position_id",
				foreignKey: "position_id",
				as: "positions",
				limit: 1
			}]
		}, {
			dbName: "uni-id-users",
			localKey: "update_id",
			foreignKey: "_id",
			as: "users",
			limit: 1
		}];

		// 手动分页获取所有数据（突破 1000 条限制）
		let allData = [];
		let pageSize = 500;
		let pageIndex = 1;
		let hasMore = true;

		while (hasMore) {
			let pageRes = await vk.baseDao.getTableData({
				dbName,
				data: {
					...data,
					pageSize,
					pageIndex
				},
				whereJson,
				sortArr,
				foreignDB
			});

			if (pageRes.code !== 0) {
				return pageRes;
			}

			let rows = pageRes.rows || [];
			allData = allData.concat(rows);

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