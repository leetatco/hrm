"use strict";
const common_vendor = require("../vendor.js");
let myfn = {};
let res = {
  code: 0,
  data: {},
  msg: ""
};
function getAgeToIden(iden) {
  let val = iden.length;
  let myDate = /* @__PURE__ */ new Date();
  let month = myDate.getMonth() + 1;
  let day = myDate.getDate();
  let age = 0;
  if (val === 18) {
    age = myDate.getFullYear() - iden.substring(6, 10) - 1;
    if (iden.substring(10, 12) < month || iden.substring(10, 12) == month && iden.substring(12, 14) <= day)
      age++;
  }
  return age;
}
myfn.test1 = function(card) {
  let num = card;
  if (!/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)) {
    return false;
  }
  let re;
  let birthday;
  let sex;
  let age;
  let month;
  const len = num.length;
  age = getAgeToIden(num);
  if (len === 15) {
    birthday = `19${card.substring(6, 8)}-${card.substring(
      8,
      10
    )}-${card.substring(10, 12)}`;
    sex = parseInt(card.substr(14, 1), 10) % 2 === 1 ? "M" : "F";
    re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
    const arrSplit = num.match(re);
    const dtmBirth = /* @__PURE__ */ new Date(
      `19${arrSplit[2]}/${arrSplit[3]}/${arrSplit[4]}`
    );
    const bGoodDay = dtmBirth.getFullYear() === Number(arrSplit[2]) && dtmBirth.getMonth() + 1 === Number(arrSplit[3]) && dtmBirth.getDate() === Number(arrSplit[4]);
    if (!bGoodDay) {
      res.code = -1;
      return res;
    }
    const arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const arrCh = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
    let nTemp = 0;
    let i;
    num = `${num.substr(0, 6)}19${num.substr(6, num.length - 6)}`;
    for (i = 0; i < 17; i++) {
      nTemp += num.substr(i, 1) * arrInt[i];
    }
    num += arrCh[nTemp % 11];
  } else if (len === 18) {
    month = parseInt(card.substring(
      10,
      12
    ));
    birthday = `${card.substring(6, 10)}-${card.substring(
      10,
      12
    )}-${card.substring(12, 14)}`;
    sex = parseInt(card.substr(16, 1), 10) % 2 === 1 ? 1 : 2;
    re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
    const arrSplit = num.match(re);
    const dtmBirth = /* @__PURE__ */ new Date(
      `${arrSplit[2]}/${arrSplit[3]}/${arrSplit[4]}`
    );
    dtmBirth.setDate(arrSplit[4]);
    const bGoodDay = dtmBirth.getFullYear() === Number(arrSplit[2]) && dtmBirth.getMonth() + 1 === Number(arrSplit[3]) && dtmBirth.getDate() === Number(arrSplit[4]);
    if (!bGoodDay) {
      res.code = -1;
    }
  }
  res.data = {
    birthday,
    month,
    sex,
    age
  };
  common_vendor.index.__f__("log", "at common/function/myPubFunction.js:144", res);
  return res;
};
myfn.toDate = function(serial) {
  common_vendor.index.vk;
  let utcDate = new Date(Date.UTC(1900, 0, serial - 1));
  return utcDate.toISOString().slice(0, 10);
};
myfn.deleteFile = (file) => {
  if (file == null ? void 0 : file.url) {
    vk.callFunction({
      url: "common/pub/deleteFile/index",
      data: {
        fileList: [file.url]
      }
    });
  }
};
myfn.deleteFiles = async (fileList = []) => {
  if ((fileList == null ? void 0 : fileList.length) > 0) {
    await vk.callFunction({
      url: "common/pub/deleteFile/index",
      data: {
        fileList
      }
    });
  }
};
myfn.formatMinutes = (min) => {
  if (!min || min <= 0)
    return "0";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0)
    return `${h}小时${m}分钟`;
  if (h > 0)
    return `${h}小时`;
  return `${m}分钟`;
};
exports.myfn = myfn;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/function/myPubFunction.js.map
