"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
const storage = {};
storage.setSessionStorageSync = function(key, data = "") {
  common_vendor.index.__f__("warn", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.sessionStorage.js:34", "非H5环境不支持此API");
};
storage.getSessionStorageSync = function(key) {
  common_vendor.index.__f__("warn", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.sessionStorage.js:58", "非H5环境不支持此API");
};
storage.removeSessionStorageSync = function(key) {
  common_vendor.index.__f__("warn", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.sessionStorage.js:74", "非H5环境不支持此API");
};
storage.clearSessionStorageSync = function(key) {
  common_vendor.index.__f__("warn", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.sessionStorage.js:101", "非H5环境不支持此API");
};
exports.storage = storage;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.sessionStorage.js.map
