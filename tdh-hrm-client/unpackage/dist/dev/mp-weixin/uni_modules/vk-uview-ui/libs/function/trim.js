"use strict";
function trim(str, pos = "both") {
  if (pos == "both") {
    return str.replace(/^\s+|\s+$/g, "");
  } else if (pos == "left") {
    return str.replace(/^\s*/, "");
  } else if (pos == "right") {
    return str.replace(/(\s*$)/g, "");
  } else if (pos == "all") {
    return str.replace(/\s+/g, "");
  } else {
    return str;
  }
}
exports.trim = trim;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/trim.js.map
