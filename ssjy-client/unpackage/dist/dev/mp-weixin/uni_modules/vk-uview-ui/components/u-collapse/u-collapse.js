"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-collapse",
  emits: ["change"],
  props: {
    // 是否手风琴模式
    accordion: {
      type: Boolean,
      default: true
    },
    // 头部的样式
    headStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 主体的样式
    bodyStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 每一个item的样式
    itemStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 是否显示右侧的箭头
    arrow: {
      type: Boolean,
      default: true
    },
    // 箭头的颜色
    arrowColor: {
      type: String,
      default: "#909399"
    },
    // 标题部分按压时的样式类，"none"为无效果
    hoverClass: {
      type: String,
      default: "u-hover-class"
    }
  },
  created() {
    this.childrens = [];
  },
  data() {
    return {};
  },
  methods: {
    // 重新初始化一次内部的所有子元素的高度计算，用于异步获取数据渲染的情况
    init() {
      this.childrens.forEach((vm, index) => {
        vm.init();
      });
    },
    // collapse item被点击，由collapse item调用父组件方法
    onChange() {
      let activeItem = [];
      this.childrens.forEach((vm, index) => {
        if (vm.isShow) {
          activeItem.push(vm.nameSync);
        }
      });
      if (this.accordion)
        activeItem = activeItem.join("");
      this.$emit("change", activeItem);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-80fbfb73"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-collapse/u-collapse.js.map
