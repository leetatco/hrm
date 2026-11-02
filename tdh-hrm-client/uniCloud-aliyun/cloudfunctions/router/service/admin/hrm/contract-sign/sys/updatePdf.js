const pdf = require('pdf-lib');
module.exports = {
	/**
	 * 修改数据并合成签名 PDF
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
			signature_url
		} = data;

		// ================= 测试日志开始 =================
		console.log('========== [合同签署] 流程开始 ==========');
		console.log('入参 _id:', _id);
		console.log('入参 signature_url:', signature_url);
		// ================= 测试日志结束 =================

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
			msg: '合同已签署'
		};

		console.log('【步骤2】查合同成功，原文件URL:', contractRes.contract_sign_file);

		// ========== 3. 查签名位置配置 ==========
		let settingRes = await vk.baseDao.findByWhereJson({
			dbName: 'hrm-contract-setting',
			whereJson: {
				contract_sign_id: contractRes.contract_sign_id
			},
			field: {
				sign_position: 1
			}
		});

		let sign_position = (settingRes && settingRes.sign_position) ? settingRes.sign_position : {
			page: 0,
			x: 300,
			y: 180,
			width: 150,
			height: 60
		};

		console.log('【步骤3】签名位置配置:', JSON.stringify(sign_position));

		// ========== 4. 下载原 PDF ==========
		let pdfBytes;
		try {
			console.log('【步骤4】尝试下载文件 URL:', contractRes.contract_sign_file);

			// 使用 dataType: 'default' 获取原始二进制数据，但在出错时它可能返回 JSON 文本
			const res = await vk.request({
				url: contractRes.contract_sign_file,
				method: 'GET',
				dataType: 'default',
				responseType: 'arraybuffer',
			});

			// 如果返回的是字符串或者包含 error 字段，说明可能是 JSON 报错信息
			if (typeof res === 'string') {
				console.error('【步骤4】下载失败，返回字符串:', res);
				return {
					code: -1,
					msg: '下载合同文件失败，文件不存在或地址有误'
				};
			}

			// 如果返回的是 Object 且包含 error 字段 (例如你日志里的 {"error":"Document not found"})
			if (res && res.error) {
				console.error('【步骤4】下载失败，服务端返回错误:', res.error);
				return {
					code: -1,
					msg: `下载合同文件失败: ${res.error}`
				};
			}

			// 如果返回的既不是字符串也不是 Buffer，可能是其他异常格式
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

		// ========== 5. 加载 PDF 并贴签名 ==========
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
		const targetIndex = sign_position.page === 0 ? pages.length - 1 : (sign_position.page - 1);

		if (targetIndex < 0 || targetIndex >= pages.length) {
			return {
				code: -1,
				msg: '签名位置页码超出范围'
			};
		}

		const page = pages[targetIndex];

		// 下载签名 PNG
		let pngBytes;
		try {
			pngBytes = await vk.request({
				url: signature_url,
				method: 'GET',
				dataType: 'default',
				responseType: 'arraybuffer'
			});
			console.log('【步骤5】下载签名PNG成功，大小:', pngBytes.length, '字节');
		} catch (e) {
			console.error('【步骤5】下载签名PNG失败:', e);
			return {
				code: -1,
				msg: '下载签名图片失败'
			};
		}

		let pngImage;
		try {
			pngImage = await pdfDoc.embedPng(pngBytes);
		} catch (e) {
			console.error('【步骤5】图片格式错误:', e);
			return {
				code: -1,
				msg: '签名图片格式错误'
			};
		}

		const pngWidth = pngImage.width;
		const pngHeight = pngImage.height;

		const targetWidth = sign_position.width;
		const targetHeight = (pngHeight / pngWidth) * targetWidth;

		page.drawImage(pngImage, {
			x: sign_position.x - 20,
			y: sign_position.y,
			width: targetWidth,
			height: targetHeight,
			interpolate: false
		});

		console.log('【步骤5】签名已贴入PDF');

		// ========== 6. 生成新 PDF ==========
		const signedPdfBytes = await pdfDoc.save();
		console.log('【步骤6】生成新PDF成功，大小:', signedPdfBytes.length, '字节');

		// ========== 7. 上传新 PDF ==========
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

			// 1. 写入临时文件
			const tempFilePath = path.join(os.tmpdir(), `sign_${Date.now()}.pdf`);
			fs.writeFileSync(tempFilePath, signedPdfBytes);

			// 2. 使用文件路径上传
			let uploadResult = await vk.request({
				url: uploadOptions.url,
				method: 'POST',
				header: uploadOptions.header,
				data: {
					...uploadOptions.formData
				},
				files: {
					file: tempFilePath // 直接传文件路径字符串
				}
			});

			// 3. 清理临时文件
			fs.unlinkSync(tempFilePath);

			if (uploadResult && uploadResult.error) {
				return {
					code: -1,
					msg: `上传失败: ${uploadResult.error}`
				};
			}
			console.log('【步骤7】上传新PDF成功，返回结果:', uploadResult);

		} catch (e) {
			console.error('【步骤7】上传异常:', e);
			return {
				code: -1,
				msg: `上传请求异常: ${e.message}`
			};
		}

		const newFileUrl = `https://tdhstorage.cntdh.net/${newCloudPath}`;

		// ========== 8. 回写合同表, 删除原文件 ==========
		await vk.baseDao.updateById({
			dbName: 'hrm-contract-sign',
			id: _id,
			dataJson: {
				contract_sign_file: newFileUrl,
				signature_url: signature_url,
				status: 1,
				sign_time: new Date().getTime(),
				update_id: uid,
				update_date: new Date().getTime()
			}
		});

		// 删除原文件
		if (contractRes.contract_sign_file) {
			await vk.callFunction({
				url: 'common/pub/deleteFile/index',
				data: {
					fileList: [contractRes.contract_sign_file]
				}
			})
		}

		console.log('【步骤8-1】合同表回写成功，最终文件URL:', newFileUrl);
		console.log('【步骤8-2】合同表回写成功，最终删除原文件URL:', contractRes.contract_sign_file);

		// ========== 9. 写日志（可选） ==========
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
				contract_sign_file: newFileUrl
			}
		};
	}
};