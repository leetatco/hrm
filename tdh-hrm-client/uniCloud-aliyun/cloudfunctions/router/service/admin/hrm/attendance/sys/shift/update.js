module.exports = {
	/**
	 * 更新班次
	 * @url admin/hrm/attendance/sys/shift/update
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
		let {
			uid
		} = data;
		let {
			_id,
			shift_name,
			shift_type,
			segments,
			company_id,
			department_id,
			status = true,
			remark
		} = data;

		if (!_id) return {
			code: -1,
			msg: '缺少ID'
		};
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

		let dbName = 'hrm-attendance-shift';
		await vk.baseDao.updateById({
			dbName,
			id: _id,
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