"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      hasWeixinAuth: true,
      encryptedKey: "",
      image: "",
      data: {}
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
    this.init();
  },
  methods: {
    init() {
      let that = this;
      vk.userCenter.code2SessionWeixin({
        data: {
          needCache: true
        },
        success: (data) => {
          that.encryptedKey = data.encryptedKey;
        }
      });
    },
    // 微信登录
    loginByWeixin(type) {
      let that = this;
      vk.userCenter.loginByWeixin({
        data: {
          type
        },
        success: (data) => {
          vk.alert(data.msg);
          that.data = data;
        }
      });
    },
    code2SessionWeixin() {
      vk.userCenter.code2SessionWeixin({
        success: (data) => {
          vk.alert(JSON.stringify(data));
        }
      });
    },
    // 设置用户昵称头像
    setUserInfo() {
      try {
        vk.navigateTo("./set-user-info");
      } catch (err) {
        vk.alert("您的微信版本过低，请先更新微信!");
      }
    },
    // 绑定微信
    bindWeixin() {
      let that = this;
      vk.userCenter.bindWeixin({
        success: (data) => {
          vk.alert("绑定成功");
          that.data = data;
        }
      });
    },
    // 解绑微信
    unbindWeixin() {
      let that = this;
      vk.userCenter.unbindWeixin({
        success: (data) => {
          vk.alert("解绑成功");
          that.data = data;
        }
      });
    },
    // 获取微信绑定的手机号码（新方式）
    getPhoneNumber1(e) {
      let that = this;
      let { code } = e.detail;
      if (!code) {
        return false;
      }
      vk.userCenter.getPhoneNumber({
        data: {
          code,
          encryptedKey: that.encryptedKey
        },
        success: (data) => {
          vk.alert("手机号:" + data.phone);
        }
      });
    },
    // 获取微信绑定的手机号码（旧方式）
    getPhoneNumber2(e) {
      let that = this;
      let { encryptedData, iv } = e.detail;
      if (!encryptedData || !iv) {
        return false;
      }
      vk.userCenter.getPhoneNumber({
        data: {
          encryptedData,
          iv,
          encryptedKey: that.encryptedKey
        },
        success: (data) => {
          vk.alert("手机号:" + data.phone);
        }
      });
    },
    // 使用微信绑定的手机号登录/注册（新方式）
    loginByWeixinPhoneNumber1(e) {
      let that = this;
      let { code } = e.detail;
      if (!code) {
        return false;
      }
      vk.userCenter.loginByWeixinPhoneNumber({
        data: {
          code,
          encryptedKey: that.encryptedKey
        },
        success(data) {
          vk.alert(data.msg);
        }
      });
    },
    // 使用微信绑定的手机号登录/注册（旧方式）
    loginByWeixinPhoneNumber2(e) {
      let that = this;
      let { encryptedData, iv } = e.detail;
      if (!encryptedData || !iv) {
        return false;
      }
      vk.userCenter.loginByWeixinPhoneNumber({
        data: {
          encryptedData,
          iv,
          encryptedKey: that.encryptedKey
        },
        success(data) {
          vk.alert(data.msg);
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/weixin/weixin"), "d3"),
    b: common_vendor.o(($event) => $options.loginByWeixin("register"), "71"),
    c: common_vendor.o(($event) => $options.loginByWeixin("login"), "20"),
    d: common_vendor.o(($event) => $options.loginByWeixin(), "6c"),
    e: common_vendor.o((...args) => $options.code2SessionWeixin && $options.code2SessionWeixin(...args), "07"),
    f: common_vendor.o((...args) => $options.setUserInfo && $options.setUserInfo(...args), "83"),
    g: common_vendor.o((...args) => $options.bindWeixin && $options.bindWeixin(...args), "5a"),
    h: common_vendor.o((...args) => $options.unbindWeixin && $options.unbindWeixin(...args), "0a"),
    i: common_vendor.o((...args) => $options.getPhoneNumber1 && $options.getPhoneNumber1(...args), "60"),
    j: common_vendor.o((...args) => $options.getPhoneNumber2 && $options.getPhoneNumber2(...args), "9d"),
    k: common_vendor.o((...args) => $options.loginByWeixinPhoneNumber1 && $options.loginByWeixinPhoneNumber1(...args), "84"),
    l: common_vendor.o((...args) => $options.loginByWeixinPhoneNumber2 && $options.loginByWeixinPhoneNumber2(...args), "78")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f8342058"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/weixin/weixin.js.map
