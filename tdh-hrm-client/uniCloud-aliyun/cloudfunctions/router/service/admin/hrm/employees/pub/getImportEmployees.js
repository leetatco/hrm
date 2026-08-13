module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/employees/sys/getList 前端调用的url参数地址
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
			item = {}
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		const formatDate = (serial) => {
			let utcDate = new Date(Date.UTC(1900, 0, serial - 1));
			return utcDate.toISOString().slice(0, 10);
		};
		try {
			//point_id: 分点代码		
			let dbName = "hrm-point"; // 表名
			let resPoint = await vk.baseDao.selects({
				dbName,
				data,
				getOne: true,
				whereJson: {
					point_name: new RegExp(item.point_id)
				}
			});
			item.point_id = resPoint.rows.point_id;

			// bank_id:"银行代码",	
			if (vk.pubfn.isNotNull(item.bank_id)) {
				dbName = "hrm-bank"; // 表名
				let resBank = await vk.baseDao.selects({
					dbName,
					data,
					getOne: true,
					whereJson: {
						bank_name: new RegExp(item.bank_id)
					}
				});
				item.bank_id = resBank.rows.bank_id;

				// location_id: "开户地代码"
				dbName = "hrm-banklocation"; // 表名
				let resLocation = await vk.baseDao.selects({
					dbName,
					data,
					getOne: true,
					whereJson: {
						location_name: new RegExp(item.location_id)
					}
				});
				item.location_id = resLocation.rows.location_id;
			} 

			// nation_id:"民族代码"
			dbName = "opendb-nation-china"; // 表名
			let resNation = await vk.baseDao.selects({
				dbName,
				data,
				getOne: true,
				whereJson: {
					name: new RegExp(item.nation_id)
				}
			});
			item.nation_id = resNation.rows._id;

			// department_id:"所属部门代码"
			dbName = "hrm-departments"; // 表名
			let resDepartment = await vk.baseDao.selects({
				dbName,
				data,
				getOne: true,
				whereJson: {
					department_name: new RegExp(item.department_id)
				}
			});
			item.department_id = resDepartment.rows.department_id;

			// company_id:"所属公司代码"
			dbName = "hrm-companys"; // 表名
			let resCompany = await vk.baseDao.selects({
				dbName,
				data,
				getOne: true,
				whereJson: {
					company_name: new RegExp(item.company_id)
				}
			});
			item.company_id = resCompany.rows.company_id;

			// position_id:"职位代码"
			dbName = "hrm-positions"; // 表名
			let resPosition = await vk.baseDao.selects({
				dbName,
				data,
				getOne: true,
				whereJson: {
					position_name: item.position_id
				}
			});
			item.position_id = resPosition.rows.position_id;

			// educational_id:"学历代码"
			dbName = "hrm-educational"; // 表名
			let resEducational = await vk.baseDao.selects({
				dbName,
				data,
				getOne: true,
				whereJson: {
					educational_name: new RegExp(item.educational_id)
				}
			});
			item.educational_id = resEducational.rows.educational_id;

			// insurance_id:"保险代码"
			dbName = "hrm-insurance"; // 表名
			let resInsurance = await vk.baseDao.selects({
				dbName,
				data,
				getOne: true,
				whereJson: {
					insurance_name: new RegExp(item.insurance_id)
				}
			});
			item.insurance_id = resInsurance.rows.insurance_id;

			// contract_id:"合同是否签定代码"
			dbName = "hrm-contract"; // 表名
			let resContract = await vk.baseDao.selects({
				dbName,
				data,
				getOne: true,
				whereJson: {
					contract_name: new RegExp(item.contract_id)
				}
			});
			item.contract_id = resContract.rows.contract_id;

			//处理常量
			// gender: "性别 1：男 2：女"
			item.gender = item.gender == '男' ? 1 : 2;

			// stay:"住宿 1：是 2：否"
			item.stay = item.gender == '是' ? 1 : 2;

			// registration:"档案是否登记 1：是 2：否"
			item.registration = item.registration == '是' ? 1 : 2;

			// marital_status:"婚姻情况 1：已婚 2：未婚"
			item.marital_status = item.marital_status == '已婚' ? 1 : 2;

			// no_crime:"无犯罪证明 1：有 2：无"
			item.no_crime = item.no_crime == '有' ? 1 : 2;

			// rest_type:"休息类型 1：单休 2：双休 3：大小周",
			if (item.rest_type == '大小周') {
				item.rest_type = 3;
			} else {
				if (item.rest_type == '双休') {
					item.rest_type = 2;
				} else {
					item.rest_type = item.rest_type == '单休' ? 1 : '';
				}
			}

			//入职日期
			if (item.hire_date)
				item.hire_date = formatDate(item.hire_date);
			//离职日期
			if (item.resign_date)
				item.resign_date = formatDate(item.resign_date);
			//出生日期
			if (item.birth_date)
				item.birth_date = formatDate(item.birth_date);
			// 合同到期日
			if (item.contract_date)
				item.contract_date = formatDate(item.contract_date);

			// status: "用户状态 1：在职 2：离职",
			item.status = item.status == '在职' ? 1 : 2;

			console.log("item:", item.hire_date);


			res.item = item;
		} catch (err) {
			res.item = item;
			res.code = -1;
			res.msg = `错误信息：${JSON.stringify(item)}\n${err.stack}`;
		} finally {
			return res;
		}

	}

}