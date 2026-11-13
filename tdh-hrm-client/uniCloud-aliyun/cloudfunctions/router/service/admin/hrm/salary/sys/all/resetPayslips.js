'use strict';
module.exports = {
	/**
	 * XXXnameXXX
	 * @url admin/hrm/salary/sys/all/resetPayslips 前端调用的url参数地址
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
			attendance_ym,
			cards = []
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		if (!attendance_ym || cards.length === 0) return {
			code: -1,
			msg: '参数错误'
		};

		await vk.baseDao.del({
			dbName: 'hrm-salary-payslip',
			whereJson: {
				attendance_ym,
				card: _.in(cards),
				status: 0
			},
		});

		res.msg = '重置成功';
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	},
};