module.exports = {
	/**
	 * 修改数据
	 * @url admin/hrm/dorm/sys/update 前端调用的url参数地址
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
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			_id,
			dorm_id,
			dorm_rent,
			location,
			update_date,
			updat_id
		} = data;
		let dbName = "hrm-dorm"; // 表名
		// 参数验证开始
		if (vk.pubfn.isNull(_id)) return {
			code: -1,
			msg: 'id不能为空'
		};
		let checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: _.and([{
					dorm_id,
					location
				}
			])
		});
		if (checkRes) {
			if (_id !== checkRes._id)
				return {
					code: -1,
					msg: "房号重复",
					rows: checkRes
				}
		}

		// 参数验证结束
		
		// 执行 数据库 updateById 命令
		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: {
				dorm_id,
				dorm_rent,
				location,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

}