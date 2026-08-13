"use strict";
const uni_modules_vkUviewUi_libs_util_emitter = require("../../libs/util/emitter.js");
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-radio-group",
  emits: ["update:modelValue", "input", "change"],
  mixins: [uni_modules_vkUviewUi_libs_util_emitter.Emitter],
  props: {
    // 匹配某一个radio组件，如果某个radio的name值等于此值，那么这个radio就被会选中
    value: {
      type: [String, Number, Array, Boolean],
      default: ""
    },
    modelValue: {
      type: [String, Number, Array, Boolean],
      default: ""
    },
    // 是否禁用所有单选框
    disabled: {
      type: Boolean,
      default: false
    },
    // 选中状态下的颜色
    activeColor: {
      type: String,
      default: "#2979ff"
    },
    // 组件的整体大小
    size: {
      type: [String, Number],
      default: 34
    },
    // 是否禁止点击提示语选中复选框
    labelDisabled: {
      type: Boolean,
      default: false
    },
    // 形状，square为方形，circle为圆型
    shape: {
      type: String,
      default: "circle"
    },
    // 图标的大小，单位rpx
    iconSize: {
      type: [String, Number],
      default: 20
    },
    // 每个checkbox占u-checkbox-group的宽度
    width: {
      type: [String, Number],
      default: "auto"
    },
    // 是否每个checkbox都换行
    wrap: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uFromData: {
        inputAlign: "left"
      }
    };
  },
  created() {
    this.children = [];
  },
  mounted() {
    let parent = this.$u.$parent.call(this, "u-form");
    if (parent) {
      Object.keys(this.uFromData).map((key) => {
        this.uFromData[key] = parent[key];
      });
    }
  },
  watch: {
    // 当父组件需要子组件需要共享的参数发生了变化，手动通知子组件
    parentData() {
      if (this.children.length) {
        this.children.map((child) => {
          typeof child.updateParentData == "function" && child.updateParentData();
        });
      }
    }
  },
  computed: {
    valueCom() {
      return this.modelValue;
    },
    // 这里computed的变量，都是子组件u-radio需要用到的，由于头条小程序的兼容性差异，子组件无法实时监听父组件参数的变化
    // 所以需要手动通知子组件，这里返回一个parentData变量，供watch监听，在其中去通知每一个子组件重新从父组件(u-radio-group)
    // 拉取父组件新的变化后的参数
    parentData() {
      return [
        this.value,
        this.disabled,
        this.activeColor,
        this.size,
        this.labelDisabled,
        this.shape,
        this.iconSize,
        this.width,
        this.wrap,
        this.modelValue
      ];
    }
  },
  methods: {
    // 该方法有子组件radio调用，当一个radio被选中的时候，给父组件设置value值(props传递的value)
    setValue(val) {
      this.children.map((child) => {
        if (child.parentData.value != val)
          child.parentData.value = "";
      });
      this.$emit("input", val);
      this.$emit("update:modelValue", val);
      this.$emit("change", val);
      setTimeout(() => {
        this.dispatch("u-form-item", "onFieldChange", val);
      }, 60);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.n($data.uFromData.inputAlign == "right" ? "flex-end" : "")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1d03092d"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-radio-group/u-radio-group.js.map
