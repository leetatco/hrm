module.exports = {
	/**
	 * 批量生成排班记录
	 * @url admin/hrm/attendance/sys/schedule/batchGenerate
	 * data: {
	 *   attendance_group_id: "考勤组ID",
	 *   start_date: "2026-07-01",
	 *   end_date: "2026-07-31"
	 * }	 
	 */
	main: async (event) => {
		let {
			data = {}, userInfo, util
		} = event;
		let {
			vk,
			db,
			_
		} = util;
		let res = {
			code: 0,
			msg: '生成成功',
			data: {
				count: 0
			}
		};
		let {
			attendance_group_id,
			start_date,
			end_date,
			uid
		} = data;

		// 1. 参数校验
		if (!attendance_group_id) {
			return {
				code: -1,
				msg: '考勤组ID不能为空'
			};
		}
		if (!start_date || !end_date) {
			return {
				code: -1,
				msg: '开始和结束日期不能为空'
			};
		}

		const startDate = new Date(start_date);
		const endDate = new Date(end_date);
		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return {
				code: -1,
				msg: '日期格式错误'
			};
		}
		if (startDate > endDate) {
			return {
				code: -1,
				msg: '开始日期不能大于结束日期'
			};
		}

		// 2. 获取考勤组信息
		const groupRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-group',
			whereJson: {
				_id: attendance_group_id
			},
			limit: 1
		});
		if (groupRes.rows.length === 0) {
			return {
				code: -1,
				msg: '考勤组不存在'
			};
		}
		const group = groupRes.rows[0];

		// 3. 获取员工列表（部门内 + 额外员工）
		let employeeIds = new Set();

		// 3.1 部门下的在职员工
		if (group.department_ids && group.department_ids.length > 0) {
			const deptEmployeesRes = await vk.baseDao.selects({
				dbName: 'hrm-employees', // 根据实际表名调整
				whereJson: {
					department_id: _.in(group.department_ids),
					status: 1 // 在职
				},
				fieldJson: {
					employee_id: true
				},
				pageSize: -1
			});
			(deptEmployeesRes.rows || []).forEach(item => {
				if (item.employee_id) employeeIds.add(item.employee_id);
			});
		}

		// 3.2 额外指定的员工
		if (group.employee_ids && group.employee_ids.length > 0) {
			group.employee_ids.forEach(id => {
				if (id) employeeIds.add(id);
			});
		}

		if (employeeIds.size === 0) {
			return {
				code: -1,
				msg: '考勤组下没有在职员工'
			};
		}		

		// 4. 生成日期列表
		const dbName = 'hrm-attendance-schedule'; // 排班计划表名
		const dateList = [];
		let current = new Date(startDate);
		while (current <= endDate) {
			dateList.push(vk.pubfn.timeFormat(current, 'yyyy-MM-dd'));
			current.setDate(current.getDate() + 1);
		}

		if (dateList.length === 0) {
			return {
				code: -1,
				msg: '日期范围为空'
			};
		}

		const employeeIdList = Array.from(employeeIds);
		const nowTime = new Date().getTime();

		// 5. 先删除这批员工在该日期范围内的旧排班，再批量插入（覆盖模式）
		await vk.baseDao.del({
			dbName,
			whereJson: {
				employee_id: _.in(employeeIdList),
				schedule_date: _.in(dateList)
			}
		});

		// 6. 组装批量插入数据
		const addList = [];
		for (const empId of employeeIdList) {
			for (const dateStr of dateList) {
				addList.push({
					employee_id: empId,
					schedule_date: dateStr,					
					attendance_group_id,
					status: true,
					remark: '',
					update_id: uid,
					update_date: nowTime
				});
			}
		}

		// 8. 批量插入
		if (addList.length > 0) {
			// 数据量特别大时建议分批，每批 1000 条
			const batchSize = 1000;
			for (let i = 0; i < addList.length; i += batchSize) {
				const batch = addList.slice(i, i + batchSize);
				await vk.baseDao.adds({
					dbName,
					dataJson: batch
				});
			}
		}

		res.data.count = addList.length;
		res.msg = `成功为 ${employeeIds.size} 名员工在 ${start_date} 至 ${end_date} 生成 ${addList.length} 条排班记录`;
		return res;
	}
};