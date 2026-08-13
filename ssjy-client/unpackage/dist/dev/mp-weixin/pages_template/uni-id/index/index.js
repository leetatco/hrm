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
    a: common_vendor.o(($event) => $options.pageTo("../password/password"), "4c"),
    b: common_vendor.o(($event) => $options.pageTo("../mobile/mobile"), "9a"),
    c: common_vendor.o(($event) => $options.pageTo("../email/email"), "58"),
    d: common_vendor.o(($event) => $options.pageTo("../weixin/weixin"), "2f"),
    e: common_vendor.o(($event) => $options.pageTo("../../db-test/db-test"), "53"),
    f: common_vendor.o(($event) => $options.pageTo("../util/util"), "6d"),
    g: common_vendor.o(($event) => $options.pageTo("../closeAccount/closeAccount"), "44"),
    h: common_vendor.o(($event) => $options.pageTo("../univerify/univerify"), "d2"),
    i: common_vendor.o(($event) => $options.pageTo("../../vk-vuex/vk-vuex"), "62"),
    j: common_vendor.o(($event) => $options.pageTo("../login/index/index"), "29"),
    k: common_vendor.o(($event) => _ctx.vk.navigateTo("../../plugs/lucky-draw/lucky-draw"), "3d"),
    l: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/weixin/weixin"), "d6"),
    m: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/qq/qq"), "fe"),
    n: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/douyin/douyin"), "85"),
    o: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/alipay/alipay"), "e0"),
    p: common_vendor.o(($event) => _ctx.vk.navigateTo("../../openapi/baidu/baidu"), "18")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-941659c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/index/index.js.map
