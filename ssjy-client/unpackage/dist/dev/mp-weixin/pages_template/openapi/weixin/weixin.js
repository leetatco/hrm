"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      imageUrl: "",
      openlink: ""
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
    this.options = options;
    this.init(options);
  },
  methods: {
    // 初始化
    init(options) {
    },
    code2Session() {
      vk.userCenter.code2SessionWeixin({
        success: (data) => {
          this.data = data;
        }
      });
    },
    // 生成带参数的小程序码
    getWeixinMPqrcode() {
      let that = this;
      vk.userCenter.getWeixinMPqrcode({
        data: {
          //page: "pages/index/mys",
          scene: "a=1&b=2",
          check_path: false,
          env_version: "develop"
          // 默认值"release"。要打开的小程序版本。正式版为 "release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
        },
        success: (data) => {
          that.imageUrl = data.base64;
        }
      });
    },
    // 生成带参数的小程序scheme码
    getWeixinMPscheme() {
      let that = this;
      vk.userCenter.getWeixinMPscheme({
        data: {
          //path: "pages/index/index",
          query: "a=1&b=2",
          env_version: "develop"
          // 默认值"release"。要打开的小程序版本。正式版为 "release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
        },
        success: (data) => {
          that.openlink = data.openlink;
        }
      });
    },
    // 生成带参数的小程序url
    getWeixinMPurl() {
      let that = this;
      vk.userCenter.getWeixinMPurl({
        data: {
          //path: "pages/index/index",
          query: "a=1&b=2",
          env_version: "develop"
          // 默认值"release"。要打开的小程序版本。正式版为 "release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
        },
        success: (data) => {
          that.openlink = data.url_link;
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.code2Session && $options.code2Session(...args), "b2"),
    b: common_vendor.o((...args) => $options.getWeixinMPqrcode && $options.getWeixinMPqrcode(...args), "5b"),
    c: $data.imageUrl
  }, $data.imageUrl ? {
    d: $data.imageUrl
  } : {}, {
    e: common_vendor.o((...args) => $options.getWeixinMPscheme && $options.getWeixinMPscheme(...args), "04"),
    f: common_vendor.o((...args) => $options.getWeixinMPurl && $options.getWeixinMPurl(...args), "70"),
    g: $data.openlink
  }, $data.openlink ? {
    h: common_vendor.t($data.openlink)
  } : {}, {
    i: common_vendor.o(($event) => _ctx.vk.navigateTo("msgSecCheck/msgSecCheck"), "fe"),
    j: common_vendor.o(($event) => _ctx.vk.navigateTo("imgSecCheck/imgSecCheck"), "fd"),
    k: common_vendor.o(($event) => _ctx.vk.navigateTo("sendMessage/sendMessage"), "ba")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d5581505"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/openapi/weixin/weixin.js.map
