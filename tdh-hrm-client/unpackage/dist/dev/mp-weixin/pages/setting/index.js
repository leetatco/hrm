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
                common_vendor.index.__f__("error", "at pages/setting/index.vue:128", "退出登录失败:", err);
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
    // 选择图片
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
        common_vendor.index.__f__("error", "at pages/setting/index.vue:163", "选择图片失败:", error);
        common_vendor.index.showToast({
          title: "选择图片失败",
          icon: "none"
        });
      }
    },
    // 确认裁剪并上传
    async confirmCrop() {
      if (!this.tempAvatarPath) {
        common_vendor.index.showToast({
          title: "请先选择图片",
          icon: "none"
        });
        return;
      }
      this.showCropModal = false;
      this.isUploading = true;
      try {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1e4);
        const cloudPath = `public/avatar/${this.uid}_${timestamp}_${random}.jpg`;
        const uploadOptionsRes = await vk.callFunction({
          url: "common/pub/getUploadFileOptions/index",
          data: {
            cloudPath
          }
        });
        if (uploadOptionsRes.code !== 0) {
          throw new Error(uploadOptionsRes.msg || "获取上传参数失败");
        }
        const uploadOptions = uploadOptionsRes.rows;
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadTask = common_vendor.index.uploadFile({
            ...uploadOptions.uploadFileOptions,
            filePath: this.tempAvatarPath,
            name: "file",
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(res);
              } else {
                reject(new Error(`上传失败: ${res.statusCode}`));
              }
            },
            fail: reject
          });
          this.uploadTask = uploadTask;
        });
        const avatarUrl = `https://tdhstorage.cntdh.net/${cloudPath}`;
        await this.submitForm(avatarUrl, cloudPath);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/index.vue:230", "上传头像失败:", error);
        common_vendor.index.showToast({
          title: "上传失败，请重试" + error.toString(),
          icon: "none"
        });
      } finally {
        this.isUploading = false;
        this.uploadTask = null;
        this.tempAvatarPath = "";
      }
    },
    // 取消裁剪
    cancelCrop() {
      this.showCropModal = false;
      this.tempAvatarPath = "";
    },
    // 提交表单更新头像
    async submitForm(avatarUrl, cloudPath) {
      try {
        const oldAvatar = vk.getVuex("$user.userInfo").avatar;
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
          if (oldAvatar && oldAvatar !== this.defaultAvatar && oldAvatar.includes(
            "tdhstorage.cntdh.net"
          )) {
            try {
              const urlParts = oldAvatar.split("/");
              const oldCloudPath = urlParts.slice(3).join("/");
              if (oldCloudPath) {
                await vk.callFunction({
                  url: "common/pub/deleteFile/index",
                  data: {
                    fileList: [oldCloudPath]
                  }
                });
              }
            } catch (deleteError) {
              common_vendor.index.__f__("error", "at pages/setting/index.vue:287", "删除旧头像失败:", deleteError);
            }
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/index.vue:293", "更新头像失败:", error);
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
    d: common_vendor.o((...args) => $options.chooseAndUploadFile && $options.chooseAndUploadFile(...args), "3f"),
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
    g: common_vendor.o((...args) => $options.goto && $options.goto(...args), "e6"),
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
    j: common_vendor.o((...args) => $options.bindLogout && $options.bindLogout(...args), "10"),
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
    t: common_vendor.o($options.confirmCrop, "1a"),
    v: common_vendor.o($options.cancelCrop, "c9"),
    w: common_vendor.o(($event) => $data.showCropModal = $event, "4d"),
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
