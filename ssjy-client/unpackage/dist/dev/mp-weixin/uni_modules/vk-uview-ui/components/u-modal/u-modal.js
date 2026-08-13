"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-modal",
  emits: ["update:modelValue", "input", "confirm", "cancel"],
  props: {
    // 是否显示Modal
    value: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Boolean,
      default: false
    },
    // 层级z-index
    zIndex: {
      type: [Number, String],
      default: ""
    },
    // 标题
    title: {
      type: [String],
      default: "提示"
    },
    // 弹窗宽度，可以是数值(rpx)，百分比，auto等
    width: {
      type: [Number, String],
      default: 600
    },
    // 弹窗内容
    content: {
      type: String,
      default: "内容"
    },
    // 是否显示标题
    showTitle: {
      type: Boolean,
      default: true
    },
    // 是否显示确认按钮
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    // 是否显示取消按钮
    showCancelButton: {
      type: Boolean,
      default: false
    },
    // 确认文案
    confirmText: {
      type: String,
      default: "确认"
    },
    // 取消文案
    cancelText: {
      type: String,
      default: "取消"
    },
    // 确认按钮颜色
    confirmColor: {
      type: String,
      default: "#2979ff"
    },
    // 取消文字颜色
    cancelColor: {
      type: String,
      default: "#606266"
    },
    // 圆角值
    borderRadius: {
      type: [Number, String],
      default: 16
    },
    // 标题的样式
    titleStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 内容的样式
    contentStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 取消按钮的样式
    cancelStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 确定按钮的样式
    confirmStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 是否开启缩放效果
    zoom: {
      type: Boolean,
      default: true
    },
    // 是否异步关闭，只对确定按钮有效
    asyncClose: {
      type: Boolean,
      default: false
    },
    // 是否允许点击遮罩关闭modal
    maskCloseAble: {
      type: Boolean,
      default: false
    },
    // 给一个负的margin-top，往上偏移，避免和键盘重合的情况
    negativeTop: {
      type: [String, Number],
      default: 0
    },
    // 遮罩的模糊度
    blur: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      loading: false,
      // 确认按钮是否正在加载中
      popupValue: false
    };
  },
  computed: {
    valueCom() {
      return this.modelValue;
    },
    cancelBtnStyle() {
      return Object.assign(
        {
          color: this.cancelColor
        },
        this.cancelStyle
      );
    },
    confirmBtnStyle() {
      return Object.assign(
        {
          color: this.confirmColor
        },
        this.confirmStyle
      );
    },
    uZIndex() {
      return this.zIndex ? this.zIndex : this.$u.zIndex.popup;
    }
  },
  watch: {
    // 如果是异步关闭时，外部修改v-model的值为false时，重置内部的loading状态
    // 避免下次打开的时候，状态混乱
    valueCom: {
      immediate: true,
      handler(n) {
        if (n === true)
          this.loading = false;
        this.popupValue = n;
      }
    }
  },
  methods: {
    confirm() {
      if (this.asyncClose) {
        this.loading = true;
      } else {
        this.$emit("input", false);
        this.$emit("update:modelValue", false);
      }
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
      this.$emit("input", false);
      this.$emit("update:modelValue", false);
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },
    // 点击遮罩关闭modal，设置v-model的值为false，否则无法第二次弹起modal
    popupClose() {
      this.$emit("input", false);
      this.$emit("update:modelValue", false);
    },
    // 清除加载中的状态
    clearLoading() {
      this.loading = false;
    }
  }
};
if (!Array) {
  const _easycom_u_loading2 = common_vendor.resolveComponent("u-loading");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_easycom_u_loading2 + _easycom_u_popup2)();
}
const _easycom_u_loading = () => "../u-loading/u-loading.js";
const _easycom_u_popup = () => "../u-popup/u-popup.js";
if (!Math) {
  (_easycom_u_loading + _easycom_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.showTitle
  }, $props.showTitle ? {
    b: common_vendor.t($props.title),
    c: common_vendor.s($props.titleStyle)
  } : {}, {
    d: _ctx.$slots.default || _ctx.$slots.$default
  }, _ctx.$slots.default || _ctx.$slots.$default ? {
    e: common_vendor.s($props.contentStyle)
  } : {
    f: common_vendor.t($props.content),
    g: common_vendor.s($props.contentStyle)
  }, {
    h: $props.showCancelButton || $props.showConfirmButton
  }, $props.showCancelButton || $props.showConfirmButton ? common_vendor.e({
    i: $props.showCancelButton
  }, $props.showCancelButton ? {
    j: common_vendor.t($props.cancelText),
    k: common_vendor.s($options.cancelBtnStyle),
    l: common_vendor.o((...args) => $options.cancel && $options.cancel(...args), "56")
  } : {}, {
    m: $props.showConfirmButton || _ctx.$slots["confirm-button"]
  }, $props.showConfirmButton || _ctx.$slots["confirm-button"] ? common_vendor.e({
    n: _ctx.$slots["confirm-button"]
  }, _ctx.$slots["confirm-button"] ? {} : common_vendor.e({
    o: $data.loading
  }, $data.loading ? {
    p: common_vendor.p({
      mode: "circle",
      color: $props.confirmColor
    })
  } : {
    q: common_vendor.t($props.confirmText)
  }), {
    r: $props.asyncClose ? "none" : "u-model__btn--hover",
    s: common_vendor.s($options.confirmBtnStyle),
    t: common_vendor.o((...args) => $options.confirm && $options.confirm(...args), "15")
  }) : {}) : {}, {
    v: common_vendor.o($options.popupClose, "bd"),
    w: common_vendor.o(($event) => $data.popupValue = $event, "ff"),
    x: common_vendor.p({
      blur: $props.blur,
      zoom: $props.zoom,
      mode: "center",
      popup: false,
      ["z-index"]: $options.uZIndex,
      length: $props.width,
      ["mask-close-able"]: $props.maskCloseAble,
      ["border-radius"]: $props.borderRadius,
      ["negative-top"]: $props.negativeTop,
      modelValue: $data.popupValue
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5708b0b9"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-modal/u-modal.js.map
