// admin/hrm/salary/sys/all/getSocialTaxAll
module.exports = {
	/**
	 * 批量获取社保、公积金、个税（合并表）
	 * @url admin/hrm/salary/sys/all/getSocialTaxAll
	 * data: { cards: [], attendance_ym: '2026-08' }
	 */
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, _ } = util;
		const { cards = [], attendance_ym } = data;

		if (cards.length === 0 || !attendance_ym) {
			return { code: 0, rows: [] };
		}

		const res = await vk.baseDao.select({
			dbName: 'hrm-salary-social-tax',
			whereJson: {
				card: _.in(cards),
				attendance_ym: attendance_ym
			},
			pageSize: -1
		});

		return {
			code: 0,
			msg: 'ok',
			rows: res.rows || []
		};
	}
};