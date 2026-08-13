"use strict";
const install = (Vue) => {
  let vk = Vue.prototype ? Vue.prototype.vk : Vue.config.globalProperties.vk;
  if (vk) {
    const oldErrorHandler = Vue.config.errorHandler;
    Vue.config.errorHandler = function errorHandler(err, vm, info) {
      const route = vm.$page && vm.$page.route;
      let date = /* @__PURE__ */ new Date();
      let log = {
        err: err.toString(),
        info,
        route,
        time: date.getTime(),
        timeStr: date.toLocaleTimeString()
      };
      if (vk.vuex)
        vk.vuex.dispatch("$error/add", log);
      return oldErrorHandler(err, vm, info);
    };
  }
};
const initGlobalError = {
  install
};
exports.initGlobalError = initGlobalError;
//# sourceMappingURL=../../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/store/libs/error.js.map
