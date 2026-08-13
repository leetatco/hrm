"use strict";
const common_vendor = require("../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      form1: {
        num1: "",
        num2: ""
      },
      value: ""
    };
  },
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options = {}) {
    vk = common_vendor.index.vk;
    this.options = options;
    this.init(options);
  },
  // 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
  onReady() {
  },
  // 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
  onShow() {
  },
  // 监听 - 页面每次【隐藏时】执行(如：返回)
  onHide() {
  },
  // 函数
  methods: {
    // 页面数据初始化函数
    init(options) {
    },
    calc() {
      let that = this;
      let form1 = that.form1;
      vk.callFunction({
        url: "template/test/pub/addition",
        // 云函数service目录下的地址，路径带/pub/的云函数不需要用户登录即可请求
        title: "请求中...",
        //data : form1, // 这样写也可以，下面这样写是为了方便新手理解
        data: {
          num1: form1.num1,
          num2: form1.num2
        },
        success: (data) => {
          that.value = data.value;
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form1.num1,
    b: common_vendor.o(($event) => $data.form1.num1 = $event.detail.value, "30"),
    c: $data.form1.num2,
    d: common_vendor.o(($event) => $data.form1.num2 = $event.detail.value, "a7"),
    e: common_vendor.o((...args) => $options.calc && $options.calc(...args), "9c"),
    f: common_vendor.t($data.value)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-727d09f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/test/test.js.map
