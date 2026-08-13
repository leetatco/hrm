"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      form1: {
        mobile: "",
        code: "",
        password: "123456"
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
    sendSmsCode(type) {
      let that = this;
      if (!/^1\d{10}$/.test(that.form1.mobile)) {
        common_vendor.index.showModal({
          content: "请输入正确的手机号",
          showCancel: false
        });
        return;
      }
      let form1 = that.form1;
      vk.userCenter.sendSmsCode({
        data: {
          mobile: form1.mobile,
          type
        },
        success: (data) => {
          vk.alert("短信发送成功");
        }
      });
    },
    setVerifyCode(type) {
      let that = this;
      if (!/^1\d{10}$/.test(that.form1.mobile)) {
        common_vendor.index.showModal({
          content: "请输入正确的手机号",
          showCancel: false
        });
        return;
      }
      that.getCode();
      let form1 = that.form1;
      vk.userCenter.setVerifyCode({
        data: {
          mobile: form1.mobile,
          code: form1.code,
          type
        },
        success: (data) => {
          vk.toast("发送成功");
        }
      });
    },
    // 登录(手机号+验证码)
    loginBySms() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.loginBySms({
        data: form1,
        success: (data) => {
          vk.alert("登录成功");
        }
      });
    },
    // 绑定手机号
    bindMobile() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.bindMobile({
        data: form1,
        success: (data) => {
          vk.alert("绑定成功");
        }
      });
    },
    // 解绑手机
    unbindMobile() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.unbindMobile({
        data: form1,
        success: (data) => {
          vk.alert("解绑成功");
        }
      });
    },
    // 手机验证码充值账号密码
    resetPasswordByMobile() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.resetPasswordByMobile({
        data: form1,
        success: (data) => {
          vk.alert("密码重置成功,新密码为:" + form1.password);
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form1.mobile,
    b: common_vendor.o(($event) => $data.form1.mobile = $event.detail.value, "7f"),
    c: $data.form1.code,
    d: common_vendor.o(($event) => $data.form1.code = $event.detail.value, "77"),
    e: common_vendor.t($data.form1.code),
    f: common_vendor.o(($event) => $options.sendSmsCode("login"), "39"),
    g: common_vendor.o(($event) => $options.setVerifyCode("login"), "8c"),
    h: common_vendor.o((...args) => $options.loginBySms && $options.loginBySms(...args), "9c"),
    i: common_vendor.o(($event) => $options.sendSmsCode("bind"), "ca"),
    j: common_vendor.o(($event) => $options.setVerifyCode("bind"), "df"),
    k: common_vendor.o((...args) => $options.bindMobile && $options.bindMobile(...args), "49"),
    l: common_vendor.o(($event) => $options.sendSmsCode("unbind"), "da"),
    m: common_vendor.o(($event) => $options.setVerifyCode("unbind"), "a0"),
    n: common_vendor.o((...args) => $options.unbindMobile && $options.unbindMobile(...args), "b8"),
    o: common_vendor.o(($event) => $options.sendSmsCode("reset-pwd"), "19"),
    p: common_vendor.o(($event) => $options.setVerifyCode("reset-pwd"), "04"),
    q: common_vendor.o((...args) => $options.resetPasswordByMobile && $options.resetPasswordByMobile(...args), "d4")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d2b54625"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/mobile/mobile.js.map
