/**
 * 海康互联开放平台公共云函数
 *
 * 调用方式：
 *
 * 1. 拉取原始打卡记录（自动分页，每条记录附带本地人员档案工号 employee_id）
 * vk.callFunction({
 *   url: 'admin/hrm/clockin/pub/hikOpenApi',
 *   data: {
 *     action: 'getOriginRecords',
 *     beginDate: '2024-08-24',
 *     endDate: '2024-08-26'
 *   }
 * })
 *
 * 2. 仅获取 Token（调试用）
 * vk.callFunction({
 *   url: 'admin/hrm/clockin/pub/hikOpenApi',
 *   data: { action: 'getToken' }
 * })
 */

const crypto = require('crypto');
const forge = require('node-forge');

// ==================== 配置区 ====================
const HIK_CONFIG = {
	baseUrl: 'https://open-api.hikiot.com',
	appKey: '1904368878272925711',
	// appSecret：PKCS#8 私钥内容（不带 PEM 头尾）
	appSecret: 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKBosU0QAaiZCTyv8X+h/vcKAdG85yRXnR14LLoxo0JLMBecPHR0JaZozo/B+q1HgWWkzZlaqWtpjzoR5MEFKV7evSoAWTVEbYs9eGmpSxPXyKk7B82t28jqrla5kDfKFIeL0DAjgrfdaiwm6WooOLonf8CiDIJFrnS3aWUcXYGdAgMBAAECgYAr0m4dj3HkjWpomehv5eGxu5ojomfDFexmUJ5nf4gKZGAPEy+w4MooXBmSTHwfOpmvGwbQDmSaY4wtYRYNZUuXnrowX4zLnPKD5R+BVI3pKaCIBppf9TadbXACZOJHBJZnglmrUgHVIsq3RNTvBlGpD0nvvHZCFsod1NDt+evwQQJBAPQ5ywOo8yH/U11/ZNtJSTyIJHwM6VX9cE/CMIhTwH8xoSbUgynkBWuINNFvWAx7+LvY9hkreM7UyWlY9igdvHMCQQCoJHEmXb1OJ0knEsc0vPZscXPxgVF5oiPtxqHj19z/4n+Mi2FP6LfejaIBzJqGy2f0pTQjN4jvPZP8LiJjStWvAkBL6NKzFoZLoOK2guxERGkhCWfdrt2vvpB0GfWfyfhhEHn4acFC+f69R56zIhqJ9tZ+/JaxiBOKphTcS6xnF6cFAkBnHKH/AzFaQiFMQunC37bG3fRaQBG048fgwxT4YqJ2kXHiwH7WwEIxyu106QJCc262yrDkf+QLwtmDps8T0QqlAkEAkS529N6XND4umiKl4begOZNjC4Qf/0ACEuedDkzQ6MeYyhg3g9ZnHRzLuuMd8fvxEqgzVpGDs5Szgf35HYL5vA==',
	userAccessToken: '', // 若接口需要用户授权，在此填入；不需要则留空
	enableSecret: true, // 应用是否开启了数据加密
	tokenExpireBuffer: 300 // Token 提前过期缓冲(秒)
};

// 拼接 PKCS#8 PEM 格式私钥（node-forge 支持 PKCS#8）
function getPrivateKeyPem() {
	const raw = HIK_CONFIG.appSecret.replace(/\s/g, '');
	if (raw.includes('BEGIN')) return raw;
	return `-----BEGIN PRIVATE KEY-----\n${raw}\n-----END PRIVATE KEY-----`;
}

// ==================== RSA 加解密 ====================

/**
 * 私钥加密（分块，每块 117 字节）
 */
function encryptByPrivateKey(data, privateKeyPem) {
	const chunkSize = 117;
	const encryptedChunks = [];
	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.slice(i, i + chunkSize);
		const encryptedChunk = crypto.privateEncrypt(privateKeyPem, Buffer.from(chunk));
		encryptedChunks.push(encryptedChunk);
	}
	return Buffer.concat(encryptedChunks).toString('base64');
}

/**
 * 私钥解密（使用 node-forge，兼容 PKCS#8 和高版本 Node.js）
 */
function decryptByPrivateKey(data, privateKeyPem) {
	const decodedData = Buffer.from(data, 'base64');
	const pki = forge.pki;
	const key = pki.privateKeyFromPem(privateKeyPem);

	const chunkSize = 128;
	const decryptedChunks = [];

	for (let i = 0; i < decodedData.length; i += chunkSize) {
		const chunk = decodedData.slice(i, i + chunkSize);
		const decryptedChunk = key.decrypt(chunk, 'RSAES-PKCS1-V1_5', {
			padding: forge.pki.rsa.PKCS1_PADDING,
			passphrase: ''
		});
		decryptedChunks.push(Buffer.from(decryptedChunk, 'binary'));
	}

	const result = Buffer.concat(decryptedChunks).toString('utf-8');
	try {
		return decodeURIComponent(result);
	} catch (e) {
		return result;
	}
}

// ==================== 主函数 ====================

module.exports = {
	main: async (event) => {
		const {
			data = {}, util
		} = event;
		const {
			vk
		} = util;

		let res = {
			code: 0,
			msg: 'ok'
		};

		try {
			const action = data.action || 'getOriginRecords';

			switch (action) {
				case 'getToken': {
					const tokenInfo = await getAppAccessToken(vk);
					res.rows = tokenInfo;
					break;
				}

				case 'getOriginRecords': {
					const records = await getOriginRecords(vk, {
						beginDate: data.beginDate,
						endDate: data.endDate,
						personNos: data.personNos || []
					});
					res.rows = records;
					res.total = records.length;
					break;
				}

				default:
					res.code = -1;
					res.msg = `未知的 action: ${action}`;
			}
		} catch (e) {
			console.error('海康开放平台调用失败:', e);
			res.code = -1;
			res.msg = e.message || '调用失败';
		}

		return res;
	}
};

// ==================== 内部方法 ====================

/**
 * 获取 App Access Token（带简单缓存）
 */
async function getAppAccessToken(vk) {
	const cacheKey = 'hik_app_access_token';
	const now = Math.floor(Date.now() / 1000);

	try {
		const cacheRes = await vk.baseDao.findById({
			dbName: 'hrm-attendance-hik-token',
			id: cacheKey
		});
		const cache = cacheRes && (cacheRes.data || cacheRes.rows || cacheRes);
		if (cache && cache.expires_at > now + HIK_CONFIG.tokenExpireBuffer) {
			console.log('[hikOpenApi] 使用缓存的 Token');
			return {
				appAccessToken: cache.app_access_token,
				refreshAppToken: cache.refresh_app_token,
				expiresIn: cache.expires_at - now
			};
		}
	} catch (e) {
		// 缓存不存在，忽略
	}

	const resp = await vk.request({
		method: 'POST',
		url: `${HIK_CONFIG.baseUrl}/auth/exchangeAppToken`,
		data: {
			appKey: HIK_CONFIG.appKey,
			appSecret: HIK_CONFIG.appSecret
		},
		contentType: 'json',
		dataType: 'json'
	});

	if (resp.code !== 0 || !resp.data || !resp.data.appAccessToken) {
		throw new Error(`获取 Token 失败: ${resp.msg || JSON.stringify(resp)}`);
	}

	const tokenData = resp.data;
	const expiresAt = now + (tokenData.expiresIn || 604800);

	try {
		await vk.baseDao.updateAndReturn({
			dbName: 'hrm-attendance-hik-token',
			whereJson: {
				_id: cacheKey
			},
			dataJson: {
				app_access_token: tokenData.appAccessToken,
				refresh_app_token: tokenData.refreshAppToken,
				expires_at: expiresAt,
				update_time: now
			},
			addDataJson: {
				_id: cacheKey
			}
		});
	} catch (e) {
		console.log('[hikOpenApi] Token 缓存写入失败(可忽略):', e.message);
	}

	return tokenData;
}

/**
 * 拉取原始打卡记录（自动分页，取全量数据）
 * 每条记录通过 personNo -> 海康人员手机号 -> 本地人事档案(hrm-employees.mobile)
 * 匹配出本地人员档案工号，附加到记录的 employee_id 字段
 */
async function getOriginRecords(vk, {
	beginDate,
	endDate,
	personNos = []
}) {
	if (!beginDate || !endDate) {
		throw new Error('beginDate 和 endDate 不能为空，格式为 "YYYY-MM-DD"');
	}

	const tokenInfo = await getAppAccessToken(vk);
	const appAccessToken = tokenInfo.appAccessToken;
	const privateKeyPem = getPrivateKeyPem();

	const url = `${HIK_CONFIG.baseUrl}/attendance/v1/origin-record/page`;
	const size = 100;
	const maxPage = 500;

	// 本地人事档案：mobile -> employee_id 映射（只加载一次）
	const employeePhoneMap = await buildEmployeePhoneMap(vk);
	// 人员详情缓存（本次运行内有效）：personNo -> 海康人员详情
	const personDetailCache = {};

	let allRecords = [];
	let page = 1;
	let hasMore = true;

	while (hasMore && page <= maxPage) {
		console.log(`[hikOpenApi] 拉取第 ${page} 页...`);

		const bodyParams = {
			beginDate,
			endDate,
			containsDeletedPerson: true,
			page,
			size
		};
		if (personNos && personNos.length > 0) {
			bodyParams.personNos = personNos;
		}

		let requestBody = JSON.stringify(bodyParams);
		if (HIK_CONFIG.enableSecret) {
			const encryptBody = encryptByPrivateKey(requestBody, privateKeyPem);
			requestBody = {
				bodySecret: encryptBody
			};
		} else {
			requestBody = bodyParams;
		}

		const headers = {
			'App-Access-Token': appAccessToken
		};
		if (HIK_CONFIG.userAccessToken) {
			headers['User-Access-Token'] = HIK_CONFIG.userAccessToken;
		}

		const resp = await vk.request({
			method: 'POST',
			url,
			header: headers,
			data: requestBody,
			contentType: 'json',
			dataType: 'json'
		});

		if (resp.code !== 0) {
			throw new Error(`拉取打卡记录失败: ${resp.msg || JSON.stringify(resp)}`);
		}

		let pageData = resp.data;
		if (typeof pageData === 'string' && HIK_CONFIG.enableSecret) {
			const decrypted = decryptByPrivateKey(pageData, privateKeyPem);
			pageData = JSON.parse(decrypted);
		} else if (pageData && pageData.bodySecret && HIK_CONFIG.enableSecret) {
			const decrypted = decryptByPrivateKey(pageData.bodySecret, privateKeyPem);
			pageData = JSON.parse(decrypted);
		}

		let records = [];
		if (Array.isArray(pageData)) {
			records = pageData;
		} else if (pageData && Array.isArray(pageData.data)) {
			records = pageData.data;
		} else if (pageData && Array.isArray(pageData.rows)) {
			records = pageData.rows;
		} else if (pageData && Array.isArray(pageData.list)) {
			records = pageData.list;
		}

		console.log(`[hikOpenApi] 第 ${page} 页取到 ${records.length} 条`);

		// 逐条附加本地人员档案工号 employee_id
		for (const record of records) {
			const personNo = record.personNo || record.person_no || '';
			if (personNo) {
				if (!(personNo in personDetailCache)) {
					personDetailCache[personNo] = await getPersonByPersonNo(
						vk, personNo, appAccessToken, privateKeyPem
					);
					// 人员详情接口限制 10 次/秒，延迟 110ms 约等于 9 次/秒
					await new Promise(r => setTimeout(r, 110));
				}
				const person = personDetailCache[personNo];
				const phone = person && person.phone ? person.phone : '';
				record.employee_id = matchEmployeeId(employeePhoneMap, phone);
			} else {
				record.employee_id = null;
			}
		}

		allRecords = allRecords.concat(records);

		if (records.length < size) {
			hasMore = false;
		} else {
			page++;
			await new Promise(r => setTimeout(r, 250));
		}
	}

	if (page > maxPage) {
		console.warn(`[hikOpenApi] 已达到最大页数限制 ${maxPage}，停止拉取`);
	}

	console.log(`[hikOpenApi] 共拉取 ${allRecords.length} 条原始打卡记录`);
	return allRecords;
}

// ==================== 人员详情 & 本地档案匹配 ====================

/**
 * 查询人员详情（调用海康 team/v1/person/getByPersonNo）
 * 人员不存在的返回码 150201 视为正常，返回 null
 */
async function getPersonByPersonNo(vk, personNo, appAccessToken, privateKeyPem) {
	try {
		const headers = {
			'Content-Type': 'application/json',
			'App-Access-Token': appAccessToken
		};
		if (HIK_CONFIG.userAccessToken) {
			headers['User-Access-Token'] = HIK_CONFIG.userAccessToken;
		}

		// GET 请求：整个查询串须用私钥 RSA 加密后以 querySecret 传递
		let queryString = `personNo=${personNo}`;
		if (HIK_CONFIG.enableSecret) {
			const encrypted = encryptByPrivateKey(queryString, privateKeyPem);
			queryString = 'querySecret=' + encodeURIComponent(encrypted);
		}

		const resp = await vk.request({
			method: 'GET',
			url: `${HIK_CONFIG.baseUrl}/team/v1/person/getByPersonNo?${queryString}`,
			header: headers,
			dataType: 'json'
		});

		if (resp.code !== 0) {
			if (resp.code === 150201) {
				console.log(`[hikOpenApi] 人员不存在: ${personNo}`);
				return null;
			}
			console.log(`[hikOpenApi] 查询人员详情失败(${personNo}): ${resp.msg}`);
			return null;
		}

		// 解密响应
		let personData = resp.data;
		if (typeof personData === 'string' && HIK_CONFIG.enableSecret) {
			const decrypted = decryptByPrivateKey(personData, privateKeyPem);
			personData = JSON.parse(decrypted);
		} else if (personData && personData.bodySecret && HIK_CONFIG.enableSecret) {
			const decrypted = decryptByPrivateKey(personData.bodySecret, privateKeyPem);
			personData = JSON.parse(decrypted);
		}

		// 兼容 data 字段被外层包裹的情况
		if (personData && personData.data && typeof personData.data === 'object') {
			personData = personData.data;
		}

		return personData;
	} catch (e) {
		console.log(`[hikOpenApi] 查询人员详情异常(${personNo}):`, e.message);
		return null;
	}
}

/**
 * 一次性加载本地人事档案，构建手机号索引
 */
async function buildEmployeePhoneMap(vk) {
	const map = {
		exact: new Map(),
		fuzzy: []
	};

	try {
		let res = await vk.callFunction({
			url: 'admin/hrm/employees/pub/getAllEmployeeByMobile',
			title: '请求中...',
			data: {}
		});

		const rows = (res && (res.rows || res.data)) || [];
		for (const row of rows) {
			const employeeId = row.employee_id || row._id || null;
			const mobile = (row.mobile || '').toString().trim();
			if (!mobile || !employeeId) continue;
			const digits = mobile.replace(/\D/g, '');
			if (!digits) continue;
			if (!map.exact.has(digits)) {
				map.exact.set(digits, employeeId);
			}
			// 预生成脱敏匹配用的前后缀（前 3 位 + 后 4 位）
			map.fuzzy.push({
				prefix: digits.slice(0, 3),
				suffix: digits.slice(-3),
				employee_id: employeeId
			});
		}
		console.log(`[hikOpenApi] 已加载 ${rows.length} 条人事档案用于手机号匹配`);
	} catch (e) {
		console.log('[hikOpenApi] 加载人事档案失败:', e.message);
	}
	return map;
}

/**
 * 用海康返回的手机号在本地档案中匹配 employee_id
 * @param {Object} employeePhoneMap - buildEmployeePhoneMap 的结果
 * @param {String} phone            - 海康返回的手机号（可能脱敏，如 123*****212）
 */
function matchEmployeeId(employeePhoneMap, phone) {
	if (!phone) return null;

	const digits = phone.toString().replace(/\D/g, '');
	if (!digits) return null;

	// 1. 完整手机号精确匹配
	if (employeePhoneMap.exact.has(digits)) {
		return employeePhoneMap.exact.get(digits);
	}

	// 2. 手机号被脱敏（含 *）时，用前 3 位 + 后 4 位前后缀匹配
	if (phone.toString().includes('*')) {
		const prefix = phone.slice(0, 3);
		const suffix = phone.slice(-3);
		const matched = employeePhoneMap.fuzzy.find(
			item => item.prefix === prefix && item.suffix === suffix
		);
		if (matched) return matched.employee_id;
	}

	return null;
}