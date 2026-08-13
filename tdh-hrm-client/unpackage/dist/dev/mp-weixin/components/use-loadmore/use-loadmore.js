"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    type: {
      type: String,
      default: "more"
    },
    tip: {
      type: String,
      default: ""
    },
    defaults: {
      type: Object,
      default() {
        return {
          more: "上拉显示更多",
          loading: "鸿运方略 · 人力服务",
          nomore: "已经到底了"
        };
      }
    }
  },
  data() {
    return {};
  },
  computed: {},
  methods: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.type !== "nomore"
  }, $props.type !== "nomore" ? {} : {}, {
    b: common_vendor.t($props.tip || $props.defaults[$props.type])
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/use-loadmore/use-loadmore.js.map
