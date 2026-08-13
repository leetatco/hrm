"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      imageUrl: "",
      data: {}
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
      vk.toast("请在抖音小程序中打开");
      return;
    },
    // 生成带参数的小程序码
    getMiniCode() {
      vk.callFunction({
        url: "template/openapi/douyin/pub/getMiniCode",
        title: "请求中...",
        data: {},
        success: (data) => {
          this.data = data;
          this.imageUrl = data.base64;
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.code2Session && $options.code2Session(...args), "59"),
    b: common_vendor.o((...args) => $options.getMiniCode && $options.getMiniCode(...args), "9a"),
    c: $data.imageUrl
  }, $data.imageUrl ? {
    d: $data.imageUrl
  } : {}, {
    e: common_vendor.o(($event) => _ctx.vk.navigateTo("msgSecCheck/msgSecCheck"), "c6"),
    f: common_vendor.o(($event) => _ctx.vk.navigateTo("imgSecCheck/imgSecCheck"), "97"),
    g: common_vendor.t(JSON.stringify($data.data, null, 2))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e193c911"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/openapi/douyin/douyin.js.map
