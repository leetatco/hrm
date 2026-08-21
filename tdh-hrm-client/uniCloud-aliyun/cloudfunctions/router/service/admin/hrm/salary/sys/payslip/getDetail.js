module.exports = {
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
			uid, // 当前用户ID（由前端传入）
			card, // 员工编号（可能与uid不同，按实际业务调整）
			status,
			_id
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		const dbName = "hrm-salary-payslip";

		// 并发执行：主查询 + 历史签名查询
		const [listResult, lastSignature] = await Promise.all([
			// 1. 主查询：分页获取工资条列表（与原逻辑一致）
			vk.baseDao.getTableData({
				dbName,
				data,
				whereJson: {
					card,
					status,
					_id
				},
				sortArr: [{
						name: "attendance_ym",
						type: "asc"
					},
					{
						name: "_id",
						type: "asc"
					}
				],
				foreignDB: [{
					dbName: "uni-id-users",
					localKey: "update_id",
					foreignKey: "_id",
					as: "users",
					limit: 1
				}]
			}),

			// 2. 附加查询：获取该员工最新的一条有签名的历史记录（仅取 signature_url）
			(async () => {
				const queryKey = card;
				if (!queryKey) return null;

				// 查询该员工所有有签名的记录，按月份倒序取第一条
				const historyRes = await vk.baseDao.getTableData({
					dbName,
					whereJson: {
						// 根据实际字段调整：可能用 card，也可能用 uid
						card: queryKey,
						status: 1,
						signature_url: _.neq('') // 只取非空签名
					},
					sortArr: [{
						name: "attendance_ym",
						type: "desc"
					}],
					limit: 1,
					getCount: false, // 不需要总数
					// 只返回 signature_url 字段，减少数据传输
					field: ['signature_url']
				});

				if (historyRes.rows && historyRes.total > 0) {
					return historyRes.rows[0].signature_url;
				}
				return null;
			})()
		]);

		// 将主查询结果赋值给 res
		res = listResult;

		// 附加历史签名到返回结果（可放在 extra 中，或直接挂在顶层）
		res.extra = {
			lastSignatureUrl: lastSignature || ''
		};

		return res;
	}
};