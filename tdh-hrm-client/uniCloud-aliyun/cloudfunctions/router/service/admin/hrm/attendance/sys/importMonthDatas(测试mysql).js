const mysql = require('mysql2/promise'); // 使用 Promise 接口
module.exports = {
	/**
	 * 添加单条数据
	 * @url admin/hrm/attendance/sys/approve/add 前端调用的url参数地址
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
		let pool = null;
		let dbName = "hrm-attendance-detail"; // 表名
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			sql,
			params
		} = data;
		// 参数验证开始		

		// 参数验证结束		
		// 执行数据库命令		
		try {
			pool = await vk.myfn.createPool();
			const [rows] = await pool.query(sql, params || []);
			res.rows = rows;
			res.total = rows.length;
			res.msg = '查询成功';
		} catch (err) {
			console.error('DB Error:', err);
			res.code = 500;
			res.msg = '查询失败';
			res.error = err.message;
			return res;
		} finally {
			await pool.end(); // 关闭连接池
		}
		// 业务逻辑结束-----------------------------------------------------------		
		return res;
	}
}