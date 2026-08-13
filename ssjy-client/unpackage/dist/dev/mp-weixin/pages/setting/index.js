"use strict";
const common_vendor = require("../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      defaultAvatar: "/static/txl/ico_logo_@3x.png",
      tempAvatarPath: "",
      // 临时头像路径，用于裁剪预览
      showCropModal: false,
      isUploading: false,
      uploadTask: null,
      uid: ""
    };
  },
  onLoad(e) {
    this.uid = vk.getVuex("$user.userInfo")._id;
  },
  onUnload() {
    if (this.uploadTask) {
      this.uploadTask.abort();
    }
  },
  methods: {
    // 导航返回
    navBack() {
      common_vendor.index.navigateBack();
    },
    // 退出登录/切换账号
    bindLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要切换账号吗？",
        success: (res) => {
          if (res.confirm) {
            vk.userCenter.logout({
              success: (data) => {
                vk.navigateToLogin();
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/setting/index.vue:129", "退出登录失败:", err);
                common_vendor.index.showToast({
                  title: "切换失败，请重试",
                  icon: "none"
                });
              }
            });
          }
        }
      });
    },
    // 跳转到修改密码页面
    goto() {
      vk.navigateTo("../pwd/update-password");
    },
    // 选择并上传文件
    async chooseAndUploadFile() {
      try {
        const res = await new Promise((resolve, reject) => {
          common_vendor.index.chooseImage({
            count: 1,
            sizeType: ["compressed"],
            sourceType: ["album", "camera"],
            success: resolve,
            fail: reject
          });
        });
        if (res.tempFilePaths && res.tempFilePaths[0]) {
          this.tempAvatarPath = res.tempFilePaths[0];
          this.showCropModal = true;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/index.vue:165", "选择图片失败:", error);
        common_vendor.index.showToast({
          title: "选择图片失败",
          icon: "none"
        });
      }
    },
    // 确认裁剪并上传
    async confirmCrop() {
      this.showCropModal = false;
      this.isUploading = true;
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          common_vendor._r.chooseAndUploadFile({
            type: "image",
            fileList: [{
              path: this.tempAvatarPath,
              cloudPath: `avatar_${Date.now()}_${this.uid}.jpg`
            }]
          }).then((res) => {
            resolve(res);
          }).catch((err) => {
            reject(err);
          });
        });
        if (uploadResult.tempFiles && uploadResult.tempFiles[0]) {
          const avatarUrl = uploadResult.tempFiles[0].url;
          await this.submitForm(avatarUrl);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/index.vue:200", "上传头像失败:", error);
        common_vendor.index.showToast({
          title: "上传失败，请重试",
          icon: "none"
        });
      } finally {
        this.isUploading = false;
      }
    },
    // 取消裁剪
    cancelCrop() {
      this.showCropModal = false;
      this.tempAvatarPath = "";
    },
    // 提交表单更新头像
    async submitForm(avatarUrl) {
      try {
        const userInfo = vk.getVuex("$user.userInfo");
        const updateData = {
          ...userInfo,
          avatar: avatarUrl
        };
        const result = await vk.userCenter.updateUser({
          data: updateData
        });
        if (result) {
          common_vendor.index.showToast({
            title: "头像更新成功",
            icon: "success"
          });
          setTimeout(() => {
          }, 500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/index.vue:242", "更新头像失败:", error);
        common_vendor.index.showToast({
          title: "更新失败，请重试",
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _component_u_status_bar = common_vendor.resolveComponent("u-status-bar");
  const _easycom_u_avatar2 = common_vendor.resolveComponent("u-avatar");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_modal2 = common_vendor.resolveComponent("u-modal");
  const _easycom_u_loading_page2 = common_vendor.resolveComponent("u-loading-page");
  (_component_u_status_bar + _easycom_u_avatar2 + _easycom_u_icon2 + _easycom_u_modal2 + _easycom_u_loading_page2)();
}
const _easycom_u_avatar = () => "../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_modal = () => "../../uni_modules/vk-uview-ui/components/u-modal/u-modal.js";
const _easycom_u_loading_page = () => "../../uni_modules/vk-uview-ui/components/u-loading-page/u-loading-page.js";
if (!Math) {
  (_easycom_u_avatar + _easycom_u_icon + _easycom_u_modal + _easycom_u_loading_page)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      bgColor: "transparent"
    }),
    b: common_vendor.p({
      src: _ctx.vk.getVuex("$user.userInfo").avatar ? _ctx.vk.getVuex("$user.userInfo").avatar : $data.defaultAvatar,
      size: "80",
      mode: "aspectFill",
      shape: "circle"
    }),
    c: common_vendor.p({
      name: "arrow-right",
      color: "#999",
      size: "24"
    }),
    d: common_vendor.o((...args) => $options.confirmCrop && $options.confirmCrop(...args), "20"),
    e: common_vendor.p({
      name: "lock",
      size: "44",
      color: "#2979ff"
    }),
    f: common_vendor.p({
      name: "arrow-right",
      color: "#999",
      size: "24"
    }),
    g: common_vendor.o((...args) => $options.goto && $options.goto(...args), "6e"),
    h: common_vendor.p({
      name: "swap",
      size: "44",
      color: "#ff4444"
    }),
    i: common_vendor.p({
      name: "arrow-right",
      color: "#999",
      size: "24"
    }),
    j: common_vendor.o((...args) => $options.bindLogout && $options.bindLogout(...args), "88"),
    k: _ctx.vk.getVuex("$user.userInfo").username
  }, _ctx.vk.getVuex("$user.userInfo").username ? common_vendor.e({
    l: common_vendor.t(_ctx.vk.getVuex("$user.userInfo").username),
    m: _ctx.vk.getVuex("$user.userInfo").nickname
  }, _ctx.vk.getVuex("$user.userInfo").nickname ? {
    n: common_vendor.t(_ctx.vk.getVuex("$user.userInfo").nickname)
  } : {}, {
    o: _ctx.vk.getVuex("$user.userInfo").mobile
  }, _ctx.vk.getVuex("$user.userInfo").mobile ? {
    p: common_vendor.t(_ctx.vk.getVuex("$user.userInfo").mobile)
  } : {}, {
    q: common_vendor.t(_ctx.vk.getVuex("$user.userInfo")._id)
  }) : {}, {
    r: $data.showCropModal
  }, $data.showCropModal ? {
    s: $data.tempAvatarPath,
    t: common_vendor.o($options.confirmCrop, "9a"),
    v: common_vendor.o($options.cancelCrop, "20"),
    w: common_vendor.o(($event) => $data.showCropModal = $event, "e1"),
    x: common_vendor.p({
      ["show-cancel-button"]: true,
      ["show-confirm-button"]: true,
      ["confirm-text"]: "确认上传",
      ["cancel-text"]: "取消",
      title: "裁剪头像",
      modelValue: $data.showCropModal
    })
  } : {}, {
    y: common_vendor.p({
      loading: $data.isUploading,
      ["loading-text"]: "头像上传中..."
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-861f37f2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/setting/index.js.map
