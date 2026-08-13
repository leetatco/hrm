module.exports = {
	/**
	 * 批量查询薪资分配规则
	 * @url admin/hrm/salary/sys/gs/getBatchList
	 * data 请求参数 说明
	 * @params {Array}   total_salaries 总薪资数组
	 * @params {String}  match_type     匹配类型（'exact'-精确匹配, 'range'-区间匹配）
	 * res 返回参数说明
	 * @params {Number}  code      错误码，0表示成功
	 * @params {String}  msg       详细信息
	 * @params {Object}  data      薪资分配规则映射表
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
			total_salaries,
			match_type = 'range' // 'exact' 或 'range'
		} = data;

		let res = {
			code: 0,
			msg: 'success',
			data: {}
		};

		// 参数验证
		if (!total_salaries || !Array.isArray(total_salaries) || total_salaries.length === 0) {
			res.code = -1;
			res.msg = 'total_salaries参数必须是非空数组';
			return res;
		}

		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-salary-refer";

		try {
			// 去重并过滤无效值
			const validSalaries = [...new Set(total_salaries.filter(
				salary => salary !== undefined && salary !== null && !isNaN(salary)
			))];

			if (validSalaries.length === 0) {
				res.code = -2;
				res.msg = '没有有效的薪资数据';
				return res;
			}

			// 根据匹配类型构建查询条件
			let whereJson = {};

			if (match_type === 'exact') {
				// 精确匹配：查询指定薪资的记录
				whereJson = {
					total_salary: {
						$in: validSalaries
					}
				};
			} else {
				// 区间匹配（默认）：查询薪资在指定范围内的记录
				const minSalary = Math.min(...validSalaries);
				const maxSalary = Math.max(...validSalaries);

				whereJson = {
					total_salary: _.gte(minSalary).lte(maxSalary + 500)
				};
			}

			// 查询数据
			const queryRes = await vk.baseDao.getTableData({
				dbName,
				data: {
					pageIndex: 1,
					pageSize: 1000, // 假设最多1000条
					sortArr: [{
						name: "total_salary",
						type: "asc"
					}]
				},
				whereJson
			});

			if (queryRes.code === 0) {
				const allRules = queryRes.rows || [];

				if (match_type === 'exact') {
					// 精确匹配：建立薪资到规则的直接映射
					allRules.forEach(rule => {
						res.data[rule.total_salary] = rule;
					});
				} else {
					// 区间匹配：为每个传入的薪资找到最匹配的规则
					validSalaries.forEach(salary => {
						// 找出最接近且不大于传入薪资的记录
						const matchingRules = allRules.filter(rule =>
							rule.total_salary <= salary && salary <= rule.total_salary + 500
						);

						if (matchingRules.length > 0) {
							// 如果有多个匹配，选择总薪资最大的（即最接近传入薪资的）
							const bestMatch = matchingRules.reduce((prev, current) =>
								prev.total_salary > current.total_salary ? prev : current
							);
							res.data[salary] = bestMatch;
						} else {
							// 如果没有区间匹配，选择总薪资最接近的
							let closestRule = null;
							let minDiff = Infinity;

							allRules.forEach(rule => {
								const diff = Math.abs(rule.total_salary - salary);
								if (diff < minDiff) {
									minDiff = diff;
									closestRule = rule;
								}
							});

							if (closestRule) {
								res.data[salary] = closestRule;
							}
						}
					});
				}
			} else {
				res.code = queryRes.code;
				res.msg = queryRes.msg;
			}

		} catch (error) {
			console.error('批量查询薪资分配规则失败:', error);
			res.code = -3;
			res.msg = '查询失败: ' + error.message;
		}

		return res;
	}
};