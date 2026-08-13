"use strict";
const common_vendor = require("../../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      data: {}
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
    // 注意 tmplIds内要改成你自己小程序申请到的订阅消息ID
    subscribeMessage1() {
      common_vendor.index.requestSubscribeMessage({
        tmplIds: [
          "UmINo5I6IcqktIwNt2TVorkU7f4dzd4eyNjfvOiwEC0",
          "uf7MotUXQ3GZWx-XftvsWtT355oNaEdMHuW_zt8WAcQ",
          "ZttnDpfQvZeu2BaqM_-rpnDp6eebXnXDsJ2nJkenT9k"
        ]
      });
    },
    subscribeMessage2() {
      common_vendor.index.requestSubscribeMessage({
        tmplIds: [
          "iC3hOtB2iSy1T0cqy7YtyIamcA3qt2z1wMEOA76IJtA",
          "w4oStuL2rl6Gqpy91mgN7tzk6MDt6eFPs8nofnfMcNM",
          "NcspDBQpH6CGHos3mMADrrQpEv2gHmtfOPa5KTLs92E"
        ]
      });
    },
    sendMessage(obj) {
      let that = this;
      new Promise((resolve, reject) => {
        vk.userCenter.code2SessionWeixin({
          success: (data) => {
            resolve(data.openid);
          }
        });
      }).then((openid) => {
        vk.callFunction({
          url: "template/openapi/weixin/pub/sendMessage",
          title: "请求中...",
          data: {
            openid
          },
          success: (data) => {
            that.data = data;
          }
        });
      });
    }
  },
  // 计算属性
  computed: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.subscribeMessage1 && $options.subscribeMessage1(...args), "04"),
    b: common_vendor.o((...args) => $options.subscribeMessage2 && $options.subscribeMessage2(...args), "79"),
    c: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args), "b9"),
    d: common_vendor.t(JSON.stringify($data.data, null, 2))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f7adad06"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages_template/openapi/weixin/sendMessage/sendMessage.js.map
