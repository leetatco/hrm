"use strict";
let isOnLaunch = true;
const mixin = {
  data() {
    return {};
  },
  onLoad() {
    let app = getApp({ allowDefault: true });
    if (app && app.globalData && !app.globalData.vk) {
      app.globalData.vk = this.vk;
    }
    if (this.vk) {
      const url = this.vk.pubfn.getCurrentPageRoute();
      this.vk.navigate.checkAllowShare({ url });
      if (isOnLaunch) {
        isOnLaunch = false;
        if (this.vk.checkToken()) {
          if (!this.vk.checkCurrentPagePermission()) {
            this.vk.navigateTo403();
            return;
          }
        } else {
          if (getCurrentPages().length == 1) {
            const currentPage = this.vk.pubfn.getCurrentPage() || {};
            let pagePath = currentPage.pagePath || `/${currentPage.route}` || url;
            let fullPath = currentPage.fullPath;
            let options = currentPage.options;
            this.vk.pubfn.checkLogin({ url: pagePath, fullPath, options, isOnLaunch: true });
          }
        }
      }
    }
  },
  created() {
    let app = getApp({ allowDefault: true });
    if (app && app.globalData && !app.globalData.vk) {
      app.globalData.vk = this.vk;
    }
  },
  methods: {
    $getData(data, key, defaultValue) {
      let { vk } = this;
      return vk.pubfn.getData(data, key, defaultValue);
    }
  }
};
exports.mixin = mixin;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/mixin/mixin.js.map
