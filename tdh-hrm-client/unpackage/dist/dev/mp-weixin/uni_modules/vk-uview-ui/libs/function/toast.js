"use strict";
const common_vendor = require("../../../../common/vendor.js");
function toast(title, duration = 1500) {
  common_vendor.index.showToast({
    title,
    icon: "none",
    duration
  });
}
exports.toast = toast;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/toast.js.map
