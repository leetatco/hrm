/**
 * 海康互联开放平台公共云函数
 *
 * 调用方式：
 *
 * 1. 拉取原始打卡记录（自动分页）
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
 * 使用 Node.js 原生 crypto，加密不受 CVE 限制
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
 * 海康返回数据是分块加密的，按 128 字节分块解密
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
			vk,
			pubFun
		} = util;

		let {
			uid
		} = data;

		let res = {
			code: 0,
			msg: 'ok'
		};

		try {
			const action = data.action || 'getOriginRecords';

			switch (action) {
				// 仅获取 Token（调试用）
				case 'getToken': {
					const tokenInfo = await getAppAccessToken(vk);
					res.rows = tokenInfo;
					break;
				}

				// 拉取原始打卡记录（自动分页）
				case 'getOriginRecords': {
					const records = await getOriginRecords(vk, uid, {
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

	// 尝试从缓存读取
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

	// 请求新 Token
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

	// 写入缓存（upsert：不存在则新增，存在则更新）
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
			// 不存在时新增的默认字段
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
 * 拉取原始打卡记录（自动处理分页，取全量数据）
 * @param {Object} vk
 * @param {Object} uid
 * @param {Object} options
 * @param {String} options.beginDate - 开始日期，格式 "2024-08-24"
 * @param {String} options.endDate   - 结束日期，格式 "2024-08-26"
 * @param {Array}  options.personNos - 人员编号（可选）
 */
async function getOriginRecords(vk, uid, {
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
	const size = 100; // 每页条数，接口最大 100
	const maxPage = 500; // 安全上限，防止死循环

	let allRecords = [];
	let page = 1;
	let hasMore = true;

	while (hasMore && page <= maxPage) {
		console.log(`[hikOpenApi] 拉取第 ${page} 页...`);

		// 构造业务参数
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

		// 加密请求体
		let requestBody = JSON.stringify(bodyParams);
		if (HIK_CONFIG.enableSecret) {
			const encryptBody = encryptByPrivateKey(requestBody, privateKeyPem);
			requestBody = {
				bodySecret: encryptBody
			};
		} else {
			requestBody = bodyParams;
		}

		// 请求头
		const headers = {
			'App-Access-Token': appAccessToken
		};
		if (HIK_CONFIG.userAccessToken) {
			headers['User-Access-Token'] = HIK_CONFIG.userAccessToken;
		}

		// 发送请求
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

		// 解密响应
		let pageData = resp.data;
		if (typeof pageData === 'string' && HIK_CONFIG.enableSecret) {
			const decrypted = decryptByPrivateKey(pageData, privateKeyPem);
			pageData = JSON.parse(decrypted);
		} else if (pageData && pageData.bodySecret && HIK_CONFIG.enableSecret) {
			const decrypted = decryptByPrivateKey(pageData.bodySecret, privateKeyPem);
			pageData = JSON.parse(decrypted);
		}

		// 提取记录（兼容数组和对象结构）
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
		allRecords = allRecords.concat(records);

		// 关键：用返回条数是否等于 size 来判断是否还有下一页
		if (records.length < size) {
			hasMore = false;
		} else {
			page++;
			// 加少量延迟，避免触发频率限制（5 次/秒、100 次/分钟）
			await new Promise(r => setTimeout(r, 250));
		}
	}

	if (page > maxPage) {
		console.warn(`[hikOpenApi] 已达到最大页数限制 ${maxPage}，停止拉取`);
	}

	// 重新组装打卡地点、打卡时间、工号、图片等
	allRecords = allRecords.map((e) => {
		return {
			// ========== 主表字段 ==========
			employee_id: vk.myfn.formatJobNumber(e.jobNumber), // 工号，如 "t-00002"
			position: e.deviceName || '', // 打卡地点，用设备名
			type: '公司卡', // 打卡类型，按业务需要调整
			remark: e.remark || '',
			img: e.photo || '',
			clockintime: vk.myfn.clockTimeToTimestamp(e.clockTime), // 打卡时间字符串 "2026-10-14 06:39"，变成数字
			update_id: uid,
			update_date: new Date().getTime(),
			// ========== 海康原始数据（追踪用） ==========
			hik_info: {
				personNo: e.personNo || '',
				jobNumber: e.jobNumber || '',
				personName: e.personName || '',
				departmentNo: e.departmentNo || '',
				departmentName: e.departmentName || '',
				attendanceName: e.attendanceName || '',
				attendanceDate: e.attendanceDate || '',
				workday: e.workday || '',
				shiftId: e.shiftId || 0,
				shiftInfo: e.shiftInfo || '',
				clockTime: e.clockTime,
				deviceSerial: e.deviceSerial || '',
				deviceName: e.deviceName || '',
				wayOfClock: e.wayOfClock || '',
				clockStatusDesc: e.clockStatusDesc || '',
				isFillRecord: e.isFillRecord || 0,
				photo: e.photo || '',
				teamNo: e.teamNo || '',
				address: e.address || ''
			}
		};
	});

	console.log(`[hikOpenApi] 共拉取 ${allRecords.length} 条原始打卡记录`);
	return allRecords;
}