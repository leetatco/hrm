"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const app_config = require("./app.config.js");
const store_index = require("./store/index.js");
const uni_modules_vkUviewUi_index = require("./uni_modules/vk-uview-ui/index.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_index = require("./uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/index.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/login/index.js";
  "./pages/login/register.js";
  "./pages/login/forget.js";
  "./pages/user/index.js";
  "./pages/contacts/index.js";
  "./pages/notice/index.js";
  "./pages/functions/index.js";
  "./pages/opendb-notice/index.js";
  "./pages/setting/index.js";
  "./pages/pwd/update-password.js";
  "./pages/entry-forms/index.js";
  "./pages/workflow/application-form/list.js";
  "./pages/workflow/seal/index.js";
  "./pages/workflow/miss-punch-apply/index.js";
  "./pages/workflow/transfer/index.js";
  "./pages/workflow/recruitment/index.js";
  "./pages/workflow/leave/index.js";
  "./pages/workflow/overtime/index.js";
  "./pages/workflow/compensatory/index.js";
  "./pages/workflow/business-trip/index.js";
  "./pages/workflow/resignation/index.js";
  "./pages/workflow/loan/index.js";
  "./pages/workflow/reimbursement/index.js";
  "./pages/workflow/work-clothes/index.js";
  "./pages/workflow/outing/index.js";
  "./pages/clockin/index.js";
  "./pages/clockin/setting.js";
  "./pages/clockin/setting_edit.js";
  "./pages/clockin/clockin.js";
  "./pages/payslip/index.js";
  "./pages/payslip/sign.js";
  "./pages_template/db-test/db-test.js";
  "./pages_template/db-test/list/list.js";
  "./pages_template/uni-id/index/index.js";
  "./pages_template/uni-id/password/password.js";
  "./pages_template/uni-id/mobile/mobile.js";
  "./pages_template/uni-id/univerify/univerify.js";
  "./pages_template/uni-id/weixin/weixin.js";
  "./pages_template/uni-id/weixin/h5-weixin.js";
  "./pages_template/uni-id/weixin/set-user-info.js";
  "./pages_template/uni-id/alipay/alipay.js";
  "./pages_template/uni-id/qq/qq.js";
  "./pages_template/uni-id/util/util.js";
  "./pages_template/uni-id/email/email.js";
  "./pages_template/uni-id/login/index/index.js";
  "./pages_template/uni-id/login/register/register.js";
  "./pages_template/uni-id/login/forget/forget.js";
  "./pages_template/vk-vuex/vk-vuex.js";
  "./pages_template/openapi/weixin/weixin.js";
  "./pages_template/openapi/weixin/msgSecCheck/msgSecCheck.js";
  "./pages_template/openapi/weixin/imgSecCheck/imgSecCheck.js";
  "./pages_template/openapi/weixin/sendMessage/sendMessage.js";
  "./pages_template/openapi/baidu/baidu.js";
  "./pages_template/openapi/qq/qq.js";
  "./pages_template/openapi/qq/msgSecCheck/msgSecCheck.js";
  "./pages_template/openapi/qq/imgSecCheck/imgSecCheck.js";
  "./pages_template/openapi/douyin/douyin.js";
  "./pages_template/openapi/douyin/msgSecCheck/msgSecCheck.js";
  "./pages_template/openapi/douyin/imgSecCheck/imgSecCheck.js";
  "./pages_template/openapi/alipay/alipay.js";
  "./pages_template/uni-id/test/test.js";
  "./pages_template/plugs/lucky-draw/lucky-draw.js";
}
const version = "0.1.2";
const _sfc_main = {
  methods: {},
  // 监听 - 页面404
  onPageNotFound: function(e) {
    common_vendor.index.redirectTo({
      url: app_config.config.error.url
    });
  },
  onLaunch: function(options) {
    if (app_config.config.debug) {
      common_vendor.index.__f__(
        "log",
        "at App.vue:18",
        `%c vk-client %c v${version} `,
        "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
        "background:#007aff ;padding: 1px; border-radius: 0 3px 3px 0;  color: #fff; font-weight: bold;"
      );
      common_vendor.index.__f__("log", "at App.vue:24", "App Launch");
    }
    common_vendor.index.vk.updateManager.updateReady();
  },
  onShow: function() {
    if (app_config.config.debug)
      common_vendor.index.__f__("log", "at App.vue:37", "App Show");
    try {
      const nodeEnv = "development";
      common_vendor.index.__f__("log", "at App.vue:42", "当前运行模式: ", nodeEnv);
      const info = common_vendor.index.getAccountInfoSync();
      if (info.miniProgram.envVersion === "trial" && nodeEnv !== "production") {
        common_vendor.index.vk.alert("检测到您当前发布的【体验版】是通过【运行】按钮打包发布的，请重新点击HBX上方菜单的【发行】按钮进行打包发布小程序（如果确定是【发行】按钮打包的，请删除手机上的体验版小程序并重新扫码进入）", "重要提示", "好的");
      }
    } catch (err) {
    }
  },
  onHide: function() {
    if (app_config.config.debug)
      common_vendor.index.__f__("log", "at App.vue:52", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(store_index.store);
  app.use(uni_modules_vkUviewUi_index.uView);
  app.use(uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_index.vk, app_config.config);
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
