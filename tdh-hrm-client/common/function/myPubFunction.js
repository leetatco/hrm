/**
 * 自定义公共函数
 */
let myfn = {};
let res = {
	code: 0,
	data: {},
	msg: ''
};
/**
 * 通过身份证号计算年龄
 * @param {str} str 字符串  身份证号
 *
 */
//iden参数是身份证号
function getAgeToIden(iden) {
	let val = iden.length
	let myDate = new Date()
	let month = myDate.getMonth() + 1
	let day = myDate.getDate()
	let age = 0

	if (val === 18) {
		age = myDate.getFullYear() - iden.substring(6, 10) - 1
		if (
			iden.substring(10, 12) < month ||
			(iden.substring(10, 12) == month && iden.substring(12, 14) <= day)
		)
			age++
	}
	return age
}
/**
 * 测试函数test1
 * vk.myfn.test1();
 */
myfn.test1 = function(card) {
	// 逻辑	  
	let num = card;
	// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
	if (!/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)) {
		return false;
	}
	// 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
	// 下面分别分析出生日期和校验位
	let re;
	let birthday;
	let sex;
	let age;
	let month;
	const len = num.length;

	age = getAgeToIden(num);

	if (len === 15) {
		// 获取出生日期
		birthday = `19${card.substring(6, 8)}-${card.substring(
	          8,
	          10
	        )}-${card.substring(10, 12)}`;
		// 获取性别
		sex = parseInt(card.substr(14, 1), 10) % 2 === 1 ? 'M' : 'F';

		re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
		const arrSplit = num.match(re);

		// 检查生日日期是否正确
		const dtmBirth = new Date(
			`19${arrSplit[2]}/${arrSplit[3]}/${arrSplit[4]}`
		);
		const bGoodDay =
			dtmBirth.getFullYear() === Number(arrSplit[2]) &&
			dtmBirth.getMonth() + 1 === Number(arrSplit[3]) &&
			dtmBirth.getDate() === Number(arrSplit[4]);
		if (!bGoodDay) {
			res.code = -1;
			return res;
		}
		// 将15位身份证转成18位
		// 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
		const arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
		const arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
		let nTemp = 0;
		let i;

		num = `${num.substr(0, 6)}19${num.substr(6, num.length - 6)}`;
		for (i = 0; i < 17; i++) {
			nTemp += num.substr(i, 1) * arrInt[i];
		}
		num += arrCh[nTemp % 11];
	} else if (len === 18) {
		//获取出生月份
		month = parseInt(card.substring(
			10,
			12
		));
		// 获取出生日期
		birthday = `${card.substring(6, 10)}-${card.substring(
	          10,
	          12
	        )}-${card.substring(12, 14)}`;
		// 获取性别
		//sex = parseInt(card.substr(16, 1), 10) % 2 === 1 ? 'M' : 'F';

		sex = parseInt(card.substr(16, 1), 10) % 2 === 1 ? 1 : 2;

		re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
		const arrSplit = num.match(re);

		// 检查生日日期是否正确
		const dtmBirth = new Date(
			`${arrSplit[2]}/${arrSplit[3]}/${arrSplit[4]}`
		);
		dtmBirth.setDate(arrSplit[4]);
		const bGoodDay =
			dtmBirth.getFullYear() === Number(arrSplit[2]) &&
			dtmBirth.getMonth() + 1 === Number(arrSplit[3]) &&
			dtmBirth.getDate() === Number(arrSplit[4]);
		if (!bGoodDay) {
			res.code = -1;
		}
		// 检验18位身份证的校验码是否正确。
		// 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
		// const arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
		// const arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
		// let nTemp = 0;
		// let i;
		// for (i = 0; i < 17; i++) {
		// 	nTemp += num.substr(i, 1) * arrInt[i];
		// }
		// const valnum = arrCh[nTemp % 11];
		// if (valnum !== num.substr(17, 1)) {
		// 	res.code = -1;
		// }
	}

	res.data = {
		birthday,
		month,
		sex,
		age
	};
	// 逻辑	
	console.log(res)
	return res
}

myfn.toDate = function(serial) {
	let vk = uni.vk;
	let utcDate = new Date(Date.UTC(1900, 0, serial - 1));
	return utcDate.toISOString().slice(0, 10);
};

myfn.deleteFile = (file) => {
	if (file?.url) {
		vk.callFunction({
			url: 'common/pub/deleteFile/index',
			data: {
				fileList: [file.url]
			}
		})
	}
};

myfn.deleteFiles = async (fileList = []) => {
	if (fileList?.length > 0) {
		await vk.callFunction({
			url: 'common/pub/deleteFile/index',
			data: {
				fileList: fileList
			}
		})
	}
};

/**
 * 获取表单字段的 formatMinutes
 * @param {String} fieldName - 字段名称，如 'min' 
 * @returns {String} formatMinutes 模板字符串
 */
myfn.formatMinutes = (min) => {
	if (!min || min <= 0) return '0';
	const h = Math.floor(min / 60);
	const m = min % 60;
	if (h > 0 && m > 0) return `${h}小时${m}分钟`;
	if (h > 0) return `${h}小时`;
	return `${m}分钟`;
};


export default myfn;