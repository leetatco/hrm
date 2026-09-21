module.exports = {
	/**
	 * 查询多条记录（层级结构：公司 → 部门/打卡点）
	 * @url admin/hrm/clockin/sys/setting/getList
	 * @params {Boolean} formData.flatten 是否返回扁平列表（供 table-select 使用）
	 * @params {String}  formData.company_name 公司名称（模糊查询）
	 * @params {String}  formData.department_name 部门名称（模糊查询）
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
			_id,
			formData = {}
		} = data;

		// 从 formData 中取出 flatten（前端通过 formData 传过来）
		let {
			flatten = false,
			...queryFormData
		} = formData;

		let res = {
			code: 0,
			msg: ''
		};

		let dbName = 'hrm-clockin-set'; // 打卡点表名

		// ============ 新增：按公司名称 / 部门名称模糊查询，先拿到对应 ID 列表 ============
		let companyIdFilter = null;
		let departmentIdFilter = null;

		// 1.1 公司名称模糊查询
		if (queryFormData.company_name) {
			const companyRes = await vk.baseDao.selects({
				dbName: 'hrm-companys',
				whereJson: {
					company_name: new RegExp(queryFormData.company_name)
				},
				fieldJson: { company_id: true },
				pageSize: -1
			});
			const ids = (companyRes.rows || []).map(item => item.company_id).filter(Boolean);
			if (ids.length === 0) {
				// 没有匹配的公司，直接返回空结果
				return {
					code: 0,
					msg: '查询成功',
					rows: []
				};
			}
			companyIdFilter = ids;
		}

		// 1.2 部门名称模糊查询
		if (queryFormData.department_name) {
			const deptRes = await vk.baseDao.selects({
				dbName: 'hrm-departments',
				whereJson: {
					department_name: new RegExp(queryFormData.department_name)
				},
				fieldJson: { department_id: true },
				pageSize: -1
			});
			const ids = (deptRes.rows || []).map(item => item.department_id).filter(Boolean);
			if (ids.length === 0) {
				return {
					code: 0,
					msg: '查询成功',
					rows: []
				};
			}
			departmentIdFilter = ids;
		}
		// ==========================================================================

		// 2. 查询所有打卡点（带公司、部门、更新人副表）
		let listRes = await vk.baseDao.selects({
			dbName,
			pageIndex: 1,
			pageSize: -1,
			whereJson: {
				// 主表字段过滤
				...(queryFormData.company_id && { company_id: queryFormData.company_id }),
				...(queryFormData.department_id && { department_id: queryFormData.department_id }),
				...(queryFormData.address && { address: new RegExp(queryFormData.address) }),
				...(queryFormData.bssid && { bssid: new RegExp(queryFormData.bssid) }),
				...(_id && { _id }),
				// 按名称模糊查询转换出的 ID 列表过滤
				...(companyIdFilter && { company_id: _.in(companyIdFilter) }),
				...(departmentIdFilter && { department_id: _.in(departmentIdFilter) })
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

		// ============ 扁平模式（供 table-select 使用） ============
		if (flatten) {
			const rows = list.map(item => {
				const companyName = item.companys && item.companys.company_name ? item.companys.company_name : '';
				const companyNo = item.companys && (item.companys.company_no || item.companys.company_code || item
					.companys.short_name) || '';
				const deptName = item.departments && item.departments.department_name ? item.departments
					.department_name : '';
				const deptNo = item.departments && (item.departments.department_no || item.departments
					.department_code) || '';

				return {
					...item,
					_id: item._id,
					// 公司别 / 部门别
					company_no: companyNo,
					department_no: deptNo,
					company_name: companyName,
					department_name: deptName,
					// table-select 会用 nameKey 字段做显示
					address: item.address,
					label: `${item.address || ''}${deptName ? '（' + deptName + '）' : ''}`
				};
			});
			return {
				code: 0,
				msg: '查询成功',
				rows: rows
			};
		}
		// ================================================================

		// 3. 按 company_id 分组，公司下直接挂部门/打卡点
		let companyMap = new Map();

		for (let item of list) {
			let cid = item.company_id || "unknown_company";
			let companyName = item.companys && item.companys.company_name ? item.companys.company_name : "未知公司";
			let companyNo = item.companys && (item.companys.company_no || item.companys.company_code || item.companys
				.short_name) || "";
			let deptName = item.departments && item.departments.department_name ? item.departments.department_name :
				"未知部门";
			let deptNo = item.departments && (item.departments.department_no || item.departments.department_code) || "";

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
					children: []
				});
			}
			let companyNode = companyMap.get(cid);

			companyNode.children.push({
				...item,
				_id: item._id,
				type: "clockin",
				company_id: cid,
				company_name: companyName,
				company_no: companyNo,
				department_name: deptName,
				department_no: deptNo,
				companys: {
					company_name: companyName,
					company_no: companyNo
				},
				departments: {
					department_name: deptName,
					department_no: deptNo
				}
			});
		}

		let treeData = [];
		companyMap.forEach(node => treeData.push(node));

		return {
			code: 0,
			msg: '查询成功',
			rows: treeData
		};
	}
};