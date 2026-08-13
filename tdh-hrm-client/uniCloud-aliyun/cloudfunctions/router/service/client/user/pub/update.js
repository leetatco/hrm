'use strict';
module.exports = {
	/**
	 * XXXnameXXX
	 * @url client/user/pub/update 前端调用的url参数地址
	 * data 请求参数
	 * @param {String} params1  参数1
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
			_,
			$
		} = util;
		let {
			uid
		} = data;
		let res = {
			code: 0,
			msg: ""
		};
		// 业务逻辑开始-----------------------------------------------------------
		let {
			_id,
			wx_openid
		} = data;
		if (vk.pubfn.isNull(_id)) return {
			code: -1,
			msg: "_id不能为空"
		};

		let dbName = "uni-id-users";
		
		// 执行数据库API请求
		res.num = await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: {
				wx_openid
			},
		});
		return res;
	}
}