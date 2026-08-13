// cloudfunctions/admin/bpmn/task/sys/getList.js
module.exports = {
	/**
	 * 查询任务列表
	 * @url admin/bpmn/task/sys/getList 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {Number}         pageIndex 当前页码
	 * @params {Number}         pageSize  每页显示数量
	 * @params {Array<Object>}  sortRule  排序规则
	 * @params {object}         formData  查询条件数据源
	 * res 返回参数说明
	 * @params {Number}         code      错误码，0表示成功
	 * @params {String}         msg       详细信息
	 */
	main: async (event) => {
		let {
			data = {}, util, filterResponse, originalParam
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
			userInfo
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "bpmn-task";

		// 构建查询条件
		let queryConditions = {};

		// 处理前端传递的查询条件
		if (data.formData) {
			queryConditions = {
				...data.formData
			};

			// 处理特殊查询条件
			// 申请标题模糊查询
			// 这个条件会在后续关联查询时处理
			delete queryConditions.application_title;
			delete queryConditions.applicant_name;
			delete queryConditions.form_type_code;
			delete queryConditions.task_name;			

			// 时间范围查询
			if (vk.pubfn.isNotNull(queryConditions.create_time) && queryConditions.create_time.$range) {
				const [startTime, endTime] = queryConditions.create_time.$range;
				queryConditions.create_time = {
					$gte: new Date(startTime).getTime(),
					$lte: new Date(endTime).getTime()
				};
			}else{
				delete queryConditions.task_name;
			}
		}

		// 默认只查询待处理任务
		// if (vk.pubfn.isNull(queryConditions.status)) {
		// 	queryConditions.status = "pending";
		// }

		// 权限控制：如果不是管理员，只能查看自己的任务
		const userRole = userInfo.role || [];
		const isAdmin = userRole.includes('admin');

		// if (!isAdmin) {
		// 	// 用户可以查看分配给自己或自己是候选人的任务
		// 	queryConditions.$or = [{
		// 			assignee: userInfo.username
		// 		},
		// 		{
		// 			candidate_users: userInfo.username
		// 		},
		// 		{
		// 			candidate_groups: db.command.in(userRole)
		// 		}
		// 	];
		// }

		try {

			console.log("queryConditions:", queryConditions)

			// 第一步：查询任务数据
			let taskQuery = await db.collection(dbName).where(queryConditions);

			// 添加排序
			if (data.sortRule && data.sortRule.length > 0) {
				data.sortRule.forEach(sort => {
					taskQuery = taskQuery.orderBy(sort.key, sort.type || 'asc');
				});
			} else {
				// 默认按创建时间倒序
				taskQuery = taskQuery.orderBy('create_time', 'desc');
			}

			// 分页
			const pageIndex = data.pageIndex || 1;
			const pageSize = data.pageSize || 20;
			const skip = (pageIndex - 1) * pageSize;

			taskQuery = taskQuery.skip(skip).limit(pageSize);

			// 获取任务列表和总数
			const [tasksRes, totalRes] = await Promise.all([
				taskQuery.get(),
				db.collection(dbName).where(queryConditions).count()
			]);

			const tasks = tasksRes.data;

			if (tasks.length === 0) {
				return {
					code: 0,
					msg: '查询成功',
					rows: [],
					total: 0,
					pageIndex,
					pageSize
				};
			}

			// 第二步：关联申请信息
			const applicationIds = tasks.map(task => task.application_id).filter(id => id);

			if (applicationIds.length > 0) {
				// 构建申请查询条件
				let applicationQuery = db.collection('bpmn-application-form')
					.where({
						_id: db.command.in(applicationIds)
					});

				// 处理前端传递的申请相关查询条件
				if (data.formData) {
					// 申请标题模糊查询
					if (vk.pubfn.isNotNull(data.formData.application_title)) {
						applicationQuery = applicationQuery.where({
							title: new RegExp(data.formData.application_title, 'i')
						});
					}

					// 申请人模糊查询
					if (vk.pubfn.isNotNull(data.formData.applicant_name)) {
						applicationQuery = applicationQuery.where({
							applicant_name: new RegExp(data.formData.applicant_name, 'i')
						});
					}

					// 申请类型查询
					if (vk.pubfn.isNotNull(data.formData.form_type_code)) {
						applicationQuery = applicationQuery.where({
							form_type_code: data.formData.form_type_code
						});
					}
				}

				const applicationsRes = await applicationQuery.get();
				const applicationMap = {};
				applicationsRes.data.forEach(app => {
					applicationMap[app._id] = app;
				});

				// 第三步：关联表单类型信息
				const formTypeCodes = [...new Set(applicationsRes.data.map(app => app.form_type_code))];
				let formTypeMap = {};

				if (formTypeCodes.length > 0) {
					const formTypesRes = await db.collection('bpmn-form-type')
						.where({
							code: db.command.in(formTypeCodes),
							status: 'active'
						})
						.get();

					formTypesRes.data.forEach(type => {
						formTypeMap[type.code] = type;
					});
				}

				// 第四步：合并数据并过滤
				let filteredTasks = [];
				const mergedTasks = tasks.map(task => {
					const application = applicationMap[task.application_id];
					if (!application) {
						// 如果申请不存在，跳过这个任务
						return null;
					}

					const formType = formTypeMap[application.form_type_code];

					// 检查是否满足前端传递的申请相关查询条件
					if (data.formData) {
						// 申请标题模糊查询
						if (data.formData.application_title &&
							!application.title.includes(data.formData.application_title)) {
							return null;
						}

						// 申请人模糊查询
						if (data.formData.applicant_name &&
							!application.applicant_name.includes(data.formData.applicant_name)) {
							return null;
						}

						// 申请类型查询
						if (data.formData.form_type_code &&
							application.form_type_code !== data.formData.form_type_code) {
							return null;
						}
					}

					return {
						...task,
						// 关联申请信息
						application_title: application.title,
						applicant_name: application.applicant_name,
						applicant_department: application.applicant_department,
						form_type_code: application.form_type_code,
						form_type_name: formType ? formType.name : application.form_type_code,
						// 关联表单数据（只包含关键字段，避免数据过大）
						form_data: extractKeyFormData(application.form_data, formType),
						// 申请状态
						application_status: application.status,
						// 申请创建时间
						application_create_date: application.create_date
					};
				}).filter(task => task !== null); // 过滤掉不满足条件的任务

				filteredTasks = mergedTasks;

				// 如果因为申请查询条件过滤了任务，需要重新计算总数
				let finalTotal = totalRes.total;
				if (filteredTasks.length !== tasks.length) {
					// 重新查询满足条件的任务总数
					const finalApplicationIds = filteredTasks.map(task => task.application_id);
					if (finalApplicationIds.length > 0) {
						let finalTaskQuery = db.collection(dbName).where({
							...queryConditions,
							application_id: db.command.in(finalApplicationIds)
						});

						const finalTotalRes = await finalTaskQuery.count();
						finalTotal = finalTotalRes.total;
					} else {
						finalTotal = 0;
					}
				}

				res = {
					code: 0,
					msg: '查询成功',
					rows: filteredTasks,
					total: finalTotal,
					pageIndex,
					pageSize
				};
			} else {
				res = {
					code: 0,
					msg: '查询成功',
					rows: [],
					total: 0,
					pageIndex,
					pageSize
				};
			}

		} catch (error) {
			console.error('查询任务列表失败:', error);
			return {
				code: -1,
				msg: '查询失败: ' + error.message
			};
		}

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}

/**
 * 提取关键表单数据，避免返回过多数据
 */
function extractKeyFormData(formData, formType) {
	if (!formData) return {};

	// 如果表单类型有配置，根据配置提取关键字段
	if (formType && formType.form_schema && formType.form_schema.fields) {
		const keyFields = {};
		const schemaFields = formType.form_schema.fields;

		// 提取前5个字段或标记为重要的字段
		schemaFields.slice(0, 5).forEach(field => {
			const fieldName = field.name;
			if (formData[fieldName] !== undefined && formData[fieldName] !== null && formData[fieldName] !==
				'') {
				keyFields[fieldName] = formData[fieldName];
			}
		});

		return keyFields;
	}

	// 如果没有表单配置，提取前5个非空字段
	const keyFields = {};
	let count = 0;
	for (const key in formData) {
		if (count >= 5) break;
		if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
			keyFields[key] = formData[key];
			count++;
		}
	}

	return keyFields;
}