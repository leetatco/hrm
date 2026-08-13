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
			pageSize
		} = data;

		// 获取允许汇入的 form_type_code 列表
		const configRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-importconfig',
			limit: 1,
			fieldJson: {
				import_codes: true
			}
		});
		let allowedCodes = configRes.rows[0]?.import_codes || [];
		let whereJson = {
			status: 'approved'
		};
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

		return vk.baseDao.getTableData({
			dbName: 'bpmn-application-form',
			data: {
				pageIndex: 1,
				pageSize: -1
			},
			whereJson: whereJson,
			sortArr: [{
				name: 'update_date',
				type: 'desc'
			}],
			foreignDB: [{
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