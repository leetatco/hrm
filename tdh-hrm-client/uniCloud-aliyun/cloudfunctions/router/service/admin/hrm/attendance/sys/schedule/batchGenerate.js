module.exports = {
	/**
	 * 批量生成排班记录
	 * @url admin/hrm/attendance/sys/schedule/batchGenerate
	 * data: {
	 *   attendance_group_id: "考勤组ID",
	 *   start_date: "2026-07-01",
	 *   end_date: "2026-07-31",
	 *   shift_id: "指定班次ID（可选）"
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
			msg: '生成成功'
		};
		let {
			attendance_group_id,
			start_date,
			end_date,
			shift_id,
			uid
		} = data;

		// 1. 参数校验
		if (!attendance_group_id) return {
			code: -1,
			msg: '考勤组ID不能为空'
		};
		if (!start_date || !end_date) return {
			code: -1,
			msg: '开始和结束日期不能为空'
		};

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
		// 从部门中获取在职员工
		if (group.department_ids && group.department_ids.length > 0) {
			const deptEmployeesRes = await vk.baseDao.selects({
				dbName: 'hrm-employees', // 根据实际表名调整
				whereJson: {
					department_id: _.in(group.department_ids),
					status: 1 // 在职
				},
				fieldJson: {
					employee_id: true
				}
			});
			deptEmployeesRes.rows.forEach(item => employeeIds.add(item.employee_id));
		}
		// 额外员工
		if (group.employee_ids && group.employee_ids.length > 0) {
			group.employee_ids.forEach(id => employeeIds.add(id));
		}

		if (employeeIds.size === 0) {
			return {
				code: -1,
				msg: '考勤组下没有在职员工'
			};
		}

		// 4. 确定使用的班次
		let targetShiftId = shift_id;
		if (!targetShiftId) {
			// 使用考勤组的默认班次
			targetShiftId = group.shift_id;
		}
		// 如果最终没有班次，则排班为空（休息），这也是合理的
		// 但通常应给出提示，此处允许空

		// 5. 遍历日期和员工生成排班
		const dbName = 'hrm-attendance-schedule'; // 排班计划表名
		let count = 0;
		const nowTime = new Date().getTime();
		const employeeIdList = Array.from(employeeIds);

		// 为提高效率，可先将日期范围内的现有记录全部清除，再批量插入（适用于覆盖模式）
		// 这里采用逐条检查并更新/插入的方式，适合数据量不大的情况

		for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
			const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
			for (let empId of employeeIdList) {
				// 检查是否已存在
				const existRes = await vk.baseDao.selects({
					dbName,
					whereJson: {
						employee_id: empId,
						schedule_date: dateStr
					},
					limit: 1
				});
				if (existRes.rows.length > 0) {
					// 存在则更新
					await vk.baseDao.update({
						dbName,
						whereJson: {
							employee_id: empId,
							schedule_date: dateStr
						},
						dataJson: {
							shift_id: targetShiftId,
							attendance_group_id,
							update_id: uid,
							update_date: nowTime
						}
					});
				} else {
					// 不存在则新增
					await vk.baseDao.add({
						dbName,
						dataJson: {
							employee_id: empId,
							schedule_date: dateStr,
							shift_id: targetShiftId,
							attendance_group_id,
							status: true,
							update_id: uid,
							update_date: nowTime
						}
					});
				}
				count++;
			}
		}

		res.count = count;
		res.msg = `成功为 ${employeeIds.size} 名员工在 ${start_date} 至 ${end_date} 生成/更新了 ${count} 条排班记录`;
		return res;
	}
};