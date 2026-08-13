"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  emits: ["close", "getMore", "end"],
  props: {
    // 显示的内容，数组
    list: {
      type: Array,
      default() {
        return [];
      }
    },
    // 显示的主题，success|error|primary|info|warning
    type: {
      type: String,
      default: "warning"
    },
    // 是否显示左侧的音量图标
    volumeIcon: {
      type: Boolean,
      default: true
    },
    // 是否显示右侧的右箭头图标
    moreIcon: {
      type: Boolean,
      default: false
    },
    // 是否显示右侧的关闭图标
    closeIcon: {
      type: Boolean,
      default: false
    },
    // 是否自动播放
    autoplay: {
      type: Boolean,
      default: true
    },
    // 文字颜色，各图标也会使用文字颜色
    color: {
      type: String,
      default: ""
    },
    // 背景颜色
    bgColor: {
      type: String,
      default: ""
    },
    // 滚动方向，row-水平滚动，column-垂直滚动
    direction: {
      type: String,
      default: "row"
    },
    // 是否显示
    show: {
      type: Boolean,
      default: true
    },
    // 字体大小，单位rpx
    fontSize: {
      type: [Number, String],
      default: 26
    },
    // 滚动一个周期的时间长，单位ms
    duration: {
      type: [Number, String],
      default: 2e3
    },
    // 音量喇叭的大小
    volumeSize: {
      type: [Number, String],
      default: 34
    },
    // 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
    speed: {
      type: Number,
      default: 160
    },
    // 水平滚动时，是否采用衔接形式滚动
    isCircular: {
      type: Boolean,
      default: true
    },
    // 滚动方向，horizontal-水平滚动，vertical-垂直滚动
    mode: {
      type: String,
      default: "horizontal"
    },
    // 播放状态，play-播放，paused-暂停
    playState: {
      type: String,
      default: "play"
    },
    // 是否禁止用手滑动切换
    // 目前HX2.6.11，只支持App 2.5.5+、H5 2.5.5+、支付宝小程序、字节跳动小程序
    disableTouch: {
      type: Boolean,
      default: true
    },
    // 通知的边距
    padding: {
      type: [Number, String],
      default: "18rpx 24rpx"
    }
  },
  computed: {
    // 计算字体颜色，如果没有自定义的，就用uview主题颜色
    computeColor() {
      if (this.color)
        return this.color;
      else if (this.type == "none")
        return "#606266";
      else
        return this.type;
    },
    // 文字内容的样式
    textStyle() {
      let style = {};
      if (this.color)
        style.color = this.color;
      else if (this.type == "none")
        style.color = "#606266";
      style.fontSize = this.fontSize + "rpx";
      return style;
    },
    // 垂直或者水平滚动
    vertical() {
      if (this.mode == "horizontal")
        return false;
      else
        return true;
    },
    // 计算背景颜色
    computeBgColor() {
      if (this.bgColor)
        return this.bgColor;
      else if (this.type == "none")
        return "transparent";
    }
  },
  data() {
    return {
      // animation: false
    };
  },
  methods: {
    // 点击通告栏
    click(index) {
      this.$emit("click", index);
    },
    // 点击关闭按钮
    close() {
      this.$emit("close");
    },
    // 点击更多箭头按钮
    getMore() {
      this.$emit("getMore");
    },
    change(e) {
      let index = e.detail.current;
      if (index == this.list.length - 1) {
        this.$emit("end");
      }
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
    a: $props.volumeIcon
  }, $props.volumeIcon ? {
    b: common_vendor.p({
      name: "volume-fill",
      size: $props.volumeSize,
      color: $options.computeColor
    })
  } : {}, {
    c: common_vendor.f($props.list, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: common_vendor.o(($event) => $options.click(index), index),
        c: index
      };
    }),
    d: common_vendor.s($options.textStyle),
    e: common_vendor.n("u-type-" + $props.type),
    f: $props.disableTouch,
    g: common_vendor.o((...args) => $options.change && $options.change(...args), "d9"),
    h: $props.autoplay && $props.playState == "play",
    i: $options.vertical,
    j: $props.duration,
    k: $props.moreIcon
  }, $props.moreIcon ? {
    l: common_vendor.o($options.getMore, "77"),
    m: common_vendor.p({
      name: "arrow-right",
      size: 26,
      color: $options.computeColor
    })
  } : {}, {
    n: $props.closeIcon
  }, $props.closeIcon ? {
    o: common_vendor.o($options.close, "24"),
    p: common_vendor.p({
      name: "close",
      size: 24,
      color: $options.computeColor
    })
  } : {}, {
    q: $options.computeBgColor,
    r: $props.padding,
    s: common_vendor.n($props.type ? `u-type-${$props.type}-light-bg` : "")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d63e9e4b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-column-notice/u-column-notice.js.map
