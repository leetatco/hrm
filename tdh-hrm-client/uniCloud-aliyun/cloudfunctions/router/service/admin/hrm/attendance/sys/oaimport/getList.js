module.exports = {
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let {
			vk,
			db,
			_
		} = util;
		let {
			formData,
			pageIndex,
			pageSize,
			company_ids = [],
			otherWhereJson,
			filterWhereJson
		} = data;

		// 是否需要过滤公司别
		// filterWhereJson、company_ids是在云函数拦截器加载，otherWhereJson是在前端应用加载 		
		const whereJson = {
			...(filterWhereJson || {}),
			...(otherWhereJson || {}),
			status: 'approved'
		};

		// 获取允许汇入的 form_type_code 列表
		const configRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-importconfig',
			limit: 1,
			fieldJson: {
				import_codes: true
			}
		});
		let allowedCodes = configRes.rows[0]?.import_codes || [];

		// 前端传了 form_type_code，则直接使用
		if (formData.form_type_code) {
			whereJson.form_type_code = formData.form_type_code;
		} else {
			if (allowedCodes.length > 0) {
				whereJson.form_type_code = _.in(allowedCodes);
			} else {
				return {
					code: 0,
					rows: [],
					total: 0
				};
			}
		}

		if (formData.import_status !== undefined && formData.import_status !== '') {
			whereJson.import_status = parseInt(formData.import_status);
		} else {
			whereJson.import_status = _.in([0, 2]); // 默认只显示未汇入和失败
		}

		if (formData.oa_instance_id) {
			whereJson._id = formData.oa_instance_id;
		}

		data.pageIndex = 1;
		data.pageSize = -1;

		return vk.baseDao.getTableData({
			dbName: 'bpmn-application-form',
			data,
			whereJson: whereJson,
			sortArr: [{
				name: 'update_date',
				type: 'desc'
			}],
			foreignDB: [{
					dbName: "hrm-employees",
					localKey: "applicant_id",
					foreignKey: "employee_id",
					as: "employees",
					limit: 1
				}, {
					dbName: 'bpmn-form-type',
					localKey: 'form_type_code',
					foreignKey: 'code',
					as: 'formTypeInfo',
					limit: 1
				},
				{
					dbName: 'uni-id-users',
					localKey: 'import_operator',
					foreignKey: '_id',
					as: 'importOperatorInfo',
					limit: 1
				}
			]
		});
	}
};