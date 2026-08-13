"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-tag",
  emits: ["click", "close"],
  // 是否禁用这个标签，禁用的话，会屏蔽点击事件
  props: {
    // 标签类型info、primary、success、warning、error
    type: {
      type: String,
      default: "primary"
    },
    disabled: {
      type: [Boolean, String],
      default: false
    },
    // 标签的大小，分为default（默认），mini（较小）
    size: {
      type: String,
      default: "default"
    },
    // tag的形状，circle（两边半圆形）, square（方形，带圆角），circleLeft（左边是半圆），circleRight（右边是半圆）
    shape: {
      type: String,
      default: "square"
    },
    // 标签文字
    text: {
      type: [String, Number],
      default: ""
    },
    // 背景颜色，默认为空字符串，即不处理
    bgColor: {
      type: String,
      default: ""
    },
    // 标签字体颜色，默认为空字符串，即不处理
    color: {
      type: String,
      default: ""
    },
    // 镂空形式标签的边框颜色
    borderColor: {
      type: String,
      default: ""
    },
    // 关闭按钮图标的颜色
    closeColor: {
      type: String,
      default: ""
    },
    // 点击时返回的索引值，用于区分例遍的数组哪个元素被点击了
    index: {
      type: [Number, String],
      default: ""
    },
    // 模式选择，dark|light|plain
    mode: {
      type: String,
      default: "light"
    },
    // 是否可关闭
    closeable: {
      type: Boolean,
      default: false
    },
    // 是否显示
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {};
  },
  computed: {
    customStyle() {
      let style = {};
      if (this.color)
        style.color = this.color;
      if (this.bgColor)
        style.backgroundColor = this.bgColor;
      if (this.mode == "plain" && this.color && !this.borderColor)
        style.borderColor = this.color;
      else
        style.borderColor = this.borderColor;
      return style;
    },
    iconStyle() {
      if (!this.closeable)
        return;
      let style = {};
      if (this.size == "mini")
        style.fontSize = "20rpx";
      else
        style.fontSize = "22rpx";
      if (this.mode == "plain" || this.mode == "light")
        style.color = this.type;
      else if (this.mode == "dark")
        style.color = "#ffffff";
      if (this.closeColor)
        style.color = this.closeColor;
      return style;
    },
    // 关闭图标的颜色
    closeIconColor() {
      if (this.closeColor)
        return this.closeColor;
      else if (this.color)
        return this.color;
      else if (this.mode == "dark")
        return "#ffffff";
      else
        return this.type;
    }
  },
  methods: {
    // 标签被点击
    clickTag() {
      if (this.disabled)
        return;
      this.$emit("click", this.index);
    },
    // 点击标签关闭按钮
    close() {
      this.$emit("close", this.index);
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  _easycom_u_icon2();
}
const _easycom_u_icon = () => "../u-icon/u-icon.js";
if (!Math) {
  _easycom_u_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.show
  }, $props.show ? common_vendor.e({
    b: common_vendor.t($props.text),
    c: $props.closeable
  }, $props.closeable ? {
    d: common_vendor.o($options.close, "95"),
    e: common_vendor.s($options.iconStyle),
    f: common_vendor.p({
      size: "22",
      color: $options.closeIconColor,
      name: "close"
    })
  } : {}, {
    g: common_vendor.o(() => {
    }, "44"),
    h: common_vendor.n($props.disabled ? "u-disabled" : ""),
    i: common_vendor.n("u-size-" + $props.size),
    j: common_vendor.n("u-shape-" + $props.shape),
    k: common_vendor.n("u-mode-" + $props.mode + "-" + $props.type),
    l: common_vendor.s($options.customStyle),
    m: common_vendor.o((...args) => $options.clickTag && $options.clickTag(...args), "12")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2c5b368d"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-tag/u-tag.js.map
