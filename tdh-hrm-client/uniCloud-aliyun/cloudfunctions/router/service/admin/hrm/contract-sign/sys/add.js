const HrmService = require('../../../../common/pub/class/hrm-service.js');
module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/contract-sign/sys/add 前端调用的url参数地址
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
			contract_sign_id,
			card,
			sign_date,
			end_date,
			contract_sign_file,
			signature_url,
			sign_time,
			status = 4,
			update_date,
			updat_id
		} = data;

		const hrmService = new HrmService(vk, db);
		// 在业务流程中获取 company_id（自动走缓存）
		const companyId = await hrmService.getCompanyIdByKeyWithCache(card);

		let dbName = 'hrm-contract-sign'; // 表名
		// 参数验证开始
		let checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: _.and([{
					card
				},
				{
					contract_sign_id
				}
			])
		});
		if (checkRes) {
			return {
				code: -1,
				msg: "合同重复"
			}
		}

		// 参数验证结束		
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				company_id: companyId,
				contract_sign_id,
				card,
				sign_date,
				end_date,
				contract_sign_file,
				signature_url,
				sign_time,
				status,
				update_id: uid,
				update_date: new Date().getTime()
			},
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	},
};