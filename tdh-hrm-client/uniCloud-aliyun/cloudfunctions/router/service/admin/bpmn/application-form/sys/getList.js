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
			id
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "bpmn-application-form";

		// 构建查询条件		
		let whereJson = {};
		// 权限控制：普通用户只能查看自己的申请
		const userRole = userInfo.role || [];
		const isAdmin = userRole.includes('admin');
		const isManager = userRole.includes('manager');
		const isExportExcel = userRole.includes('OA-exportExcel')

		if (!isAdmin && !isManager && !isExportExcel) {
			whereJson.applicant_id = userInfo.username;
		}

		if (id) {
			whereJson._id = id;
		}

		// 处理前端传递的查询条件
		// let startTime = 0;
		// let endTime = 0;

		// if (data.formData) {
		// 	// 表单类型筛选
		// 	if (data.formData.form_type_code) {
		// 		queryConditions.form_type_code = data.formData.form_type_code;
		// 	}

		// 	// 状态筛选
		// 	if (data.formData.status && data.formData.status !== 'all') {
		// 		queryConditions.status = data.formData.status;
		// 	}

		// 	// 关键词搜索
		// 	if (data.formData.keyword) {
		// 		queryConditions.title = new RegExp(data.formData.keyword, 'i');
		// 	}

		// 	// 时间范围筛选		
		// 	if (data.formData.dateRange && data.formData.dateRange.length === 2) {
		// 		startTime = data.formData.dateRange[0];
		// 		endTime = data.formData.dateRange[1];
		// 		whereJson["_add_time"] = _.gte(startTime).lte(endTime);
		// 	}
		// }

		// console.log(queryConditions, whereJson);
		// 使用vk.baseDao.getTableData进行分页查询
		// 为何加上whereJson是为了查詢建立日期，如果不加条件无效
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson
			// data: {
			// 	...data,
			// 	// 覆盖查询条件
			// 	// formData: queryConditions,
			// },
			// whereJson: whereJson
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