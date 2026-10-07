// admin/hrm/salary/sys/all/getOvertimeRate
module.exports = {
	/**
	 * 批量获取加班费单价
	 * @url admin/hrm/salary/sys/all/getOvertimeRate
	 * data: { cards: [] }
	 */
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, _ } = util;
		const { cards = [] } = data;

		if (cards.length === 0) {
			return { code: 0, rows: [] };
		}

		// 一次查出所有相关规则（员工自己的 + common）
		const whereJson = _.or([
			{ card: _.in(cards) },
			{ card: 'common' }
		]);

		const res = await vk.baseDao.select({
			dbName: 'hrm-salary-overtime',   // 按实际表名调整
			whereJson,
			pageSize: -1
		});

		return {
			code: 0,
			msg: 'ok',
			rows: res.rows || []
		};
	}
};