module.exports = {
	/**
	 * 修改数据
	 * @url admin/hrm/attendance/sys/all/updateAll 前端调用的url参数地址
	 * data 请求参数 说明
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
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
		let dbName = "hrm-attendance-approve"; // 表名
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			items = [],
				enable_hr,
				update_date,
				update_id
		} = data;
		// 参数验证开始				
		if (!items || !Array.isArray(items) || items.length === 0) {
			res.code = -1;
			res.msg = 'items参数必须是有效的非空数组';
			return res;
		}

		// 提取所有_id值
		let ids = items.map(item => item._id).filter(Boolean);

		if (ids.length === 0) {
			res.code = -1;
			res.msg = 'ids参数中的_id值不能为空';
			return res;
		}
		// 参数验证结束		
		// 执行 数据库 update 命令
		await vk.baseDao.update({
			dbName,
			whereJson: {
				_id: _.in(ids)
			},
			dataJson: {
				enable_hr,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

}