"use strict";
const common_vendor = require("../../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      // init请求返回的数据
      data: {},
      // 表单请求数据
      form1: {}
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
    chooseImage() {
      let that = this;
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        //可以指定是原图还是压缩图，默认二者都有
        success: (res) => {
          let file = res.tempFiles[0];
          vk.pubfn.fileToBase64({ file }).then((base64) => {
            if (file.size / 1024 / 1024 > 1) {
              vk.toast("图片不能大于1M", "none");
              return false;
            }
            vk.callFunction({
              url: "template/openapi/douyin/pub/imgSecCheck",
              title: "检测中...",
              data: {
                base64
              },
              success: (data) => {
                that.data = data;
              },
              fail: (data) => {
                that.data = data;
                vk.toast(data.msg, "none");
              }
            });
          });
        }
      });
    }
  },
  // 计算属性
  computed: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args), "6a"),
    b: common_vendor.t(JSON.stringify($data.data, null, 2))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7191a072"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages_template/openapi/douyin/imgSecCheck/imgSecCheck.js.map
