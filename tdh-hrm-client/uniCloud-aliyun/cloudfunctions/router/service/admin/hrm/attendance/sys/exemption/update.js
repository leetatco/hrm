module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk
		} = util;
		let {
			uid,
			_id
		} = data;
		let res = {
			code: 0,
			msg: 'ok'
		};

		if (!_id) {
			return {
				code: -1,
				msg: 'id不能为空'
			};
		}

		const {
			exemption_type,
			employee_ids = [],
			department_ids = [],
			attendance_group_ids = [],
			start_date,
			end_date,
			reason,
			status,
			remark
		} = data;

		// 参数校验
		if (!exemption_type) {
			return {
				code: -1,
				msg: '豁免类型不能为空'
			};
		}
		if (!start_date) {
			return {
				code: -1,
				msg: '生效开始日期不能为空'
			};
		}
		if (!reason) {
			return {
				code: -1,
				msg: '豁免原因不能为空'
			};
		}
		if (exemption_type === 1 && employee_ids.length === 0) {
			return {
				code: -1,
				msg: '请至少选择一个员工'
			};
		}
		if (exemption_type === 2 && department_ids.length === 0) {
			return {
				code: -1,
				msg: '请至少选择一个部门'
			};
		}
		if (exemption_type === 3 && attendance_group_ids.length === 0) {
			return {
				code: -1,
				msg: '请至少选择一个考勤组'
			};
		}

		const dbName = 'hrm-attendance-exemption';

		// ============ 重复数据判断（排除自身） ============
		const repeatRes = await checkExemptionRepeat({
			vk,
			dbName,
			exemption_type,
			employee_ids,
			department_ids,
			attendance_group_ids,
			start_date,
			end_date,
			excludeId: _id
		});
		if (repeatRes.isRepeat) {
			return {
				code: -1,
				msg: repeatRes.msg
			};
		}
		// ==============================================

		await vk.baseDao.updateById({
			dbName,
			id: _id,
			dataJson: {
				exemption_type,
				employee_ids,
				department_ids,
				attendance_group_ids,
				start_date,
				end_date: end_date || '',
				reason,
				status,
				remark,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});

		return res;
	}
};

/**
 * 重复豁免判断
 * @returns { isRepeat: Boolean, msg: String }
 */
async function checkExemptionRepeat({
	vk,
	dbName,
	exemption_type,
	employee_ids,
	department_ids,
	attendance_group_ids,
	start_date,
	end_date,
	excludeId
}) {
	// 1. 先查出同类型的启用记录
	let whereJson = {
		exemption_type,
		status: true
	};
	// 更新时排除自身
	if (excludeId) {
		whereJson._id = vk.pubfn.isNull(excludeId) ? undefined : excludeId;
	}

	// 用 _.neq 排除自身
	if (excludeId) {
		const _ = vk.getUtil && vk.getUtil()._ ? vk.getUtil()._ : null;
	}

	const listRes = await vk.baseDao.selects({
		dbName,
		whereJson,
		pageSize: -1
	});

	const list = listRes.rows || [];
	if (list.length === 0) {
		return {
			isRepeat: false
		};
	}

	// 2. 时间段重叠判断
	const isDateOverlap = (oldStart, oldEnd, newStart, newEnd) => {
		const oldEndVal = oldEnd || '9999-12-31';
		const newEndVal = newEnd || '9999-12-31';
		return newStart <= oldEndVal && newEndVal >= oldStart;
	};

	// 3. 数组是否有交集
	const hasIntersection = (arr1, arr2) => {
		if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
		return arr1.some(v => arr2.includes(v));
	};

	// 4. 逐条匹配
	for (const item of list) {
		if (excludeId && item._id === excludeId) continue;

		// 时间段不重叠，跳过
		if (!isDateOverlap(item.start_date, item.end_date, start_date, end_date)) {
			continue;
		}

		// 按类型判断豁免对象是否有交集
		if (exemption_type === 1) {
			if (hasIntersection(item.employee_ids, employee_ids)) {
				const dupNames = (item.employee_ids || []).filter(id => employee_ids.includes(id));
				return {
					isRepeat: true,
					msg: `员工【${dupNames.join('、')}】在所选时间段内已存在豁免规则`
				};
			}
		} else if (exemption_type === 2) {
			if (hasIntersection(item.department_ids, department_ids)) {
				const dupNames = (item.department_ids || []).filter(id => department_ids.includes(id));
				return {
					isRepeat: true,
					msg: `部门【${dupNames.join('、')}】在所选时间段内已存在豁免规则`
				};
			}
		} else if (exemption_type === 3) {
			if (hasIntersection(item.attendance_group_ids, attendance_group_ids)) {
				const dupNames = (item.attendance_group_ids || []).filter(id => attendance_group_ids
					.includes(id));
				return {
					isRepeat: true,
					msg: `考勤组【${dupNames.join('、')}】在所选时间段内已存在豁免规则`
				};
			}
		}
	}

	return {
		isRepeat: false
	};
}