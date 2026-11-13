const pdf = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
	main: async (event) => {
		let {
			data = {}, userInfo, util
		} = event;
		let {
			vk,
			db,
			_
		} = util;

		// 接收 fieldKeys
		let {
			template_file,
			card,
			contract_sign_id,
			fieldKeys = []
		} = data;

		if (!template_file) return {
			code: -1,
			msg: '缺少模板文件'
		};
		if (!card) return {
			code: -1,
			msg: '缺少员工身份证号'
		};

		// 1. 查员工详细信息
		let employeeInfo = await vk.baseDao.findByWhereJson({
			dbName: 'hrm-employees', // 你的员工表名
			whereJson: {
				card: card
			}
		});
		if (!employeeInfo) return {
			code: -1,
			msg: '未找到员工信息'
		};

		// 2. 查配置中的文本定位信息
		let settingRes = await vk.baseDao.findByWhereJson({
			dbName: 'hrm-contract-setting', // 你的配置表名
			whereJson: {
				contract_sign_id: contract_sign_id
			},
			field: {
				text_positions: 1
			}
		});
		let textPositions = settingRes?.text_positions || [];

		// 【新增】：如果传了 fieldKeys，则过滤出需要填充的字段
		if (fieldKeys && fieldKeys.length > 0) {
			textPositions = textPositions.filter(item => fieldKeys.includes(item.fieldKey));
		}

		console.log("employeeInfo:", employeeInfo);
		console.log("需要的 textPositions:", textPositions);

		// 3. 下载模板 PDF
		const res = await vk.request({
			url: template_file,
			method: 'GET',
			dataType: 'default',
			responseType: 'arraybuffer',
		});
		let pdfBytes = Buffer.isBuffer(res) ? res : Buffer.from(res);
		let pdfDoc = await pdf.PDFDocument.load(pdfBytes);
		const pages = pdfDoc.getPages();

		// 注册中文字体 (请确保云函数目录下有 simsun.ttf)
		pdfDoc.registerFontkit(fontkit);
		let fontPath = path.join(__dirname, 'simsun.ttf');
		let chineseFont;
		if (fs.existsSync(fontPath)) {
			console.log("fontPath:", fontPath);
			const fontBytes = fs.readFileSync(fontPath);
			chineseFont = await pdfDoc.embedFont(fontBytes);
		}

		// 4. 填充文字
		if (chineseFont && textPositions.length > 0) {
			for (let i = 0; i < textPositions.length; i++) {
				const field = textPositions[i];
				const targetIndex = field.page === 0 ? pages.length - 1 : (field.page - 1);
				const page = pages[targetIndex];
				if (!page) continue;

				let textValue = employeeInfo[field.fieldKey] || "";
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

		// 5. 保存并上传新 PDF
		const prefilledBytes = await pdfDoc.save();
		const newCloudPath = `public/contract/prefilled/${card}_${Date.now()}.pdf`;

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

		const tempFilePath = path.join(os.tmpdir(), `prefill_${Date.now()}.pdf`);
		fs.writeFileSync(tempFilePath, prefilledBytes);

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

		if (uploadResult && uploadResult.error) return {
			code: -1,
			msg: `上传失败: ${uploadResult.error}`
		};
		const newFileUrl = `https://tdhstorage.cntdh.net/${newCloudPath}`;

		// 删除模版文件
		if (template_file) {
			await vk.callFunction({
				url: 'common/pub/deleteFile/index',
				data: {
					fileList: [template_file]
				}
			});
		}

		return {
			code: 0,
			msg: '预填充成功',
			data: {
				contract_sign_file: newFileUrl
			}
		};
	}
};