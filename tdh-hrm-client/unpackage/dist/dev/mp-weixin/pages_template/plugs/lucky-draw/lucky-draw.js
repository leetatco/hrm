"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      activity_id: "685b95a6e9f982fde4835c85"
      // 活动ID，具体活动ID请在vk-admin后台-系统设置-抽奖活动中查看，如有疑问，可联系QQ：370725567
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
  },
  methods: {
    navigateToLuckyDraw(path) {
      vk.navigateToLuckyDraw({
        path
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.navigateToLuckyDraw(`pages/activity/detail/detail?_id=${$data.activity_id}`), "f4"),
    b: common_vendor.o(($event) => $options.navigateToLuckyDraw(`pages/activity/user-list/user-list?_id=${$data.activity_id}`), "3d"),
    c: common_vendor.o(($event) => $options.navigateToLuckyDraw(`pages/activity/win-user-list/win-user-list?_id=${$data.activity_id}`), "aa"),
    d: common_vendor.o(($event) => $options.navigateToLuckyDraw(`pages/activity/share/share?_id=${$data.activity_id}`), "2a"),
    e: common_vendor.o(($event) => $options.navigateToLuckyDraw("pages/index/add"), "b2"),
    f: common_vendor.o(($event) => $options.navigateToLuckyDraw("pages/user/my-add/list"), "95"),
    g: common_vendor.o(($event) => $options.navigateToLuckyDraw("pages/user/my-in/list"), "37"),
    h: common_vendor.o(($event) => $options.navigateToLuckyDraw("pages/user/my-win/list"), "bc"),
    i: common_vendor.o(($event) => $options.navigateToLuckyDraw("pages/index/mys"), "72"),
    j: common_vendor.o(($event) => $options.navigateToLuckyDraw("pages/index/index"), "54"),
    k: common_vendor.o(($event) => $options.navigateToLuckyDraw("pages/pub/help/index"), "fd"),
    l: common_vendor.o(($event) => $options.navigateToLuckyDraw("pages/user/api-key/list"), "47")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-28a10d68"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/plugs/lucky-draw/lucky-draw.js.map
