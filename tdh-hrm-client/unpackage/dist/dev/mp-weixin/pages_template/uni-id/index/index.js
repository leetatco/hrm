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
    pageTo(url) {
      vk.navigateTo(url);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.pageTo("../password/password"), "d2"),
    b: common_vendor.o(($event) => $options.pageTo("../mobile/mobile"), "77"),
    c: common_vendor.o(($event) => $options.pageTo("../email/email"), "bf"),
    d: common_vendor.o(($event) => $options.pageTo("../weixin/weixin"), "2d"),
    e: common_vendor.o(($event) => $options.pageTo("../../db-test/db-test"), "4c"),
    f: common_vendor.o(($event) => $options.pageTo("../util/util"), "f4"),
    g: common_vendor.o(($event) => $options.pageTo("../univerify/univerify"), "bb"),
    h: common_vendor.o(($event) => $options.pageTo("../../vk-vuex/vk-vuex"), "c5"),
    i: common_vendor.o(($event) => $options.pageTo("../login/index/index"), "b4"),
    j: common_vendor.o(($event) => _ctx.vk.navigateTo("../../plugs/lucky-draw/lucky-draw"), "0d"),
    k: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/weixin/weixin"), "f3"),
    l: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/qq/qq"), "09"),
    m: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/douyin/douyin"), "8a"),
    n: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/alipay/alipay"), "bd"),
    o: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/baidu/baidu"), "2a")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-941659c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/index/index.js.map
