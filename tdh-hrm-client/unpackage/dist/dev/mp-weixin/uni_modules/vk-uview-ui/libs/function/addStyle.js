"use strict";
const uni_modules_vkUviewUi_libs_function_test = require("./test.js");
function trim(str, pos = "both") {
  str = String(str);
  if (pos == "both") {
    return str.replace(/^\s+|\s+$/g, "");
  }
  if (pos == "left") {
    return str.replace(/^\s*/, "");
  }
  if (pos == "right") {
    return str.replace(/(\s*$)/g, "");
  }
  if (pos == "all") {
    return str.replace(/\s+/g, "");
  }
  return str;
}
function addStyle(customStyle, target = "object") {
  if (uni_modules_vkUviewUi_libs_function_test.test.empty(customStyle) || typeof customStyle === "object" && target === "object" || target === "string" && typeof customStyle === "string") {
    return customStyle;
  }
  if (target === "object") {
    customStyle = trim(customStyle);
    const styleArray = customStyle.split(";");
    const style = {};
    for (let i = 0; i < styleArray.length; i++) {
      if (styleArray[i]) {
        const item = styleArray[i].split(":");
        style[trim(item[0])] = trim(item[1]);
      }
    }
    return style;
  }
  let string = "";
  for (const i in customStyle) {
    const key = i.replace(/([A-Z])/g, "-$1").toLowerCase();
    string += `${key}:${customStyle[i]};`;
  }
  return trim(string);
}
exports.addStyle = addStyle;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/addStyle.js.map
