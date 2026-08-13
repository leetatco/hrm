"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-notice-bar",
  emits: ["click", "close", "getMore", "end"],
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
    // 音量喇叭的大小
    volumeSize: {
      type: [Number, String],
      default: 34
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
    // 滚动方向，horizontal-水平滚动，vertical-垂直滚动
    mode: {
      type: String,
      default: "horizontal"
    },
    // 是否显示
    show: {
      type: Boolean,
      default: true
    },
    // 字体大小，单位rpx
    fontSize: {
      type: [Number, String],
      default: 28
    },
    // 滚动一个周期的时间长，单位ms
    duration: {
      type: [Number, String],
      default: 2e3
    },
    // 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
    speed: {
      type: [Number, String],
      default: 160
    },
    // 水平滚动时，是否采用衔接形式滚动
    // 水平衔接模式，采用的是swiper组件，水平滚动
    isCircular: {
      type: Boolean,
      default: true
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
    // 滚动通知设置圆角
    borderRadius: {
      type: [Number, String],
      default: 0
    },
    // 通知的边距
    padding: {
      type: [Number, String],
      default: "18rpx 24rpx"
    },
    // list列表为空时，是否显示组件
    noListHidden: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    // 如果设置show为false，或者设置了noListHidden为true，且list长度又为零的话，隐藏组件
    isShow() {
      if (this.show == false || this.noListHidden == true && this.list.length == 0)
        return false;
      else
        return true;
    }
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
    // 滚动一个周期结束，只对垂直，或者水平步进形式有效
    end() {
      this.$emit("end");
    }
  }
};
if (!Array) {
  const _easycom_u_row_notice2 = common_vendor.resolveComponent("u-row-notice");
  const _easycom_u_column_notice2 = common_vendor.resolveComponent("u-column-notice");
  (_easycom_u_row_notice2 + _easycom_u_column_notice2)();
}
const _easycom_u_row_notice = () => "../u-row-notice/u-row-notice.js";
const _easycom_u_column_notice = () => "../u-column-notice/u-column-notice.js";
if (!Math) {
  (_easycom_u_row_notice + _easycom_u_column_notice)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.isShow
  }, $options.isShow ? common_vendor.e({
    b: $props.mode == "horizontal" && $props.isCircular
  }, $props.mode == "horizontal" && $props.isCircular ? {
    c: common_vendor.o($options.getMore, "49"),
    d: common_vendor.o($options.close, "2c"),
    e: common_vendor.o($options.click, "44"),
    f: common_vendor.p({
      type: $props.type,
      color: $props.color,
      bgColor: $props.bgColor,
      list: $props.list,
      volumeIcon: $props.volumeIcon,
      moreIcon: $props.moreIcon,
      volumeSize: $props.volumeSize,
      closeIcon: $props.closeIcon,
      mode: $props.mode,
      fontSize: $props.fontSize,
      speed: $props.speed,
      playState: $props.playState,
      padding: $props.padding
    })
  } : {}, {
    g: $props.mode == "vertical" || $props.mode == "horizontal" && !$props.isCircular
  }, $props.mode == "vertical" || $props.mode == "horizontal" && !$props.isCircular ? {
    h: common_vendor.o($options.getMore, "02"),
    i: common_vendor.o($options.close, "3a"),
    j: common_vendor.o($options.click, "98"),
    k: common_vendor.o($options.end, "e0"),
    l: common_vendor.p({
      type: $props.type,
      color: $props.color,
      bgColor: $props.bgColor,
      list: $props.list,
      volumeIcon: $props.volumeIcon,
      moreIcon: $props.moreIcon,
      closeIcon: $props.closeIcon,
      mode: $props.mode,
      volumeSize: $props.volumeSize,
      ["disable-touch"]: $props.disableTouch,
      fontSize: $props.fontSize,
      duration: $props.duration,
      playState: $props.playState,
      padding: $props.padding
    })
  } : {}, {
    m: $props.borderRadius + "rpx"
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a898d50a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-notice-bar/u-notice-bar.js.map
