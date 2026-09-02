const HrmService = require('../../../common/pub/class/hrm-service.js');

module.exports = {
	main: async (event) => {
		let {
			data = {}, util
		} = event;
		let {
			uniID,
			vk,
			db,
			_,
			$
		} = util;
		let {
			mobile,
			username,
			password,
			wx_openid
		} = data;

		let res = {
			code: 0,
			msg: "",
			total: 0,
			rows: []
		};

		if (!password) password = "123456";

		// 1. 从人事系统获取员工信息
		const hrmService = new HrmService(vk, db);
		const employeeInfo = await hrmService.getEmployeeInfoByUsername(username);

		if (!employeeInfo || vk.pubfn.isNull(employeeInfo.card) || employeeInfo.status == 2) {
			res.msg = `员工信息不存在: ${mobile},请联系人事部档案管理人员！`;
			return res;
		}

		// 2. 查询 uni-id-users 是否已有该用户（用 mobile 或 username）
		let dbName = "uni-id-users";
		let userRes = await vk.baseDao.selects({
		    dbName,
		    whereJson: _.or([
		        { mobile: mobile ? mobile : 'null' },
		        { username: employeeInfo.employee_id ? employeeInfo.employee_id : 'null' },
		        { 'wx_openid.mp-weixin': wx_openid }
		    ]),
		    getOne: true // 只取一条
		});
		
		if (userRes.code !== 0) {
		    res.code = userRes.code;
		    res.msg = userRes.msg || "查询用户失败";
		    return res;
		}
		
		// 如果查到了用户，需要区分是哪种匹配情况
		if (userRes.rows) {
		    const user = userRes.rows;
		
		    // 情况1：完全匹配（手机号+工号+微信都匹配同一个用户）=> 允许登录，返回用户信息
		    const isMobileMatch = mobile && user.mobile === mobile;
		    const isUsernameMatch = employeeInfo.employee_id && user.username === employeeInfo.employee_id;
		    const isWxMatch = wx_openid && user.wx_openid && user.wx_openid['mp-weixin'] === wx_openid;
		
		    // 如果手机号、工号、微信三者至少有一项匹配，且没有冲突，则认为该用户已存在，直接返回
		    // 但注意：如果只是微信匹配，但手机号/工号不匹配，且该用户已有其他手机号/工号，则说明微信被占用
		    if (isMobileMatch && isUsernameMatch) {
		        // 完全匹配：手机号和工号都一致，视为同一个用户，直接返回
		        userInfo = user;
		        // 附加 employeeInfo
		        userInfo.employeeInfo = employeeInfo;
		        res.total = 1;
		        res.rows = [userInfo];
		        return res;
		    }
		
		    // 情况2：部分字段冲突，需要报错
		    // 2.1 手机号已被其他用户占用（且当前手机号不为空）
		    if (mobile && user.mobile === mobile && user.username !== employeeInfo.employee_id) {
		        res.code = -1;
		        res.msg = `手机号 ${mobile} 已被其他用户注册!`;
		        return res;
		    }
		
		    // 2.2 工号已被其他用户占用（且当前工号不为空）
		    if (employeeInfo.employee_id && user.username === employeeInfo.employee_id && user.mobile !== mobile) {
		        res.code = -1;
		        res.msg = `工号 ${employeeInfo.employee_id} 已被其他用户注册，请确认工号是否正确!`;
		        return res;
		    }
		
		    // 2.3 微信已被其他用户绑定（且当前微信不为空）
		    if (wx_openid && user.wx_openid && user.wx_openid['mp-weixin'] === wx_openid && 
		        user.mobile !== mobile && user.username !== employeeInfo.employee_id) {
		        res.code = -1;
		        res.msg = `该微信账号已绑定其他用户(${wx_openid})!`;
		        return res;
		    }
		
		    // 如果以上冲突都不存在，但用户确实存在（理论上不会到这里），则视为正常返回
		    userInfo = user;
		    userInfo.employeeInfo = employeeInfo;
		    res.total = 1;
		    res.rows = [userInfo];
		    return res;
		}

		// 3. 若用户不存在则自动创建		
		const dcloud_appid = ['__UNI__A0EB040', '__UNI__FB9EBBB']; // 根据实际项目修改
		let addUserRes = await uniID.addUser({
			username: employeeInfo.employee_id,
			password, // 默认密码，建议后续强制修改
			mobile: employeeInfo.mobile || '',
			authorizedApp: dcloud_appid
		});
		if (addUserRes.code !== 0) {
			res.code = addUserRes.code;
			res.msg =
				`创建用户失败(手机号:${employeeInfo.mobile}, 工号:${employeeInfo.employee_id})：${addUserRes.msg}`;
			return res;
		}

		// ========== 新增：更新用户后台登录权限等字段 ==========
		let updateData = {
			nickname: employeeInfo.employee_name,
			gender: employeeInfo.gender || 0, // 0未知 1男 2女
			role: ["group-common"],
			allow_login_background: true, // 允许登录后台
			status: 0, // 启用
			dcloud_appid: db.command.remove() // 移除应用限制，允许所有应用
		};
		// 如果 avatar 在 addUser 未传，可在此补充
		if (employeeInfo.avatar) {
			updateData.avatar = employeeInfo.avatar;
		}
		await vk.baseDao.update({
			dbName: "uni-id-users",
			whereJson: {
				_id: addUserRes.uid
			},
			dataJson: updateData
		});

		// 重新查询新创建的用户
		let newUserRes = await vk.baseDao.selects({
			dbName: "uni-id-users",
			whereJson: {
				_id: addUserRes.uid
			},
			getOne: true
		});
		if (newUserRes.code === 0 && newUserRes.rows) {
			userInfo = newUserRes.rows;
		} else {
			res.msg = "创建用户后查询失败";
			return res;
		}


		// 4. 附加 employeeInfo 并返回
		userInfo.employeeInfo = employeeInfo;
		res.total = 1;
		res.rows = [userInfo];
		return res;
	}
}