"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      // 表单数据
      form: {
        username: "",
        password: "",
        remember: false
      },
      // 是否显示第三方登录
      showThirdLogin: true,
      // 表单验证规则
      rules: {
        username: [
          {
            required: true,
            message: "请输入账号",
            trigger: ["blur", "change"]
          },
          {
            min: 3,
            max: 20,
            message: "账号长度在3-20个字符",
            trigger: ["blur", "change"]
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: ["blur", "change"]
          },
          {
            min: 6,
            max: 20,
            message: "密码长度在6-20个字符",
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  onLoad() {
    this.vk = common_vendor.index.vk;
    this.loadRememberedAccount();
  },
  onReady() {
    this.$refs.uForm.setRules(this.rules);
  },
  onShow() {
    common_vendor.index.hideHomeButton();
  },
  onHide() {
    if (this.form.remember && this.form.username) {
      this.saveRememberedAccount();
    } else {
      this.clearRememberedAccount();
    }
  },
  methods: {
    // 加载记住的账号
    loadRememberedAccount() {
      try {
        const remembered = common_vendor.index.getStorageSync("rememberedAccount");
        if (remembered) {
          this.form.username = remembered.username || "";
          this.form.password = remembered.password || "";
          this.form.remember = true;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:169", "读取记住的账号失败", e);
      }
    },
    // 保存记住的账号
    saveRememberedAccount() {
      try {
        common_vendor.index.setStorageSync("rememberedAccount", {
          username: this.form.username,
          password: this.form.password
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:181", "保存记住的账号失败", e);
      }
    },
    // 清除记住的账号
    clearRememberedAccount() {
      try {
        common_vendor.index.removeStorageSync("rememberedAccount");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:190", "清除记住的账号失败", e);
      }
    },
    // 登录处理
    handleLogin() {
      this.$refs.uForm.validate().then((valid) => {
        if (valid) {
          this.doLogin();
        }
      }).catch((errors) => {
        common_vendor.index.__f__("log", "at pages/login/index.vue:201", "表单验证失败", errors);
      });
    },
    // 执行登录
    doLogin() {
      const { username, password } = this.form;
      this.vk.userCenter.login({
        data: {
          username,
          password
        },
        success: async (data) => {
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          if (!data.userInfo.wx_openid) {
            await this.bindWeixin();
            await this.login_weixin();
          }
          setTimeout(() => {
            this.vk.navigateToHome();
          }, 1500);
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: err.msg || "登录失败",
            icon: "none"
          });
        }
      });
    },
    // 绑定微信
    async bindWeixin() {
      try {
        await this.vk.userCenter.bindWeixin();
      } catch (e) {
        common_vendor.index.__f__("log", "at pages/login/index.vue:245", "绑定微信失败:", e);
      }
    },
    // 跳转到忘记密码页面
    toForget() {
      common_vendor.index.navigateTo({
        url: "/pages/forget/forget"
      });
    },
    // 跳转到注册页面
    toRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    },
    // 显示用户协议
    showAgreement() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/agreement?type=user"
      });
    },
    // 显示隐私政策
    showPrivacy() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/agreement?type=privacy"
      });
    },
    // 微信登录（保持原有逻辑）
    async login_weixin() {
      try {
        let codeRes = await this.vk.userCenter.code2SessionWeixin();
        if (!codeRes || !codeRes.openid) {
          common_vendor.index.showToast({
            title: "微信登录失败",
            icon: "none"
          });
          return;
        }
        let checkWxRes = await this.vk.callFunction({
          url: "client/user/pub/isUser",
          title: "请求中...",
          data: {
            wx_openid: codeRes.openid
          }
        });
        if (checkWxRes.total > 0) {
          let loginRes = await this.vk.userCenter.loginByWeixin();
          if (loginRes.code === 0) {
            vk.setVuex("$user.userInfo.employeeInfo", checkWxRes.rows[0].employeeInfo);
            common_vendor.index.showToast({
              title: "登录成功",
              icon: "success"
            });
            this.vk.navigateToHome();
          }
          return;
        }
        common_vendor.index.showModal({
          title: "提示",
          content: "检测到您未绑定微信，是否要绑定到现有账号？",
          success: async (res) => {
            if (res.confirm) {
              this.showBindDialog(codeRes);
            } else {
              this.toRegister();
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:330", "微信登录失败:", error);
        common_vendor.index.showToast({
          title: "微信登录失败，请重试",
          icon: "none"
        });
      }
    },
    // 显示绑定对话框（保持原有逻辑）
    showBindDialog(codeRes) {
      common_vendor.index.showModal({
        title: "绑定账号",
        editable: true,
        placeholderText: "请输入您的账号或手机号",
        success: async (res) => {
          if (res.confirm && res.content) {
            const account = res.content.trim();
            if (!account) {
              common_vendor.index.showToast({
                title: "请输入账号",
                icon: "none"
              });
              return;
            }
            let userRes = await this.vk.callFunction({
              url: "client/user/pub/isUser",
              title: "验证中...",
              data: {
                mobile: account,
                username: account
              }
            });
            if (userRes.total == 0) {
              common_vendor.index.showToast({
                title: "账号不存在",
                icon: "none"
              });
              return;
            }
            let wx_openid = {};
            wx_openid["mp-weixin"] = codeRes.openid;
            wx_openid[`mp-weixin_${codeRes.appid}`] = codeRes.openid;
            let bindRes = await this.vk.callFunction({
              url: "client/user/pub/update",
              title: "绑定中...",
              data: {
                _id: userRes.rows[0]._id,
                wx_openid
              }
            });
            if (bindRes.code === 0) {
              common_vendor.index.showToast({
                title: "绑定成功",
                icon: "success"
              });
              let loginRes = await this.vk.userCenter.loginByWeixin();
              if (loginRes.code === 0) {
                this.vk.navigateToHome();
              }
            } else {
              common_vendor.index.showToast({
                title: bindRes.msg || "绑定失败",
                icon: "none"
              });
            }
          }
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  (_easycom_u_icon2 + _easycom_u_input2 + _easycom_u_form_item2 + _easycom_u_button2 + _easycom_u_form2)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_input + _easycom_u_form_item + _easycom_u_button + _easycom_u_form)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.p({
      name: "account",
      size: "20",
      color: "#2979ff",
      customStyle: "margin-right: 10rpx"
    }),
    c: common_vendor.o(($event) => $data.form.username = $event, "2b"),
    d: common_vendor.p({
      placeholder: "请输入账号",
      clearable: true,
      border: false,
      customStyle: {
        padding: "10rpx 0"
      },
      modelValue: $data.form.username
    }),
    e: common_vendor.p({
      label: "账号",
      prop: "username",
      borderBottom: true
    }),
    f: common_vendor.p({
      name: "lock",
      size: "20",
      color: "#2979ff",
      customStyle: "margin-right: 10rpx"
    }),
    g: common_vendor.o(($event) => $data.form.password = $event, "36"),
    h: common_vendor.p({
      type: "password",
      placeholder: "请输入密码",
      clearable: true,
      border: false,
      customStyle: {
        padding: "10rpx 0"
      },
      modelValue: $data.form.password
    }),
    i: common_vendor.p({
      label: "密码",
      prop: "password",
      borderBottom: true
    }),
    j: common_vendor.o($options.handleLogin, "76"),
    k: common_vendor.p({
      type: "primary",
      shape: "circle",
      customStyle: {
        height: "90rpx",
        fontSize: "32rpx",
        marginTop: "80rpx"
      }
    }),
    l: common_vendor.sr("uForm", "d08ef7d4-0"),
    m: common_vendor.p({
      model: $data.form,
      labelPosition: "top"
    }),
    n: $data.showThirdLogin
  }, $data.showThirdLogin ? {} : {}, {
    o: $data.showThirdLogin
  }, $data.showThirdLogin ? {
    p: common_vendor.p({
      name: "weixin-fill",
      size: "60",
      color: "#ffffff"
    }),
    q: common_vendor.o((...args) => $options.login_weixin && $options.login_weixin(...args), "df")
  } : {}, {
    r: common_vendor.o((...args) => $options.showAgreement && $options.showAgreement(...args), "83"),
    s: common_vendor.o((...args) => $options.showPrivacy && $options.showPrivacy(...args), "95")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
