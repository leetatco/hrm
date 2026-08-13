"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      form1: {
        email: "",
        code: ""
      }
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
  },
  methods: {
    // 为了演示把这个逻辑放在客户端
    getCode() {
      const randomStr = "00000" + Math.floor(Math.random() * 1e6);
      this.form1.code = randomStr.substring(randomStr.length - 6);
    },
    sendEmailCode(type) {
      let that = this;
      if (!/.+@.+/.test(that.form1.email)) {
        common_vendor.index.showModal({
          content: "请输入正确的邮箱",
          showCancel: false
        });
        return;
      }
      let form1 = that.form1;
      vk.userCenter.sendEmailCode({
        data: {
          serviceType: "qq",
          email: form1.email,
          type
        },
        success: (data) => {
          vk.alert("邮件发送成功");
        }
      });
    },
    setVerifyCode(type) {
      let that = this;
      if (!/.+@.+/.test(that.form1.email)) {
        common_vendor.index.showModal({
          content: "请输入正确的邮箱",
          showCancel: false
        });
        return;
      }
      that.getCode();
      let form1 = that.form1;
      vk.userCenter.setVerifyCode({
        data: {
          email: form1.email,
          code: form1.code,
          type
        },
        success: (data) => {
          vk.toast("发送成功");
        }
      });
    },
    // 邮箱登录
    loginByEmail() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.loginByEmail({
        data: form1,
        success: (data) => {
          vk.alert("登录成功");
        }
      });
    },
    // 绑定邮箱
    bindEmail() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.bindEmail({
        data: form1,
        success: (data) => {
          vk.alert("绑定成功");
        }
      });
    },
    // 解绑邮箱
    unbindEmail() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.unbindEmail({
        data: form1,
        success: (data) => {
          vk.alert("解绑成功");
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form1.email,
    b: common_vendor.o(($event) => $data.form1.email = $event.detail.value, "3c"),
    c: $data.form1.code,
    d: common_vendor.o(($event) => $data.form1.code = $event.detail.value, "b6"),
    e: common_vendor.t($data.form1.code),
    f: common_vendor.o(($event) => $options.sendEmailCode("login"), "27"),
    g: common_vendor.o(($event) => $options.setVerifyCode("login"), "20"),
    h: common_vendor.o((...args) => $options.loginByEmail && $options.loginByEmail(...args), "45"),
    i: common_vendor.o(($event) => $options.sendEmailCode("bind"), "3b"),
    j: common_vendor.o(($event) => $options.setVerifyCode("bind"), "59"),
    k: common_vendor.o((...args) => $options.bindEmail && $options.bindEmail(...args), "8d"),
    l: common_vendor.o(($event) => $options.sendEmailCode("unbind"), "2e"),
    m: common_vendor.o(($event) => $options.setVerifyCode("unbind"), "cc"),
    n: common_vendor.o((...args) => $options.unbindEmail && $options.unbindEmail(...args), "32")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-74227f1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/email/email.js.map
