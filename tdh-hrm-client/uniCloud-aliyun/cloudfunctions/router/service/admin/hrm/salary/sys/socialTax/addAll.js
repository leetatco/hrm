// admin/hrm/salary/sb/sys/addAll
module.exports = {
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let {
			vk,
			_
		} = util;
		let {
			uid
		} = data;
		let res = {
			code: 0,
			msg: 'ok'
		};

		const dbName = "hrm-salary-social-tax";
		let {
			items = []
		} = data;

		if (items.length === 0) {
			return {
				code: -1,
				msg: '导入数据不能为空'
			};
		}

		const nowTime = Date.now();
		const addList = items.map(item => ({
			attendance_ym: item.attendance_ym,
			employee_id: item.employee_id || '',
			card: item.card,
			last_month_sb: item.last_month_sb || 0,
			last_month_dk: item.last_month_dk || 0,
			last_month_gjj: item.last_month_gjj || 0,
			this_month_sb: item.this_month_sb || 0,
			this_month_dk: item.this_month_dk || 0,
			company_social: item.company_social || 0,
			company_fund: item.company_fund || 0,
			dkgs: item.dkgs || 0,
			comment: item.comment || '',
			update_id: uid,
			update_date: nowTime
		}));

		// 分批写入，避免单次过大
		const BATCH_SIZE = 500;
		const ids = [];
		for (let i = 0; i < addList.length; i += BATCH_SIZE) {
			const batch = addList.slice(i, i + BATCH_SIZE);
			const result = await vk.baseDao.adds({
				dbName,
				dataJson: batch
			});
			if (result && result.ids) ids.push(...result.ids);
		}

		res.id = ids;
		res.msg = `成功导入 ${addList.length} 条`;
		return res;
	}
};