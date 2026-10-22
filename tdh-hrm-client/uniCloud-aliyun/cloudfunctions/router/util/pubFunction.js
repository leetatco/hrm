const mysql = require('mysql2/promise'); // 使用 Promise 接口
const CryptoJS = require("crypto-js");
/**
 * 自定义公共函数包
 * 这里可以写你自己的公共函数
 */
let pubFun = {};
/**
 * 公共函数写法示例
 * 调用示例：
 * pubFun.test();
 * 或
 * vk.myfn.test();
 */
pubFun.test = (e) => {
	let res = {
		code: 0,
		msg: ""
	};
	// 业务逻辑开始----------------------------------------------------------- 
	// 可写与数据库的交互逻辑等等	
	// 业务逻辑结束-----------------------------------------------------------
	return res;
}
// 加密
pubFun.encrypt = (keyStr) => {
	return CryptoJS.AES.encrypt(keyStr, 'secret key 123').toString();;
}
// 解密
pubFun.decrypt = (ciphertext) => {
	let bytes = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
	let originalText = bytes.toString(CryptoJS.enc.Utf8);
	return originalText;
}

pubFun.clockTimeToTimestamp = (clockTime) => {
	if (!clockTime) return 0;
	const str = clockTime.replace(/\+/g, ' ').trim(); // "2026-10-06 07:56"
	// 拆成 [2026,10,06] 和 [07,56]
	const [datePart, timePart = '00:00'] = str.split(' ');
	const [y, m, d] = datePart.split('-').map(Number);
	const [hh, mm, ss = 0] = timePart.split(':').map(Number);
	// 注意月份从 0 开始
	return new Date(y, m - 1, d, hh, mm, ss).getTime();
}

pubFun.formatJobNumber = (jobNumber) => {
	if (!jobNumber) return '';
	// 用正则拆出「字母部分」和「数字部分」
	const match = jobNumber.match(/^([a-zA-Z]*)(\d+)$/);
	if (!match) return jobNumber; // 不匹配则原样返回
	const letters = match[1]; // "test"
	const numbers = match[2]; // "00002"
	// 取字母最后一个字符 + "-" + 数字
	return letters + '-' + numbers; // "test-00002"
}

/**
 * 日期字符串转毫秒时间戳
 * @param {String} dateStr - 格式 "YYYY-MM-DD"
 * @param {Boolean} isEnd - true 取当天 23:59:59，false 取当天 00:00:00
 * @returns {Number} 毫秒时间戳
 */
pubFun.dateToTimestamp = (dateStr, isEnd = false) => {
	const [y, m, d] = dateStr.split('-').map(Number);
	const date = new Date(
		y,
		m - 1,
		d,
		isEnd ? 23 : 0,
		isEnd ? 59 : 0,
		isEnd ? 59 : 0
	);
	return date.getTime();
}

pubFun.createPool = async () => {
	const con = await mysql.createPool({
		host: '113.90.145.57', // 从环境变量读取
		port: '33021',
		user: await pubFun.decrypt('U2FsdGVkX192ae3J7n/QIMxrrchQW9Kb0jxBMiazE1k='),
		password: await pubFun.decrypt(
			'U2FsdGVkX1855wFKrMYyHktorZLRHuiJZv8xNeQgLPmhEYy2O1psNPGpgoXB6JO1'),
		database: 'tdh_oa',
		charset: 'utf8mb4',
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
		ssl: {
			rejectUnauthorized: false
		} // 启用SSL加密
	});
	return con;
}

//获取员工角色公司别
pubFun.getRoleCompanys = async (userInfo, vk, _) => {
	// 获取用户角色
	const userRoles = userInfo.role;

	let systemAdminRoles = [];

	//获取拦截云函数和不需拦截角色组
	const filterDetails = await vk.baseDao.select({
		dbName: "hrm-company-filter",
		getMain: true
	});

	if (filterDetails && filterDetails[0].roles && filterDetails[0].paths) {
		systemAdminRoles = filterDetails[0].roles;
	}

	// 获取用户角色可查公司信息
	const roleDetails = await vk.baseDao.select({
		dbName: "uni-id-roles",
		whereJson: {
			"role_id": _.in(userRoles)
		},
		getMain: true
	});

	// 系统管理员角色
	const isSystemAdmin = userRoles && userRoles.some(role =>
		!systemAdminRoles.includes(role)
	);

	// 系统管理员不过滤
	if (!isSystemAdmin) {
		return []
	}

	// 获取用户有权限的公司列表（支持多公司）,默认是本人公司别
	let employeeInfo = {};

	let res = await vk.callFunction({
		url: 'client/user/pub/isUser',
		title: '请求中...',
		data: {
			username: userInfo.username
		}
	});

	if (res && res.total > 0) {
		employeeInfo = res.rows[0].employeeInfo
	}

	let userCompanyIds = [];
	if (employeeInfo.company_id) {
		userCompanyIds.push(employeeInfo.company_id);
	}
	roleDetails.map(role => {
		if (role.company) {
			role.company.map(companyid => {
				userCompanyIds.push(companyid)
			})
		}
	})
	return userCompanyIds;
}


module.exports = pubFun;