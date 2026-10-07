// admin/hrm/salary/sb/sys/deleteAll
module.exports = {
	main: async (event) => {
		let { data = {}, util } = event;
		let { vk } = util;
		let res = { code: 0, msg: 'ok' };

		const dbName = "hrm-salary-social-tax";
		let { attendance_ym } = data;

		if (!attendance_ym) {
			return { code: -1, msg: '考勤日期不能为空' };
		}

		const countRes = await vk.baseDao.count({
			dbName,
			whereJson: { attendance_ym }
		});

		if (countRes === 0) {
			return { code: 0, msg: '没有需要删除的数据' };
		}

		await vk.baseDao.del({
			dbName,
			whereJson: { attendance_ym }
		});

		res.msg = `已删除 ${countRes} 条 ${attendance_ym} 的数据`;
		return res;
	}
};