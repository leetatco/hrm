module.exports = {
	main: async (event) => {
		let { data = {}, userInfo, util } = event;
		let { vk, db, _ } = util;
		let { _id, pageIndex, pageSize } = data;

		// 1. 读取调休规则，判断是否仅限当月
		const ruleRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-comprule',
			whereJson: { status: true },
			limit: 1
		});
		const rule = ruleRes.rows[0] || {};
		const sameMonthOnly = rule.same_month_only === true;

		// 2. 基础查询条件
		let whereJson = {
			form_type_code: 'OVERTIME_APPLICATION',
			status: 'approved'
		};
		if (_id) whereJson._id = _id;
		whereJson.applicant_id = userInfo.username;

		// 3. 若规则要求同月，只查询本月加班单
		if (sameMonthOnly) {
			const now = new Date();
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
			const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

			// 注意：这里过滤的是加班记录的日期，需要通过关联表或聚合实现
			// 由于加班日期存在 overtime_record 表，而 application-form 表单存的是 form_data.items
			// 这里简化处理：先查本月所有加班记录，拿到 overtime_id 列表
			const overtimeRecordsRes = await vk.baseDao.selects({
				dbName: 'hrm-attendance-overtimerecord',
				whereJson: {
					employee_id: userInfo.username,
					overtime_type: 'compensatory',
					import_status: 1,
					overtime_date: db.command.gte(startOfMonth).and(db.command.lte(endOfMonth))
				},
				fieldJson: { oa_instance_id: true }
			});
			const validOaIds = overtimeRecordsRes.rows.map(r => r.oa_instance_id);

			if (validOaIds.length === 0) {
				// 本月没有可调休的加班单
				return { code: 0, rows: [], total: 0 };
			}
			whereJson._id = db.command.in(validOaIds);
		}

		// 4. 查询符合条件的加班申请
		let res = await vk.baseDao.getTableData({
			dbName: 'bpmn-application-form',
			data: { pageIndex, pageSize },
			whereJson,
			orderBy: { '_add_time': 'desc' }
		});

		// 5. 计算剩余可调休时长
		if (res.code === 0 && res.total > 0) {
			const overtimeIds = res.rows.map(item => item._id);
			const compensatoryList = await db.collection('bpmn-application-form')
				.where({
					form_type_code: 'COMPENSATORY_APPLICATION',
					status: _.in(['approved', 'pending']),
					'form_data.items': db.command.elemMatch({
						overtime_id: db.command.in(overtimeIds)
					})
				})
				.get();

			const usedMap = {};
			compensatoryList.data.forEach(comp => {
				const items = comp.form_data?.items || [];
				items.forEach(item => {
					const oid = item.overtime_id;
					const deduct = parseFloat(item.deduct_minutes) || 0;
					usedMap[oid] = (usedMap[oid] || 0) + deduct;
				});
			});

			const finalRows = [];
			for (const item of res.rows) {
				const overtimeType = item.form_data?.overtime_type || item.calculated_values?.overtime_type;
				if (overtimeType !== 'compensatory') continue;

				const total = parseFloat(item.form_data?.total_minutes ||
					item.calculated_values?.total_minutes || 0);
				if (total <= 0) continue;

				const used = usedMap[item._id] || 0;
				const remaining = Math.max(0, total - used);
				if (remaining <= 0) continue;

				finalRows.push({
					...item,
					remaining_minutes: remaining
				});
			}
			res.rows = finalRows;
			res.total = finalRows.length;
		}
		return res;
	}
};