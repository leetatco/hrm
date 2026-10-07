// admin/hrm/attendance/sys/monthlyAttendance/update
module.exports = {
	/**
	 * 修改月度汇总记录（主要用于编辑签单状态）
	 * @url admin/hrm/attendance/sys/monthlyAttendance/update
	 * data: { _id, sign_status }
	 */
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, _ } = util;
		const { _id, sign_status, uid } = data;

		if (!_id) {
			return { code: -1, msg: 'id不能为空' };
		}

		// 签单状态校验：只允许 0（未签）或 1（已签）
		if (sign_status !== 0 && sign_status !== 1) {
			return { code: -1, msg: '签单状态不合法' };
		}

		const dbName = 'hrm-attendance-monthly';	

		const updateJson = {
			sign_status,
			update_id: uid,
			update_date: Date.now()
		};

		// 改为已签时，如果之前没有签单日期，补一个
		if (sign_status === 1 && !existRes.sign_date) {
			updateJson.sign_date = Date.now();
		}

		// 改回未签时，清空签单日期（可选，按业务需要）
		if (sign_status === 0) {
			updateJson.sign_date = null;
		}

		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: updateJson
		});

		return {
			code: 0,
			msg: '保存成功'
		};
	}
};