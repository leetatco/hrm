"use strict";
const common_vendor = require("../../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      // init请求返回的数据
      data: {},
      // 表单请求数据
      form1: {
        content: "草泥马"
        // 需检测的文本内容，文本字数的上限为2500字
      }
    };
  },
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options = {}) {
    vk = common_vendor.index.vk;
    this.options = options;
    this.init(options);
  },
  // 函数
  methods: {
    // 页面数据初始化函数
    init(options) {
    },
    msgSecCheck(obj) {
      let that = this;
      vk.callFunction({
        url: "template/openapi/douyin/pub/msgSecCheck",
        title: "检测中...",
        data: that.form1,
        success: (data) => {
          that.data = data;
        },
        fail: (data) => {
          that.data = data;
          vk.toast(data.msg, "none");
        }
      });
    }
  },
  // 计算属性
  computed: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form1.content,
    b: common_vendor.o(($event) => $data.form1.content = $event.detail.value, "67"),
    c: common_vendor.o((...args) => $options.msgSecCheck && $options.msgSecCheck(...args), "44"),
    d: common_vendor.t(JSON.stringify($data.data, null, 2))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e9a01646"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages_template/openapi/douyin/msgSecCheck/msgSecCheck.js.map
