const HrmService = require('../../../../common/pub/class/hrm-service.js');
module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/clockin/sys/add 前端调用的url参数地址
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
			employee_id,
			bssid,
			position,
			type,
			remark,
			img,
			clockintime,
			update_date,
			updat_id
		} = data;

		// 参数验证开始	

		if (vk.pubfn.isNull(employee_id)) return {
			code: -1,
			msg: '工号不能为空'
		};
		// 参数验证结束		
		let dbName = 'hrm-clockin'; // 表名
		// 执行 数据库add 命令
		const hrmService = new HrmService(vk, db);
		// 在业务流程中获取 company_id（自动走缓存）
		const companyId = await hrmService.getCompanyIdByKeyWithCache(employee_id);
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				company_id: companyId,
				employee_id,
				bssid,
				position,
				type,
				remark,
				img,
				clockintime: new Date().getTime(),
				update_id: uid,
				update_date: new Date().getTime()
			},
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	},
};