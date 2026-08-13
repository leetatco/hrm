"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-collapse-item",
  emits: ["change"],
  props: {
    // 标题
    title: {
      type: String,
      default: ""
    },
    // 标题的对齐方式
    align: {
      type: String,
      default: "left"
    },
    // 是否可以点击收起
    disabled: {
      type: Boolean,
      default: false
    },
    // collapse显示与否
    open: {
      type: Boolean,
      default: false
    },
    // 唯一标识符
    name: {
      type: [Number, String],
      default: ""
    },
    //活动样式
    activeStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 标识当前为第几个
    index: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      isShow: false,
      elId: this.$u.guid(),
      height: 0,
      // body内容的高度
      headStyle: {},
      // 头部样式，对象形式
      bodyStyle: {},
      // 主体部分样式
      itemStyle: {},
      // 每个item的整体样式
      arrowColor: "",
      // 箭头的颜色
      hoverClass: "",
      // 头部按下时的效果样式类
      arrow: true
      // 是否显示右侧箭头
    };
  },
  watch: {
    open(val) {
      this.isShow = val;
    }
  },
  created() {
    this.parent = false;
    this.isShow = this.open;
  },
  methods: {
    // 异步获取内容，或者动态修改了内容时，需要重新初始化
    init() {
      this.parent = this.$u.$parent.call(this, "u-collapse");
      if (this.parent) {
        this.nameSync = this.name ? this.name : this.parent.childrens.length;
        !this.parent.childrens.includes(this) && this.parent.childrens.push(this);
        this.headStyle = this.parent.headStyle;
        this.bodyStyle = this.parent.bodyStyle;
        this.arrowColor = this.parent.arrowColor;
        this.hoverClass = this.parent.hoverClass;
        this.arrow = this.parent.arrow;
        this.itemStyle = this.parent.itemStyle;
      }
      this.$nextTick(() => {
        this.queryRect();
      });
    },
    // 点击collapsehead头部
    headClick() {
      if (this.disabled)
        return;
      if (this.parent && this.parent.accordion == true) {
        this.parent.childrens.map((val) => {
          if (this != val) {
            val.isShow = false;
          }
        });
      }
      this.isShow = !this.isShow;
      this.$emit("change", {
        index: this.index,
        show: this.isShow
      });
      if (this.isShow) {
        this.parent && this.parent.onChange();
        this.$nextTick(() => {
          this.queryRect();
        });
      }
      this.$forceUpdate();
    },
    // 查询内容高度
    queryRect() {
      this.$uGetRect("#" + this.elId).then((res) => {
        this.height = res.height;
      });
    }
  },
  mounted() {
    this.init();
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
    a: !_ctx.$slots["title-all"]
  }, !_ctx.$slots["title-all"] ? common_vendor.e({
    b: !_ctx.$slots["title"]
  }, !_ctx.$slots["title"] ? {
    c: common_vendor.t($props.title),
    d: common_vendor.s({
      textAlign: $props.align ? $props.align : "left"
    }),
    e: common_vendor.s($data.isShow && $props.activeStyle && !$data.arrow ? $props.activeStyle : "")
  } : {}, {
    f: $data.arrow
  }, $data.arrow ? {
    g: $data.isShow ? 1 : "",
    h: common_vendor.p({
      color: $data.arrowColor,
      name: "arrow-down"
    })
  } : {}) : {}, {
    i: common_vendor.o((...args) => $options.headClick && $options.headClick(...args), "45"),
    j: $data.hoverClass,
    k: common_vendor.s($data.headStyle),
    l: $data.elId,
    m: common_vendor.s($data.bodyStyle),
    n: common_vendor.s({
      height: $data.isShow ? $data.height + "px" : "0"
    }),
    o: common_vendor.s($data.itemStyle)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-349be381"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-collapse-item/u-collapse-item.js.map
