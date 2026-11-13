'use strict';
module.exports = {
	/**
	 * XXXnameXXX
	 * @url admin/hrm/salary/sys/all/createPayslips 前端调用的url参数地址
	 * data 请求参数
	 * @param {String} params1  参数1
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
			_,
			$
		} = util;
		let {
			uid,
			attendance_ym,
			items = []
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		// 1.先判断传入数据
		if (!attendance_ym && items.length > 0) {
			return {
				code: -1,
				msg: '考勤月份和工资数据不能为空'
			};
		}

		// 2. 查询已存在的工资条（按 card + attendance_ym）
		const cards = items.map(i => i.card);
		const existRes = await db.collection('hrm-salary-payslip')
			.where({
				attendance_ym,
				card: _.in(cards)
			})
			.limit(1000)
			.get();
		const existMap = new Map();
		(existRes.data || []).forEach(i => {
			existMap.set(`${i.card}_${i.attendance_ym}`, i);
		});

		// 3. 组装新增/更新数据
		const addList = [];
		const updateList = [];
		const now = Date.now();

		for (const salary of items) {
			const key = `${salary.card}_${salary.attendance_ym}`;
			const exist = existMap.get(key);

			// 工资条需要展示的字段（按你的 payslip 表结构补充）
			const payslipData = {
				attendance_ym: salary.attendance_ym,
				card: salary.card,
				company_id: salary.company_id,
				employee_name: salary.employee_name,
				department_name: salary.department_name,
				position_name: salary.position_name,
				hire_date:salary.hire_date,
				resign_date:salary.resign_date,

				base_salary: salary.base_salary,
				performance_salary: salary.performance_salary,
				overtime_fee: salary.overtime_fee,
				penalty_fund: salary.penalty_fund,
				housing_fund: salary.housing_fund,
				annual_allowance: salary.annual_allowance,
				floating_bonus: salary.floating_bonus,
				confidentiality_fee: salary.confidentiality_fee,
				work_days: salary.work_days,
				real_days: salary.real_days,
				gross_salary: salary.gross_salary,
				overtime_cost: salary.overtime_cost,
				free_cost: salary.free_cost,
				grant: salary.grant,
				agency_fee: salary.agency_fee,
				other_cost: salary.other_cost,
				we_cost: salary.we_cost,
				clothes_cost: salary.clothes_cost,
				earlytime_cost: salary.earlytime_cost,
				missed_cost: salary.missed_cost,
				loan_cost: salary.loan_cost,
				this_month_sb: salary.this_month_sb,
				this_month_dk: salary.this_month_dk,
				dkgs: salary.dkgs,
				real_salary: salary.real_salary,
				company_sb: salary.company_sb,
				company_gjj: salary.company_gjj,
				last_month_sb: salary.last_month_sb,
				last_month_gjj: salary.last_month_gjj,
				comment: salary.comment,

				salary_id: salary._id,
				update_id: uid,
				update_date: now
			};

			if (!exist) {
				// 新增：待签名状态
				addList.push({
					...payslipData,
					status: 0, // 0=待签名，1=已签名（按你的业务定义）
					signature_url: '', // 签名图片
					file_id: '',
					create_date: now,
					enable_fd1: true
				});
			} else {
				// 已存在：如果已签名，跳过（不覆盖签名）；未签名则更新数据
				if (exist.status === 1) {
					continue; // 已签名不覆盖
				}
				updateList.push({
					_id: exist._id,
					...payslipData
				});
			}
		}

		// 4. 批量写入
		let addNum = 0,
			updateNum = 0;
		const collection = db.collection('hrm-salary-payslip');
		
		// 新增：分片批量插入
		if (addList.length > 0) {
			const ADD_BATCH = 500;
			for (let i = 0; i < addList.length; i += ADD_BATCH) {
				const batch = addList.slice(i, i + ADD_BATCH);
				await collection.add(batch);
			}
			addNum = addList.length;
		}
		
		// 更新：分片并发更新
		if (updateList.length > 0) {
			const UPDATE_BATCH = 50; // 每批并发数，可按数据库压力调整
			for (let i = 0; i < updateList.length; i += UPDATE_BATCH) {
				const batch = updateList.slice(i, i + UPDATE_BATCH);
				await Promise.all(
					batch.map(item => {
						const {
							_id,
							...rest
						} = item;
						return collection.doc(_id).update(rest);
					})
				);
			}
			updateNum = updateList.length;
		}
		
		return {
			code: 0,
			msg: `生成完成：新增 ${addNum} 条，更新 ${updateNum} 条`,
			addNum,
			updateNum
		};
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
};