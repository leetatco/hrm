"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-grid",
  emits: ["click"],
  props: {
    // 分成几列
    col: {
      type: [Number, String],
      default: 3
    },
    // 是否显示边框
    border: {
      type: Boolean,
      default: true
    },
    // 宫格对齐方式，表现为数量少的时候，靠左，居中，还是靠右
    align: {
      type: String,
      default: "left"
    },
    // 宫格按压时的样式类，"none"为无效果
    hoverClass: {
      type: String,
      default: "u-hover-class"
    }
  },
  data() {
    return {
      index: 0
    };
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
  created() {
    this.children = [];
  },
  computed: {
    // 计算父组件的值是否发生变化
    parentData() {
      return [this.hoverClass, this.col, this.size, this.border];
    },
    // 宫格对齐方式
    gridStyle() {
      let style = {};
      switch (this.align) {
        case "left":
          style.justifyContent = "flex-start";
          break;
        case "center":
          style.justifyContent = "center";
          break;
        case "right":
          style.justifyContent = "flex-end";
          break;
        default:
          style.justifyContent = "flex-start";
      }
      return style;
    }
  },
  methods: {
    click(index) {
      this.$emit("click", index);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.border ? 1 : "",
    b: common_vendor.s($options.gridStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-897c440a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-grid/u-grid.js.map
