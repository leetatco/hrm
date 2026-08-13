"use strict";
const uni_modules_vkUviewUi_libs_function_getSystemInfoSync = require("./getSystemInfoSync.js");
function os() {
  return uni_modules_vkUviewUi_libs_function_getSystemInfoSync.getSystemInfoSync().platform;
}
function sys() {
  return uni_modules_vkUviewUi_libs_function_getSystemInfoSync.getSystemInfoSync();
}
exports.os = os;
exports.sys = sys;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/sys.js.map
