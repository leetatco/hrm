module.exports = {
	/**
	 * 批量修改数据（每条记录按自己的 _id 更新）
	 * @url admin/hrm/attendance/sys/all/updateAll
	 * data: { items: [{ _id, ...其他字段 }] }
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
			_
		} = util;
		let {
			uid
		} = data;
		let res = {
			code: 0,
			msg: 'ok'
		};
		let dbName = "hrm-salary-payslip";

		// 业务逻辑开始-----------------------------------------------------------
		let {
			cards = [],
				items = []
		} = data;

		// 参数验证
		if (!items || !Array.isArray(items) || items.length === 0) {
			return {
				code: -1,
				msg: 'items参数必须是有效的非空数组'
			};
		}


		const employeeCompanyMap = {};
		if (cards.length > 0) {
			const batchSize = 500;
			for (let i = 0; i < cards.length; i += batchSize) {
				const batchIds = cards.slice(i, i + batchSize);
				const empRes = await vk.baseDao.select({
					dbName: 'hrm-employees',
					whereJson: {
						card: _.in(batchIds)
					},
					fieldJson: {
						card: 1,
						company_id: 1
					},
					pageSize: batchSize
				});
				(empRes.rows || []).forEach(emp => {
					employeeCompanyMap[emp.card] = emp.company_id || '';
				});
			}
		}

		const nowTime = new Date().getTime();

		// 构造要更新的数据
		const tasks = items.map(item => {
			const updateData = {
				...item,
				company_id: employeeCompanyMap[item.card],
				update_id: uid,
				update_date: nowTime
			};
			delete updateData._id;
			return {
				_id: item._id,
				updateData
			};
		});

		// ★ 并发 + 分批处理
		const BATCH_SIZE = 200; // 每批 50 条并发
		let successCount = 0;
		const errors = [];

		for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
			const batch = tasks.slice(i, i + BATCH_SIZE);

			const results = await Promise.all(
				batch.map(task =>
					vk.baseDao.updateById({
						dbName,
						id: task._id,
						dataJson: task.updateData
					}).then(() => ({
						success: true,
						_id: task._id
					})).catch(err => ({
						success: false,
						item: task,
						error: err.message
					}))
				)
			);

			results.forEach(r => {
				if (r.success) {
					successCount++;
				} else {
					errors.push({
						item: r.item,
						error: r.error
					});
				}
			});
		}

		res.msg = `成功更新 ${successCount} 条，失败 ${errors.length} 条`;
		if (errors.length > 0) {
			res.errors = errors;
		}
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
};