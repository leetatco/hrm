"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      form1: {
        username: "admin",
        password: "123456"
      }
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
  },
  methods: {
    // 用户注册
    register() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.register({
        data: form1,
        success: (data) => {
          vk.alert("注册成功!");
        }
      });
    },
    // 用户登录
    login() {
      let that = this;
      let form1 = that.form1;
      vk.userCenter.login({
        data: form1,
        success: (data) => {
          vk.alert("登录成功");
        }
      });
    },
    // 修改密码
    updatePwd() {
      let that = this;
      that.form1;
      vk.userCenter.updatePwd({
        data: {
          oldPassword: "123456",
          newPassword: "123456",
          password_confirmation: "123456"
        },
        success: (data) => {
          vk.alert("修改成功");
        }
      });
    },
    // 重置密码
    resetPwd() {
      let that = this;
      that.form1;
      vk.userCenter.resetPwd({
        success: (data) => {
          vk.alert("密码已重置为123456");
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form1.username,
    b: common_vendor.o(($event) => $data.form1.username = $event.detail.value, "60"),
    c: $data.form1.password,
    d: common_vendor.o(($event) => $data.form1.password = $event.detail.value, "ec"),
    e: common_vendor.o((...args) => $options.register && $options.register(...args), "95"),
    f: common_vendor.o((...args) => $options.login && $options.login(...args), "fe"),
    g: common_vendor.o((...args) => $options.updatePwd && $options.updatePwd(...args), "e3"),
    h: common_vendor.o((...args) => $options.resetPwd && $options.resetPwd(...args), "30")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aca1d7f6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/password/password.js.map
