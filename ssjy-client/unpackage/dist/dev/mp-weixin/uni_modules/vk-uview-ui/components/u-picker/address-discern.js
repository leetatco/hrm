"use strict";
class AddressDiscern {
  // 初始化数据源
  constructor(dataSource = {}) {
    this.dataSource = dataSource;
  }
  // 智能解析收货地址
  discern(text) {
    if (!text)
      return { code: -1, msg: "地址文本不能为空" };
    text = text.trim();
    const positionRes = this.regionDiscern(text);
    if (positionRes.code !== 0)
      return positionRes;
    const { name, mobile } = this.nameMobileDiscern(positionRes.not_address_text);
    const status = name && mobile && positionRes.data ? 1 : 0;
    let msg = "ok";
    if (status === 0) {
      msg = "未识别：";
      if (!name)
        msg += "姓名、";
      if (!mobile)
        msg += "手机号、";
      msg = msg.slice(0, -1);
    }
    const res = {
      code: 0,
      msg,
      status,
      // 1 表示全部识别成功，0 表示部分成功
      data: {
        name,
        // 姓名
        mobile,
        // 手机号
        position: positionRes.data
        // 省市区街道信息
      }
    };
    return res;
  }
  // 智能识别省市区
  regionDiscern(addressText) {
    const { provinces, citys, areas } = this.dataSource;
    const province = {};
    const city = {};
    const area = {};
    let address = "";
    if (!addressText)
      return { code: -1, msg: "地址文本不能为空" };
    addressText = addressText.trim();
    const findProvinceIndex = () => {
      const index = provinces.findIndex(({ name }) => addressText.includes(name.substring(0, 2)));
      return index;
    };
    const findCityIndex = (citys2) => {
      const index = citys2.findIndex(({ name }) => addressText.includes(name.slice(0, -1)));
      return index;
    };
    const findAreaIndex = (areas2) => {
      const index = areas2.findIndex(({ name }) => {
        const reg = name.length > 2 ? `${name}|${name.slice(0, -1)}` : name;
        const areaRegExp = new RegExp(reg);
        if (areaRegExp.test(addressText)) {
          address = addressText.replace(areaRegExp, "{{~}}").split("{{~}}")[1] || "";
          address = address.split(new RegExp("[^\\u4e00-\\u9fa5a-zA-Z0-9+-（）()]+", "g"))[0];
          return true;
        }
        return false;
      });
      return index;
    };
    const findProvinceByCity = () => {
      for (let i = 0; i < citys.length; i++) {
        const index = findCityIndex(citys[i]);
        if (index !== -1) {
          return { provinceIndex: i, cityIndex: index };
        }
      }
      return { provinceIndex: -1, cityIndex: -1 };
    };
    const findProvinceByArea = () => {
      for (let i = 0; i < areas.length; i++) {
        for (let j = 0; j < areas[i].length; j++) {
          const index = findAreaIndex(areas[i][j]);
          if (index !== -1) {
            return { provinceIndex: i, cityIndex: j, areaIndex: index };
          }
        }
      }
      return { provinceIndex: -1, cityIndex: -1, areaIndex: -1 };
    };
    let provinceIndex = findProvinceIndex();
    let cityIndex = -1;
    let areaIndex = -1;
    if (provinceIndex === -1) {
      const cityResult = findProvinceByCity();
      provinceIndex = cityResult.provinceIndex;
      cityIndex = cityResult.cityIndex;
    }
    if (provinceIndex === -1) {
      const areaResult = findProvinceByArea();
      provinceIndex = areaResult.provinceIndex;
      cityIndex = areaResult.cityIndex;
      areaIndex = areaResult.areaIndex;
    }
    if (provinceIndex === -1)
      return { code: -1, msg: "省份没有找到，请输入正确的地址" };
    Object.assign(province, provinces[provinceIndex]);
    const cityList = citys[provinceIndex];
    if (cityIndex === -1) {
      cityIndex = findCityIndex(cityList);
      if (cityIndex === -1)
        return { code: -1, msg: "地级市没有找到，请输入正确的地址" };
    }
    Object.assign(city, cityList[cityIndex]);
    const areaList = areas[provinceIndex][cityIndex];
    if (areaIndex === -1) {
      areaIndex = findAreaIndex(areaList);
      if (areaIndex === -1)
        return { code: -1, msg: "县级市没有找到，请输入正确的地址" };
    }
    Object.assign(area, areaList[areaIndex]);
    const formatted_address = `${province.name}${city.name}${area.name}${address}`;
    const provinceName = province.name.substring(0, 2);
    const not_address_text = (addressText.substring(0, addressText.indexOf(provinceName)) + addressText.substring(addressText.indexOf(address) + address.length)).trim();
    return {
      code: 0,
      msg: "ok",
      data: {
        province,
        city,
        area,
        address,
        formatted_address
      },
      not_address_text
    };
  }
  // 智能解析姓名和手机号
  nameMobileDiscern(text) {
    if (!text)
      return { name: "", mobile: "" };
    let name = "";
    let mobile = "";
    const mobilePatterns = [
      new RegExp("1\\d{2}([\\s-]?\\d{4}){2}", "g")
    ];
    let mobileMatchText;
    for (const pattern of mobilePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        mobile = matches[0].replace(new RegExp("[\\s\\-\\.]", "g"), "");
        mobileMatchText = matches[0];
        break;
      }
    }
    let cleanText = text;
    if (mobile) {
      cleanText = cleanText.replace(mobileMatchText, "");
    }
    const labelPatterns = [
      new RegExp("^姓名[：:]\\s*"),
      new RegExp("^收货人[：:]\\s*"),
      new RegExp("^收件人[：:]\\s*"),
      new RegExp("^联系人[：:]\\s*"),
      new RegExp("^name[：:]\\s*", "i"),
      new RegExp("^收[：:]\\s*"),
      new RegExp("^人[：:]\\s*"),
      new RegExp("^电话[：:]\\s*"),
      new RegExp("^手机[：:]\\s*"),
      new RegExp("^tel[：:]\\s*", "i"),
      new RegExp("^phone[：:]\\s*", "i"),
      new RegExp("^mobile[：:]\\s*", "i"),
      new RegExp("^地址[：:]\\s*"),
      new RegExp("^address[：:]\\s*", "i"),
      new RegExp("^收货地址[：:]\\s*"),
      new RegExp("^收件地址[：:]\\s*")
    ];
    for (const pattern of labelPatterns) {
      cleanText = cleanText.replace(pattern, "");
    }
    cleanText = cleanText.replace(new RegExp("\\s+", "g"), " ").trim();
    const namePatterns = [
      // 英文+称谓（如：vk先生、John先生、Mary女士等）- 最具体，优先匹配
      new RegExp("[A-Za-z]+[\\u4e00-\\u9fa5]{1,3}", "g"),
      // 中文姓名（2-6个汉字，支持复姓和少数民族姓名）
      new RegExp("[\\u4e00-\\u9fa5]{2,6}", "g"),
      // 英文姓名（支持多种格式：全名、简称、首字母等）
      new RegExp("[A-Za-z]+(\\s+[A-Za-z]+)*", "g")
    ];
    for (const pattern of namePatterns) {
      const matches = cleanText.match(pattern);
      if (matches && matches.length > 0) {
        const validNames = matches.filter((match) => {
          const addressWords = ["省", "市", "区", "县", "镇", "村", "路", "街", "号", "楼", "室", "单元", "栋", "层", "小区", "大厦", "广场", "花园"];
          const isAddressWord = addressWords.some((word) => match.includes(word));
          const labelWords = ["姓名", "收货人", "收件人", "联系人", "收", "人", "电话", "手机", "地址", "收货", "收件", "联系"];
          const isLabelWord = labelWords.some((word) => match.includes(word));
          const isNumber = new RegExp("^\\d+$").test(match);
          const isTooShort = match.length < 2;
          const isChinese = new RegExp("[\\u4e00-\\u9fa5]").test(match);
          const isEnglishWithTitle = new RegExp("^[A-Za-z]+[\\u4e00-\\u9fa5]{1,3}$").test(match);
          const isTooLong = isEnglishWithTitle ? false : isChinese ? match.length > 8 : match.length > 25;
          const hasSpecialChars = isChinese ? new RegExp("[^\\u4e00-\\u9fa5a-zA-Z\\s]").test(match) : new RegExp("[^a-zA-Z\\s]").test(match);
          return !isAddressWord && !isLabelWord && !isNumber && !isTooShort && !isTooLong && !hasSpecialChars;
        });
        if (validNames.length > 0) {
          name = validNames.sort((a, b) => a.length - b.length)[0];
          break;
        }
      }
    }
    if (!name) {
      const remainingText = cleanText.trim();
      if (remainingText) {
        const parts = remainingText.split(new RegExp("[\\s，,。.！!？?；;：:]"));
        for (const part of parts) {
          const trimmedPart = part.trim();
          const isChineseName = new RegExp("^[\\u4e00-\\u9fa5]{2,6}$").test(trimmedPart);
          const isEnglishName = new RegExp("^[a-zA-Z]{2,20}$").test(trimmedPart);
          const isEnglishWithTitle = new RegExp("^[a-zA-Z]+[\\u4e00-\\u9fa5]{1,3}$").test(trimmedPart);
          if (isChineseName || isEnglishName || isEnglishWithTitle) {
            const addressWords = ["省", "市", "区", "县", "镇", "村", "路", "街", "号", "楼", "室", "单元", "栋", "层", "小区", "大厦", "广场", "花园"];
            const labelWords = ["姓名", "收货人", "收件人", "联系人", "收", "人", "电话", "手机", "地址", "收货", "收件", "联系"];
            const isAddressWord = addressWords.some((word) => trimmedPart.includes(word));
            const isLabelWord = labelWords.some((word) => trimmedPart.includes(word));
            if (!isAddressWord && !isLabelWord) {
              name = trimmedPart;
              break;
            }
          }
        }
      }
    }
    if (name) {
      name = name.replace(new RegExp("\\s+", "g"), "").trim();
    }
    return { name, mobile };
  }
}
exports.AddressDiscern = AddressDiscern;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-picker/address-discern.js.map
