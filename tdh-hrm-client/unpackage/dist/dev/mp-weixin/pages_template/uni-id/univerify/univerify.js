"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      userInfo: {}
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
    this.init(options);
  },
  methods: {
    init(options) {
    },
    loginByUniverify() {
      let that = this;
      vk.userCenter.loginByUniverify({
        // 更多配置请查看 https://uniapp.dcloud.io/univerify
        univerifyStyle: {
          "fullScreen": true,
          // 是否全屏显示(hbx3.1.5起支持全屏)，true表示全屏模式，false表示非全屏模式，默认值为false。
          "backgroundColor": "#f5f5f5",
          // 授权页面背景颜色，默认值：#ffffff
          "authButton": {
            "normalColor": "#19be6b",
            // 授权按钮正常状态背景颜色 默认值：#3479f5
            "highlightColor": "#18b566",
            // 授权按钮按下状态背景颜色 默认值：#2861c5（仅ios支持）
            "disabledColor": "#71d5a1",
            // 授权按钮不可点击时背景颜色 默认值：#73aaf5（仅ios支持）
            "textColor": "#ffffff",
            // 授权按钮文字颜色 默认值：#ffffff
            "title": "本机号码一键登录"
            // 授权按钮文案 默认值：“本机号码一键登录”
          },
          "privacyTerms": {
            "suffix": "使用本机号码登录",
            // 条款后的文案 默认值：“并使用本机号码登录”
            "termsColor": "#555555"
          }
        },
        data: {},
        success: (data) => {
          common_vendor.index.closeAuthView();
          that.userInfo = data.userInfo;
          setTimeout(() => {
            vk.alert(data.msg);
          }, 300);
        },
        fail: (res) => {
          common_vendor.index.closeAuthView();
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.loginByUniverify && $options.loginByUniverify(...args), "74"),
    b: $data.userInfo && $data.userInfo._id
  }, $data.userInfo && $data.userInfo._id ? {
    c: common_vendor.t(JSON.stringify($data.userInfo, null, 2))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-60cd0d30"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/univerify/univerify.js.map
