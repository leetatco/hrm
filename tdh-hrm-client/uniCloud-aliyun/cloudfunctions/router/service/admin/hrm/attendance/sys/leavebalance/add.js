// admin/hrm/attendance/sys/leavebalance/add
module.exports = {
	main: async (event) => {
		const { data = {}, userInfo, util } = event;
		const { vk, db } = util;

		const {
			uid,
			employee_id,
			leave_type_id,
			year,
			total_minutes = 0,
			used_minutes = 0,
			adjust_reason = '',
			status = true,
			remark = ''
		} = data;

		if (!employee_id || !leave_type_id || !year) {
			return { code: -1, msg: '员工、假期类型、年度不能为空' };
		}

		const dbName = 'hrm-attendance-leavebalance';
		const nowTime = Date.now();

		// 1. 检查是否已存在
		const existRes = await vk.baseDao.selects({
			dbName,
			whereJson: { employee_id, leave_type_id, year },
			limit: 1
		});

		if (existRes.rows.length > 0) {
			return { code: -1, msg: '该员工该年度该假期类型额度已存在，请勿重复添加' };
		}

		// 2. 新增额度
		const id = await vk.baseDao.add({
			dbName,
			dataJson: {
				employee_id,
				leave_type_id,
				year,
				total_minutes,
				used_minutes,
				adjust_reason,
				status,
				remark,
				update_id: uid,
				update_date: nowTime
			}
		});

		// 3. 写入额度日志
		await vk.baseDao.add({
			dbName: 'hrm-attendance-balancelog',
			dataJson: {
				employee_id,
				leave_type_id,
				year,
				change_type: 1,  // 初始化
				change_amount: total_minutes,
				before_balance: 0,
				after_balance: total_minutes,
				ref_id: '',
				ref_type: 'manual',
				remark: adjust_reason || 'HR手工初始化',
				update_id: uid,
				update_date: nowTime
			}
		});

		return { code: 0, msg: '添加成功', id };
	}
};