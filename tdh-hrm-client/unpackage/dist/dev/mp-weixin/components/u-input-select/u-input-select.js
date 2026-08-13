"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "u-input-select",
  props: {
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: "请选择"
    },
    label: {
      type: String,
      default: ""
    },
    labelWidth: {
      type: String,
      default: "auto"
    },
    value: {
      type: [String, Number],
      default: ""
    },
    modelValue: {
      type: [String, Number],
      default: ""
    },
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: true
    },
    panelTitle: {
      type: String,
      default: "请选择"
    }
  },
  emits: ["input", "update:modelValue", "change"],
  data() {
    return {
      inputValue: "",
      popupShow: false,
      selectedItem: null,
      isUpdating: false,
      searchText: ""
      // 只保留搜索文本，不手动维护过滤数组
    };
  },
  computed: {
    actualValue() {
      return this.modelValue !== "" ? this.modelValue : this.value;
    },
    // 计算过滤后的选项，当 searchText 或 options 变化时自动更新
    filteredOptions() {
      if (!this.filterable || !this.searchText.trim()) {
        return this.options;
      }
      const keyword = this.searchText.toLowerCase().trim();
      return this.options.filter(
        (item) => item.label.toLowerCase().includes(keyword)
      );
    }
  },
  watch: {
    actualValue: {
      handler(newVal) {
        this.syncFromValue(newVal);
      },
      immediate: true
    },
    options: {
      handler() {
        this.syncFromValue(this.actualValue);
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    syncFromValue(val) {
      if (this.isUpdating)
        return;
      if (!val && val !== 0) {
        this.inputValue = "";
        this.selectedItem = null;
        return;
      }
      const valStr = String(val);
      const matched = this.options.find((item) => String(item.value) === valStr);
      if (matched) {
        this.selectedItem = matched;
        this.inputValue = matched.label;
      } else {
        this.selectedItem = null;
        this.inputValue = "";
      }
    },
    openSelector() {
      if (this.disabled)
        return;
      this.searchText = "";
      this.popupShow = true;
    },
    // 弹窗关闭时清空搜索文本（包括点击遮罩关闭）
    onPopupClose() {
      this.searchText = "";
      this.popupShow = false;
    },
    isSelected(value) {
      return this.selectedItem && String(this.selectedItem.value) === String(value);
    },
    selectItem(item) {
      this.isUpdating = true;
      this.selectedItem = item;
      this.inputValue = item.label;
      this.popupShow = false;
      this.searchText = "";
      this.$emit("input", item.value);
      this.$emit("update:modelValue", item.value);
      this.$emit("change", item);
      this.$nextTick(() => {
        this.isUpdating = false;
      });
    },
    clearInput() {
      this.isUpdating = true;
      this.inputValue = "";
      this.selectedItem = null;
      this.popupShow = false;
      this.searchText = "";
      this.$emit("input", "");
      this.$emit("update:modelValue", "");
      this.$nextTick(() => {
        this.isUpdating = false;
      });
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_easycom_u_icon2 + _easycom_u_input2 + _easycom_u_search2 + _easycom_u_empty2 + _easycom_u_popup2)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_input + _easycom_u_search + _easycom_u_empty + _easycom_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.clearable && $data.inputValue
  }, $props.clearable && $data.inputValue ? {
    b: common_vendor.o($options.clearInput, "55"),
    c: common_vendor.p({
      name: "close-circle-fill",
      size: "18",
      color: "#c0c4cc",
      ["custom-style"]: {
        marginRight: "6rpx"
      }
    })
  } : {}, {
    d: common_vendor.p({
      name: "arrow-down",
      size: "14",
      color: "#c0c4cc",
      ["custom-style"]: {
        transition: "transform 0.3s",
        transform: $data.popupShow ? "rotate(180deg)" : ""
      }
    }),
    e: common_vendor.o($options.openSelector, "c5"),
    f: common_vendor.o(($event) => $data.inputValue = $event, "0e"),
    g: common_vendor.p({
      type: "select",
      placeholder: $props.placeholder,
      disabled: $props.disabled,
      clearable: false,
      modelValue: $data.inputValue
    }),
    h: common_vendor.t($props.panelTitle),
    i: $props.filterable
  }, $props.filterable ? {
    j: common_vendor.o(($event) => $data.searchText = $event, "4e"),
    k: common_vendor.p({
      placeholder: "搜索...",
      focus: true,
      ["show-action"]: false,
      modelValue: $data.searchText
    })
  } : {}, {
    l: $options.filteredOptions.length === 0
  }, $options.filteredOptions.length === 0 ? {
    m: common_vendor.p({
      text: "暂无匹配项",
      mode: "list"
    })
  } : {}, {
    n: common_vendor.f($options.filteredOptions, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.label),
        b: $options.isSelected(item.value)
      }, $options.isSelected(item.value) ? {
        c: "07402310-6-" + i0 + ",07402310-3",
        d: common_vendor.p({
          name: "checkmark-circle",
          size: "20",
          color: "#2979ff"
        })
      } : {}, {
        e: index,
        f: $options.isSelected(item.value) ? 1 : "",
        g: common_vendor.o(($event) => $options.selectItem(item), index)
      });
    }),
    o: common_vendor.o($options.onPopupClose, "9b"),
    p: common_vendor.o(($event) => $data.popupShow = $event, "71"),
    q: common_vendor.p({
      mode: "bottom",
      ["border-radius"]: "20",
      closeable: true,
      ["safe-area-inset-bottom"]: true,
      modelValue: $data.popupShow
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-07402310"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/u-input-select/u-input-select.js.map
