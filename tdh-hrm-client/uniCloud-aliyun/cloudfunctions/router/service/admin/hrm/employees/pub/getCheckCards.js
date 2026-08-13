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
	 * @params {Array}          cardeds   数据库中不存在的card号码
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
			cards
		} = data;
		let res = {
			code: 0,
			msg: '',
			cardeds: []
		};
		let dbName = "hrm-employees"; // 表名

		// 业务逻辑开始-----------------------------------------------------------

		// 检查参数
		if (!cards || !Array.isArray(cards) || cards.length === 0) {
			res.code = -1;
			res.msg = 'cards参数必须是有效的非空数组';
			return res;
		}

		try {
			// 提取所有card值
			let cardValues = cards.map(item => item).filter(Boolean);

			if (cardValues.length === 0) {
				res.code = -1;
				res.msg = 'cards参数中的card值不能为空';
				return res;
			}

			// 批量查询：一次性查询所有card是否存在于数据库中	
			// 设置 pageSize 为 -1 获取所有记录（不分页）
			data.pageSize = -1;
			data.pageIndex = 1;
			let existCardsRes = await vk.baseDao.getTableData({
				dbName,
				data,
				whereJson: {
					card: _.in(cardValues)
				},
				fieldJson: {
					card: true
				}
			});
			
			// 获取数据库中已存在的card
			let existCards = existCardsRes.rows.map(item => item.card);

			// 找出不存在的card
			res.cardeds = cardValues.filter(card => !existCards.includes(card));

		} catch (error) {
			res.code = -1;
			res.msg = '查询失败: ' + error.message;
			console.error('查询失败:', error);
		}

		return res;
	}
}