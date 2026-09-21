// admin/hrm/attendance/pub/checkRemedyLimit
module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk,
			db
		} = util;
		const {
			employee_id,
			date,
			fileLength = 0
		} = data;

		// 参数校验
		if (!employee_id) {
			return {
				code: -1,
				msg: '缺少员工工号'
			};
		}
		if (!date) {
			return {
				code: -1,
				msg: '缺少补卡日期'
			};
		}

		// 1. 读取补卡规则
		const ruleRes = await vk.baseDao.selects({
			dbName: 'hrm-attendance-remedyrule',
			whereJson: {
				status: true
			},
			limit: 1
		});
		const rule = ruleRes.rows[0];
		if (!rule || !rule.remedy_enabled) {
			return {
				code: -1,
				msg: '补卡功能已关闭'
			};
		}

		// 2. 是否必须上传附件
		if (rule.require_attachment && fileLength === 0) {
			return {
				code: -1,
				msg: '请上传证明文件'
			};
		}

		// 3. 校验补卡申请时限
		const missDate = new Date(date + 'T00:00:00');
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - missDate.getTime()) / (24 * 3600 * 1000));
		if (rule.remedy_days_limit > 0 && diffDays > rule.remedy_days_limit) {
			return {
				code: -1,
				msg: `超过补卡申请时限（${rule.remedy_days_limit}天）`
			};
		}

		// 4. 校验每月补卡次数（按缺卡日期所在月份统计）
		const year = missDate.getFullYear();
		const month = missDate.getMonth() + 1;
		const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
		const endDateStr = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

		// 统计当月已提交（pending/approved）的补卡申请
		// 注意：按 form_data.miss_date 统计，而不是 _add_time
		const countRes = await vk.baseDao.selects({
			dbName: 'bpmn-application-form',
			whereJson: {
				applicant_id: employee_id,
				form_type_code: 'MISS_PUNCH_RECORD',
				status: db.command.in(['pending', 'approved']),
				'form_data.miss_date': db.command.gte(startDateStr).and(db.command.lte(endDateStr))
			},
			fieldJson: {
				_id: true
			}
		});

		const currentCount = countRes.rows ? countRes.rows.length : 0;

		if (rule.remedy_max_per_month > 0 && currentCount >= rule.remedy_max_per_month) {
			return {
				code: -1,
				msg: `本月补卡次数已达上限（${rule.remedy_max_per_month}次）`
			};
		}

		return {
			code: 0,
			msg: 'ok',
			rule,
			currentCount,
			limit: rule.remedy_max_per_month
		};
	}
};