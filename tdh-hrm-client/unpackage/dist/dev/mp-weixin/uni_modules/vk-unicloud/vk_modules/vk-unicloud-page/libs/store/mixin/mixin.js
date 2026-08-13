"use strict";
const storeMixin = {
  beforeCreate() {
    let { vk, $store } = this;
    if (typeof $store !== "undefined" && typeof vk.getVuexStore === "undefined") {
      vk.getVuexStore = function() {
        return $store;
      };
      vk.vuex = (name, value) => {
        $store.commit("updateStore", { name, value });
      };
      vk.vuex.set = (name, value) => {
        $store.commit("updateStore", { name, value });
      };
      vk.vuex.get = (name, defaultValue) => {
        let value = vk.pubfn.getData($store.state, name);
        if (typeof value === "undefined")
          return typeof defaultValue !== "undefined" ? defaultValue : "";
        return JSON.parse(JSON.stringify(value));
      };
      vk.vuex.getters = (name, ...e) => {
        let ters = $store.getters[name];
        if (typeof ters === "function") {
          return ters(...e);
        } else {
          return ters;
        }
      };
      vk.vuex.dispatch = $store.dispatch;
      vk.vuex.commit = $store.commit;
      vk.setVuex = vk.vuex.set;
      vk.getVuex = vk.vuex.get;
      vk.state = vk.vuex.get;
      try {
        if (!vk.checkToken()) {
          vk.callFunctionUtil.deleteUserInfo({
            log: false
          });
        }
      } catch (err) {
      }
    }
  },
  computed: {}
};
exports.storeMixin = storeMixin;
//# sourceMappingURL=../../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/store/mixin/mixin.js.map
