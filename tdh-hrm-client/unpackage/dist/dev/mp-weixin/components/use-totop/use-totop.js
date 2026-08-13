"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    top: {
      type: Number,
      default: 100
    },
    right: {
      type: String,
      default: "30"
    },
    bottom: {
      type: String,
      default: "30"
    },
    duration: {
      type: Number,
      default: 120
    },
    scrollTop: {
      type: Number,
      default: 0
    }
  },
  watch: {
    scrollTop(nv, ov) {
      this.s_top = nv;
      this.change();
    }
  },
  data() {
    return {
      s_top: 0,
      visible: false
    };
  },
  methods: {
    totop: function() {
      common_vendor.index.pageScrollTo({
        scrollTop: 0,
        duration: this.duration
      });
      this.$emit("to", {
        type: "to",
        scrollTop: this.s_top
      });
    },
    change(scrollTop) {
      this.s_top = scrollTop;
      if (this.s_top > this.top) {
        if (!this.visible)
          this.visible = true;
      } else {
        if (this.visible)
          this.visible = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.n($data.visible ? "fade-in" : "dn"),
    b: $props.bottom + "rpx",
    c: $props.right + "rpx",
    d: common_vendor.o((...args) => $options.totop && $options.totop(...args), "0f")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/use-totop/use-totop.js.map
