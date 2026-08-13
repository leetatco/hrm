module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/clockin/sys/getList 前端调用的url参数地址
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
			_,
			$
		} = util;
		let {
			uid
		} = data;
		let res = {
			code: 0,
			msg: ''
		};
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = 'hrm-clockin'; // 表名
		// 1. 获取当前用户ID，这里需要根据你的实际场景获取
		const currentUserId = uid;

		// 2. 获取本月的起始和结束时间戳（毫秒）
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();
		const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0).getTime();
		const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

		// 3. 构建聚合查询
		const resDays = await db.collection(dbName)
			.aggregate()
			// 第1步：筛选本月且指定用户的数据
			.match({
				update_id: currentUserId,
				clockintime: _.gte(startOfMonth).and(_.lte(endOfMonth))
			})
			// 第2步：添加一个字段，存储转换后的日期字符串（YYYY-MM-DD）
			.addFields({
				dateStr: $.dateToString({
					// 这里将 clockintime 转换为日期对象
					date: $.add([$.dateFromParts({
						year: 1970,
						month: 1,
						day: 1,
						hour: 8,
						minute: 0,
						second: 0,
						millisecond: 0,
						timezone: 'Asia/Shanghai'
					}), '$clockintime']),
					format: '%Y-%m-%d',
					timezone: 'Asia/Shanghai'
				})
			})
			// 第3步：按日期分组去重
			.group({
				_id: '$dateStr'
			})
			// 第4步：统计总天数
			.group({
				_id: null,
				totalDays: $.sum(1)
			})
			.end();

		// 处理返回结果
		res.totalDays = resDays.data.length > 0 ? resDays.data[0].totalDays : 0;

		return res;
	},
};