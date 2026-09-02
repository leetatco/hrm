"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      statusBarHeight: 20,
      logoMarginTop: 0,
      backHomeTop: 30,
      // 返回按钮的 top 值，动态计算
      form: {
        username: "",
        password: "",
        remember: false
      },
      showThirdLogin: true,
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
      inputModalVisible: false,
      bindAccountInput: "",
      currentCodeRes: null,
      agreementPopupVisible: false,
      agreementTitle: "用户协议",
      agreementContent: "",
      privacyContent: "",
      agreementChecked: false,
      encryptedKey: "",
      wxOpenid: ""
    };
  },
  onLoad() {
    this.loadRememberedAccount();
    this.initLayout();
    this.loadAgreementContent();
    this.prepareEncryptedKey();
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
    // 返回主页
    goHome() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    },
    // 预先获取 encryptedKey
    async prepareEncryptedKey() {
      try {
        const res = await vk.userCenter.code2SessionWeixin({
          data: {
            needCache: true
          }
        });
        if (res && res.encryptedKey) {
          this.encryptedKey = res.encryptedKey;
        }
      } catch (e) {
        common_vendor.index.__f__("log", "at pages/login/index.vue:224", "获取 encryptedKey 失败", e);
      }
    },
    // 获取微信手机号
    getPhoneNumber(e) {
      const {
        encryptedData,
        iv
      } = e.detail;
      if (!encryptedData || !iv) {
        common_vendor.index.showToast({
          title: "授权失败，请手动输入",
          icon: "none"
        });
        return;
      }
      if (!this.encryptedKey) {
        common_vendor.index.showToast({
          title: "加密密钥未准备好，请重试",
          icon: "none"
        });
        return;
      }
      vk.userCenter.getPhoneNumber({
        data: {
          encryptedData,
          iv,
          encryptedKey: this.encryptedKey
        },
        success: (data) => {
          if (data.mobile) {
            this.bindAccountInput = data.mobile;
            this.confirmInputBind();
          } else {
            common_vendor.index.showToast({
              title: "未能获取手机号，请手动输入",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/login/index.vue:266", "获取手机号失败", err);
          common_vendor.index.showToast({
            title: err.msg || "获取失败，请手动输入",
            icon: "none"
          });
        }
      });
    },
    toggleAgreement() {
      this.agreementChecked = !this.agreementChecked;
    },
    loadAgreementContent() {
      this.agreementContent = `
					<h2>用户协议</h2>
					<p>欢迎您使用本应用！请您仔细阅读以下条款：</p>
					
					<h3>一、服务内容</h3>
					<p>1. 本应用提供企业办公管理服务，包括但不限于考勤、审批、通知等功能。</p>
					<p>2. 我们保留随时变更、中断或终止部分或全部服务的权利。</p>
					
					<h3>二、用户账户</h3>
					<p>1. 您需提供真实、准确、完整的注册信息。</p>
					<p>2. 您应妥善保管您的账号和密码，因您保管不善导致的损失由您自行承担。</p>
					<p>3. 您应对您账号下的所有行为负责。</p>
					
					<h3>三、使用规范</h3>
					<p>1. 您不得利用本应用从事违法违规活动。</p>
					<p>2. 您不得干扰或破坏本应用的正常运行。</p>
					<p>3. 您不得发布虚假信息或侵犯他人合法权益的内容。</p>
					
					<h3>四、隐私保护</h3>
					<p>1. 我们重视您的隐私，具体请查阅《隐私政策》。</p>
					<p>2. 我们不会在未经您同意的情况下向第三方提供您的个人信息。</p>
					
					<h3>五、免责声明</h3>
					<p>1. 本应用按"现状"提供服务，不提供任何明示或暗示的担保。</p>
					<p>2. 我们不保证服务不会中断或完全无错误。</p>
					
					<h3>六、协议修改</h3>
					<p>我们有权随时修改本协议，修改后的协议将在应用内公示。</p>
					
					<h3>七、联系我们</h3>
					<p>如有任何疑问，请通过应用内的客服功能联系我们。</p>
				`;
      this.privacyContent = `
					<h2>隐私政策</h2>
					<p>本应用非常重视您的隐私保护。本隐私政策将说明我们如何收集、使用和保护您的个人信息。</p>
					
					<h3>一、信息收集</h3>
					<p>1. <strong>账户信息</strong>：当您注册时，我们会收集您的用户名、手机号等信息。</p>
					<p>2. <strong>使用信息</strong>：我们可能会收集您使用应用的行为数据，以优化服务体验。</p>
					<p>3. <strong>设备信息</strong>：为保障服务安全，我们可能收集设备型号、操作系统等信息。</p>
					
					<h3>二、信息使用</h3>
					<p>1. 我们使用您的信息来提供、维护和改进服务。</p>
					<p>2. 我们可能使用您的信息进行身份验证和安全防护。</p>
					<p>3. 我们不会将您的个人信息出售给第三方。</p>
					
					<h3>三、信息存储</h3>
					<p>1. 您的信息将存储在安全的服务器上。</p>
					<p>2. 我们采取合理的技术措施保护您的信息安全。</p>
					<p>3. 您有权查询、更正或删除您的个人信息。</p>
					
					<h3>四、信息共享</h3>
					<p>1. 未经您的明确同意，我们不会与第三方共享您的个人信息。</p>
					<p>2. 法律法规要求或政府机关依法要求时，我们可能需要披露相关信息。</p>
					
					<h3>五、Cookie使用</h3>
					<p>我们可能使用Cookie来提升您的使用体验，您可以选择禁用Cookie。</p>
					
					<h3>六、隐私政策更新</h3>
					<p>我们可能会适时更新本隐私政策，更新后的政策将在应用内公示。</p>
					
					<h3>七、联系我们</h3>
					<p>如果您对隐私政策有任何疑问，请通过客服功能联系我们。</p>
				`;
    },
    showAgreementPopup() {
      this.agreementTitle = "用户协议";
      this.agreementContent = this.agreementContent;
      this.agreementPopupVisible = true;
    },
    showPrivacyPopup() {
      this.agreementTitle = "隐私政策";
      this.agreementContent = this.privacyContent;
      this.agreementPopupVisible = true;
    },
    initLayout() {
      try {
        const sysInfo = common_vendor.index.getSystemInfoSync();
        this.statusBarHeight = sysInfo.statusBarHeight || 20;
        const menuRect = common_vendor.index.getMenuButtonBoundingClientRect();
        const capsuleBottom = menuRect.top + menuRect.height;
        const pxToRpx = 750 / sysInfo.windowWidth;
        this.logoMarginTop = (capsuleBottom + 10) * pxToRpx;
        this.backHomeTop = menuRect.top + menuRect.height / 2 - 22;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:378", "获取布局信息失败:", e);
        this.logoMarginTop = 40;
        this.backHomeTop = 40;
      }
    },
    loadRememberedAccount() {
      try {
        const remembered = common_vendor.index.getStorageSync("rememberedAccount");
        if (remembered) {
          this.form.username = remembered.username || "";
          this.form.password = remembered.password || "";
          this.form.remember = true;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:392", "读取记住的账号失败", e);
      }
    },
    saveRememberedAccount() {
      try {
        common_vendor.index.setStorageSync("rememberedAccount", {
          username: this.form.username,
          password: this.form.password
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:402", "保存记住的账号失败", e);
      }
    },
    clearRememberedAccount() {
      try {
        common_vendor.index.removeStorageSync("rememberedAccount");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:409", "清除记住的账号失败", e);
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
      if (!this.agreementChecked) {
        common_vendor.index.showToast({
          title: "请先阅读并同意用户协议和隐私政策",
          icon: "none"
        });
        return;
      }
      this.$refs.uForm.validate().then((valid) => {
        if (valid) {
          this.doLogin();
        }
      }).catch((errors) => {
        common_vendor.index.__f__("log", "at pages/login/index.vue:438", "表单验证失败", errors);
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
        common_vendor.index.__f__("log", "at pages/login/index.vue:480", "绑定微信失败:", e);
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
    async login_weixin() {
      try {
        if (!this.agreementChecked) {
          common_vendor.index.showToast({
            title: "请先阅读并同意用户协议和隐私政策",
            icon: "none"
          });
          return;
        }
        let codeRes = await vk.userCenter.code2SessionWeixin();
        if (!codeRes || !codeRes.openid) {
          common_vendor.index.showToast({
            title: "微信登录失败",
            icon: "none"
          });
          return;
        }
        if (codeRes.encryptedKey) {
          this.encryptedKey = codeRes.encryptedKey;
        }
        this.wxOpenid = codeRes.openid || "";
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
        this.bindAccountInput = "";
        this.inputModalVisible = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:542", "微信登录失败:", error);
        common_vendor.index.showToast({
          title: "微信登录失败，请重试",
          icon: "none"
        });
      }
    },
    onInputPopupClose() {
    },
    async confirmInputBind() {
      const account = this.bindAccountInput.trim();
      if (!account) {
        common_vendor.index.showToast({
          title: "请先输入手机号或点击获取本机号码",
          icon: "none"
        });
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
          username: account,
          wx_openid: this.wxOpenid
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
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_easycom_u_icon2 + _easycom_u_input2 + _easycom_u_form_item2 + _easycom_u_button2 + _easycom_u_form2 + _easycom_u_popup2)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_input + _easycom_u_form_item + _easycom_u_button + _easycom_u_form + _easycom_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.statusBarHeight + "px",
    b: common_vendor.p({
      name: "home",
      size: "45"
    }),
    c: $data.backHomeTop + 6 + "px",
    d: common_vendor.o((...args) => $options.goHome && $options.goHome(...args), "27"),
    e: common_assets._imports_0,
    f: $data.logoMarginTop + "rpx",
    g: common_vendor.p({
      name: "account",
      size: "20",
      color: "#6c8cff",
      customStyle: {
        marginRight: "10rpx"
      }
    }),
    h: common_vendor.o(($event) => $data.form.username = $event, "3c"),
    i: common_vendor.p({
      placeholder: "请输入账号",
      clearable: true,
      border: false,
      customStyle: {
        padding: "10rpx 0"
      },
      disabled: true,
      modelValue: $data.form.username
    }),
    j: common_vendor.p({
      label: "账号",
      prop: "username",
      borderBottom: true
    }),
    k: common_vendor.p({
      name: "lock",
      size: "20",
      color: "#6c8cff",
      customStyle: {
        marginRight: "10rpx"
      }
    }),
    l: common_vendor.o(($event) => $data.form.password = $event, "f7"),
    m: common_vendor.p({
      type: "password",
      placeholder: "请输入密码",
      clearable: true,
      border: false,
      customStyle: {
        padding: "10rpx 0"
      },
      disabled: true,
      modelValue: $data.form.password
    }),
    n: common_vendor.p({
      label: "密码",
      prop: "password",
      borderBottom: true
    }),
    o: common_vendor.o($options.handleLogin, "e0"),
    p: common_vendor.p({
      type: "primary",
      shape: "circle",
      customStyle: {
        height: "90rpx",
        fontSize: "32rpx",
        marginTop: "70rpx",
        background: "linear-gradient(135deg, #6c8cff, #a78bfa)",
        boxShadow: "0 12rpx 36rpx rgba(108, 140, 255, 0.35)",
        border: "none"
      }
    }),
    q: common_vendor.sr("uForm", "d08ef7d4-1"),
    r: common_vendor.p({
      model: $data.form,
      labelPosition: "top"
    }),
    s: $data.showThirdLogin
  }, $data.showThirdLogin ? {} : {}, {
    t: $data.showThirdLogin
  }, $data.showThirdLogin ? {
    v: common_vendor.p({
      name: "moments-circel-fill",
      size: "52",
      color: "#ffffff"
    }),
    w: common_vendor.o((...args) => $options.login_weixin && $options.login_weixin(...args), "f4")
  } : {}, {
    x: $data.agreementChecked
  }, $data.agreementChecked ? {
    y: common_vendor.p({
      name: "checkmark",
      size: "16",
      color: "#ffffff"
    })
  } : {}, {
    z: $data.agreementChecked ? 1 : "",
    A: common_vendor.o((...args) => $options.showAgreementPopup && $options.showAgreementPopup(...args), "ec"),
    B: common_vendor.o((...args) => $options.showPrivacyPopup && $options.showPrivacyPopup(...args), "09"),
    C: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args), "3d"),
    D: common_vendor.t($data.agreementTitle),
    E: $data.agreementContent,
    F: common_vendor.o(($event) => $data.agreementPopupVisible = $event, "32"),
    G: common_vendor.p({
      mode: "bottom",
      closeable: true,
      ["mask-close-able"]: true,
      height: "85%",
      ["border-radius"]: 20,
      modelValue: $data.agreementPopupVisible
    }),
    H: common_vendor.p({
      name: "phone-fill",
      size: "30",
      color: "#07c160",
      customStyle: {
        marginRight: "12rpx"
      }
    }),
    I: common_vendor.o((...args) => $options.getPhoneNumber && $options.getPhoneNumber(...args), "fe"),
    J: common_vendor.o($options.onInputPopupClose, "2c"),
    K: common_vendor.o(($event) => $data.inputModalVisible = $event, "15"),
    L: common_vendor.p({
      mode: "bottom",
      closeable: true,
      ["mask-close-able"]: false,
      height: "auto",
      ["border-radius"]: 20,
      modelValue: $data.inputModalVisible
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
