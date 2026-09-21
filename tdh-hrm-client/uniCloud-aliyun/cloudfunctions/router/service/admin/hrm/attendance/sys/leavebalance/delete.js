// admin/hrm/attendance/sys/leavebalance/delete
module.exports = {
	main: async (event) => {
		const { data = {}, userInfo, util } = event;
		const { vk, db } = util;
		const { _id, uid } = data;
		if (!_id) return { code: -1, msg: '缺少ID' };

		const dbName = 'hrm-attendance-leavebalance';
		const nowTime = Date.now();

		// 1. 查询原记录
		const oldRes = await vk.baseDao.findById({ dbName, id: _id });
		if (!oldRes) return { code: -1, msg: '记录不存在' };

		// 2. 删除记录
		await vk.baseDao.deleteById({ dbName, id: _id });

		// 3. 写入额度日志
		const oldRemain = (oldRes.total_minutes || 0) - (oldRes.used_minutes || 0);
		await vk.baseDao.add({
			dbName: 'hrm-attendance-balancelog',
			dataJson: {
				employee_id: oldRes.employee_id,
				leave_type_id: oldRes.leave_type_id,
				year: oldRes.year,
				change_type: 6,  // 清零
				change_amount: -oldRemain,
				before_balance: oldRemain,
				after_balance: 0,
				ref_id: '',
				ref_type: 'manual',
				remark: 'HR删除额度记录',
				update_id: uid,
				update_date: nowTime
			}
		});

		return { code: 0, msg: '删除成功' };
	}
};