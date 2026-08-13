module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/bpmn/bpmn-condition-rule/sys/getList 前端调用的url参数地址
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
			form_type_code
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "bpmn-form-type"; // 表名		
		let fields = [];
		res = await vk.baseDao.getTableData({
			dbName,
			data,
			whereJson: {
				code: form_type_code
			}
		});
		if (res.total > 0) {
			const schema = JSON.parse(res.rows[0].form_schema);
			fields = extractFields(schema.fields);
			res.rows = fields;
		}
		return res;
	}
}

// 3. 递归提取所有字段（支持嵌套和 array<object> 内的子字段）
function extractFields(fieldsArray, prefix = '') {
	let fields = [];
	fieldsArray.forEach(field => {
		const fullKey = prefix ? `${prefix}.${field.name}` : field.name;
		fields.push({
			value: fullKey,
			label: field.label,
			type: field.type,
			description: field.placeholder || ''
		});
		// 处理 array<object> 内部的子字段
		if (field.type === 'array<object>' && field.columns) {
			extractFields(field.columns, `${fullKey}.*`);
		}
	});
	return fields
}