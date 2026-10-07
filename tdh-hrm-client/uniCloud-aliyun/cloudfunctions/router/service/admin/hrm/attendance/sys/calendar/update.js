// admin/hrm/attendance/sys/calendar/update
module.exports = {
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, _ } = util;
		const { _id, calendar_name, calendar_date, year, date_type, name, is_default, remark, uid } = data;

		if (!_id) return { code: -1, msg: 'id不能为空' };

		const dbName = 'hrm-attendance-calendar';

		const existRes = await vk.baseDao.findById({ dbName, id: _id });
		if (!existRes) return { code: -1, msg: '记录不存在' };

		const newVersion = (existRes.version || 1) + 1;

		const calendar_code = existRes.calendar_code || `${calendar_name}_${year}`;

		// 重复校验
		const repeatCount = await vk.baseDao.count({
			dbName,
			whereJson: {
				_id: _.neq(_id),
				calendar_name,
				year,
				calendar_date
			}
		});
		if (repeatCount > 0) {
			return { code: -1, msg: `该工作日历【${calendar_name}（${year}）】中，日期【${calendar_date}】已存在` };
		}

		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: {
				calendar_name,
				calendar_code,
				calendar_date,
				date_type,
				year,
				name,
				is_default,
				remark,
				version: newVersion,
				update_id: uid,
				update_date: Date.now()
			}
		});

		return { code: 0, msg: '保存成功' };
	}
};