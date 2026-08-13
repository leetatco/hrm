"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      isLoading: false,
      password: {
        oldPassword: "",
        newPassword: "",
        passwordConfirmation: ""
      },
      rules: {
        oldPassword: [{
          required: true,
          message: "请输入原密码",
          trigger: ["blur", "change"]
        }],
        newPassword: [
          {
            required: true,
            message: "请输入新密码",
            trigger: ["blur", "change"]
          },
          {
            min: 6,
            max: 20,
            message: "密码长度需在6-20位之间",
            trigger: ["blur", "change"]
          },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
            message: "密码需包含字母和数字",
            trigger: ["blur", "change"]
          }
        ],
        passwordConfirmation: [
          {
            required: true,
            message: "请确认新密码",
            trigger: ["blur", "change"]
          },
          {
            validator: (rule, value, callback) => {
              if (value !== this.password.newPassword) {
                callback(new Error("两次输入的密码不一致"));
              } else {
                callback();
              }
            },
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  computed: {
    canSubmit() {
      return this.password.oldPassword && this.password.newPassword && this.password.passwordConfirmation && this.password.newPassword.length >= 6 && this.password.newPassword.length <= 20 && /[a-zA-Z]/.test(this.password.newPassword) && /\d/.test(this.password.newPassword) && this.password.newPassword === this.password.passwordConfirmation;
    }
  },
  onLoad() {
    common_vendor.index.setNavigationBarTitle({
      title: "修改密码"
    });
  },
  methods: {
    ...common_vendor.mapMutations(["logout"]),
    // 导航返回
    navBack() {
      common_vendor.index.navigateBack();
    },
    // 提交表单
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.save(this.password);
        }
      });
    },
    // 重置表单
    resetForm() {
      this.password = {
        oldPassword: "",
        newPassword: "",
        passwordConfirmation: ""
      };
      this.showOldPassword = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
      this.$refs.form.resetFields();
    },
    // 保存修改
    async save(formData) {
      let that = this;
      this.isLoading = true;
      try {
        const res = await common_vendor._r.callFunction({
          name: "user-center",
          data: {
            action: "updatePwd",
            params: {
              ...formData
            }
          }
        });
        if (res.result.code === 0) {
          common_vendor.index.showModal({
            title: "修改成功",
            content: res.result.msg || "密码修改成功，请重新登录",
            showCancel: false,
            confirmText: "重新登录",
            success: (modalRes) => {
              if (modalRes.confirm) {
                that.logout();
                common_vendor.index.removeStorageSync("uni_id_token");
                common_vendor.index.removeStorageSync("username");
                setTimeout(() => {
                  common_vendor.index.reLaunch({
                    url: "/pages/login/login"
                  });
                }, 300);
              }
            }
          });
        } else {
          common_vendor.index.showToast({
            title: res.result.msg || "修改失败",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/pwd/update-password.vue:303", "修改密码失败:", e);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none",
          duration: 2e3
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
};
if (!Array) {
  const _component_u_status_bar = common_vendor.resolveComponent("u-status-bar");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _component_template = common_vendor.resolveComponent("template");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_loading_page2 = common_vendor.resolveComponent("u-loading-page");
  (_component_u_status_bar + _easycom_u_icon2 + _component_template + _easycom_u_input2 + _easycom_u_form_item2 + _easycom_u_form2 + _easycom_u_button2 + _easycom_u_loading_page2)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_loading_page = () => "../../uni_modules/vk-uview-ui/components/u-loading-page/u-loading-page.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_input + _easycom_u_form_item + _easycom_u_form + _easycom_u_button + _easycom_u_loading_page)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      bgColor: "transparent"
    }),
    b: common_vendor.p({
      name: "lock",
      size: "36",
      color: "#2979ff"
    }),
    c: common_vendor.o(($event) => $data.showOldPassword = !$data.showOldPassword, "7b"),
    d: common_vendor.p({
      name: $data.showOldPassword ? "eye-fill" : "eye",
      size: "36",
      color: "#909399"
    }),
    e: common_vendor.o(($event) => $data.password.oldPassword = $event, "03"),
    f: common_vendor.p({
      type: $data.showOldPassword ? "text" : "password",
      placeholder: "请输入原密码",
      clearable: false,
      border: false,
      modelValue: $data.password.oldPassword
    }),
    g: common_vendor.p({
      label: "原密码",
      prop: "oldPassword",
      ["border-bottom"]: true
    }),
    h: common_vendor.p({
      name: "lock-open",
      size: "36",
      color: "#2979ff"
    }),
    i: common_vendor.o(($event) => $data.showNewPassword = !$data.showNewPassword, "dd"),
    j: common_vendor.p({
      name: $data.showNewPassword ? "eye-fill" : "eye",
      size: "36",
      color: "#909399"
    }),
    k: common_vendor.o(($event) => $data.password.newPassword = $event, "94"),
    l: common_vendor.p({
      type: $data.showNewPassword ? "text" : "password",
      placeholder: "请输入新密码",
      clearable: false,
      border: false,
      modelValue: $data.password.newPassword
    }),
    m: common_vendor.p({
      label: "新密码",
      prop: "newPassword",
      ["border-bottom"]: true
    }),
    n: common_vendor.p({
      name: "checkmark-circle",
      size: "36",
      color: "#2979ff"
    }),
    o: common_vendor.o(($event) => $data.showConfirmPassword = !$data.showConfirmPassword, "1c"),
    p: common_vendor.p({
      name: $data.showConfirmPassword ? "eye-fill" : "eye",
      size: "36",
      color: "#909399"
    }),
    q: common_vendor.o($options.submitForm, "cd"),
    r: common_vendor.o(($event) => $data.password.passwordConfirmation = $event, "8b"),
    s: common_vendor.p({
      type: $data.showConfirmPassword ? "text" : "password",
      placeholder: "请再次输入新密码",
      clearable: false,
      border: false,
      modelValue: $data.password.passwordConfirmation
    }),
    t: common_vendor.p({
      label: "确认新密码",
      prop: "passwordConfirmation",
      ["border-bottom"]: true
    }),
    v: common_vendor.sr("form", "451fa565-1"),
    w: common_vendor.p({
      model: $data.password,
      rules: $data.rules,
      ["label-position"]: "top"
    }),
    x: $data.password.newPassword.length >= 6
  }, $data.password.newPassword.length >= 6 ? {
    y: common_vendor.p({
      name: "checkmark",
      size: "24",
      color: "#19be6b"
    })
  } : {
    z: common_vendor.p({
      name: "close",
      size: "24",
      color: "#fa3534"
    })
  }, {
    A: /[a-zA-Z]/.test($data.password.newPassword)
  }, /[a-zA-Z]/.test($data.password.newPassword) ? {
    B: common_vendor.p({
      name: "checkmark",
      size: "24",
      color: "#19be6b"
    })
  } : {
    C: common_vendor.p({
      name: "close",
      size: "24",
      color: "#fa3534"
    })
  }, {
    D: /\d/.test($data.password.newPassword)
  }, /\d/.test($data.password.newPassword) ? {
    E: common_vendor.p({
      name: "checkmark",
      size: "24",
      color: "#19be6b"
    })
  } : {
    F: common_vendor.p({
      name: "close",
      size: "24",
      color: "#fa3534"
    })
  }, {
    G: $data.password.newPassword && $data.password.passwordConfirmation && $data.password.newPassword === $data.password.passwordConfirmation
  }, $data.password.newPassword && $data.password.passwordConfirmation && $data.password.newPassword === $data.password.passwordConfirmation ? {
    H: common_vendor.p({
      name: "checkmark",
      size: "24",
      color: "#19be6b"
    })
  } : {
    I: common_vendor.p({
      name: "close",
      size: "24",
      color: "#fa3534"
    })
  }, {
    J: common_vendor.o($options.submitForm, "3f"),
    K: common_vendor.p({
      type: "primary",
      shape: "circle",
      disabled: !$options.canSubmit,
      customStyle: {
        height: "88rpx",
        fontSize: "32rpx",
        fontWeight: "500"
      }
    }),
    L: common_vendor.o((...args) => $options.resetForm && $options.resetForm(...args), "3a"),
    M: common_vendor.p({
      name: "info-circle",
      size: "36",
      color: "#2979ff"
    }),
    N: common_vendor.p({
      loading: $data.isLoading,
      ["loading-text"]: "修改中..."
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-451fa565"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/pwd/update-password.js.map
