module.exports = {
	/**
	 * 批量生成排班
	 * @url admin/hrm/attendance/sys/schedule/batchGenerate
	 * data: {
	 *   attendance_group_ids: [],   // 空数组表示全部考勤组
	 *   start_date: "2026-09-01",
	 *   end_date: "2026-09-30"
	 * }
	 */
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk,
			db,
			_
		} = util;
		const {
			attendance_group_ids = [], start_date, end_date
		} = data;

		// 1. 参数校验
		if (!start_date || !end_date) {
			return {
				code: -1,
				msg: '日期范围不能为空'
			};
		}

		// 2. 确定要生成的考勤组
		let groupIds = attendance_group_ids;
		if (!groupIds || groupIds.length === 0) {
			// 不选则取全部启用的考勤组
			const groupRes = await vk.baseDao.selects({
				dbName: 'hrm-attendance-group',
				whereJson: {
					status: true
				},
				fieldJson: {
					_id: true
				},
				pageSize: -1
			});
			groupIds = groupRes.rows.map(g => g._id);
		}

		if (groupIds.length === 0) {
			return {
				code: -1,
				msg: '没有可用的考勤组'
			};
		}

		// 3. 日期列表
		const dateList = [];
		let current = new Date(start_date);
		const end = new Date(end_date);
		while (current <= end) {
			dateList.push(vk.pubfn.timeFormat(current, 'yyyy-MM-dd'));
			current.setDate(current.getDate() + 1);
		}

		// 4. 逐考勤组生成排班
		let total = 0;
		const nowTime = Date.now();

		for (const groupId of groupIds) {
			// 4.1 查考勤组
			const groupRes = await vk.baseDao.findById({
				dbName: 'hrm-attendance-group',
				id: groupId
			});
			if (!groupRes) continue;

			const group = groupRes;

			// 4.2 查考勤组覆盖的员工（部门内 + 额外员工）
			const employeeIds = new Set();

			if (group.department_ids && group.department_ids.length > 0) {
				const empRes = await vk.baseDao.selects({
					dbName: 'hrm-employees',
					whereJson: {
						department_id: _.in(group.department_ids),
						status: 1
					},
					fieldJson: {
						employee_id: true
					},
					pageSize: -1
				});
				(empRes.rows || []).forEach(e => {
					if (e.employee_id) employeeIds.add(e.employee_id);
				});
			}

			if (group.employee_ids && group.employee_ids.length > 0) {
				group.employee_ids.forEach(id => {
					if (id) employeeIds.add(id);
				});
			}

			if (employeeIds.size === 0) continue;

			const employeeIdList = Array.from(employeeIds);

			// 4.3 先删除这批员工在该日期范围内的旧排班
			await vk.baseDao.del({
				dbName: 'hrm-attendance-schedule',
				whereJson: {
					employee_id: _.in(employeeIdList),
					schedule_date: _.in(dateList),
					attendance_group_id: groupId
				}
			});

			// 4.4 组装批量插入数据，每条记录写单个 attendance_group_id
			const addList = [];
			for (const empId of employeeIdList) {
				for (const dateStr of dateList) {
					addList.push({
						employee_id: empId,
						schedule_date: dateStr,
						attendance_group_id: groupId, // 单值
						status: true,
						remark: '',
						version: 1,
						update_id: 'system',
						update_date: nowTime
					});
				}
			}

			// 4.5 分批插入
			const batchSize = 1000;
			for (let i = 0; i < addList.length; i += batchSize) {
				const batch = addList.slice(i, i + batchSize);
				await vk.baseDao.adds({
					dbName: 'hrm-attendance-schedule',
					dataJson: batch
				});
			}

			total += addList.length;
		}

		return {
			code: 0,
			msg: `成功生成 ${groupIds.length} 个考勤组共 ${total} 条排班记录`,
			total,
			groupCount: groupIds.length
		};
	}
};