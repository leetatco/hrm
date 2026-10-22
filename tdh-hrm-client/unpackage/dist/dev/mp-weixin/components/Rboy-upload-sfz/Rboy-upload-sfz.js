"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "Rboy-upload-sfz",
  props: {
    // 正面
    obverseUrl: {
      type: String,
      default: ""
    },
    // 反面
    reverseUrl: {
      type: String,
      default: ""
    },
    // album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
    sourceType: {
      type: Array || Object,
      default: () => {
        return ["album", "camera"];
      }
    }
  },
  data() {
    return {
      obverse: common_assets.obverse,
      reverse: common_assets.reverse
      // ===== 改动：删掉 del 字段，不再需要 base64 =====
    };
  },
  created() {
  },
  methods: {
    obverse_btn() {
      if (this.obverseUrl) {
        this.previewImage(this.obverseUrl);
      } else {
        this.select_change("obverse");
      }
    },
    reverse_btn() {
      if (this.reverseUrl) {
        this.previewImage(this.reverseUrl);
      } else {
        this.select_change("reverse");
      }
    },
    // 上传
    select_change(name) {
      common_vendor.index.chooseImage({
        count: 1,
        //默认9
        sizeType: ["original", "compressed"],
        // 可以指定是原图还是压缩图，默认二者都有
        sourceType: this.sourceType,
        // 从相册选择
        success: (res) => {
          this.$emit("selectChange", {
            msg: `${name}Image:ok`,
            name,
            tempFilePath: res.tempFilePaths[0],
            tempFile: res.tempFiles[0]
          });
        }
      });
    },
    // 预览
    previewImage(current = 0) {
      common_vendor.index.previewImage({
        current,
        urls: [this.obverseUrl, this.reverseUrl]
      });
    },
    // 删除
    del_btn(name) {
      common_vendor.index.__f__("log", "at components/Rboy-upload-sfz/Rboy-upload-sfz.vue:109", name);
      this.$emit("del", {
        name
      });
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  _easycom_u_icon2();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
if (!Math) {
  _easycom_u_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.obverseUrl ? $props.obverseUrl : $data.obverse,
    b: common_vendor.o((...args) => $options.obverse_btn && $options.obverse_btn(...args), "1c"),
    c: $props.obverseUrl
  }, $props.obverseUrl ? {
    d: common_vendor.p({
      name: "close",
      color: "#ffffff",
      size: "26"
    }),
    e: common_vendor.o(($event) => $options.del_btn("obverse"), "4d")
  } : {}, {
    f: $props.reverseUrl ? $props.reverseUrl : $data.reverse,
    g: common_vendor.o((...args) => $options.reverse_btn && $options.reverse_btn(...args), "59"),
    h: $props.reverseUrl
  }, $props.reverseUrl ? {
    i: common_vendor.p({
      name: "close",
      color: "#ffffff",
      size: "26"
    }),
    j: common_vendor.o(($event) => $options.del_btn("reverse"), "04")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-734f1bcd"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/Rboy-upload-sfz/Rboy-upload-sfz.js.map
