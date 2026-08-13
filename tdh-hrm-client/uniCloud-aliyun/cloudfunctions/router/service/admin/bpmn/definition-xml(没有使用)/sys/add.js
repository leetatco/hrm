module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/bpmn/definition/sys/add 前端调用的url参数地址
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
			name,
			key,
			version = 1,
			xml,
			description,
			category_id,
			status = "draft",
			tags,
			update_date,
			updat_id
		} = data;
		let dbName = "bpmn-definition"; // 表名
		// 参数验证开始
		let checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: _.or([{
					name
				},
				{
					key
				}
			])
		});
		if (checkRes) {
			return {
				code: -1,
				msg: "流程KEY或名称重复"
			}
		}

		// 参数验证结束		
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				name,
				key,
				version,
				xml,
				description,
				category_id,
				status,
				tags,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}