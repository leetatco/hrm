module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/attendance/sys/schedule/getList 前端调用的url参数地址
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
			uid
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = 'hrm-attendance-schedule'; // 表名

		// ============ 新增：处理公司、部门筛选（通过员工表反查 employee_id） ============
		let {
			formData = {}
		} = data;

		if (formData.company_id || formData.department_id) {
			// 先按公司/部门查出员工列表
			const empWhere = {};
			if (formData.company_id) empWhere.company_id = formData.company_id;
			if (formData.department_id) empWhere.department_id = formData.department_id;

			const empRes = await vk.baseDao.selects({
				dbName: 'hrm-employees',
				whereJson: empWhere,
				fieldJson: {
					employee_id: true
				},
				pageSize: -1
			});
			const ids = (empRes.rows || []).map(item => item.employee_id).filter(Boolean);

			if (ids.length === 0) {
				// 没有匹配的员工，直接返回空结果
				return {
					code: 0,
					msg: '查询成功',
					rows: [],
					total: 0
				};
			}

			// 把 company_id、department_id 转成 employee_id 过滤条件
			data.formData = {
				...formData,
				employee_id: _.in(ids)
			};
			// 删除临时的 company_id、department_id，避免被当成排班表字段查询
			delete data.formData.company_id;
			delete data.formData.department_id;
		}
		// ============================================================================

		res = await vk.baseDao.getTableData({
			dbName,
			data,
			sortArr: [{
				name: 'employee_id',
				type: 'asc'
			}, {
				name: 'schedule_date',
				type: 'asc'
			}],
			// 副表
			foreignDB: [{
				dbName: "uni-id-users",
				localKey: "update_id",
				foreignKey: "_id",
				as: "users",
				limit: 1
			}, {
				dbName: "hrm-employees",
				localKey: "employee_id",
				foreignKey: "employee_id",
				as: "employeeInfo",
				limit: 1,
				foreignDB: [{
						dbName: "hrm-companys",
						localKey: "company_id",
						foreignKey: "company_id",
						as: "companys",
						limit: 1
					},
					{
						dbName: "hrm-departments",
						localKey: "department_id",
						foreignKey: "department_id",
						as: "departments",
						limit: 1
					}
				]
			}, {
				dbName: "hrm-attendance-group",
				localKey: "attendance_group_id",
				foreignKey: "_id",
				as: "groupInfo",
				limit: 1,
				foreignDB: [{
					dbName: 'hrm-attendance-shift',
					localKey: 'shift_id',
					foreignKey: '_id',
					as: 'shiftInfo',
					limit: 1
				}]
			}]
		});
		return res;
	},
};