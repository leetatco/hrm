// admin/hrm/salary/sb/sys/update
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: 'ok' };

		const dbName = "hrm-salary-social-tax";

		let {
			_id,
			attendance_ym,
			employee_id,
			card,
			last_month_sb,
			last_month_dk,
			last_month_gjj,
			this_month_sb,
			this_month_dk,
			company_social,
			company_fund,			
			dkgs,
			comment
		} = data;

		if (!_id) {
			return { code: -1, msg: 'id不能为空' };
		}
		if (!attendance_ym) {
			return { code: -1, msg: '考勤日期不能为空' };
		}
		if (!card) {
			return { code: -1, msg: '身份证号码不能为空' };
		}

		// 重复校验：排除自身
		const checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: {
				_id: _.neq(_id),
				attendance_ym,
				card
			}
		});
		if (checkRes) {
			return {
				code: -1,
				msg: `该员工【${card}】在【${attendance_ym}】已有记录`
			};
		}

		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: {
				attendance_ym,
				employee_id: employee_id || '',
				card,
				last_month_sb: last_month_sb || 0,
				last_month_dk: last_month_dk || 0,
				last_month_gjj: last_month_gjj || 0,
				this_month_sb: this_month_sb || 0,
				this_month_dk: this_month_dk || 0,
				company_social: company_social || 0,
				company_fund: company_fund || 0,				
				dkgs: dkgs || 0,
				comment: comment || '',
				update_id: uid,
				update_date: Date.now()
			}
		});

		return res;
	}
};