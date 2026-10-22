/**
 * 批量新增打卡记录（按时间段先删后插）
 *
 * 调用方式：
 * vk.callFunction({
 *   url: 'admin/hrm/attendance/sys/clockin/batchAdd',
 *   data: {
 *     items: [ ...打卡记录数组... ],
 *     beginDate: '2026-10-14',
 *     endDate: '2026-10-14'
 *   }
 * })
 */

module.exports = {
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let {
			vk,
			pubFun,
			db,
			_
		} = util;

		let res = {
			code: 0,
			msg: 'ok'
		};
		let dbName = "hrm-clockin";

		let {
			items = [], beginDate, endDate
		} = data;

		if (!Array.isArray(items) || items.length === 0) {
			return {
				code: -1,
				msg: '没有需要新增的数据'
			};
		}
		if (!beginDate || !endDate) {
			return {
				code: -1,
				msg: 'beginDate 和 endDate 不能为空，格式为 "YYYY-MM-DD"'
			};
		}

		// 1. 日期字符串转毫秒时间戳（beginDate 取当天 00:00:00，endDate 取当天 23:59:59）
		const beginTime = pubFun.dateToTimestamp(beginDate, false);
		const endTime = pubFun.dateToTimestamp(endDate, true);

		// 2. 删除该时间段内已有的打卡记录（clockintime 是数字时间戳）
		const delRes = await vk.baseDao.delete({
			dbName,
			whereJson: {
				clockintime: _.gte(beginTime).lte(endTime)
			}
		});
		console.log(`[batchAdd] 删除旧数据 ${delRes} 条`);

		// 3. 批量插入新数据
		const batchSize = 100;
		let addCount = 0;
		for (let i = 0; i < items.length; i += batchSize) {
			const batch = items.slice(i, i + batchSize);
			await vk.baseDao.adds({
				dbName,
				dataJson: batch
			});
			addCount += batch.length;
		}

		res.msg = `删除旧数据，新增 ${addCount} 条`;
		res.addCount = addCount;
		res.delCount = delRes;

		return res;
	}
}