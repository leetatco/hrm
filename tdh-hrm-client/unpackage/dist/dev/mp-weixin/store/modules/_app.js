"use strict";
const common_vendor = require("../../common/vendor.js");
const app_config = require("../../app.config.js");
let lifeData = common_vendor.index.getStorageSync("lifeData") || {};
let $app = lifeData.$app || {};
const $app$1 = {
  // 通过添加 namespaced: true 的方式使其成为带命名空间的模块
  namespaced: true,
  /**
   * vuex的基本数据，用来存储变量
   */
  state: {
    /**
     * 是否已经初始化
     * js调用示例
     * vk.getVuex('$app.inited');
     * 页面上直接使用示例
     * {{ vk.getVuex('$app.inited') }}
     * js更新示例
     * vk.setVuex('$app.inited', true);
     */
    inited: $app.inited || false,
    config: {
      ...app_config.config
    },
    // 动态主题色 vk.getVuex('$app.color.main') vk.setVuex('$app.color.main','#ff4444')
    color: $app.color || app_config.config.color,
    /**
     * vk.getVuex('$app.originalPage');
     * vk.setVuex('$app.originalPage', originalPage);
     */
    originalPage: $app.originalPage || null
    // 跳登录前的页面
  },
  /**
   * 从基本数据(state)派生的数据，相当于state的计算属性
   */
  getters: {},
  /**
   * 提交更新数据的方法，必须是同步的(如果需要异步使用action)。
   * 每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。
   * 回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数，提交载荷作为第二个参数。
   */
  mutations: {},
  /**
   * 和mutation的功能大致相同，不同之处在于 ==》
   * 1. Action 提交的是 mutation，而不是直接变更状态。
   * 2. Action 可以包含任意异步操作。
   */
  actions: {}
};
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $app$1
}, Symbol.toStringTag, { value: "Module" }));
exports.__vite_glob_0_0 = __vite_glob_0_0;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/store/modules/_app.js.map
