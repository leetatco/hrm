module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk,
			db
		} = util;
		const {
			employee_id,
			date
		} = data;

		if (!employee_id) return {
			code: -1,
			msg: '缺少员工工号'
		};

		const todayStr = date || vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd');
		const result = {
			source: 'none',
			schedule_day: false,
			overtime_day: false,
			attendance_group_id: '',
			attendance_group_name: '',
			punch_location_id: '',
			punch_location: null
		};

		// ========== 1. 查今日排班 ==========
		let attendanceGroupId = '';
		const scheduleRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-schedule',
			whereJson: {
				employee_id: employee_id,
				schedule_date: todayStr
			},
			limit: 1
		});
		if (scheduleRes.rows.length > 0 && scheduleRes.rows[0].attendance_group_id) {
			attendanceGroupId = scheduleRes.rows[0].attendance_group_id;
			result.schedule_day = true;
			result.source = 'schedule';
		}

		// ========== 2. 无排班 → 反查员工归属的考勤组 ==========
		if (!attendanceGroupId) {
			// 2.1 判断今日是否有加班（仅用于提示）
			const overtimeRes = await vk.baseDao.selects({
				dbName: 'bpmn-application-form',
				whereJson: {
					form_type_code: 'OVERTIME_APPLICATION',
					applicant_id: employee_id,
					status: 'approved',
					'form_data.items.overtime_date': todayStr
				},
				limit: 1
			});
			result.overtime_day = overtimeRes.rows.length > 0;

			// 2.2 先查考勤组的 employee_ids 是否包含该员工
			const groupByEmpRes = await vk.baseDao.selects({
				dbName: 'hrm-attendance-group',
				whereJson: {
					status: true,
					employee_ids: employee_id
				},
				limit: 1
			});
			if (groupByEmpRes.rows.length > 0) {
				attendanceGroupId = groupByEmpRes.rows[0]._id;
				result.source = 'default';
			} else {
				// 2.3 其次查该员工的部门是否在考勤组的 department_ids 里
				const empRes = await vk.baseDao.selects({
					dbName: 'hrm-employees',
					whereJson: {
						employee_id
					},
					limit: 1,
					fieldJson: {
						department_id: true
					}
				});

				if (empRes.rows.length > 0 && empRes.rows[0].department_id) {
					const deptId = empRes.rows[0].department_id;
					const groupByDeptRes = await vk.baseDao.selects({
						dbName: 'hrm-attendance-group',
						whereJson: {
							status: true,
							department_ids: deptId
						},
						limit: 1
					});
					if (groupByDeptRes.rows.length > 0) {
						attendanceGroupId = groupByDeptRes.rows[0]._id;
						result.source = 'default';
					}
				}
			}
		}

		// ========== 3. 仍无考勤组 ==========
		if (!attendanceGroupId) {
			return {
				code: 0,
				msg: '未找到考勤组，无法打卡',
				data: result
			};
		}

		result.attendance_group_id = attendanceGroupId;

		// ========== 4. 获取考勤组 ==========
		const group = await vk.baseDao.findById({
			dbName: 'hrm-attendance-group',
			id: attendanceGroupId
		});
		if (!group || !group.status) {
			return {
				code: -1,
				msg: '考勤组不存在或已停用',
				data: result
			};
		}

		result.attendance_group_name = group.group_name || '';
		result.punch_location_id = group.punch_location_id || '';
		if (!result.punch_location_id) {
			return {
				code: -1,
				msg: '该考勤组未配置打卡点',
				data: result
			};
		}

		// ========== 5. 查询打卡点 ==========
		const location = await vk.baseDao.findById({
			dbName: 'hrm-clockin-set',
			id: result.punch_location_id
		});
		if (!location) {
			return {
				code: -1,
				msg: '打卡点记录不存在',
				data: result
			};
		}

		result.punch_location = {
			_id: location._id,
			address: location.address || '',
			longitude: location.longitude || 0,
			latitude: location.latitude || 0,
			distance_in: location.distance_in || 0,
			bssid: location.bssid || '',
			ssid: location.ssid || '',
			signalStrength: location.signalStrength || 0
		};

		return {
			code: 0,
			msg: 'ok',
			data: result
		};
	}
};