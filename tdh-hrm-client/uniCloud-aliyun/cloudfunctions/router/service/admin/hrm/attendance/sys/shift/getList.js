module.exports = {
	/**
	 * 查询多条记录（层级结构：公司 → 部门 → 班次）
	 * @url admin/hrm/attendance/sys/shift/getList
	 * data 请求参数 说明
	 * @params {Number}         pageIndex 当前页码
	 * @params {Number}         pageSize  每页显示数量
	 * @params {Array<Object>}  sortRule  排序规则
	 * @params {object}         formData  查询条件数据源
	 * @params {Array<Object>}  columns   查询条件规则
	 * @params {Boolean}        flatten   是否返回扁平列表（供 remote-select 使用）
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
			formData = {},
			flatten = false
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		let dbName = 'hrm-attendance-shift'; // 班次表名

		// 1. 查询所有班次（带公司、部门、更新人副表）
		let listRes = await vk.baseDao.selects({
			dbName,
			pageIndex: 1,
			pageSize: -1,
			whereJson: {
				...(formData.company_id && { company_id: formData.company_id }),
				...(formData.department_id && { department_id: formData.department_id }),
				...(formData.shift_name && { shift_name: new RegExp(formData.shift_name) }),
				...(formData.shift_type != null && formData.shift_type !== "" && { shift_type: formData.shift_type }),
				...(formData.status != null && formData.status !== "" && { status: formData.status })
			},
			sortArr: [{ name: "update_date", type: "desc" }],
			foreignDB: [{
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
					limit: 1
				},
				{
					dbName: "uni-id-users",
					localKey: "update_id",
					foreignKey: "_id",
					as: "users",
					limit: 1
				}
			]
		});

		let list = listRes.rows || [];

		// ============ 新增：扁平模式（供 remote-select 使用） ============
		if (flatten) {
			const rows = list.map(item => {
				const companyName = item.companys && item.companys.company_name ? item.companys.company_name : '';
				const deptName = item.departments && item.departments.department_name ? item.departments
					.department_name : '';
				return {
					...item,
					_id: item._id,
					shift_name: item.shift_name,
					label: `${item.shift_name}（${companyName}${deptName ? ' / ' + deptName : ''}）`
				};
			});
			return {
				code: 0,
				msg: '查询成功',
				rows: rows
			};
		}
		// ================================================================

		// 2. 按 company_id → department_id 分组（原树形逻辑不变）
		let companyMap = new Map();

		for (let item of list) {
			let cid = item.company_id || "unknown_company";
			let did = item.department_id || "unknown_dept";
			let companyName = item.companys && item.companys.company_name ? item.companys.company_name : "未知公司";
			let companyNo = item.companys && (item.companys.company_no || item.companys.company_code || item.companys
				.short_name) || "";
			let deptName = item.departments && item.departments.department_name ? item.departments.department_name :
				"未知部门";

			if (!companyMap.has(cid)) {
				companyMap.set(cid, {
					_id: `company_${cid}`,
					type: "company",
					company_id: cid,
					company_name: companyName,
					company_no: companyNo,
					companys: {
						company_name: companyName,
						company_no: companyNo
					},
					deptMap: new Map(),
					children: []
				});
			}
			let companyNode = companyMap.get(cid);

			if (!companyNode.deptMap.has(did)) {
				let deptNode = {
					_id: `dept_${cid}_${did}`,
					type: "department",
					company_id: cid,
					company_name: companyName,
					company_no: companyNo,
					department_id: did,
					department_name: deptName,
					companys: {
						company_name: companyName,
						company_no: companyNo
					},
					departments: {
						department_name: deptName
					},
					children: []
				};
				companyNode.deptMap.set(did, deptNode);
				companyNode.children.push(deptNode);
			}
			let deptNode = companyNode.deptMap.get(did);

			deptNode.children.push({
				...item,
				_id: item._id,
				type: "shift",
				company_id: cid,
				company_name: companyName,
				company_no: companyNo,
				department_id: did,
				department_name: deptName,
				companys: {
					company_name: companyName,
					company_no: companyNo
				},
				departments: {
					department_name: deptName
				}
			});
		}

		let treeData = [];
		companyMap.forEach(node => {
			delete node.deptMap;
			treeData.push(node);
		});

		return {
			code: 0,
			msg: '查询成功',
			rows: treeData
		};
	}
};