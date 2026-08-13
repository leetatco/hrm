const HrmService = require('../../../../common/pub/class/hrm-service.js');
module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/bpmn/bpmn-application-form/sys/add 前端调用的url参数地址
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
			form_type_code,
			process_definition_id,
			applicant_id,
			applicant_name,
			applicant_department,
			applicant_level,
			applicant_roles,
			title,
			form_data,
			calculated_values,
			status = "draft",
			current_task,
			update_date,
			updat_id
		} = data;
		// 参数验证开始

		const hrmService = new HrmService(vk, db);
		const employeeInfo = await hrmService.getEmployeeInfoByUsername(userInfo.username);

		// 创建申请记录			
		applicant_id = employeeInfo.employee_id;
		applicant_name = employeeInfo.employee_name;
		applicant_department = employeeInfo.department_name || '';
		applicant_level = employeeInfo.position_level || '';
		applicant_roles = userInfo.role || [];

		// 参数验证结束
		let dbName = "bpmn-application-form"; // 表名
		// 执行 数据库add 命令
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				form_type_code,
				process_definition_id,
				applicant_id,
				applicant_name,
				applicant_department,
				applicant_level,
				applicant_roles,
				title,
				form_data,
				calculated_values,
				status,
				current_task,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}