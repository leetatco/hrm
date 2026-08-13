"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudUserCenter = require("./libs/vk-unicloud/vk-unicloud-user-center.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil = require("./libs/vk-unicloud/vk-unicloud-callFunctionUtil.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_index = require("./libs/function/index.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal = require("./libs/function/modal.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate = require("./libs/function/vk.navigate.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_localStorage = require("./libs/function/vk.localStorage.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_sessionStorage = require("./libs/function/vk.sessionStorage.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_openapi_index = require("./libs/openapi/index.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_request = require("./libs/function/vk.request.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_importObject = require("./libs/function/vk.importObject.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_eventManager = require("./libs/function/vk.eventManager.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_mixin_mixin = require("./libs/mixin/mixin.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_permission = require("./libs/function/permission.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_store_mixin_mixin = require("./libs/store/mixin/mixin.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_store_libs_error = require("./libs/store/libs/error.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_install_console_log = require("./libs/install/console.log.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_updateManager = require("./libs/function/updateManager.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_crypto = require("./libs/function/vk.crypto.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_connectWebSocket = require("./libs/function/vk.connectWebSocket.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_setCustomClientInfo = require("./libs/function/vk.setCustomClientInfo.js");
const vk = {
  userCenter: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudUserCenter.userCenter,
  callFunctionUtil: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil,
  /**
   * 发起一个云函数请求
   */
  callFunction: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.callFunction,
  getToken: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.getToken,
  saveToken: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.saveToken,
  checkToken: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.checkToken,
  deleteToken: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.deleteToken,
  uploadFile: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.uploadFile,
  getConfig: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.getConfig,
  emitRefreshToken: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.emitRefreshToken,
  onRefreshToken: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.onRefreshToken,
  offRefreshToken: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_vkUnicloud_vkUnicloudCallFunctionUtil.callFunctionUtil.offRefreshToken,
  pubfn: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_index.pubfn,
  alert: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal.modal.alert,
  toast: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal.modal.toast,
  confirm: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal.modal.confirm,
  prompt: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal.modal.prompt,
  showActionSheet: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal.modal.showActionSheet,
  showLoading: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal.modal.showLoading,
  hideLoading: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal.modal.hideLoading,
  setLoading: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_modal.modal.setLoading,
  navigate: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util,
  // 保留当前页面,并进行页面跳转
  navigateTo: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.navigateTo,
  // 关闭当前页面,并进行页面跳转
  redirectTo: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.redirectTo,
  // 并关闭所有页面,并进行页面跳转
  reLaunch: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.reLaunch,
  // 并关闭所有非tab页面,并进行tab面跳转
  switchTab: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.switchTab,
  // 页面返回
  navigateBack: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.navigateBack,
  // 跳转到首页
  navigateToHome: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.navigateToHome,
  // 跳转到登录页
  navigateToLogin: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.navigateToLogin,
  // 跳转到小程序
  navigateToMiniProgram: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.navigateToMiniProgram,
  // 跳转到抽奖小程序
  navigateToLuckyDraw: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.navigateToLuckyDraw,
  // 触发全局的自定义事件，附加参数都会传给监听器回调函数。
  $emit: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.$emit,
  // 监听全局的自定义事件，事件由 uni.$emit 触发，回调函数会接收事件触发函数的传入参数。
  $on: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.$on,
  // 触发全局的自定义事件，附加参数都会传给监听器回调函数。
  $once: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.$once,
  // 移除全局自定义事件监听器。
  $off: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_navigate.util.$off,
  // 本地持久
  localStorage: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_localStorage.storage,
  // 本地会话缓存
  sessionStorage: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_sessionStorage.storage,
  // 获取应用语言列表
  getLocaleList: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_index.pubfn.getLocaleList,
  // 获取应用当前语言
  getLocale: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_index.pubfn.getLocale,
  // 获取应用当前语言对象
  getLocaleObject: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_index.pubfn.getLocaleObject,
  // 设置应用当前语言
  setLocale: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_index.pubfn.setLocale,
  // 本地持久缓存
  ...uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_localStorage.storage,
  // 本地会话缓存
  ...uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_sessionStorage.storage,
  // 更新管理器
  updateManager: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_updateManager.updateManager,
  // 开放API
  openapi: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_openapi_index.openapi,
  // 请求库
  requestUtil: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_request.requestUtil,
  // 发起URL请求
  request: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_request.requestUtil.request,
  // 导出云对象
  importObject: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_importObject.importObject,
  // 事件管理
  ...uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_eventManager.eventManager,
  // 客户端加密函数
  crypto: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_crypto.n,
  // webSocket
  connectWebSocket: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_connectWebSocket.connectWebSocket,
  // 设置自定义客户端信息
  setCustomClientInfo: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_vk_setCustomClientInfo.setCustomClientInfo
};
vk.getGlobalObject = function() {
  if (typeof globalThis === "object")
    return globalThis;
  if (typeof self === "object")
    return self;
  if (typeof window === "object")
    return window;
  if (typeof global === "object")
    return global;
};
vk.use = function(obj, util) {
  for (let name in obj) {
    if (obj[name] && typeof obj[name].init === "function") {
      obj[name].init(util);
    }
    vk[name] = obj[name];
  }
};
vk.install = (Vue, config) => {
  Vue.mixin(uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_mixin_mixin.mixin);
  Vue.config.globalProperties.vk = vk;
  Vue.config.globalProperties.$fn = vk.pubfn;
  if (typeof common_vendor.index == "object")
    common_vendor.index.vk = vk;
  let vkGlobalThis = vk.getGlobalObject();
  if (typeof vkGlobalThis == "object")
    vkGlobalThis.vk = vk;
  let util = { vk };
  vk.use({
    callFunctionUtil: vk.callFunctionUtil,
    openapi: vk.openapi
  }, util);
  uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_permission.initPermission(Vue);
  Vue.mixin(uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_store_mixin_mixin.storeMixin);
  if (config) {
    if (config.globalError) {
      Vue.use(uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_store_libs_error.initGlobalError);
    }
    vk.callFunctionUtil.setConfig(config);
    Vue.use(uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_install_console_log.consoleLog);
  }
};
vk.init = function(obj = {}) {
  let {
    Vue,
    // Vue实例
    config,
    // 配置
    store
    // 兼容更旧的版本
  } = obj;
  if (typeof store !== "undefined") {
    Vue.use(store);
  } else {
    Vue.mixin(uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_store_mixin_mixin.storeMixin);
    if (config.globalError) {
      Vue.use(uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_store_libs_error.initGlobalError);
    }
  }
  vk.callFunctionUtil.setConfig(config);
  Vue.use(uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_install_console_log.consoleLog);
};
exports.vk = vk;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/index.js.map
