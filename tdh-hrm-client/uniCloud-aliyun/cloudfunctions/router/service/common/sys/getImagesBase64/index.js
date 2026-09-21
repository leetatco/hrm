module.exports = {
	main: async (event) => {
		const {
			data = {}
		} = event;
		const {
			imageUrls = [],
				concurrency = 5,
				maxCount = 100,
				timeout = 30000,
				retries = 1
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

		// 单次下载尝试（指定 provider）
		const downloadWithProvider = (url, provider, ms) => {
			return Promise.race([
				vk.downloadFile({
					provider: provider,
					fileID: url
				}),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error('下载超时')), ms)
				)
			]);
		};

		// 带降级策略的下载：先尝试 unicloud，失败后尝试 extStorage
		const downloadWithFallback = async (url, ms) => {
			const providers = ['extStorage', 'unicloud'];
			let lastError;

			for (const provider of providers) {
				try {
					const result = await downloadWithProvider(url, provider, ms);
					// 如果返回成功且有文件内容，则返回
					if (result && result.fileContent) {
						return result;
					}
					// 如果返回空对象或没有 fileContent，视为失败，继续尝试下一个 provider
					throw new Error(`provider ${provider} 返回空内容`);
				} catch (err) {
					lastError = err;
					console.log(`使用 ${provider} 下载失败:`, err.message);
					// 继续尝试下一个 provider
				}
			}

			// 所有 provider 都失败
			throw lastError || new Error('所有下载方式均失败');
		};

		// 带重试的下载（指数退避），内部集成降级策略
		const downloadWithRetry = async (url, maxRetries, ms) => {
			let lastError;
			for (let i = 0; i <= maxRetries; i++) {
				try {
					// 每次重试都重新执行降级下载流程
					return await downloadWithFallback(url, ms);
				} catch (err) {
					lastError = err;
					if (i < maxRetries) {
						const delay = 300 * Math.pow(2, i);
						console.log(`第 ${i + 1} 次重试，等待 ${delay}ms`);
						await new Promise(r => setTimeout(r, delay));
					}
				}
			}
			throw lastError;
		};

		// 处理单张图片
		const processOne = async (url) => {
			try {
				const res = await downloadWithRetry(url, retries, timeout);

				// 检查是否有文件内容
				if (!res.fileContent) {
					throw new Error('下载成功但未返回文件内容');
				}

				const base64 = res.fileContent.toString('base64');

				// 优先从响应头取 MIME，其次从 URL 后缀取
				let mime = 'image/png';
				if (res.contentType && res.contentType.startsWith('image/')) {
					mime = res.contentType;
				} else {
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