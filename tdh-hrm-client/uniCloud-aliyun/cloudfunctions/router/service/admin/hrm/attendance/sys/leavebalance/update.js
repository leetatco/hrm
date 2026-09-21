// admin/hrm/attendance/sys/leavebalance/update
module.exports = {
	main: async (event) => {
		const { data = {}, userInfo, util } = event;
		const { vk, db } = util;

		const {
			uid,
			_id,
			total_minutes,
			used_minutes,
			adjust_reason = '',
			status,
			remark
		} = data;

		if (!_id) return { code: -1, msg: '缺少ID' };

		const dbName = 'hrm-attendance-leavebalance';
		const nowTime = Date.now();

		// 1. 查询原记录
		const oldRes = await vk.baseDao.findById({ dbName, id: _id });
		if (!oldRes) return { code: -1, msg: '记录不存在' };

		// 2. 计算变动
		const oldTotal = oldRes.total_minutes || 0;
		const newTotal = total_minutes ?? oldTotal;
		const oldRemain = oldTotal - (oldRes.used_minutes || 0);
		const newRemain = newTotal - (used_minutes ?? oldRes.used_minutes ?? 0);
		const changeAmount = newTotal - oldTotal;

		// 3. 更新额度
		const updateData = {
			total_minutes: newTotal,
			used_minutes: used_minutes ?? oldRes.used_minutes,
			adjust_reason,
			status: status ?? oldRes.status,
			remark: remark ?? oldRes.remark,
			update_id: uid,
			update_date: nowTime
		};
		await vk.baseDao.updateById({ dbName, id: _id, dataJson: updateData });

		// 4. 写入额度日志（仅当总额度有变动时）
		if (changeAmount !== 0) {
			let changeType = 7; // 其他调整
			if (changeAmount > 0) changeType = 3;  // 手工增加
			else changeType = 5;                   // 手工扣减

			await vk.baseDao.add({
				dbName: 'hrm-attendance-balancelog',
				dataJson: {
					employee_id: oldRes.employee_id,
					leave_type_id: oldRes.leave_type_id,
					year: oldRes.year,
					change_type: changeType,
					change_amount: changeAmount,
					before_balance: oldRemain,
					after_balance: newRemain,
					ref_id: '',
					ref_type: 'manual',
					remark: adjust_reason || 'HR手工调整',
					update_id: uid,
					update_date: nowTime
				}
			});
		}

		return { code: 0, msg: '更新成功' };
	}
};