// cloudfunctions/admin/bpmn/application-form/sys/getListToCompensatory.js
module.exports = {
	main: async (event) => {
		let {
			data = {}, userInfo, util
		} = event;
		let {
			vk,
			db,
			_
		} = util;
		let {
			_id,
			pageIndex,
			pageSize
		} = data;

		// 基础查询条件
		let whereJson = {
			form_type_code: 'OVERTIME_APPLICATION',
			status: 'approved'
		};
		if (_id) whereJson._id = _id;

		// 权限控制：非管理员只能看自己的
		// const userRole = userInfo.role || [];
		// if (!userRole.includes('admin') && !userRole.includes('manager')) {
		// 	whereJson.applicant_id = userInfo.username;
		// }
		whereJson.applicant_id = userInfo.username;

		let res = await vk.baseDao.getTableData({
			dbName: 'bpmn-application-form',
			data: {
				pageIndex,
				pageSize
			},
			whereJson,
			orderBy: {
				'_add_time': 'desc'
			}
		});

		if (res.code === 0 && res.rows.length > 0) {
			const overtimeIds = res.rows.map(item => item._id);
			// 查询所有调休申请单（包括已审批通过和审批中的）
			const compensatoryList = await db.collection('bpmn-application-form')
				.where({
					form_type_code: 'COMPENSATORY_APPLICATION',
					status: _.in(['approved', 'pending']), // 增加审批中的状态
					'form_data.items': db.command.elemMatch({
						overtime_id: db.command.in(overtimeIds)
					})
				})
				.get();

			// 累加已使用（包括审批中和已通过的）
			const usedMap = {};
			compensatoryList.data.forEach(comp => {
				const items = comp.form_data?.items || [];
				items.forEach(item => {
					const oid = item.overtime_id;
					const deduct = parseFloat(item.deduct_hours) || 0;
					usedMap[oid] = (usedMap[oid] || 0) + deduct;
				});
			});

			// 过滤出可调休的加班单（overtime_type === 'compensatory' 且剩余时长 > 0）
			const finalRows = [];
			for (const item of res.rows) {
				// 检查加班类型
				const overtimeType = item.form_data?.overtime_type || item.calculated_values?.overtime_type;
				if (overtimeType !== 'compensatory') continue;

				// 获取总加班小时数
				const total = parseFloat(item.form_data?.overtime_total_hours ||
					item.calculated_values?.total_hours || 0);
				if (total <= 0) continue;

				const used = usedMap[item._id] || 0;
				const remaining = Math.max(0, total - used);
				if (remaining <= 0) continue;

				let remainingHours = remaining.toFixed(1);
				if (remainingHours.endsWith('.0')) remainingHours = remainingHours.slice(0, -2);
				finalRows.push({
					...item,
					remaining_hours: remainingHours
				});
			}
			res.rows = finalRows;
			res.total = finalRows.length;
		}
		return res;
	}
};