module.exports = {
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db } = util;
		let res = { code: 0, msg: 'ok' };

		let {
			uid,
			_id,
			single_punch_rule = 1,
			late_early_coexist_rule = 1,
			out_office_cancel_absence = true,
			out_office_cancel_late = false,
			out_office_cancel_early = false,
			overtime_cancel_early = false,			
			status = true,
			remark
		} = data;

		if (!_id) return { code: -1, msg: '缺少ID' };

		await vk.baseDao.updateById({
			dbName: 'hrm-attendance-abnormalrule',
			id: _id,
			dataJson: {
				single_punch_rule,
				late_early_coexist_rule,
				out_office_cancel_absence,
				out_office_cancel_late,
				out_office_cancel_early,
				overtime_cancel_early,				
				status,
				remark,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});

		return res;
	}
};