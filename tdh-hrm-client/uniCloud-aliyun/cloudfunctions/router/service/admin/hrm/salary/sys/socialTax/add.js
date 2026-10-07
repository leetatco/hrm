module.exports = {
	/**
	 * 添加单条社保/公积金/个税数据
	 * @url admin/hrm/salary/sb/sys/add
	 * data 请求参数 说明
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
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
			msg: 'ok'
		};

		const dbName = "hrm-salary-social-tax";

		// ========== 获取参数 ==========
		let {
			attendance_ym,
			employee_id,
			card,
			last_month_sb,
			last_month_dk,
			last_month_gjj,
			this_month_sb,
			this_month_dk,
			company_social,
			company_fund,			
			dkgs,
			comment
		} = data;

		// ========== 参数验证 ==========
		if (!attendance_ym) {
			return { code: -1, msg: '考勤日期不能为空' };
		}
		if (!card) {
			return { code: -1, msg: '身份证号码不能为空' };
		}

		// ========== 重复校验：同员工同月份只能有一条 ==========
		const checkRes = await vk.baseDao.findByWhereJson({
			dbName,
			whereJson: {
				attendance_ym,
				card
			}
		});
		if (checkRes) {
			return {
				code: -1,
				msg: `该员工【${card}】在【${attendance_ym}】已有记录，请勿重复添加`
			};
		}

		// ========== 写入数据 ==========
		res.id = await vk.baseDao.add({
			dbName,
			dataJson: {
				attendance_ym,
				employee_id: employee_id || '',
				card,
				last_month_sb: last_month_sb || 0,
				last_month_dk: last_month_dk || 0,
				last_month_gjj: last_month_gjj || 0,
				this_month_sb: this_month_sb || 0,
				this_month_dk: this_month_dk || 0,
				company_social: company_social || 0,
				company_fund: company_fund || 0,				
				dkgs: dkgs || 0,
				comment: comment || '',
				update_id: uid,
				update_date: Date.now()
			}
		});

		return res;
	}
};