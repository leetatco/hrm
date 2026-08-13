"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-grid-item",
  emits: ["click"],
  props: {
    // 背景颜色
    bgColor: {
      type: String,
      default: "#ffffff"
    },
    // 点击时返回的index
    index: {
      type: [Number, String],
      default: ""
    },
    // 自定义样式，对象形式
    customStyle: {
      type: Object,
      default() {
        return {
          padding: "30rpx 0"
        };
      }
    }
  },
  data() {
    return {
      parentData: {
        hoverClass: "",
        // 按下去的时候，是否显示背景灰色
        col: 3,
        // 父组件划分的宫格数
        border: true
        // 是否显示边框，根据父组件决定
      }
    };
  },
  created() {
    this.updateParentData();
    if (this.parent && this.parent.children) {
      this.parent.children.push(this);
    }
  },
  computed: {
    // 每个grid-item的宽度
    width() {
      return 100 / Number(this.parentData.col) + "%";
    }
  },
  methods: {
    // 获取父组件的参数
    updateParentData() {
      this.getParentData("u-grid");
    },
    click() {
      this.$emit("click", this.index);
      this.parent && this.parent.click(this.index);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.s($props.customStyle),
    b: common_vendor.n($data.parentData.border ? "u-border-right u-border-bottom" : ""),
    c: $data.parentData.hoverClass,
    d: common_vendor.o((...args) => $options.click && $options.click(...args), "90"),
    e: $props.bgColor,
    f: $options.width
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-60e229e5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-grid-item/u-grid-item.js.map
