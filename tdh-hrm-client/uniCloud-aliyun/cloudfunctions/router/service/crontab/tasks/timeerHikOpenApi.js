const vk = uniCloud.vk; // 全局vk实例
const db = uniCloud.database(); // 全局数据库引用
const _ = db.command; // 数据库操作符
const $ = _.aggregate; // 聚合查询操作符

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

// ==================== 内部方法 ====================

/**
 * 获取 App Access Token（带简单缓存）
 */
async function getAppAccessToken() {
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

	// 写入缓存（upsert）
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
 * 拉取原始打卡记录（自动处理分页，取全量数据）
 */
async function getOriginRecords(beginDate, endDate, personNos = []) {
	if (!beginDate || !endDate) {
		throw new Error('beginDate 和 endDate 不能为空，格式为 "YYYY-MM-DD"');
	}

	const tokenInfo = await getAppAccessToken();
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

		// 用返回条数是否等于 size 来判断是否还有下一页
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

	// ========== 批量查询员工 company_id ==========
	// 1. 收集所有工号（去重）
	const employeeIds = [...new Set(
		allRecords.map(e => vk.myfn.formatJobNumber(e.jobNumber)).filter(Boolean)
	)];

	// 2. 批量查询 hrm-employees，拿到 employee_id → company_id 映射
	const employeeCompanyMap = {};
	if (employeeIds.length > 0) {
		const batchSize = 500;
		for (let i = 0; i < employeeIds.length; i += batchSize) {
			const batchIds = employeeIds.slice(i, i + batchSize);
			const empRes = await vk.baseDao.select({
				dbName: 'hrm-employees',
				whereJson: {
					employee_id: _.in(vk.pubfn.isNull(batchIds) ? [] : batchIds),
				},
				fieldJson: {
					employee_id: 1,
					company_id: 1
				},
				pageSize: batchSize
			});
			(empRes.rows || []).forEach(emp => {
				employeeCompanyMap[emp.employee_id] = emp.company_id || '';
			});
		}
	}

	// 3. 重新组装记录，带上 company_id
	allRecords = allRecords.map((e) => {
		const employeeId = vk.myfn.formatJobNumber(e.jobNumber);
		return {
			// ========== 主表字段 ==========
			employee_id: employeeId,
			company_id: employeeCompanyMap[employeeId] || '',
			position: e.deviceName || '',
			type: '公司卡',
			remark: e.remark || '',
			img: e.photo || '',
			clockintime: vk.myfn.clockTimeToTimestamp(e.clockTime),
			update_id: 'system',
			update_date: new Date().getTime(),
			// ========== 海康原始数据 ==========
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

/**
 * 批量写入打卡记录到 hrm-clockin（按时间段先删后插）
 * @param {Array}  items     - 打卡记录数组
 * @param {String} beginDate - 开始日期 "YYYY-MM-DD"
 * @param {String} endDate   - 结束日期 "YYYY-MM-DD"
 */
async function batchAddClockin(items, beginDate, endDate) {
	const dbName = 'hrm-clockin';

	if (!Array.isArray(items) || items.length === 0) {
		return {
			addCount: 0,
			delCount: 0,
			msg: '没有需要新增的数据'
		};
	}
	if (!beginDate || !endDate) {
		throw new Error('beginDate 和 endDate 不能为空，格式为 "YYYY-MM-DD"');
	}

	// 1. 日期字符串转毫秒时间戳（beginDate 取当天 00:00:00，endDate 取当天 23:59:59）
	const beginTime = vk.myfn.dateToTimestamp(beginDate, false);
	const endTime = vk.myfn.dateToTimestamp(endDate, true);

	// 2. 删除该时间段内已有的打卡记录（clockintime 是数字时间戳）
	const delRes = await vk.baseDao.delete({
		dbName,
		whereJson: {
			clockintime: _.gte(beginTime).lte(endTime)
		}
	});
	console.log(`[batchAdd] 删除旧数据 ${delRes} 条`);

	// 3. 批量插入新数据
	const batchSize = 100;
	let addCount = 0;
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		await vk.baseDao.adds({
			dbName,
			dataJson: batch
		});
		addCount += batch.length;
	}

	return {
		addCount,
		delCount: delRes,
		msg: `删除旧数据，新增 ${addCount} 条`
	};
}

// ==================== 主函数 ====================

module.exports = async function(event) {
	let {
		triggerTime, // 本轮统一的触发时间戳（毫秒），不受前面任务执行耗时的影响
	} = event;
	let res = {
		code: 0,
		msg: ''
	};
	// 业务逻辑开始-----------------------------------------------------------
	console.log('我是timeerHikOpenApi定时任务');
	console.log('timeerHikOpenApi定时任务本轮触发时间：', vk.pubfn.timeFormat(triggerTime));

	try {
		// 计算前一天日期（格式 YYYY-MM-DD）
		const yesterday = new Date(triggerTime - 24 * 60 * 60 * 1000);
		const dateStr = vk.pubfn.timeFormat(yesterday, 'yyyy-MM-dd');
		console.log('抓取日期（前一天）：', dateStr);

		// 1. 只传前一天的开始和结束日期（同一天），不传 personNos 则拉取所有人员
		const personNos = ['CY048645147'];
		const records = await getOriginRecords(dateStr, dateStr, personNos);
		console.log(`拉取到 ${records.length} 条打卡记录`);

		// 2. 写入 hrm-clockin 表（按时间段先删后插）
		if (records.length > 0) {
			const addRes = await batchAddClockin(records, dateStr, dateStr);
			res.addCount = addRes.addCount;
			res.delCount = addRes.delCount;
			res.msg = addRes.msg;
			console.log(`[定时任务] ${addRes.msg}`);
		} else {
			res.msg = '未拉取到打卡记录';
			console.log(res.msg);
		}

		res.rows = records;
		res.total = records.length;
	} catch (e) {
		console.error('海康开放平台调用失败:', e);
		res.code = -1;
		res.msg = e.message || '调用失败';
	}
	// 业务逻辑结束-----------------------------------------------------------
	return res;
}