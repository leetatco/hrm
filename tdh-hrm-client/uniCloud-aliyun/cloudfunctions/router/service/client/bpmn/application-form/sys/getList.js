// cloudfunctions/admin/bpmn/application-form/sys/getList.js
module.exports = {
	/**
	 * 查询签核申请列表 分页
	 * @url admin/bpmn/application-form/sys/getList 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {Number}         pageIndex 当前页码
	 * @params {Number}         pageSize  每页显示数量
	 * @params {Array<Object>}  sortRule  排序规则
	 * @params {object}         formData  查询条件数据源
	 * @params {Array<Object>}  columns   查询条件规则
	 * res 返回参数说明
	 * @params {Number}         code      错误码，0表示成功
	 * @params {String}         msg       详细信息
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
			uid,
			form_type_code,
			status
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "bpmn-application-form";

		// 构建查询条件		
		let whereJson = {};
		if (form_type_code) {
			whereJson.form_type_code = form_type_code;
		}
		if (status) {
			whereJson.status = status;
		}
		// 权限控制：普通用户只能查看自己的申请
		const userRole = userInfo.role || [];
		const isAdmin = userRole.includes('admin');
		const isManager = userRole.includes('manager');

		if (!isAdmin && !isManager) {
			whereJson.applicant_id = userInfo.username;
		}
		
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson
		});

		// 关联任务信息
		if (res.code === 0 && res.rows && res.rows.length > 0) {
			const applications = res.rows;
			const applicationIds = applications.map(app => app._id);

			// 查询相关任务
			const tasksRes = await db.collection('bpmn-task')
				.where({
					application_id: db.command.in(applicationIds),
					status: 'pending'
				})
				.get();

			const taskMap = {};
			tasksRes.data.forEach(task => {
				if (!taskMap[task.application_id]) {
					taskMap[task.application_id] = [];
				}
				taskMap[task.application_id].push(task);
			});

			// 合并任务信息到返回数据
			res.rows = applications.map(app => ({
				...app,
				current_tasks: taskMap[app._id] || []
			}));
		}

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}