// admin/hrm/salary/sys/all/getLateRule
module.exports = {
	/**
	 * 获取迟到/未打卡规则（全局唯一）
	 * @url admin/hrm/salary/sys/all/getLateRule
	 */
	main: async (event) => {
		const { util } = event;
		const { vk } = util;

		const res = await vk.baseDao.select({
			dbName: 'hrm-salary-lateclock',   // 按实际表名调整
			pageSize: 1
		});

		return {
			code: 0,
			msg: 'ok',
			data: res.rows[0] || null
		};
	}
};