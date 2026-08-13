"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-radio",
  emits: ["change"],
  props: {
    // radio的名称
    name: {
      type: [String, Number],
      default: ""
    },
    // 组件的整体大小
    size: {
      type: [String, Number],
      default: ""
    },
    // 形状，square为方形，circle为原型
    shape: {
      type: String,
      default: ""
    },
    // 是否禁用
    disabled: {
      type: [String, Boolean],
      default: ""
    },
    // 是否禁止点击提示语选中复选框
    labelDisabled: {
      type: [String, Boolean],
      default: ""
    },
    // 选中状态下的颜色，如设置此值，将会覆盖parent的activeColor值
    activeColor: {
      type: String,
      default: ""
    },
    // 图标的大小，单位rpx
    iconSize: {
      type: [String, Number],
      default: ""
    },
    // label的字体大小，rpx单位
    labelSize: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      // 父组件的默认值，因为头条小程序不支持在computed中使用this.parent.shape的形式
      // 故只能使用如此方法
      parentData: {
        iconSize: null,
        labelDisabled: null,
        disabled: null,
        shape: null,
        activeColor: null,
        size: null,
        width: null,
        height: null,
        value: null,
        wrap: null,
        modelValue: null
      }
    };
  },
  created() {
    this.parent = false;
    this.updateParentData();
    this.parent.children.push(this);
  },
  computed: {
    // 是否禁用，如果父组件u-raios-group禁用的话，将会忽略子组件的配置
    elDisabled() {
      return this.disabled !== "" ? this.disabled : this.parentData.disabled !== null ? this.parentData.disabled : false;
    },
    // 是否禁用label点击
    elLabelDisabled() {
      return this.labelDisabled !== "" ? this.labelDisabled : this.parentData.labelDisabled !== null ? this.parentData.labelDisabled : false;
    },
    // 组件尺寸，对应size的值，默认值为34rpx
    elSize() {
      return this.size ? this.size : this.parentData.size ? this.parentData.size : 34;
    },
    // 组件的勾选图标的尺寸，默认20
    elIconSize() {
      return this.iconSize ? this.iconSize : this.parentData.iconSize ? this.parentData.iconSize : 20;
    },
    // 组件选中激活时的颜色
    elActiveColor() {
      return this.activeColor ? this.activeColor : this.parentData.activeColor ? this.parentData.activeColor : "primary";
    },
    // 组件的形状
    elShape() {
      return this.shape ? this.shape : this.parentData.shape ? this.parentData.shape : "circle";
    },
    // 设置radio的状态，要求radio的name等于parent的value时才为选中状态
    iconStyle() {
      let style = {};
      if (this.elActiveColor && this.parentData.value === this.name && !this.elDisabled) {
        style.borderColor = this.elActiveColor;
        style.backgroundColor = this.elActiveColor;
      }
      style.width = this.$u.addUnit(this.elSize);
      style.height = this.$u.addUnit(this.elSize);
      return style;
    },
    iconColor() {
      return this.name === this.parentData.value ? "#ffffff" : "transparent";
    },
    iconClass() {
      let classes = [];
      classes.push("u-radio__icon-wrap--" + this.elShape);
      if (this.name === this.parentData.value)
        classes.push("u-radio__icon-wrap--checked");
      if (this.elDisabled)
        classes.push("u-radio__icon-wrap--disabled");
      if (this.name === this.parentData.value && this.elDisabled)
        classes.push("u-radio__icon-wrap--disabled--checked");
      return classes.join(" ");
    },
    radioStyle() {
      let style = {};
      if (this.parentData.width) {
        style.width = this.$u.addUnit(this.parentData.width);
        style.float = "left";
      }
      if (this.parentData.wrap) {
        style.width = "100%";
      }
      return style;
    }
  },
  methods: {
    updateParentData() {
      this.getParentData("u-radio-group");
    },
    onClickLabel() {
      if (!this.elLabelDisabled && !this.elDisabled) {
        this.setRadioCheckedStatus();
      }
    },
    toggle() {
      if (!this.elDisabled) {
        this.setRadioCheckedStatus();
      }
    },
    emitEvent() {
      if (this.parentData.value != this.name)
        this.$emit("change", this.name);
    },
    // 改变组件选中状态
    // 这里的改变的依据是，更改本组件的parentData.value值为本组件的name值，同时通过父组件遍历所有u-radio实例
    // 将本组件外的其他u-radio的parentData.value都设置为空(由computed计算后，都被取消选中状态)，因而只剩下一个为选中状态
    setRadioCheckedStatus() {
      this.emitEvent();
      if (this.parent) {
        this.parent.setValue(this.name);
        this.parentData.value = this.name;
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
  return {
    a: common_vendor.p({
      name: "checkbox-mark",
      size: $options.elIconSize,
      color: $options.iconColor
    }),
    b: common_vendor.o((...args) => $options.toggle && $options.toggle(...args), "9e"),
    c: common_vendor.n($options.iconClass),
    d: common_vendor.s($options.iconStyle),
    e: common_vendor.o((...args) => $options.onClickLabel && $options.onClickLabel(...args), "38"),
    f: _ctx.$u.addUnit($props.labelSize),
    g: common_vendor.s($options.radioStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3d838a1d"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-radio/u-radio.js.map
