const pdf = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
	/**
	 * 员工签署：将签名图片贴入 PDF
	 * @url admin/hrm/contract-sign/sys/update 前端调用的url参数地址
	 */
	main: async (event) => {
		let {
			data = {}, userInfo, util
		} = event;
		let {
			vk,
			db,
			_
		} = util;

		let {
			_id,
			uid,
			signature_url,
			fieldKeys = []
		} = data;

		console.log('========== [合同签署] 流程开始 ==========');
		console.log('入参 _id:', _id);
		console.log('入参 signature_url:', signature_url);

		// ========== 1. 参数校验 ==========
		if (vk.pubfn.isNull(_id)) return {
			code: -1,
			msg: 'id不能为空'
		};
		if (vk.pubfn.isNull(signature_url)) return {
			code: -1,
			msg: '缺少签名图片'
		};

		// ========== 2. 查合同 ==========
		let contractRes = await vk.baseDao.findById({
			dbName: 'hrm-contract-sign',
			id: _id,
			field: {
				_id: 1,
				contract_sign_id: 1,
				contract_sign_file: 1,
				contract_sign_name: 1,
				status: 1,
				card: 1
			}
		});

		if (!contractRes) return {
			code: -1,
			msg: '合同不存在'
		};
		if (contractRes.status === 1) return {
			code: -1,
			msg: '合同已签署，无需重复签署'
		};

		console.log('【步骤2】查合同成功，原文件URL:', contractRes.contract_sign_file);

		// ========== 3. 查签名位置配置（数组） ==========
		let settingRes = await vk.baseDao.findByWhereJson({
			dbName: 'hrm-contract-setting',
			whereJson: {
				contract_sign_id: contractRes.contract_sign_id
			},
			field: {
				sign_positions: 1
			}
		});

		let signPositions = (settingRes && Array.isArray(settingRes.sign_positions)) ? settingRes
			.sign_positions : [];
		let textPositions = (settingRes && Array.isArray(settingRes.text_positions)) ? settingRes
			.text_positions : [];

		if (signPositions.length === 0) {
			return {
				code: -1,
				msg: '该合同未配置签名位置，请联系管理员'
			};
		}

		// 过滤出前端需要的文本配置
		if (fieldKeys && fieldKeys.length > 0) {
			textPositions = textPositions.filter(item => fieldKeys.includes(item.fieldKey));
		} else {
			textPositions = [];
		}

		console.log('【步骤3】签名位置配置数量:', signPositions.length);

		// ========== 4. 下载原 PDF ==========
		let pdfBytes;
		try {
			console.log('【步骤4】尝试下载文件 URL:', contractRes.contract_sign_file);

			const res = await vk.request({
				url: contractRes.contract_sign_file,
				method: 'GET',
				dataType: 'default',
				responseType: 'arraybuffer',
			});

			if (typeof res === 'string') {
				console.error('【步骤4】下载失败，返回字符串:', res);
				return {
					code: -1,
					msg: '下载合同文件失败，文件不存在或地址有误'
				};
			}

			if (res && res.error) {
				console.error('【步骤4】下载失败，服务端返回错误:', res.error);
				return {
					code: -1,
					msg: `下载合同文件失败: ${res.error}`
				};
			}

			if (!res || (!Buffer.isBuffer(res) && !(res instanceof ArrayBuffer))) {
				console.error('【步骤4】下载失败，返回了未知格式的数据:', res);
				return {
					code: -1,
					msg: '下载合同文件失败，返回格式异常'
				};
			}

			pdfBytes = Buffer.isBuffer(res) ? res : Buffer.from(res);
			console.log('【步骤4】下载原PDF成功，大小:', pdfBytes.length, '字节');

		} catch (e) {
			console.error('【步骤4】下载原PDF请求异常:', e);
			return {
				code: -1,
				msg: '下载合同文件异常'
			};
		}

		// ========== 5. 加载 PDF ==========
		let pdfDoc;
		try {
			pdfDoc = await pdf.PDFDocument.load(pdfBytes);
		} catch (e) {
			console.error('【步骤5】PDF解析失败:', e);
			return {
				code: -1,
				msg: 'PDF解析失败'
			};
		}

		const pages = pdfDoc.getPages();

		// ========== 7. 绘制动态文本（支持拆分年月日） ==========
		if (textPositions.length > 0) {
			pdfDoc.registerFontkit(fontkit);
			let fontPath = path.join(__dirname, 'simsun.ttf');
			let chineseFont;

			if (fs.existsSync(fontPath)) {
				const fontBytes = fs.readFileSync(fontPath);
				chineseFont = await pdfDoc.embedFont(fontBytes);
			}

			if (chineseFont) {
				// 获取当前时间
				let now = new Date();
				let yearStr = now.getFullYear().toString();
				let monthStr = (now.getMonth() + 1).toString().padStart(2, '0'); // 补零，例如 09
				let dayStr = now.getDate().toString().padStart(2, '0'); // 补零，例如 05

				// 也可以是完整日期
				let fullDateStr = `${yearStr}年${monthStr}月${dayStr}日`;

				for (let i = 0; i < textPositions.length; i++) {
					const field = textPositions[i];
					const page = pages[field.page === 0 ? pages.length - 1 : (field.page - 1)];
					if (!page) continue;

					let textValue = "";

					// 【核心修改】：根据 fieldKey 分配数据源
					if (field.fieldKey === 'sign_year') {
						textValue = yearStr;
					} else if (field.fieldKey === 'sign_month') {
						textValue = monthStr;
					} else if (field.fieldKey === 'sign_day') {
						textValue = dayStr;
					} else if (field.fieldKey === 'sign_date') {
						textValue = fullDateStr; // 如果配置的是完整日期
					}

					if (textValue) {
						const fontSize = 14;						
						// 【优化】：自适应垂直居中（框高度 - 字体高度）/ 2，确保在下划线框内居中
						// 如果你觉得还是偏下，可以在此基础上加个固定偏移量，比如 + 2
						const fieldHeight = Number(field.height) || 20;
						const yPos = Number(field.y) + (fieldHeight - fontSize) / 2;

						page.drawText(textValue.toString(), {
							x: Number(field.x),
							y: yPos + 10,
							size: fontSize,
							font: chineseFont,
							color: pdf.rgb(0, 0, 0)
						});
					}
				}
			}
		}


		// ========== 6. 下载签名 PNG（只下载、只 embed 一次） ==========
		let pngBytes;
		try {
			const pngRes = await vk.request({
				url: signature_url,
				method: 'GET',
				dataType: 'default',
				responseType: 'arraybuffer'
			});

			if (typeof pngRes === 'string') {
				console.error('【步骤6】下载签名PNG失败，返回字符串:', pngRes);
				return {
					code: -1,
					msg: '下载签名图片失败'
				};
			}
			if (pngRes && pngRes.error) {
				console.error('【步骤6】下载签名PNG失败，服务端返回错误:', pngRes.error);
				return {
					code: -1,
					msg: `下载签名图片失败: ${pngRes.error}`
				};
			}
			if (!pngRes || (!Buffer.isBuffer(pngRes) && !(pngRes instanceof ArrayBuffer))) {
				console.error('【步骤6】下载签名PNG失败，返回格式异常:', pngRes);
				return {
					code: -1,
					msg: '下载签名图片失败，返回格式异常'
				};
			}

			pngBytes = Buffer.isBuffer(pngRes) ? pngRes : Buffer.from(pngRes);
			console.log('【步骤6】下载签名PNG成功，大小:', pngBytes.length, '字节');
		} catch (e) {
			console.error('【步骤6】下载签名PNG失败:', e);
			return {
				code: -1,
				msg: '下载签名图片失败'
			};
		}

		let pngImage;
		try {
			pngImage = await pdfDoc.embedPng(pngBytes);
		} catch (e) {
			console.error('【步骤6】图片格式错误:', e);
			return {
				code: -1,
				msg: '签名图片格式错误，请重新签名'
			};
		}

		const pngWidth = pngImage.width;
		const pngHeight = pngImage.height;

		// ========== 7. 先统一校验所有位置页码 ==========
		for (let i = 0; i < signPositions.length; i++) {
			const pos = signPositions[i] || {};
			const pageNum = (pos.page === undefined || pos.page === null) ? 0 : pos.page;
			const targetIndex = pageNum === 0 ? pages.length - 1 : (pageNum - 1);
			if (targetIndex < 0 || targetIndex >= pages.length) {
				console.error(`【步骤7】位置#${i + 1}页码越界: page=${pageNum}, PDF总页数=${pages.length}`);
				return {
					code: -1,
					msg: `第 ${i + 1} 个签名位置页码超出范围（PDF共${pages.length}页）`
				};
			}
		}

		// ========== 8. 循环贴签名到每个位置 ==========
		for (let i = 0; i < signPositions.length; i++) {
			const pos = signPositions[i] || {};
			const pageNum = (pos.page === undefined || pos.page === null) ? 0 : pos.page;
			const targetIndex = pageNum === 0 ? pages.length - 1 : (pageNum - 1);
			const page = pages[targetIndex];

			// 框的宽高
			const boxW = Number(pos.width) > 0 ? Number(pos.width) : 150;
			const boxH = Number(pos.height) > 0 ? Number(pos.height) : 60;

			// 【核心修复】：保持原图比例，取最小缩放比，确保图片完全在框内
			const scaleX = boxW / pngWidth;
			const scaleY = boxH / pngHeight;
			const scale = Math.min(scaleX, scaleY); // 选较小的比例，这样保证宽度和高度都不会超出框

			// 实际贴图宽高
			const targetWidth = pngWidth * scale + 6;
			const targetHeight = pngHeight * scale + 6;

			// 居中计算（如果你希望它贴在框的左下角，可以去掉这里的居中偏移）
			const offsetX = (boxW - targetWidth) / 2;
			const offsetY = (boxH - targetHeight) / 2;

			page.drawImage(pngImage, {
				x: Number(pos.x), // 加上居中偏移
				y: Number(pos.y) + offsetY + 10,
				width: targetWidth,
				height: targetHeight,
				interpolate: false
			});

			console.log(
				`【步骤8】位置#${i + 1} 已贴入: page=${pageNum}, 框:${boxW}x${boxH}, 图:${targetWidth}x${targetHeight}`
			);
		}

		console.log('【步骤8】所有签名已贴入PDF');

		// ========== 9. 生成新 PDF ==========
		const signedPdfBytes = await pdfDoc.save();
		console.log('【步骤9】生成新PDF成功，大小:', signedPdfBytes.length, '字节');

		// ========== 10. 上传新 PDF ==========
		const newCloudPath = `public/contract/signed/${userInfo?.username}_${Date.now()}.pdf`;
		const uploadOptRes = await vk.callFunction({
			url: 'common/pub/getUploadFileOptions/index',
			data: {
				cloudPath: newCloudPath,
				fileType: 'pdf'
			}
		});
		if (uploadOptRes.code !== 0) return {
			code: -1,
			msg: '获取上传凭证失败'
		};
		const uploadOptions = uploadOptRes.rows.uploadFileOptions;

		try {
			const fs = require('fs');
			const path = require('path');
			const os = require('os');

			const tempFilePath = path.join(os.tmpdir(), `sign_${Date.now()}.pdf`);
			fs.writeFileSync(tempFilePath, signedPdfBytes);

			let uploadResult = await vk.request({
				url: uploadOptions.url,
				method: 'POST',
				header: uploadOptions.header,
				data: {
					...uploadOptions.formData
				},
				files: {
					file: tempFilePath
				}
			});

			fs.unlinkSync(tempFilePath);

			if (uploadResult && uploadResult.error) {
				return {
					code: -1,
					msg: `上传失败: ${uploadResult.error}`
				};
			}
			console.log('【步骤10】上传新PDF成功');

		} catch (e) {
			console.error('【步骤10】上传异常:', e);
			return {
				code: -1,
				msg: `上传请求异常: ${e.message}`
			};
		}

		const newFileUrl = `https://tdhstorage.cntdh.net/${newCloudPath}`;

		// ========== 11. 回写合同表, 删除原文件 ==========
		await vk.baseDao.updateById({
			dbName: 'hrm-contract-sign',
			id: _id,
			dataJson: {
				contract_sign_file: newFileUrl,
				signature_url: signature_url,
				status: 1, // 状态变为已签署
				sign_time: new Date().getTime(),
				update_id: uid,
				update_date: new Date().getTime()
			}
		});

		// 删除原文件（带文字未签名的那个文件）
		if (contractRes.contract_sign_file) {
			await vk.callFunction({
				url: 'common/pub/deleteFile/index',
				data: {
					fileList: [contractRes.contract_sign_file]
				}
			});
		}

		console.log('【步骤11】合同回写成功，最终文件URL:', newFileUrl);

		// ========== 12. 写日志 ==========
		await vk.baseDao.add({
			dbName: 'hrm-contract-sign-log',
			dataJson: {
				doc_id: _id,
				action: 'sign',
				operator_type: 'employee',
				card: contractRes.card,
				update_id: uid,
				update_date: new Date().getTime()
			}
		});

		console.log('========== [合同签署] 流程结束 ==========');

		return {
			code: 0,
			msg: '签署成功',
			data: {
				contract_sign_file: newFileUrl,
				sign_count: signPositions.length
			}
		};
	}
};