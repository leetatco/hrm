"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
let updateManager = {};
updateManager.updateReady = function(obj) {
  updateManagerByMP(obj);
};
function updateManagerByMP(obj = {}) {
  let { title = "更新提示", content = "新版本已经准备好，点击更新！", autoUpdate = true, showCancel = false, confirmText = "一键更新" } = obj;
  if (typeof common_vendor.index.getUpdateManager !== "function") {
    return;
  }
  const updateManager2 = common_vendor.index.getUpdateManager();
  updateManager2.onCheckForUpdate((res) => {
  });
  updateManager2.onUpdateReady(() => {
    common_vendor.index.showModal({
      title,
      content,
      showCancel,
      confirmText,
      success: (res) => {
        if (res.confirm) {
          if (typeof obj.success === "function") {
            obj.success({
              applyUpdate: updateManager2.applyUpdate
            });
          }
          if (typeof obj.complete === "function")
            obj.complete();
          if (autoUpdate) {
            updateManager2.applyUpdate();
          }
        }
      }
    });
  });
  updateManager2.onUpdateFailed((res) => {
    common_vendor.index.__f__("error", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/updateManager.js:51", "onUpdateFailed", res);
    if (typeof obj.fail === "function")
      obj.fail(res);
    if (typeof obj.complete === "function")
      obj.complete(res);
  });
}
exports.updateManager = updateManager;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/updateManager.js.map
