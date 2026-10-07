// admin/hrm/salary/sys/all/getCostAll
module.exports = {
	/**
	 * 批量获取费用数据（水电费、工衣费、人事费用）
	 * @url admin/hrm/salary/sys/all/getCostAll
	 * data: { cards: [], attendance_ym: '2026-08' }
	 */
	main: async (event) => {
		let {
			data = {}, userInfo, util, filterResponse, originalParam
		} = event;
		let {
			customUtil,
			uniID,
			config,
			pubFun,
			vk,
			db,
			_,
			$
		} = util;
		let {
			uid,
			cards,           // ★ 改成数组
			attendance_ym    // ★ 单个月份
		} = data;

		let res = {
			code: 0,
			msg: 'success',
			data: {
				we: [],
				clothes: [],
				cost: []
			}
		};

		// 参数处理
		const cardList = Array.isArray(cards) ? cards : (cards ? [cards] : []);
		const attendanceYmList = Array.isArray(attendance_ym) ? attendance_ym : (attendance_ym ? [attendance_ym] : []);

		if (cardList.length === 0) {
			return res;
		}
		if (attendanceYmList.length === 0) {
			res.code = -1;
			res.msg = 'attendance_ym 参数不能为空';
			return res;
		}

		try {
			// ========== 1. 查询水电费 ==========
			// 水电费表里 cards 是数组（一条记录可关联多个员工），需要按员工分摊
			const weRes = await vk.baseDao.getTableData({
				dbName: "hrm-salary-we",
				data: {
					pageIndex: 1,
					pageSize: -1
				},
				whereJson: {
					// cards 数组字段包含其中任意一个员工
					cards: _.in(cardList),
					attendance_ym: _.in(attendanceYmList)
				}
			});

			if (weRes.code === 0 && weRes.rows && weRes.rows.length > 0) {
				// 按员工 + 月份分组，累加分摊金额
				const groupedWe = {};

				weRes.rows.forEach(record => {
					const recordCards = record.cards || [];
					const ym = record.attendance_ym;
					const shareCostPerPerson = record.share_cost || 0;

					// 该记录涉及的所有员工
					recordCards.forEach(c => {
						// 只处理请求参数里的员工
						if (!cardList.includes(c)) return;

						const key = `${c}_${ym}`;
						if (!groupedWe[key]) {
							groupedWe[key] = {
								card: c,
								attendance_ym: ym,
								share_cost: 0
							};
						}
						groupedWe[key].share_cost += shareCostPerPerson;
					});
				});

				res.data.we = Object.values(groupedWe);
			}

			// ========== 2. 查询工衣费 ==========
			const clothesRes = await vk.baseDao.getTableData({
				dbName: "hrm-salary-clothes",
				data: {
					pageIndex: 1,
					pageSize: -1
				},
				whereJson: {
					card: _.in(cardList),
					attendance_ym: _.in(attendanceYmList)
				},
				foreignDB: [{
					dbName: "uni-id-users",
					localKey: "update_id",
					foreignKey: "_id",
					as: "users",
					limit: 1
				}]
			});

			if (clothesRes.code === 0) {
				res.data.clothes = clothesRes.rows || [];
			}

			// ========== 3. 查询人事费用 ==========
			const costRes = await vk.baseDao.getTableData({
				dbName: "hrm-salary-cost",
				data: {
					pageIndex: 1,
					pageSize: -1
				},
				whereJson: {
					card: _.in(cardList),
					attendance_ym: _.in(attendanceYmList)
				},
				foreignDB: [{
					dbName: "uni-id-users",
					localKey: "update_id",
					foreignKey: "_id",
					as: "users",
					limit: 1
				}]
			});

			if (costRes.code === 0) {
				res.data.cost = costRes.rows || [];
			}

		} catch (error) {
			console.error('批量查询费用数据失败:', error);
			res.code = -2;
			res.msg = '查询失败: ' + error.message;
		}

		return res;
	}
};