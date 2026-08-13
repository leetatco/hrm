const HrmService = require('../../../common/pub/class/hrm-service.js');
module.exports = {
	/**
	 * XXXnameXXX
	 * @url client/user/pub/isUser 前端调用的url参数地址
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
			uid,
			wx_openid,
			mobile,
			username
		} = data;
		let res = {
			code: 0,
			msg: ""
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "uni-id-users"; // 表名		
		res = await vk.baseDao.selects({
			dbName,
			whereJson: _.or([{
				'wx_openid.mp-weixin': wx_openid ? wx_openid : 'null'
			}, {
				mobile: mobile ? mobile : 'null'
			}, {
				username: username ? username : 'null'
			}])
		});
		
		console.log(res.rows)

		if (res.code == 0 && res.total > 0) {
			const hrmService = new HrmService(vk, db);
			const employeeInfo = await hrmService.getEmployeeInfoByUsername(res.rows[0].username);
			res.rows[0].employeeInfo = employeeInfo;
		}

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}