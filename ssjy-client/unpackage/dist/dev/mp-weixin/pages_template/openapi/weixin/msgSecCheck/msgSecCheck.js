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
        content: "深夜福利，真人视频一对一私密聊天",
        // 需检测的文本内容，文本字数的上限为2500字
        version: 2,
        // 接口版本
        scene: 3,
        // 场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
        openid: "",
        // 用户的openid（用户需在近两小时访问过小程序）
        title: "",
        // 文本标题
        nickname: "",
        // 用户昵称
        signature: ""
        // 个性签名，该参数仅在资料类场景有效(scene=1)，
      }
    };
  },
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options = {}) {
    vk = common_vendor.index.vk;
    this.options = options;
    this.init(options);
    let openid = vk.getStorageSync("my-mp-weixin-openid");
    if (openid) {
      this.form1.openid = openid;
    } else {
      vk.userCenter.code2SessionWeixin({
        loading: false,
        success: (data) => {
          let { openid: openid2 } = data;
          this.form1.openid = openid2;
          vk.setStorageSync("my-mp-weixin-openid", openid2);
        }
      });
    }
  },
  // 函数
  methods: {
    // 页面数据初始化函数
    init(options) {
    },
    msgSecCheck(obj) {
      let that = this;
      vk.callFunction({
        url: "template/openapi/weixin/pub/msgSecCheck",
        title: "检测中...",
        data: that.form1,
        success: (data) => {
          that.data = data;
        },
        fail: (data) => {
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
    b: common_vendor.o(($event) => $data.form1.content = $event.detail.value, "a5"),
    c: common_vendor.o((...args) => $options.msgSecCheck && $options.msgSecCheck(...args), "18"),
    d: common_vendor.t(JSON.stringify($data.data, null, 2))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages_template/openapi/weixin/msgSecCheck/msgSecCheck.js.map
