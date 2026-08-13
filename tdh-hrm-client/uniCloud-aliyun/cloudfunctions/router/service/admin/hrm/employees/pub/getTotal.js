module.exports = {
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
			$,
			_
		} = util;
		let {
			uid,
			companys
		} = data;

		let res = {
			code: 0,
			msg: '',
			data: {}
		};

		try {
			const dbName = "hrm-employees";
			// 1. 先获取总数量			
			const whereJson = {
				status: 1,
			};

			if (companys && Array.isArray(companys) && companys.length > 0) {
				whereJson.company_id = _.in(companys);
			}

			// 设置 pageSize 为 -1 获取所有记录（不分页）
			data.pageSize = -1;
			data.pageIndex = 1;

			res = await vk.baseDao.getTableData({
				dbName,
				data,
				whereJson
			});

			const total = res.total;

			if (total === 0) {
				res.data = {
					total: 0,
					avg_tenure: 0,
					avg_age: 0
				};
				return res;
			}


			let allEmployees = res.rows;


			// 3. 计算统计值
			const currentTime = new Date().getTime();
			let totalTenureYears = 0;
			let totalAge = 0;

			allEmployees.forEach(employee => {
				const hireTime = new Date(employee.hire_date).getTime();
				const tenureYears = (currentTime - hireTime) / (1000 * 60 * 60 * 24 * 365.25);
				totalTenureYears += tenureYears;
				totalAge += Number(employee.age);
			});

			res.data = {
				total: allEmployees.length,
				avg_tenure: Number((totalTenureYears / allEmployees.length).toFixed(0)),
				avg_age: Number((totalAge / allEmployees.length).toFixed(0)),
				totalAge,
			};

		} catch (err) {
			console.error('统计失败:', err);
			res.code = -1;
			res.msg = '统计失败: ' + err.message;
			res.data = {
				total: 0,
				avg_tenure: 0,
				avg_age: 0
			};
		}

		return res;
	}
}