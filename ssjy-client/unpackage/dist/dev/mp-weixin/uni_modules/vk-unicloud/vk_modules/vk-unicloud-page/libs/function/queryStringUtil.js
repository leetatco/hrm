"use strict";
function jsonToQueryString(data = {}, arrayFormat = "brackets") {
  let newData = JSON.parse(JSON.stringify(data));
  let _result = [];
  if (["indices", "brackets", "repeat", "comma"].indexOf(arrayFormat) == -1)
    arrayFormat = "brackets";
  for (let key in newData) {
    let value = newData[key];
    if (["", void 0, null].indexOf(value) >= 0) {
      continue;
    }
    if (value.constructor === Array) {
      switch (arrayFormat) {
        case "indices":
          for (let i = 0; i < value.length; i++) {
            _result.push(key + "[" + i + "]=" + value[i]);
          }
          break;
        case "brackets":
          value.forEach((_value) => {
            _result.push(key + "[]=" + _value);
          });
          break;
        case "repeat":
          value.forEach((_value) => {
            _result.push(key + "=" + _value);
          });
          break;
        case "comma":
          let commaStr = "";
          value.forEach((_value) => {
            commaStr += (commaStr ? "," : "") + _value;
          });
          _result.push(key + "=" + commaStr);
          break;
        default:
          value.forEach((_value) => {
            _result.push(key + "[]=" + _value);
          });
      }
    } else {
      _result.push(key + "=" + value);
    }
  }
  return _result.length ? _result.join("&") : "";
}
function queryStringToJson(query = "", arrayFormat = "brackets") {
  let json = {};
  let params = query.replace(/^\?/, "").split("&");
  params.forEach((param) => {
    let [key, value] = param.split("=");
    value = decodeURIComponent(value);
    if (key.match(/\[\]$/) || key.match(/\[\d+\]$/)) {
      let arrayKey;
      if (arrayFormat === "brackets") {
        arrayKey = key.replace(/\[]$/, "");
      } else if (arrayFormat === "indices") {
        arrayKey = key.replace(/\[\d+\]$/, "");
      }
      if (!json[arrayKey])
        json[arrayKey] = [];
      if (arrayFormat === "indices") {
        let index = key.match(/\[(\d+)\]/)[1];
        json[arrayKey][index] = value;
      } else {
        json[arrayKey].push(value);
      }
    } else {
      if (!json[key]) {
        json[key] = arrayFormat === "comma" ? [] : value;
      }
      if (arrayFormat === "comma") {
        if (value.includes(",")) {
          json[key] = value.split(",").map((item) => decodeURIComponent(item));
        } else {
          json[key] = value;
        }
      } else if (arrayFormat === "repeat" && json[key] !== value) {
        if (!Array.isArray(json[key])) {
          json[key] = [json[key]];
        }
        json[key].push(value);
      }
    }
  });
  if (arrayFormat === "repeat") {
    for (let key in json) {
      if (json[key].constructor === Array && json[key].length === 1) {
        json[key] = json[key][0];
      }
    }
  }
  return json;
}
const queryStringUtil = {
  jsonToQueryString,
  queryStringToJson
};
exports.queryStringUtil = queryStringUtil;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/queryStringUtil.js.map
