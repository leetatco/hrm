"use strict";
const common_vendor = require("../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      // init请求返回的数据
      data: {},
      // 表单请求数据
      form1: {
        agreement: true,
        mobile: "",
        password: "",
        password2: "",
        code: "",
        type: "register"
      },
      scrollTop: 0,
      isRotate: false,
      logoImage: "/static/logo.png"
    };
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
  },
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options) {
    vk = common_vendor.index.vk;
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
  // 监听 - 页面下拉刷新
  onPullDownRefresh() {
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  // 监听 - 点击右上角转发时
  onShareAppMessage(options) {
  },
  // 函数
  methods: {
    // 页面数据初始化函数
    init(options = {}) {
      common_vendor.index.__f__("log", "at pages/login/register.vue:112", "init: ", options);
    },
    pageTo(path) {
      vk.navigateTo(path);
    },
    checkboxChange(e) {
      let that = this;
      let value = e.detail.value || [];
      if (value.length > 0 && value[0]) {
        that.form1.agreement = true;
      } else {
        that.form1.agreement = false;
      }
    },
    // 登录(手机号+验证码) 不存在会自动注册
    loginBySms() {
      let that = this;
      if (that.isRotate) {
        return false;
      }
      const { agreement, mobile, code, password, password2 } = that.form1;
      if (!agreement) {
        vk.toast("请阅读并同意用户服务及隐私协议", "none");
        return;
      }
      if (!vk.pubfn.test(mobile, "mobile")) {
        vk.toast("请输入正确的手机号码", "none");
        return;
      }
      if (!vk.pubfn.test(password, "pwd")) {
        vk.toast("密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线", "none");
        return;
      }
      if (!vk.pubfn.test(password2, "pwd")) {
        vk.toast("密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线", "none");
        return;
      }
      if (password != password2) {
        vk.toast("两次密码必须相同!", "none");
        return;
      }
      if (!vk.pubfn.test(code, "mobileCode")) {
        vk.toast("验证码格式为6位数字", "none");
        return;
      }
      that.isRotate = true;
      vk.userCenter.loginBySms({
        data: that.form1,
        success: (data) => {
          that.isRotate = false;
          if (data.type == "login") {
            vk.toast("登录成功!");
          } else {
            vk.toast("注册成功!");
          }
          setTimeout(() => {
            let pages = getCurrentPages();
            if (pages.length > 1) {
              vk.navigateBack();
            } else {
              vk.navigateToHome();
            }
          }, 1e3);
        },
        complete: () => {
          that.isRotate = false;
        }
      });
    }
  },
  // 计算属性
  computed: {}
};
if (!Array) {
  const _easycom_vk_data_verification_code2 = common_vendor.resolveComponent("vk-data-verification-code");
  _easycom_vk_data_verification_code2();
}
const _easycom_vk_data_verification_code = () => "../../uni_modules/vk-unicloud/components/vk-data-verification-code/vk-data-verification-code.js";
if (!Math) {
  _easycom_vk_data_verification_code();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.logoImage,
    b: $data.form1.mobile,
    c: common_vendor.o(($event) => $data.form1.mobile = $event.detail.value, "5a"),
    d: $data.form1.password,
    e: common_vendor.o(($event) => $data.form1.password = $event.detail.value, "bf"),
    f: $data.form1.password2,
    g: common_vendor.o(($event) => $data.form1.password2 = $event.detail.value, "14"),
    h: $data.form1.code,
    i: common_vendor.o(($event) => $data.form1.code = $event.detail.value, "95"),
    j: common_vendor.p({
      seconds: "60",
      mobile: $data.form1.mobile,
      type: "register",
      ["custom-style"]: "font-size: 28rpx;"
    }),
    k: common_vendor.o((...args) => $options.loginBySms && $options.loginBySms(...args), "9c"),
    l: $data.form1.agreement,
    m: common_vendor.o((...args) => $options.checkboxChange && $options.checkboxChange(...args), "c7")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-838b72c9"]]);
_sfc_main.__runtimeHooks = 3;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/register.js.map
