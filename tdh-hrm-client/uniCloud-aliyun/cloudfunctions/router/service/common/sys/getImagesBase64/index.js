module.exports = {
	main: async (event) => {
		const {
			data = {}
		} = event;
		const {
			imageUrls = [],
				concurrency = 5, // 并发数，默认同时下载 5 张
				maxCount = 100, // 单次上限，防止内存/超时爆炸
				timeout = 30000, // 单张超时 30 秒
				retries = 1 // 失败重试 1 次
		} = data;

		// 参数校验
		if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
			return {
				code: 1,
				msg: '图片URL列表不能为空'
			};
		}
		if (imageUrls.length > maxCount) {
			return {
				code: 1,
				msg: `单次最多处理 ${maxCount} 张，当前 ${imageUrls.length} 张，请分批调用`
			};
		}

		const {
			util
		} = event;
		const {
			vk
		} = util;

		const mimeMap = {
			'png': 'image/png',
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'gif': 'image/gif',
			'webp': 'image/webp'
		};

		// 带超时的下载
		const downloadWithTimeout = (url, ms) => {
			return Promise.race([
				vk.downloadFile({
					fileID: url
				}),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error('下载超时')), ms)
				)
			]);
		};

		// 带重试的下载（指数退避）
		const downloadWithRetry = async (url, maxRetries, ms) => {
			let lastError;
			for (let i = 0; i <= maxRetries; i++) {
				try {
					return await downloadWithTimeout(url, ms);
				} catch (err) {
					lastError = err;
					if (i < maxRetries) {
						await new Promise(r => setTimeout(r, 300 * Math.pow(2, i)));
					}
				}
			}
			throw lastError;
		};

		// 处理单张图片
		const processOne = async (url) => {
			try {
				const res = await downloadWithRetry(url, retries, timeout);
				const base64 = res.fileContent.toString('base64');

				// 优先从响应头取 MIME，其次从 URL 后缀取
				let mime = 'image/png';
				if (res.contentType && res.contentType.startsWith('image/')) {
					mime = res.contentType;
				} else {
					// 正则排除 ?query 和 #hash 干扰
					const extMatch = url.match(/\.(png|jpe?g|gif|webp)(?:[?#]|$)/i);
					if (extMatch) {
						mime = mimeMap[extMatch[1].toLowerCase()] || mime;
					}
				}

				return {
					url,
					base64: `data:${mime};base64,${base64}`,
					success: true
				};
			} catch (err) {
				return {
					url,
					success: false,
					error: err.message || '下载失败'
				};
			}
		};

		// 并发控制：切片批量执行
		const results = [];
		for (let i = 0; i < imageUrls.length; i += concurrency) {
			const batch = imageUrls.slice(i, i + concurrency);
			const batchRes = await Promise.all(batch.map(url => processOne(url)));
			results.push(...batchRes);
		}

		const success = results.filter(r => r.success).length;
		const failed = results.length - success;

		return {
			code: 0,
			msg: `完成：成功 ${success} 张，失败 ${failed} 张`,
			data: results
		};
	}
};