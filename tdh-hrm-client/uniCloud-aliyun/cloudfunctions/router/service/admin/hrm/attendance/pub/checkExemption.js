module.exports = {
	/**
	 * 判断员工在指定日期是否豁免考勤
	 * @url admin/hrm/attendance/pub/checkExemption
	 * data: { employee_id, date, attendance_group_id? }
	 * 返回：{ exempted: true/false, reason: '' }
	 */
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, db, _ } = util;
		const { employee_id, date, attendance_group_id } = data;

		if (!employee_id || !date) {
			return { code: -1, msg: '参数不完整' };
		}

		const dbName = 'hrm-attendance-exemption';

		// 1. 先查员工所属部门、考勤组
		let departmentIds = [];
		if (!attendance_group_id) {
			const empRes = await vk.baseDao.findById({
				dbName: 'hrm-employees',
				id: employee_id
			});
			if (empRes && empRes.department_id) {
				departmentIds = [empRes.department_id];
			}
		}

		// 2. 查询生效中的豁免记录
		const whereJson = {
			status: true,
			start_date: _.lte(date),
			$or: [
				{ end_date: _.exists(false) },
				{ end_date: '' },
				{ end_date: _.gte(date) }
			]
		};

		const res = await vk.baseDao.selects({
			dbName,
			whereJson,
			pageSize: -1
		});

		// 3. 逐条匹配
		for (const item of res.rows) {
			if (item.exemption_type === 1 && Array.isArray(item.employee_ids)) {
				if (item.employee_ids.includes(employee_id)) {
					return { code: 0, exempted: true, reason: item.reason || '员工豁免' };
				}
			}
			if (item.exemption_type === 2 && Array.isArray(item.department_ids)) {
				if (item.department_ids.some(d => departmentIds.includes(d))) {
					return { code: 0, exempted: true, reason: item.reason || '部门豁免' };
				}
			}
			if (item.exemption_type === 3 && Array.isArray(item.attendance_group_ids)) {
				if (attendance_group_id && item.attendance_group_ids.includes(attendance_group_id)) {
					return { code: 0, exempted: true, reason: item.reason || '考勤组豁免' };
				}
			}
		}

		return { code: 0, exempted: false, reason: '' };
	}
};