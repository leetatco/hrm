"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
let isOnLaunch = true;
const mixin = {
  data() {
    return {};
  },
  onLoad() {
    const vk = common_vendor.index.vk;
    let app = getApp({ allowDefault: true });
    if (app && app.globalData && !app.globalData.vk) {
      app.globalData.vk = vk;
    }
    if (vk) {
      const url = vk.pubfn.getCurrentPageRoute();
      vk.navigate.checkAllowShare({ url });
      if (isOnLaunch) {
        isOnLaunch = false;
        if (vk.checkToken()) {
          if (!vk.checkCurrentPagePermission()) {
            vk.navigateTo403();
            return;
          }
        } else {
          if (getCurrentPages().length == 1) {
            const currentPage = vk.pubfn.getCurrentPage() || {};
            let pagePath = currentPage.pagePath || `/${currentPage.route}` || url;
            let fullPath = currentPage.fullPath;
            let options = currentPage.options;
            vk.pubfn.checkLogin({ url: pagePath, fullPath, options, isOnLaunch: true });
          }
        }
      }
    }
  },
  created() {
    let app = getApp({ allowDefault: true });
    if (app && app.globalData && !app.globalData.vk) {
      app.globalData.vk = common_vendor.index.vk;
    }
  },
  methods: {
    $getData(data, key, defaultValue) {
      const vk = common_vendor.index.vk;
      return vk.pubfn.getData(data, key, defaultValue);
    }
  }
};
exports.mixin = mixin;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/mixin/mixin.js.map
