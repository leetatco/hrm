module.exports = {
	/**
	 * 考勤组级联选择器数据源（公司 → 部门 → 考勤组，一次性返回完整树）
	 * 没有考勤组的公司/部门会被过滤掉，不显示
	 * @url admin/hrm/attendance/sys/group/getCascader
	 */
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let { vk } = util;
		let res = { code: 0, msg: 'ok' };

		// 1. 查询所有公司
		const companyRes = await vk.baseDao.selects({
			dbName: 'hrm-companys',
			sortArr: [{ name: 'company_name', type: 'asc' }],
			pageSize: -1
		});
		const companies = companyRes.rows || [];

		// 2. 查询所有部门
		const deptRes = await vk.baseDao.selects({
			dbName: 'hrm-departments',
			sortArr: [{ name: 'department_name', type: 'asc' }],
			pageSize: -1
		});
		const departments = deptRes.rows || [];

		// 3. 查询所有启用的考勤组
		const groupRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-group',
			whereJson: {
				status: true
			},
			sortArr: [{ name: 'group_name', type: 'asc' }],
			pageSize: -1
		});
		const groups = groupRes.rows || [];

		// 4. 按“company_id + department_id”给考勤组分组
		//    考勤组的 department_ids 是数组，一个考勤组可能挂在多个部门下
		const groupByDeptMap = new Map(); // `${company_id}_${department_id}` -> [考勤组节点]
		groups.forEach(item => {
			const cid = item.company_id || '';
			const deptIds = Array.isArray(item.department_ids) ? item.department_ids : [];
			deptIds.forEach(did => {
				const key = `${cid}_${did}`;
				if (!groupByDeptMap.has(key)) {
					groupByDeptMap.set(key, []);
				}
				groupByDeptMap.get(key).push({
					_id: item._id,
					value: item._id,
					label: item.group_name,
					company_id: cid,
					department_id: did,
					leaf: true,
					children: []
				});
			});
		});

		// 5. 按 company_id 给部门分组，并挂上考勤组，过滤掉没有考勤组的部门
		const deptMap = new Map(); // company_id -> [部门节点]
		departments.forEach(item => {
			const cid = item.company_id || '';
			const key = `${cid}_${item.department_id}`;
			const groupChildren = groupByDeptMap.get(key) || [];
			// 没有考勤组的部门直接跳过
			if (groupChildren.length === 0) return;

			if (!deptMap.has(cid)) {
				deptMap.set(cid, []);
			}
			deptMap.get(cid).push({
				_id: `dept_${item.department_id}`,
				value: `dept_${item.department_id}`,
				label: item.department_name,
				company_id: cid,
				department_id: item.department_id,
				leaf: false,
				children: groupChildren
			});
		});

		// 6. 组装公司 → 部门 结构，过滤掉没有部门的公司
		const rows = [];
		companies.forEach(item => {
			const cid = item.company_id;
			const deptList = deptMap.get(cid) || [];
			// 没有部门的公司直接跳过
			if (deptList.length === 0) return;

			rows.push({
				_id: `company_${cid}`,
				value: `company_${cid}`,
				label: item.company_name,
				company_id: cid,
				leaf: false,
				children: deptList
			});
		});

		res.rows = rows;
		return res;
	}
};