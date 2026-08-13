"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  emits: ["close", "getMore"],
  props: {
    // 显示的内容，数组
    list: {
      type: Array,
      default() {
        return [];
      }
    },
    // 显示的主题，success|error|primary|info|warning|none
    // none主题默认为透明背景，黑色(contentColor)字体
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
    // 音量喇叭的大小
    volumeSize: {
      type: [Number, String],
      default: 34
    },
    // 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
    speed: {
      type: [Number, String],
      default: 160
    },
    // 播放状态，play-播放，paused-暂停
    playState: {
      type: String,
      default: "play"
    },
    // 通知的边距
    padding: {
      type: [Number, String],
      default: "18rpx 24rpx"
    }
  },
  data() {
    return {
      textWidth: 0,
      // 滚动的文字宽度
      boxWidth: 0,
      // 供文字滚动的父盒子的宽度，和前者一起为了计算滚动速度
      animationDuration: "10s",
      // 动画执行时间
      animationPlayState: "paused",
      // 动画的开始和结束执行
      showText: ""
      // 显示的文本
    };
  },
  watch: {
    list: {
      immediate: true,
      handler(val) {
        this.showText = val.join("，");
        this.$nextTick(() => {
          this.initSize();
        });
      }
    },
    playState(val) {
      if (val == "play")
        this.animationPlayState = "running";
      else
        this.animationPlayState = "paused";
    },
    speed(val) {
      this.initSize();
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
    // 计算背景颜色
    computeBgColor() {
      if (this.bgColor)
        return this.bgColor;
      else if (this.type == "none")
        return "transparent";
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initSize();
    });
  },
  methods: {
    initSize() {
      let query = [];
      let textQuery = new Promise((resolve, reject) => {
        common_vendor.index.createSelectorQuery().in(this).select(`#u-notice-content`).boundingClientRect().exec((ret) => {
          this.textWidth = ret[0].width;
          resolve();
        });
      });
      query.push(textQuery);
      Promise.all(query).then(() => {
        this.animationDuration = `${this.textWidth / common_vendor.index.upx2px(this.speed)}s`;
        this.animationPlayState = "paused";
        setTimeout(() => {
          if (this.playState == "play" && this.autoplay)
            this.animationPlayState = "running";
        }, 10);
      });
    },
    // 点击通告栏
    click(index) {
      this.$emit("click");
    },
    // 点击关闭按钮
    close() {
      this.$emit("close");
    },
    // 点击更多箭头按钮
    getMore() {
      this.$emit("getMore");
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
    b: $props.volumeIcon
  }, $props.volumeIcon ? {
    c: common_vendor.p({
      name: "volume-fill",
      size: $props.volumeSize,
      color: $options.computeColor
    })
  } : {}, {
    d: common_vendor.t($data.showText),
    e: common_vendor.o((...args) => $options.click && $options.click(...args), "b1"),
    f: common_vendor.s($options.textStyle),
    g: common_vendor.n("u-type-" + $props.type),
    h: $data.animationDuration,
    i: $data.animationPlayState,
    j: $props.moreIcon
  }, $props.moreIcon ? {
    k: common_vendor.o($options.getMore, "2b"),
    l: common_vendor.p({
      name: "arrow-right",
      size: 26,
      color: $options.computeColor
    })
  } : {}, {
    m: $props.closeIcon
  }, $props.closeIcon ? {
    n: common_vendor.o($options.close, "7a"),
    o: common_vendor.p({
      name: "close",
      size: 24,
      color: $options.computeColor
    })
  } : {}, {
    p: $options.computeBgColor,
    q: $props.padding,
    r: common_vendor.n($props.type ? `u-type-${$props.type}-light-bg` : "")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-58e73729"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-row-notice/u-row-notice.js.map
