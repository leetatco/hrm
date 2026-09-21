module.exports = {
	/**
	 * 添加单条工作日历数据
	 * @url admin/hrm/attendance/sys/calendar/add
	 */
	main: async (event) => {
		let {
			data = {}, userInfo, util
		} = event;
		let {
			vk, db, _
		} = util;
		let { uid } = data;
		let res = {
			code: 0,
			msg: 'ok'
		};

		// 获取参数
		let {
			calendar_name,
			calendar_date,
			date_type,
			year,
			name,
			is_default = false,
			remark
		} = data;

		// 参数验证
		if (!calendar_name) {
			return { code: -1, msg: '工作日历名称不能为空' };
		}
		if (!calendar_date) {
			return { code: -1, msg: '日期不能为空' };
		}
		if (!date_type) {
			return { code: -1, msg: '日期类型不能为空' };
		}
		if (!year && calendar_date) {
			year = new Date(calendar_date).getFullYear();
		}
		if (!year) {
			return { code: -1, msg: '年份不能为空' };
		}

		const dbName = 'hrm-attendance-calendar';
		const calendar_code = `${calendar_name}_${year}`;

		// 重复校验：同一日历（calendar_name + year）下同一天不允许重复
		let repeatCount = await vk.baseDao.count({
			dbName,
			whereJson: {
				calendar_name,
				year,
				calendar_date
			}
		});
		if (repeatCount > 0) {
			return {
				code: -1,
				msg: `该工作日历【${calendar_name}（${year}）】中，日期【${calendar_date}】已存在，请勿重复添加`
			};
		}

		// 写入数据
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				calendar_name,
				calendar_code,
				calendar_date,
				date_type,
				year,
				name,
				is_default,
				remark,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});

		return res;
	}
};