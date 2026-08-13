module.exports = {
	/**
	 * 查询多条记录 分页
	 * @url admin/hrm/salary/sys/all/getsbAll 前端调用的url参数地址
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
			cards,
			attendance_ym_keys
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		// 参数验证开始		
		if (!cards || !Array.isArray(cards) || cards.length === 0) {
			res.code = -1;
			res.msg = 'cards参数必须是非空数组';
			return res;
		}

		if (!attendance_ym_keys || !Array.isArray(attendance_ym_keys) || attendance_ym_keys.length === 0) {
			res.code = -2;
			res.msg = 'attendance_ym_keys参数必须是非空数组';
			return res;
		}
		// 参数验证结束	
		// 业务逻辑开始-----------------------------------------------------------
		let dbName = "hrm-salary-sb"; // 表名
		res = await vk.baseDao.getTableData({
			dbName,
			data: {
				pageIndex: 1,
				pageSize: -1,
			},
			whereJson: {
				card: {
					$in: cards
				},
				attendance_ym: {
					$in: attendance_ym_keys
				}
			}
		});
		return res;
	}
}