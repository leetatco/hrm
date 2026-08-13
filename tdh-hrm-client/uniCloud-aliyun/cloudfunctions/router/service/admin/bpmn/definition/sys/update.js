module.exports = {
	/**
	 * 修改数据
	 * @url admin/bpmn/definition/sys/update 前端调用的url参数地址
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
			ids = [],
			name,
			key,
			version,
			description,
			nodes,
			category_id,
			status,
			tags,
			update_date,
			updat_id
		} = data;
		
		// 参数验证开始		
		if (vk.pubfn.isNull(_id) && vk.pubfn.isNull(ids)) return {
			code: -1,
			msg: 'id不能为空'
		};
		
		// 检查原状态
		const oldDef = await vk.baseDao.findById({ dbName: "bpmn-definition", id: _id });
		if (oldDef && oldDef.status === 'active' && data.status !== 'inactive') {
		    return { code: -1, msg: '已发布的流程无法直接修改，请先停用或创建新版本草稿' };
		}


		// 参数验证结束
		let dbName = "bpmn-definition"; // 表名
		// 执行 数据库 updateById 命令
		if (vk.pubfn.isNotNull(ids)) {
			await vk.baseDao.update({
				dbName,
				whereJson: {
					id: _.in(ids)
				},
				dataJson: {
					name,
					key,
					version,
					description,
					nodes,
					category_id,
					status,
					tags,
					update_id: uid,
					update_date: new Date().getTime()
				}
			});
			return res;
		}
		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: {
				name,
				key,
				version,
				description,
				nodes,
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