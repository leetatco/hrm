"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      data: {}
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
    this.options = options;
    this.init(options);
  },
  methods: {
    // 初始化
    init(options) {
    },
    // 营业执照识别
    business_license() {
      let that = this;
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: (res) => {
          let file = res.tempFiles[0];
          vk.openapi.baidu.open.ocr.business_license({
            title: "识别中...",
            data: {
              file
            },
            success: (data) => {
              that.data = data;
            },
            fail: (err) => {
              that.data = err;
            }
          });
        }
      });
    },
    // 身份证识别
    idcard() {
      let that = this;
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: (res) => {
          let file = res.tempFiles[0];
          vk.openapi.baidu.open.ocr.idcard({
            title: "识别中...",
            data: {
              file
            },
            success: (data) => {
              that.data = data;
            }
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.business_license && $options.business_license(...args), "b5"),
    b: common_vendor.o((...args) => $options.idcard && $options.idcard(...args), "71"),
    c: common_vendor.t(JSON.stringify($data.data, null, 2))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-db8a8165"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/openapi/baidu/baidu.js.map
