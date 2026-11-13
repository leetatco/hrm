const HrmService = require('../../../../../common/pub/class/hrm-service.js');
module.exports = {
	main: async (event) => {
		const {
			data = {}, userInfo, util
		} = event;
		const {
			vk,
			db,
			_
		} = util;

		const {
			uid,
			_id,
			employee_id,
			leave_type_id,
			year,
			total_minutes,
			used_minutes,
			adjust_reason = '',
			status,
			remark
		} = data;

		if (!_id) return {
			code: -1,
			msg: '缺少ID'
		};

		const dbName = 'hrm-attendance-leavebalance';
		const nowTime = Date.now();

		const existRes = await vk.baseDao.selects({
			dbName,
			whereJson: {
				employee_id,
				leave_type_id,
				year,
				_id: _.neq(_id)
			},
			limit: 1
		});

		if (existRes.rows.length > 0) {
			return {
				code: -1,
				msg: '该员工该年度该假期类型额度已存在，请勿重复添加'
			};
		}

		// 1. 查询原记录
		const oldRes = await vk.baseDao.findById({
			dbName,
			id: _id
		});
		if (!oldRes) return {
			code: -1,
			msg: '记录不存在'
		};

		// 2. 计算变动
		const oldTotal = oldRes.total_minutes || 0;
		const newTotal = total_minutes ?? oldTotal;
		const oldRemain = oldTotal - (oldRes.used_minutes || 0);
		const newRemain = newTotal - (used_minutes ?? oldRes.used_minutes ?? 0);
		const changeAmount = newTotal - oldTotal;

		const hrmService = new HrmService(vk, db);
		// 在业务流程中获取 company_id（自动走缓存）
		const companyId = await hrmService.getCompanyIdByKeyWithCache(employee_id);

		// 3. 更新额度
		const updateData = {
			company_id: companyId,
			employee_id,
			leave_type_id,
			year,
			total_minutes: newTotal,
			used_minutes: used_minutes ?? oldRes.used_minutes,
			adjust_reason,
			status: status ?? oldRes.status,
			remark: remark ?? oldRes.remark,
			update_id: uid,
			update_date: nowTime
		};
		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: updateData
		});

		// 4. 写入额度日志（仅当总额度有变动时）
		if (changeAmount !== 0) {
			let changeType = 7; // 其他调整
			if (changeAmount > 0) changeType = 3; // 手工增加
			else changeType = 5; // 手工扣减

			await vk.baseDao.add({
				dbName: 'hrm-attendance-leavebalancelog',
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

		return {
			code: 0,
			msg: '更新成功'
		};
	}
};