import FileSaver from "file-saver";
import * as XLSX from "xlsx";
class IExcel {
	constructor() {}

	//文件是否加密
	// 通过文件头判断加密
	isEncryptedByHeader(data) {
		// 标准加密文件头
		const encryptedHeaders = [
			// Office 2007+ 加密格式
			[0x50, 0x4B, 0x03, 0x04, 0x2D, 0x00, 0x08, 0x01],

			// 旧版 Excel 加密格式
			[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
		];

		// 检查是否匹配任一加密头
		return encryptedHeaders.some(header => {
			if (data.length < header.length) return false;
			for (let i = 0; i < header.length; i++) {
				if (data[i] !== header[i]) return false;
			}
			return true;
		});
	}

	// 通过错误信息判断加密
	isEncryptionError(error) {
		if (!error || !error.message) return false;

		const errorMsg = error.message.toLowerCase();
		const encryptionKeywords = [
			'password', 'encrypt', 'encrypted', 'crypt',
			'protected', 'security', 'agile', 'standard',
			'extensible', 'locked', 'permission'
		];

		return encryptionKeywords.some(keyword =>
			errorMsg.includes(keyword)
		);
	}

	// 解析工作簿
	parseWorkbook(workbook) {
		try {
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

			if (jsonData.length === 0) {
				vk.toast("文件未包含有效数据", "warning");
				return;
			}

			// 处理数据...
			vk.toast(`成功导入 ${jsonData.length} 条数据`, "success");

		} catch (parseError) {
			vk.toast(`数据处理失败: ${parseError.message}`, "error");
		}
	}


	//将文件按照二进制进行读取
	readFile(file) {
		return new Promise((resolve) => {
			let reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = (e) => {
				resolve(e.target.result);
			}
		})
	}
	//导入excel  ------ 将二进制转json (file是文件流，typeObj是传给后端的表格字段，suc是成功的回调，err是错误的回调）
	async importExcel(file, typeObj, suc, err) {
		const data = await this.readFile(file);
		const workbook = XLSX.read(data, {
			type: "array",
			cellText: false, // 禁用富文本格式
			cellHTML: false, // 禁用 HTML 内容
			raw: true
		});

		this.parseWorkbook(workbook);
		const worksheet = workbook.Sheets[workbook.SheetNames[0]];
		const wkData = XLSX.utils.sheet_to_json(worksheet);
		let arr = [];
		console.log("excel原始数据:", wkData);
		wkData.forEach((item) => {
			let obj = {};
			for (let key in typeObj) {
				let v = typeObj[key];
				let text = v.text || v.title;
				let type = v.type;
				// if (!item.hasOwnProperty(text)) break;						
				v = item[text] || "";
				if (type === "text" && vk.pubfn.isNotNull(v)) {
					v = String(v).trim();
				} 
				if (type === "number" && vk.pubfn.isNotNull(v)) {
					v = Number(v);
				}
				// type === "date" ? (v = vk.pubfn.timeFormat(new Date((v - 25569) * 86400 * 1000), "yyyy-MM-dd")) : "";
				obj[key] = v;
			}
			arr.push(obj);
		});
		if (arr.length != 0) {
			console.log("excel转换后数据:", arr);
			return new Promise(resolve => {
				resolve(suc(arr));
			})
		} else {
			err();
		}
	}
	//导出excel --------
	exportExcel(fileName, sheetName, tableData) {
		var xlsxParam = {
			raw: true
		}; //转换成excel时，使用原始的格式
		let workSheet = XLSX.utils.json_to_sheet(tableData, xlsxParam);
		let bookNew = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(bookNew, workSheet, sheetName); // 工作簿名称
		var wbout = XLSX.write(bookNew, {
			bookType: "xlsx",
			bookSST: true,
			type: "array",
		});
		try {
			FileSaver.saveAs(
				new Blob([wbout], {
					type: "application/octet-stream"
				}),
				fileName + ".xlsx"
			);
		} catch (e) {
			if (typeof console !== "undefined") {
				console.log(e, wbout);
			}
		}
		return wbout;
	}
}
export function initExcel() {
	return new IExcel();
}