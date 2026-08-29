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
			password
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
			res.msg = "该账号未在人事系统中建立";
			return res;
		}

		// 2. 查询 uni-id-users 是否已有该用户（用 mobile 或 username）		
		let dbName = "uni-id-users";
		let userRes = await vk.baseDao.selects({
			dbName,
			whereJson: _.or([{
				mobile: mobile ? mobile : 'null',
			}, {
				username: username ? username : 'null'
			}]),
			getOne: true // 只取一条
		});

		if (userRes.code !== 0) {
			res.code = userRes.code;
			res.msg = userRes.msg || "查询用户失败";
			return res;
		}

		console.log("userInfo:", userRes);

		let userInfo = null;
		if (userRes.rows) {
			userInfo = userRes.rows;
		}

		// 3. 若用户不存在则自动创建
		if (!userInfo) {
			const dcloud_appid = ['__UNI__A0EB040', '__UNI__FB9EBBB']; // 根据实际项目修改
			let addUserRes = await uniID.addUser({
				username: employeeInfo.employee_id,
				password, // 默认密码，建议后续强制修改
				mobile: employeeInfo.mobile || '',
				authorizedApp: dcloud_appid
			});
			if (addUserRes.code !== 0) {
				res.code = addUserRes.code;
				res.msg = `创建用户失败(手机号:${employeeInfo.mobile}, 工号:${employeeInfo.employee_id})：${addUserRes.msg}`;
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
		}

		// 4. 附加 employeeInfo 并返回
		userInfo.employeeInfo = employeeInfo;
		res.total = 1;
		res.rows = [userInfo];
		return res;
	}
}