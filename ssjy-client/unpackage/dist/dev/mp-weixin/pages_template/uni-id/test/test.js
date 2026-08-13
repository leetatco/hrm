"use strict";
const common_vendor = require("../../../common/vendor.js");
common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      show: false,
      form: {
        name: "",
        intro: ""
      },
      rules: {
        name: [{
          required: true,
          message: "请输入姓名",
          // 可以单个或者同时写两个触发验证方式
          trigger: ["change", "blur"]
        }],
        intro: [
          {
            required: true,
            message: "请输入简介",
            // 可以单个或者同时写两个触发验证方式
            trigger: ["change", "blur"]
          },
          {
            min: 5,
            message: "简介不能少于5个字",
            trigger: "change"
          }
        ]
      }
    };
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
  },
  onLoad(options) {
    common_vendor.index.vk;
  },
  onReady() {
    this.$refs.uForm.setRules(this.rules);
  },
  methods: {
    click(e) {
      common_vendor.index.__f__("log", "at pages_template/uni-id/test/test.vue:56", e);
    },
    change(index) {
      this.current = index;
    },
    submit() {
      this.$refs.uForm.validate((valid) => {
        if (valid) {
          common_vendor.index.__f__("log", "at pages_template/uni-id/test/test.vue:64", "验证通过");
        } else {
          common_vendor.index.__f__("log", "at pages_template/uni-id/test/test.vue:66", "验证失败");
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  (_easycom_u_input2 + _easycom_u_form_item2 + _easycom_u_form2 + _easycom_u_button2)();
}
const _easycom_u_input = () => "../../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form_item = () => "../../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_form = () => "../../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_u_button = () => "../../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
if (!Math) {
  (_easycom_u_input + _easycom_u_form_item + _easycom_u_form + _easycom_u_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $data.form.name = $event, "98"),
    b: common_vendor.p({
      modelValue: $data.form.name
    }),
    c: common_vendor.p({
      label: "姓名",
      prop: "name"
    }),
    d: common_vendor.o(($event) => $data.form.intro = $event, "b5"),
    e: common_vendor.p({
      modelValue: $data.form.intro
    }),
    f: common_vendor.p({
      label: "简介",
      prop: "intro"
    }),
    g: common_vendor.sr("uForm", "27126203-0"),
    h: common_vendor.p({
      model: $data.form
    }),
    i: common_vendor.o($options.submit, "87"),
    j: common_vendor.o(($event) => $data.show = true, "d9")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-27126203"]]);
_sfc_main.__runtimeHooks = 1;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/test/test.js.map
