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
      },
      // u-modal 控制变量
      bindModalVisible: false,
      // 是否绑定提示
      inputModalVisible: false,
      // 绑定账号输入框
      bindAccountInput: "",
      // 输入的账号
      currentCodeRes: null
      // 暂存 codeRes
    };
  },
  onLoad() {
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
    loadRememberedAccount() {
      try {
        const remembered = common_vendor.index.getStorageSync("rememberedAccount");
        if (remembered) {
          this.form.username = remembered.username || "";
          this.form.password = remembered.password || "";
          this.form.remember = true;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:164", "读取记住的账号失败", e);
      }
    },
    saveRememberedAccount() {
      try {
        common_vendor.index.setStorageSync("rememberedAccount", {
          username: this.form.username,
          password: this.form.password
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:174", "保存记住的账号失败", e);
      }
    },
    clearRememberedAccount() {
      try {
        common_vendor.index.removeStorageSync("rememberedAccount");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:181", "清除记住的账号失败", e);
      }
    },
    async is_resigned(username) {
      let res = await vk.callFunction({
        url: "client/user/pub/getList",
        title: "请求中...",
        data: {
          otherWhereJson: {
            employee_id: username,
            status: 2
          }
        }
      });
      return res && res.total > 0;
    },
    handleLogin() {
      this.$refs.uForm.validate().then((valid) => {
        if (valid) {
          this.doLogin();
        }
      }).catch((errors) => {
        common_vendor.index.__f__("log", "at pages/login/index.vue:203", "表单验证失败", errors);
      });
    },
    async doLogin() {
      const {
        username,
        password
      } = this.form;
      const isResigned = await this.is_resigned(username);
      if (isResigned) {
        return vk.alert("此账号已是离职状态！", "登录失败");
      }
      vk.userCenter.login({
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
            vk.navigateToHome();
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
    async bindWeixin() {
      try {
        await vk.userCenter.bindWeixin();
      } catch (e) {
        common_vendor.index.__f__("log", "at pages/login/index.vue:245", "绑定微信失败:", e);
      }
    },
    toForget() {
      common_vendor.index.navigateTo({
        url: "/pages/forget/forget"
      });
    },
    toRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    },
    showAgreement() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/agreement?type=user"
      });
    },
    showPrivacy() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/agreement?type=privacy"
      });
    },
    // ========== 微信登录相关 ==========
    async login_weixin() {
      try {
        let codeRes = await vk.userCenter.code2SessionWeixin();
        if (!codeRes || !codeRes.openid) {
          common_vendor.index.showToast({
            title: "微信登录失败",
            icon: "none"
          });
          return;
        }
        let checkWxRes = await vk.callFunction({
          url: "client/user/pub/isUser",
          title: "请求中...",
          data: {
            wx_openid: codeRes.openid
          }
        });
        if (checkWxRes.total > 0) {
          vk.setVuex("$user.employeeInfo", checkWxRes.rows[0].employeeInfo);
          let loginRes = await vk.userCenter.loginByWeixin();
          if (loginRes.code === 0) {
            const isResigned = checkWxRes.rows[0].employeeInfo.status == 2 ? true : false;
            if (isResigned) {
              await vk.userCenter.unbindWeixin();
              common_vendor.index.clearStorageSync();
              return vk.alert("此账号已是离职状态！", "登录失败");
            }
            vk.navigateToHome();
          }
          return;
        }
        this.currentCodeRes = codeRes;
        this.bindModalVisible = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:309", "微信登录失败:", error);
        common_vendor.index.showToast({
          title: "微信登录失败，请重试",
          icon: "none"
        });
      }
    },
    // 用户确认绑定，打开输入框模态
    confirmBind() {
      this.bindModalVisible = false;
      this.bindAccountInput = "";
      this.inputModalVisible = true;
    },
    // 输入账号后确认绑定
    async confirmInputBind() {
      const account = this.bindAccountInput.trim();
      if (!account) {
        common_vendor.index.showToast({
          title: "请输入账号",
          icon: "none"
        });
        this.inputModalVisible = true;
        return;
      }
      const codeRes = this.currentCodeRes;
      if (!codeRes) {
        common_vendor.index.showToast({
          title: "微信登录信息失效，请重试",
          icon: "none"
        });
        this.inputModalVisible = false;
        return;
      }
      let userRes = await vk.callFunction({
        url: "client/user/pub/isAddUser",
        title: "验证中...",
        data: {
          mobile: account,
          // 同时传递，云函数按优先级处理
          username: account
        }
      });
      if (userRes.code !== 0) {
        common_vendor.index.showToast({
          title: userRes.msg || "验证失败",
          icon: "none"
        });
        this.inputModalVisible = true;
        return;
      }
      if (userRes.total === 0) {
        common_vendor.index.showToast({
          title: "账号不存在或未在人事系统建立",
          icon: "none"
        });
        this.inputModalVisible = true;
        return;
      }
      const userInfo = userRes.rows[0];
      vk.setVuex("$user.employeeInfo", userInfo.employeeInfo);
      if (userInfo.employeeInfo.status == 2) {
        common_vendor.index.showToast({
          title: "该员工已离职",
          icon: "none"
        });
        this.inputModalVisible = false;
        return;
      }
      let wx_openid = {};
      wx_openid["mp-weixin"] = codeRes.openid;
      wx_openid[`mp-weixin_${codeRes.appid}`] = codeRes.openid;
      let bindRes = await vk.callFunction({
        url: "client/user/pub/update",
        title: "绑定中...",
        data: {
          _id: userInfo._id,
          wx_openid
        }
      });
      if (bindRes.code === 0) {
        common_vendor.index.showToast({
          title: "绑定成功",
          icon: "success"
        });
        this.inputModalVisible = false;
        this.bindAccountInput = "";
        let loginRes = await vk.userCenter.loginByWeixin();
        if (loginRes.code === 0) {
          vk.navigateToHome();
        } else {
          common_vendor.index.showToast({
            title: loginRes.msg || "登录失败",
            icon: "none"
          });
        }
      } else {
        common_vendor.index.showToast({
          title: bindRes.msg || "绑定失败",
          icon: "none"
        });
        this.inputModalVisible = true;
      }
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _easycom_u_modal2 = common_vendor.resolveComponent("u-modal");
  (_easycom_u_icon2 + _easycom_u_input2 + _easycom_u_form_item2 + _easycom_u_button2 + _easycom_u_form2 + _easycom_u_modal2)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_u_modal = () => "../../uni_modules/vk-uview-ui/components/u-modal/u-modal.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_input + _easycom_u_form_item + _easycom_u_button + _easycom_u_form + _easycom_u_modal)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.p({
      name: "account",
      size: "20",
      color: "#2979ff",
      customStyle: {
        marginRight: "10rpx"
      }
    }),
    c: common_vendor.o(($event) => $data.form.username = $event, "31"),
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
      customStyle: {
        marginRight: "10rpx"
      }
    }),
    g: common_vendor.o(($event) => $data.form.password = $event, "0e"),
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
    j: common_vendor.o($options.handleLogin, "b3"),
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
    q: common_vendor.o((...args) => $options.login_weixin && $options.login_weixin(...args), "85")
  } : {}, {
    r: common_vendor.o((...args) => $options.showAgreement && $options.showAgreement(...args), "01"),
    s: common_vendor.o((...args) => $options.showPrivacy && $options.showPrivacy(...args), "3e"),
    t: common_vendor.o($options.confirmBind, "87"),
    v: common_vendor.o(($event) => $data.bindModalVisible = false, "8d"),
    w: common_vendor.o(($event) => $data.bindModalVisible = $event, "db"),
    x: common_vendor.p({
      title: "提示",
      content: "检测到您未绑定微信，是否要绑定到现有账号？",
      showCancelButton: true,
      modelValue: $data.bindModalVisible
    }),
    y: $data.inputModalVisible
  }, $data.inputModalVisible ? {
    z: common_vendor.o(($event) => $data.bindAccountInput = $event, "19"),
    A: common_vendor.p({
      placeholder: "请输入您的手机号",
      type: "text",
      border: true,
      focus: true,
      modelValue: $data.bindAccountInput
    })
  } : {}, {
    B: common_vendor.o($options.confirmInputBind, "1b"),
    C: common_vendor.o(($event) => $data.inputModalVisible = false, "a8"),
    D: common_vendor.o(($event) => $data.inputModalVisible = $event, "7e"),
    E: common_vendor.p({
      title: "绑定账号",
      showCancelButton: true,
      modelValue: $data.inputModalVisible
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
