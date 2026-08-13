"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-card",
  emits: ["click", "head-click", "body-click", "foot-click"],
  props: {
    // 与屏幕两侧是否留空隙
    full: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: ""
    },
    // 标题颜色
    titleColor: {
      type: String,
      default: "#303133"
    },
    // 标题字体大小，单位rpx
    titleSize: {
      type: [Number, String],
      default: "30"
    },
    // 副标题
    subTitle: {
      type: String,
      default: ""
    },
    // 副标题颜色
    subTitleColor: {
      type: String,
      default: "#909399"
    },
    // 副标题字体大小，单位rpx
    subTitleSize: {
      type: [Number, String],
      default: "26"
    },
    // 是否显示外部边框，只对full=false时有效(卡片与边框有空隙时)
    border: {
      type: Boolean,
      default: true
    },
    // 用于标识点击了第几个
    index: {
      type: [Number, String, Object],
      default: ""
    },
    // 用于隔开上下左右的边距，带单位的写法，如："30rpx 30rpx"，"20rpx 20rpx 30rpx 30rpx"
    margin: {
      type: String,
      default: "30rpx"
    },
    // card卡片的圆角
    borderRadius: {
      type: [Number, String],
      default: "16"
    },
    // 头部自定义样式，对象形式
    headStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 主体自定义样式，对象形式
    bodyStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 底部自定义样式，对象形式
    footStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 头部是否下边框
    headBorderBottom: {
      type: Boolean,
      default: true
    },
    // 底部是否有上边框
    footBorderTop: {
      type: Boolean,
      default: true
    },
    // 标题左边的缩略图
    thumb: {
      type: String,
      default: ""
    },
    // 缩略图宽高，单位rpx
    thumbWidth: {
      type: [String, Number],
      default: "60"
    },
    // 缩略图是否为圆形
    thumbCircle: {
      type: Boolean,
      default: false
    },
    // 给head，body，foot的内边距
    padding: {
      type: [String, Number],
      default: "30"
    },
    // 是否显示头部
    showHead: {
      type: Boolean,
      default: true
    },
    // 是否显示尾部
    showFoot: {
      type: Boolean,
      default: true
    },
    // 卡片外围阴影，字符串形式
    boxShadow: {
      type: String,
      default: "none"
    }
  },
  data() {
    return {};
  },
  methods: {
    click() {
      this.$emit("click", this.index);
    },
    headClick() {
      this.$emit("head-click", this.index);
    },
    bodyClick() {
      this.$emit("body-click", this.index);
    },
    footClick() {
      this.$emit("foot-click", this.index);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.showHead
  }, $props.showHead ? common_vendor.e({
    b: !_ctx.$slots.head
  }, !_ctx.$slots.head ? common_vendor.e({
    c: $props.title
  }, $props.title ? common_vendor.e({
    d: $props.thumb
  }, $props.thumb ? {
    e: $props.thumb,
    f: $props.thumbWidth + "rpx",
    g: $props.thumbWidth + "rpx",
    h: $props.thumbCircle ? "100rpx" : "6rpx"
  } : {}, {
    i: common_vendor.t($props.title),
    j: $props.titleSize + "rpx",
    k: $props.titleColor
  }) : {}, {
    l: $props.subTitle
  }, $props.subTitle ? {
    m: common_vendor.t($props.subTitle),
    n: $props.subTitleSize + "rpx",
    o: $props.subTitleColor
  } : {}) : {}, {
    p: common_vendor.s({
      padding: $props.padding + "rpx"
    }),
    q: common_vendor.s($props.headStyle),
    r: $props.headBorderBottom ? 1 : "",
    s: common_vendor.o((...args) => $options.headClick && $options.headClick(...args), "17")
  }) : {}, {
    t: common_vendor.o((...args) => $options.bodyClick && $options.bodyClick(...args), "ac"),
    v: common_vendor.s({
      padding: $props.padding + "rpx"
    }),
    w: common_vendor.s($props.bodyStyle),
    x: $props.showFoot
  }, $props.showFoot ? {
    y: common_vendor.o((...args) => $options.footClick && $options.footClick(...args), "40"),
    z: common_vendor.s({
      padding: _ctx.$slots.foot ? $props.padding + "rpx" : 0
    }),
    A: common_vendor.s($props.footStyle),
    B: $props.footBorderTop ? 1 : ""
  } : {}, {
    C: common_vendor.o((...args) => $options.click && $options.click(...args), "c0"),
    D: $props.border ? 1 : "",
    E: $props.full ? 1 : "",
    F: $props.borderRadius > 0 ? 1 : "",
    G: $props.borderRadius + "rpx",
    H: $props.borderRadius + "rpx",
    I: $props.margin,
    J: $props.boxShadow
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-797f62c7"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-card/u-card.js.map
