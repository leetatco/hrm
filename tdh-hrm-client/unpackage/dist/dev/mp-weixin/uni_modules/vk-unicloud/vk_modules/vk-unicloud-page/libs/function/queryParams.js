"use strict";
function queryParams(data = {}, isPrefix = true, arrayFormat = "brackets", options = {}) {
  const { encode = false, keepEmpty = false } = options;
  const formatParam = (key, value) => {
    return encode ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}` : `${key}=${value}`;
  };
  let newData = JSON.parse(JSON.stringify(data));
  let prefix = isPrefix ? "?" : "";
  let _result = [];
  if (["indices", "brackets", "repeat", "comma"].indexOf(arrayFormat) == -1)
    arrayFormat = "brackets";
  for (let key in newData) {
    let value = newData[key];
    if (value === void 0 || value === null || value === "" && !keepEmpty) {
      continue;
    }
    if (value.constructor === Array) {
      switch (arrayFormat) {
        case "indices":
          for (let i = 0; i < value.length; i++) {
            _result.push(formatParam(key + "[" + i + "]", value[i]));
          }
          break;
        case "brackets":
          value.forEach((_value) => {
            _result.push(formatParam(key + "[]", _value));
          });
          break;
        case "repeat":
          value.forEach((_value) => {
            _result.push(formatParam(key, _value));
          });
          break;
        case "comma":
          let commaStr = "";
          value.forEach((_value) => {
            commaStr += (commaStr ? "," : "") + _value;
          });
          _result.push(formatParam(key, commaStr));
          break;
        default:
          value.forEach((_value) => {
            _result.push(formatParam(key + "[]", _value));
          });
      }
    } else {
      _result.push(formatParam(key, value));
    }
  }
  return _result.length ? prefix + _result.join("&") : "";
}
exports.queryParams = queryParams;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/queryParams.js.map
