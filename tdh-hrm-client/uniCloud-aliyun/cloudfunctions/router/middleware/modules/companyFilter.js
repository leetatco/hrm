/**
 * 自定义过滤器 - 前置（支持多公司权限）【活动化版本】
 * 
 * 说明：
 * 1. 配置表 hrm-company-filter 需包含字段：
 *    - paths: Array<String>  需要过滤的云函数路径（正则字符串）
 *    - roles: Array<String>  豁免过滤的角色ID列表（拥有任一即跳过过滤）
 * 2. 修改上述表内容后 60 秒内自动生效，无需重启
 */
module.exports = [{
	id: "customFilterCompany",
	// 仅用于触发中间件执行，实际匹配在 main 里动态完成
	regExp: ["admin/.*"],
	description: "按公司别进行查询（支持多公司）- 动态配置版",
	index: 310,
	mode: "onActionExecuting",
	enable: true,

	// ----- 内存缓存 -----
	_filterConfigCache: null,
	_filterConfigCacheTime: 0,
	_cacheTTL: 60000, // 60 秒缓存

	/**
	 * 获取过滤配置（带缓存）
	 */
	async getFilterConfig(util) {
		const vk = util.vk;
		const now = Date.now();
		if (this._filterConfigCache && (now - this._filterConfigCacheTime < this._cacheTTL)) {
			return this._filterConfigCache;
		}
		try {
			const res = await vk.baseDao.select({
				dbName: "hrm-company-filter",
				getMain: true,
			});
			const config = res && res[0] ? res[0] : null;
			this._filterConfigCache = config;
			this._filterConfigCacheTime = now;
			return config;
		} catch (err) {
			console.error("获取公司过滤配置失败:", err);
			// 出错时返回 null，放行请求（避免阻死）
			return null;
		}
	},

	main: async function(event, serviceRes) {
		let {
			data = {}, util, filterResponse
		} = event;
		let {
			vk,
			_
		} = util;
		let {
			uid,
			userInfo = {}
		} = filterResponse;

		// 修复：使用 event.url 获取路径
		const routerPath = event.url || event.$url || event.routerPath || "";
		console.error("=== 过滤器启动 ===");
		console.error("routerPath:", routerPath);

		try {
			const filterConfig = await this.getFilterConfig(util);
			// console.error("filterConfig:", JSON.stringify(filterConfig));
			if (!filterConfig || !filterConfig.paths || filterConfig.paths.length === 0) {
				// console.error("无配置，放行");
				return {
					code: 0,
					msg: "无配置，放行"
				};
			}

			const {
				paths: dynamicPaths,
				roles: exemptRoles = []
			} = filterConfig;
			// console.error("dynamicPaths:", dynamicPaths, "exemptRoles:", exemptRoles);
			const isPathMatched = dynamicPaths.some(pattern => {
				try {
					const result = new RegExp(pattern).test(routerPath);
					// console.error(`测试正则 ${pattern} 对路径 ${routerPath} 结果: ${result}`);
					return result;
				} catch (e) {
					console.error("正则错误:", pattern, e);
					return false;
				}
			});
			// console.error("isPathMatched:", isPathMatched);
			if (!isPathMatched) {
				console.error("路径不匹配，放行");
				return {
					code: 0,
					msg: "路径不匹配，放行"
				};
			}

			const userRoles = userInfo.role || [];
			// console.error("userRoles:", userRoles);
			if (userRoles.length === 0) {
				return {
					code: -1,
					msg: "未获取到用户角色信息"
				};
			}

			// console.error("角色豁免判断：", userRoles, exemptRoles);
			const isExempted = userRoles.some(role => exemptRoles.includes(role));
			if (isExempted) {
				// console.error("角色豁免，放行");
				return {
					code: 0,
					msg: "角色豁免，放行"
				};
			}

			// 5. 获取用户有权限的公司列表
			// 5.1 查询角色表中分配的公司
			const roleDetails = await vk.baseDao.select({
				dbName: "uni-id-roles",
				whereJson: {
					role_id: _.in(userRoles)
				},
				getMain: true
			});

			// 5.2 获取用户自己的员工信息（默认公司）
			let employeeInfo = {};
			try {
				let res = await vk.callFunction({
					url: 'client/user/pub/isUser',
					title: '请求中...',
					data: {
						username: userInfo.username
					},
				});
				if (res && res.total > 0) {
					employeeInfo = res.rows[0].employeeInfo || {};
				}
			} catch (e) {
				console.error("获取员工信息失败:", e);
				// 获取失败不阻塞，继续用角色公司数据
			}

			// 汇总公司ID列表（去重）
			let companyIdSet = new Set();
			if (employeeInfo.company_id) {
				companyIdSet.add(employeeInfo.company_id);
			}
			roleDetails.forEach(role => {
				if (vk.pubfn.isNotNull(role.company) && Array.isArray(role.company)) {
					role.company.forEach(cid => companyIdSet.add(cid));
				}
			});

			const userCompanyIds = Array.from(companyIdSet);
			if (userCompanyIds.length === 0) {
				return {
					code: -1,
					msg: "用户角色未分配公司权限，无法查询数据"
				};
			}

			// 6. 应用公司过滤条件
			let filterWhereJson = data.whereJson || {};
			filterWhereJson.company_id = _.in(userCompanyIds);

			// 挂载到 data 上，方便后续云函数使用
			data.company_ids = userCompanyIds;
			data.filterWhereJson = filterWhereJson;

			console.log("companyFilter 动态应用:", {
				routerPath,
				user: userInfo.username,
				userCompanyIds,
				filterWhereJson,
				isExempted: false
			});

			return {
				code: 0,
				msg: "公司过滤条件已应用",
				userInfo: {
					uid: uid,
					companyIds: userCompanyIds,
					isSystemAdmin: false, // 此处为普通用户
					filterWhereJson,
					datas: data
				}
			};

		} catch (error) {
			console.error('自定义过滤器错误:', error);
			return {
				code: -1,
				msg: "过滤器执行错误: " + error.message
			};
		}
	}
}];