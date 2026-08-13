"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  emits: ["update:modelValue", "input", "change"],
  props: {
    // 通过v-model绑定current值
    value: {
      type: [String, Number],
      default: 0
    },
    modelValue: {
      type: [String, Number],
      default: 0
    },
    // 显示与否
    show: {
      type: Boolean,
      default: true
    },
    // 整个tabbar的背景颜色
    bgColor: {
      type: String,
      default: "#ffffff"
    },
    // tabbar的高度，默认50px，单位任意，如果为数值，则为px单位
    height: {
      type: [String, Number],
      default: "50px"
    },
    // 非凸起图标的大小，单位任意，数值默认px
    iconSize: {
      type: [String, Number],
      default: "24px"
    },
    // 凸起的图标的大小，单位任意，数值默认px
    midButtonSize: {
      type: [String, Number],
      default: "45px"
    },
    // 激活时的演示，包括字体图标，提示文字等的演示
    activeColor: {
      type: String,
      default: "#303133"
    },
    // 未激活时的颜色
    inactiveColor: {
      type: String,
      default: "#606266"
    },
    // 是否显示中部的凸起按钮
    midButton: {
      type: Boolean,
      default: false
    },
    // 配置参数
    list: {
      type: Array,
      default() {
        return [];
      }
    },
    // 切换前的回调
    beforeSwitch: {
      type: Function,
      default: null
    },
    // 是否显示顶部的横线
    borderTop: {
      type: Boolean,
      default: true
    },
    // 是否隐藏原生tabbar，默认为false
    hideTabBar: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 由于安卓太菜了，通过css居中凸起按钮的外层元素有误差，故通过js计算将其居中
      midButtonLeft: "50%",
      pageUrl: ""
      // 当前页面URL
    };
  },
  created() {
    if (this.hideTabBar)
      common_vendor.index.hideTabBar();
    let pages = getCurrentPages();
    if (pages.length > 0) {
      this.pageUrl = pages[pages.length - 1].route;
    }
  },
  computed: {
    valueCom() {
      return this.modelValue;
    },
    elIconPath() {
      return (index) => {
        let pagePath = this.list[index].pagePath;
        if (pagePath) {
          if (pagePath == this.pageUrl || pagePath == "/" + this.pageUrl) {
            return this.list[index].selectedIconPath;
          } else {
            return this.list[index].iconPath;
          }
        } else {
          return index == this.valueCom ? this.list[index].selectedIconPath : this.list[index].iconPath;
        }
      };
    },
    elColor() {
      return (index) => {
        let pagePath = this.list[index].pagePath;
        if (pagePath) {
          if (pagePath == this.pageUrl || pagePath == "/" + this.pageUrl)
            return this.activeColor;
          else
            return this.inactiveColor;
        } else {
          return index == this.valueCom ? this.activeColor : this.inactiveColor;
        }
      };
    }
  },
  mounted() {
    this.midButton && this.getMidButtonLeft();
  },
  beforeDestroy() {
  },
  methods: {
    addUnit(value) {
      if (!isNaN(value)) {
        return `${value}px`;
      }
      return value;
    },
    async clickHandler(index) {
      if (this.beforeSwitch && typeof this.beforeSwitch === "function") {
        let beforeSwitch = this.beforeSwitch.bind(this.$u.$parent.call(this))(index);
        if (!!beforeSwitch && typeof beforeSwitch.then === "function") {
          await beforeSwitch.then((res) => {
            this.switchTab(index);
          }).catch((err) => {
          });
        } else if (beforeSwitch === true) {
          this.switchTab(index);
        }
      } else {
        this.switchTab(index);
      }
    },
    // 切换tab
    switchTab(index) {
      this.$emit("change", index);
      if (this.list[index].pagePath) {
        let url = this.list[index].pagePath;
        common_vendor.index.switchTab({
          url,
          fail: (err) => {
            if (err && err.errMsg && err.errMsg.indexOf("tabBar") > -1) {
              common_vendor.index.navigateTo({ url });
            } else {
              common_vendor.index.__f__("error", "at uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.vue:271", err);
            }
          }
        });
      } else {
        this.$emit("input", index);
        this.$emit("update:modelValue", index);
      }
    },
    // 计算角标的right值
    getOffsetRight(count, isDot) {
      if (isDot) {
        return -10;
      } else if (count > 9) {
        return -20;
      } else {
        return -15;
      }
    },
    // 获取凸起按钮外层元素的left值，让其水平居中
    getMidButtonLeft() {
      let windowWidth = this.$u.sys().windowWidth;
      this.midButtonLeft = windowWidth / 2 + "px";
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_badge2 = common_vendor.resolveComponent("u-badge");
  (_easycom_u_icon2 + _easycom_u_badge2)();
}
const _easycom_u_icon = () => "../u-icon/u-icon.js";
const _easycom_u_badge = () => "../u-badge/u-badge.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_badge)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.show
  }, $props.show ? common_vendor.e({
    b: common_vendor.f($props.list, (item, index, i0) => {
      return common_vendor.e({
        a: "d1ac5dd3-0-" + i0,
        b: common_vendor.p({
          size: $props.midButton && item.midButton ? $props.midButtonSize : $props.iconSize,
          name: $options.elIconPath(index),
          ["img-mode"]: "scaleToFill",
          color: $options.elColor(index),
          ["custom-prefix"]: item.customIcon ? "custom-icon" : "uicon"
        }),
        c: item.count
      }, item.count ? {
        d: "d1ac5dd3-1-" + i0,
        e: common_vendor.p({
          count: item.count,
          ["is-dot"]: item.isDot,
          offset: [-2, $options.getOffsetRight(item.count, item.isDot)]
        })
      } : {}, {
        f: common_vendor.n($props.midButton && item.midButton ? "u-tabbar__content__circle__button" : "u-tabbar__content__item__button"),
        g: common_vendor.t(item.text),
        h: $options.elColor(index),
        i: index,
        j: $props.midButton && item.midButton ? 1 : "",
        k: common_vendor.o(($event) => $options.clickHandler(index), index)
      });
    }),
    c: $props.bgColor,
    d: $props.midButton
  }, $props.midButton ? {
    e: $props.borderTop ? 1 : "",
    f: $props.bgColor,
    g: $data.midButtonLeft
  } : {}, {
    h: $options.addUnit($props.height),
    i: $props.bgColor,
    j: $props.borderTop ? 1 : "",
    k: `calc(${$options.addUnit($props.height)} + ${$props.midButton ? 24 : 0}px)`,
    l: common_vendor.o(() => {
    }, "e1")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d1ac5dd3"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js.map
