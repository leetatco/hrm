"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {};
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
  },
  methods: {
    // 支付宝登录
    loginByAlipay(type) {
      vk.userCenter.loginByAlipay({
        data: {
          type
        },
        success: (data) => {
          vk.alert("登录成功");
        }
      });
    },
    // 获取支付宝openid
    code2SessionAlipay() {
      vk.userCenter.code2SessionAlipay({
        success: (data) => {
          vk.alert(JSON.stringify(data));
        }
      });
    },
    // 绑定支付宝
    bindAlipay() {
      vk.userCenter.bindAlipay({
        success: (data) => {
          vk.alert("绑定成功");
        }
      });
    },
    // 解绑支付宝
    unbindAlipay() {
      vk.userCenter.unbindAlipay({
        success: (data) => {
          vk.alert("解绑成功");
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.loginByAlipay("register"), "6f"),
    b: common_vendor.o(($event) => $options.loginByAlipay("login"), "13"),
    c: common_vendor.o(($event) => $options.loginByAlipay(), "9d"),
    d: common_vendor.o((...args) => $options.code2SessionAlipay && $options.code2SessionAlipay(...args), "0c"),
    e: common_vendor.o((...args) => $options.bindAlipay && $options.bindAlipay(...args), "2c"),
    f: common_vendor.o((...args) => $options.unbindAlipay && $options.unbindAlipay(...args), "73")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cd1a712a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/alipay/alipay.js.map
