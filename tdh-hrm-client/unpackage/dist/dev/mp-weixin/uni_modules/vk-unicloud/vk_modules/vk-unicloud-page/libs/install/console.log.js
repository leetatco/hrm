"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
const originalLog = console.log;
let debug = true;
const consoleLog = (vk) => {
  if (vk) {
    vk.log = originalLog;
    if (typeof vk.getConfig === "function") {
      debug = vk.getConfig().debug;
    }
    if (!debug) {
      console.log = function(...obj) {
      };
      console.group = function(...obj) {
      };
      console.groupCollapsed = function(...obj) {
      };
      console.groupEnd = function(...obj) {
      };
    }
    if (common_vendor.wx$1.canIUse("getDeviceInfo") && common_vendor.wx$1.canIUse("getWindowInfo") && common_vendor.wx$1.canIUse("getAppBaseInfo") && common_vendor.wx$1.canIUse("getSystemSetting")) {
      common_vendor.index.getSystemInfoSync = () => {
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
      };
    }
  }
};
exports.consoleLog = consoleLog;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/install/console.log.js.map
