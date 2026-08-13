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
        agreement: true,
        username: "admin",
        password: "123456"
      },
      scrollTop: 0,
      logoImage: "/static/logo.png"
    };
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
  },
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options) {
    vk = common_vendor.index.vk;
    this.options = options;
    this.init(options);
  },
  // 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
  onReady() {
  },
  // 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
  onShow() {
    common_vendor.index.hideHomeButton();
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
      common_vendor.index.__f__("log", "at pages_template/uni-id/login/index/index.vue:107", "init: ", options);
    },
    pageTo(path) {
      vk.navigateTo(path);
    },
    // 账号密码登录
    login() {
      let that = this;
      const { agreement, username, password } = that.form1;
      if (!agreement) {
        vk.toast("请阅读并同意用户服务及隐私协议", "none");
        return;
      }
      if (username.length < 4) {
        vk.toast("账号至少4位数", "none");
        return;
      }
      if (!vk.pubfn.test(password, "pwd")) {
        vk.toast("密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线", "none");
        return;
      }
      let form1 = that.form1;
      vk.userCenter.login({
        data: form1,
        //loading:false,
        success: (data) => {
          common_vendor.index.__f__("log", "at pages_template/uni-id/login/index/index.vue:134", "data", data);
          vk.toast("登录成功");
          setTimeout(() => {
            that.login_success(data);
          }, 1e3);
        }
      });
    },
    login_success(data) {
      let that = this;
      if (this.options.uniIdRedirectUrl) {
        let uniIdRedirectUrl = decodeURIComponent(this.options.uniIdRedirectUrl);
        if (uniIdRedirectUrl) {
          vk.navigate.setOriginalPage(null);
          vk.redirectTo(uniIdRedirectUrl);
          return;
        }
      }
      if (vk.navigate.getOriginalPage()) {
        vk.navigate.originalTo();
        return false;
      }
      let pages = getCurrentPages();
      if (pages.length > 1 && pages[pages.length - 2] && pages[pages.length - 2].route && pages[pages.length - 2].route.indexOf("login/index") == -1) {
        const eventChannel = that.getOpenerEventChannel();
        eventChannel.emit("loginSuccess", {});
        vk.navigateBack();
      } else {
        vk.navigateToHome();
      }
    },
    // 第三方登录 - 微信
    login_weixin() {
      let that = this;
      vk.userCenter.loginByWeixin({
        success: (data) => {
          vk.toast("登录成功");
          setTimeout(() => {
            that.login_success(data);
          }, 1e3);
        }
      });
    }
  },
  // 计算属性
  computed: {}
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  _easycom_u_icon2();
}
const _easycom_u_icon = () => "../../../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
if (!Math) {
  _easycom_u_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.logoImage,
    b: $data.form1.username,
    c: common_vendor.o(($event) => $data.form1.username = $event.detail.value, "81"),
    d: $data.form1.password,
    e: common_vendor.o(($event) => $data.form1.password = $event.detail.value, "b1"),
    f: common_vendor.o((...args) => $options.login && $options.login(...args), "14"),
    g: common_vendor.o($options.login_weixin, "04"),
    h: common_vendor.p({
      name: "weixin-fill",
      size: "80",
      color: "#19be6b"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-91f50f7c"]]);
_sfc_main.__runtimeHooks = 3;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages_template/uni-id/login/index/index.js.map
