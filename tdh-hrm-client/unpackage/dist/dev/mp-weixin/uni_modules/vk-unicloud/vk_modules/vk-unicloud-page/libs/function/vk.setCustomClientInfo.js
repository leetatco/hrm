"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
function setCustomClientInfo(data) {
  if (Object.prototype.toString.call(data) !== "[object Object]") {
    common_vendor.index.__f__("warn", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.setCustomClientInfo.js:12", "setCustomClientInfo(data)的参数data必须是一个对象");
    return;
  }
  common_vendor.wr.setCustomClientInfo({
    customInfo: data
  });
}
exports.setCustomClientInfo = setCustomClientInfo;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.setCustomClientInfo.js.map
