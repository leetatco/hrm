// admin/hrm/attendance/sys/preloadOneDay
module.exports = {
	main: async (event) => {
		const { data = {}, util } = event;
		const { vk, db, _ } = util;
		const { date, employee_ids = [] } = data;

		if (!date) return { code: -1, msg: 'date不能为空' };

		const dayStartTs = new Date(date + 'T00:00:00').getTime();
		const dayEndTs = new Date(date + 'T23:59:59.999').getTime();
		const empIn = _.in(employee_ids);

		const [
			leaveRes, tripRes, compRes, remedyRes, overtimeRes,
			scheduleRes, clockRes, outingRes
		] = await Promise.all([
			selectAll(util, 'hrm-attendance-leaverecord', {
				employee_id: empIn,
				leave_date: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs))
			}),
			selectAll(util, 'hrm-attendance-triprecord', {
				employee_id: empIn,
				start_time: db.command.lte(dayEndTs),
				end_time: db.command.gte(dayStartTs)
			}),
			selectAll(util, 'hrm-attendance-compensatoryrecord', {
				employee_id: empIn,
				compensatory_date: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs))
			}),
			selectAll(util, 'bpmn-application-form', {
				applicant_id: empIn,
				form_type_code: 'MISS_PUNCH_RECORD',
				status: 'approved',
				'form_data.miss_date': date
			}),
			selectAll(util, 'hrm-attendance-overtimerecord', {
				employee_id: empIn,
				overtime_date: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs)),
				import_status: 1
			}),
			selectAll(util, 'hrm-attendance-schedule', {
				employee_id: empIn,
				schedule_date: date
			}),
			selectAll(util, 'hrm-clockin', {
				employee_id: empIn,
				type: '公司卡',
				clockintime: db.command.gte(dayStartTs).and(db.command.lte(dayEndTs))
			}, {
				sortArr: [{ name: 'clockintime', type: 'asc' }]
			}),
			selectAll(util, 'bpmn-application-form', {
				applicant_id: empIn,
				form_type_code: 'OUTING_APPLICATION',
				status: 'approved',
				'form_data.outing_date': date
			})
		]);

		return {
			code: 0,
			msg: 'ok',
			data: {
				date,
				leaveRows: leaveRes.rows,
				tripRows: tripRes.rows,
				compRows: compRes.rows,
				remedyRows: remedyRes.rows,
				overtimeRows: overtimeRes.rows,
				scheduleRows: scheduleRes.rows,
				clockRows: clockRes.rows,
				outingRows: outingRes.rows
			}
		};
	}
};

async function selectAll(util, dbName, whereJson, options = {}) {
	const { vk } = util;
	const pageSize = options.pageSize || 1000;
	const allRows = [];
	let pageIndex = 1;

	while (true) {
		const res = await vk.baseDao.select({
			dbName,
			whereJson,
			sortArr: options.sortArr || [],
			fieldJson: options.fieldJson || {},
			pageIndex,
			pageSize
		});
		const rows = res.rows || [];
		allRows.push(...rows);
		if (rows.length < pageSize) break;
		pageIndex++;
		if (pageIndex > 1000) break;
	}
	return { rows: allRows };
}