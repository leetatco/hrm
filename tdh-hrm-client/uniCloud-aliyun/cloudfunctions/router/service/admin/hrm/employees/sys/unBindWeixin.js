module.exports = {
	/**
	 * 为用户解绑微信
	 * @url admin/hrm/employees/sys/unBindWeixin 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} item 		userInfo
	 * @param {String} provider		wx
	 * @param {String} providerName 微信
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
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
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let {
			item,
			provider,
			providerName,
			appid, // 注意：如果不传appid，则解绑所有
		} = data;

		// 参数非空检测
		let nullKey = vk.pubfn.isNullOneByObject({
			item,
			provider
		});
		if (nullKey) return {
			code: -1,
			msg: '参数 ' + nullKey + ' 不能为空'
		};

		// 如果账户没有绑定手机号或没有设置用户名则不允许解绑（因为解绑后会造成无法登录）
		if (vk.pubfn.isNullAll(item.mobile, item.username)) {
			return {
				code: -1,
				msg: `为了您的账号安全，请绑定手机号后再解绑${providerName}`
			};
		}		

		// 判断当前登录用户是否已经绑定过
		if (!item[`${provider}_openid`]) {			
			return {
				code: 1,
				msg: `当前账号未绑定${providerName}，无需解绑`
			};
		}

		// 定义openid和unionid存在item的哪个字段中
		let fieldInfo = {};
		if (!appid || Object.keys(item[`${provider}_openid`]).length <= 2) {
			fieldInfo = {
				[`${provider}_openid`]: _.remove(),
				[`${provider}_unionid`]: _.remove()
			};
		} else {
			// 找到对应appid的key
			let key = Object.keys(item[`${provider}_openid`]).find((item) => {
				return item.indexOf(appid) > -1;
			});
			fieldInfo = {
				[`${provider}_openid.${key}`]: _.remove()
			};
		}

		let num = await vk.daoCenter.userDao.updateById({
			id: item._id,
			dataJson: fieldInfo
		});

		res.msg = num > 0 ? "解绑成功" : "解绑失败";

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

}