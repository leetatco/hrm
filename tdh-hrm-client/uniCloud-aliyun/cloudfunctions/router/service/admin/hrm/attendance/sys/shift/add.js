module.exports = {
	/**
	 * 添加班次
	 * @url admin/hrm/attendance/sys/shift/add
	 */
	main: async (event) => {
		let {
			data = {}, userInfo, util
		} = event;
		let {
			vk,
			db
		} = util;
		let res = {
			code: 0,
			msg: 'ok'
		};

		// 获取前端传参
		let {
			uid,
			shift_name,
			shift_type,
			segments,
			company_id,
			department_id,
			status = true,
			remark
		} = data;

		// 参数验证
		if (!shift_name || !shift_type) {
			return {
				code: -1,
				msg: '班次名称和类型不能为空'
			};
		}
		if (!Array.isArray(segments) || segments.length === 0) {
			return {
				code: -1,
				msg: '至少需要一个班次时段'
			};
		}
		for (let seg of segments) {
			if (!seg.name || !seg.start_time || !seg.end_time) {
				return {
					code: -1,
					msg: '时段信息不完整'
				};
			}
		}

		// 写入数据库
		let dbName = 'hrm-attendance-shift';
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				shift_name,
				shift_type,
				segments,
				company_id,
				department_id,
				status,
				remark,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});

		return res;
	}
};