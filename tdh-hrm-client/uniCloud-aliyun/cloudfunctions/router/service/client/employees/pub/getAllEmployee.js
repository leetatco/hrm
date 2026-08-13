module.exports = {
	/**
	 * 查询多条记录（全量，突破1000条限制）并去重
	 * @url admin/hrm/attendance/sys/approve/getList 前端调用的url参数地址
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
			otherWhereJson,
			filterWhereJson
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-employees"; // 表名
		
		const whereJson = {
			...(filterWhereJson || {}),
			...(otherWhereJson || {})
		};

		let sortArr = [{
			name: "_id",
			type: "asc"
		}];

		// 副表关联配置（保持不变）
		let foreignDB = [{
				dbName: "hrm-bank",
				localKey: "bank_id",
				foreignKey: "bank_id",
				as: "banks",
				limit: 1
			},
			{
				dbName: "hrm-banklocation",
				localKey: "location_id",
				foreignKey: "location_id",
				as: "locations",
				limit: 1
			},
			{
				dbName: "hrm-center",
				localKey: "center_id",
				foreignKey: "center_id",
				as: "centers",
				limit: 1
			},
			{
				dbName: "hrm-point",
				localKey: "point_id",
				foreignKey: "point_id",
				as: "points",
				limit: 1
			},
			{
				dbName: "opendb-nation-china",
				localKey: "nation_id",
				foreignKey: "_id",
				as: "nations",
				limit: 1
			},
			{
				dbName: "hrm-contract",
				localKey: "contract_id",
				foreignKey: "contract_id",
				as: "contracts",
				limit: 1
			},
			{
				dbName: "hrm-educational",
				localKey: "educational_id",
				foreignKey: "educational_id",
				as: "educationals",
				limit: 1
			},
			{
				dbName: "hrm-insurance",
				localKey: "insurance_id",
				foreignKey: "insurance_id",
				as: "insurances",
				limit: 1
			},
			{
				dbName: "hrm-employees",
				localKey: "internal_id",
				foreignKey: "employee_id",
				as: "internals",
				limit: 1
			},
			{
				dbName: "hrm-salary-clothes",
				localKey: "employee_id",
				foreignKey: "employee_id",
				as: "clothes"
			},
			{
				dbName: "hrm-employees",
				localKey: "handover_person_id",
				foreignKey: "employee_id",
				as: "handovers",
				limit: 1
			},
			{
				dbName: "hrm-positions",
				localKey: "position_id",
				foreignKey: "position_id",
				as: "positions",
				limit: 1
			},
			{
				dbName: "hrm-resigntypes",
				localKey: "type_id",
				foreignKey: "type_id",
				as: "resigntypes",
				limit: 1
			},
			{
				dbName: "hrm-companys",
				localKey: "company_id",
				foreignKey: "company_id",
				as: "companys",
				limit: 1
			},
			{
				dbName: "hrm-departments",
				localKey: "department_id",
				foreignKey: "department_id",
				as: "departments",
				limit: 1,
				foreignDB: [{
					dbName: "hrm-employees",
					localKey: "department_manager_id",
					foreignKey: "employee_id",
					as: "deptmanagers",
					limit: 1
				}]
			},
			{
				dbName: "hrm-employees",
				localKey: "manager_id",
				foreignKey: "employee_id",
				as: "managers",
				limit: 1
			},
			{
				dbName: "uni-id-users",
				localKey: "update_id",
				foreignKey: "_id",
				as: "users",
				limit: 1
			}
		];

		// 手动分页获取所有数据（突破1000条限制）
		let allData = [];
		let pageSize = 500; // 每次查询条数，可根据实际情况调整
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

		// -------------------- 去重逻辑开始 --------------------
		// 根据 _id 去重（可根据实际业务修改 uniqueKey，如 item.employee_id）
		const uniqueKey = 'employee_id';
		const uniqueMap = new Map();
		for (const item of allData) {
			const keyValue = item[uniqueKey];
			if (!uniqueMap.has(keyValue)) {
				uniqueMap.set(keyValue, item);
			}
		}
		const uniqueData = Array.from(uniqueMap.values());
		// -------------------- 去重逻辑结束 --------------------

		res.rows = uniqueData;
		res.total = uniqueData.length;
		return res;
	}
}