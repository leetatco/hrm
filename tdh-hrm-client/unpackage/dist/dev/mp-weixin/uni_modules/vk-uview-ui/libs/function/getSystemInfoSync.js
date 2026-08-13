"use strict";
const common_vendor = require("../../../../common/vendor.js");
function getSystemInfoSync() {
  return getCompatibleSystemInfo();
}
function getCompatibleSystemInfo() {
  if (common_vendor.wx$1.canIUse("getDeviceInfo") && common_vendor.wx$1.canIUse("getWindowInfo") && common_vendor.wx$1.canIUse("getAppBaseInfo") && common_vendor.wx$1.canIUse("getSystemSetting")) {
    const deviceInfo = common_vendor.index.getDeviceInfo();
    const windowInfo = common_vendor.index.getWindowInfo();
    const appBaseInfo = common_vendor.index.getAppBaseInfo();
    const systemSetting = common_vendor.index.getSystemSetting();
    return {
      devicePixelRatio: windowInfo.pixelRatio,
      hostFontSizeSetting: appBaseInfo.fontSizeSetting,
      batteryLevel: 100,
      // 设置一个假的固定值进去，防止出错（如果再调用电量API这效率会比较低）
      ...deviceInfo,
      ...windowInfo,
      ...appBaseInfo,
      ...systemSetting
      // ...appAuthorizeSetting,
    };
  } else {
    return common_vendor.index.getSystemInfoSync();
  }
}
exports.getSystemInfoSync = getSystemInfoSync;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/getSystemInfoSync.js.map
