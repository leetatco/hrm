module.exports = {
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
			keyword,
			otherWhereJson,
			filterWhereJson
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		let dbName = "hrm-employees";
		
		const whereJson = {
			...(filterWhereJson || {}),
			...(otherWhereJson || {})
		};
		let lastWhereJson = {};
		if (keyword) {
			lastWhereJson = _.or([
				{ "departments.department_name": new RegExp(keyword) },
				{ "positions.position_name": new RegExp(keyword) },
				{ employee_name: new RegExp(keyword) }
			]);
		}

		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson,
			sortArr: [
				{ name: "center_id", type: "asc" },
				{ name: "company_id", type: "asc" },
				{ name: "department_id", type: "asc" },
				{ name: "employee_id", type: "asc" }
			],
			foreignDB: [
				{ dbName: "hrm-bank", localKey: "bank_id", foreignKey: "bank_id", as: "banks", limit: 1 },
				{ dbName: "hrm-banklocation", localKey: "location_id", foreignKey: "location_id", as: "locations", limit: 1 },
				{ dbName: "hrm-center", localKey: "center_id", foreignKey: "center_id", as: "centers", limit: 1 },
				{ dbName: "hrm-point", localKey: "point_id", foreignKey: "point_id", as: "points", limit: 1 },
				{ dbName: "opendb-nation-china", localKey: "nation_id", foreignKey: "_id", as: "nations", limit: 1 },
				{ dbName: "hrm-contract", localKey: "contract_id", foreignKey: "contract_id", as: "contracts", limit: 1 },
				{ dbName: "hrm-educational", localKey: "educational_id", foreignKey: "educational_id", as: "educationals", limit: 1 },
				{ dbName: "hrm-insurance", localKey: "insurance_id", foreignKey: "insurance_id", as: "insurances", limit: 1 },
				{ dbName: "hrm-employees", localKey: "internal_id", foreignKey: "employee_id", as: "internals", limit: 1 },
				{ dbName: "hrm-salary-clothes", localKey: "employee_id", foreignKey: "employee_id", as: "clothes" },
				{ dbName: "hrm-employees", localKey: "handover_person_id", foreignKey: "employee_id", as: "handovers", limit: 1 },
				{ dbName: "hrm-positions", localKey: "position_id", foreignKey: "position_id", as: "positions", limit: 1 },
				{ dbName: "hrm-resigntypes", localKey: "type_id", foreignKey: "type_id", as: "resigntypes", limit: 1 },
				{ dbName: "hrm-companys", localKey: "company_id", foreignKey: "company_id", as: "companys", limit: 1 },
				{
					dbName: "hrm-departments",
					localKey: "department_id",
					foreignKey: "department_id",
					as: "departments",
					limit: 1,
					foreignDB: [
						{ dbName: "hrm-employees", localKey: "department_manager_id", foreignKey: "employee_id", as: "deptmanagers", limit: 1 }
					]
				},
				{ dbName: "hrm-employees", localKey: "manager_id", foreignKey: "employee_id", as: "managers", limit: 1 },
				{ dbName: "uni-id-users", localKey: "update_id", foreignKey: "_id", as: "users", limit: 1 }
			],
			lastWhereJson
		});

		// ---------- 电话号码权限控制 ----------
		const userRoles = userInfo?.role || [];
		const hasPhonePermission = userRoles.includes('admin') || userRoles.includes('phone-manager');

		if (!hasPhonePermission && res.rows && res.rows.length > 0) {
			res.rows = res.rows.map(employee => {
				const phone = employee.mobile;
				if (phone) {
					// 脱敏：13912345678 -> 139****5678
					employee.mobile = vk.pubfn.hidden(phone,3,0);
				}
				return employee;
			});
		}
		// ------------------------------------

		return res;
	}
};