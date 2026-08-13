"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      form1: {
        inviteCode: ""
      },
      avatar: ""
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
  },
  methods: {
    // 设置头像
    setAvatar() {
      let that = this;
      let avatar = "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1594798658581&di=bcd5486940ad88cf88a904f411c53e94&imgtype=0&src=http%3A%2F%2Fn.sinaimg.cn%2Fsinacn15%2F600%2Fw1920h1080%2F20180505%2Fad66-hacuuvt5802647.jpg";
      that.form1;
      vk.userCenter.setAvatar({
        data: {
          avatar
        },
        success: (data) => {
          that.avatar = avatar;
          vk.alert("设置成功");
        }
      });
    },
    updateUser() {
      let that = this;
      that.form1;
      vk.userCenter.updateUser({
        data: {
          nickname: "剑圣李白"
        },
        success: (data) => {
          vk.alert("更新成功");
        }
      });
    },
    getMyUserInfo() {
      let that = this;
      that.form1;
      vk.userCenter.getCurrentUserInfo({
        success: (data) => {
          vk.alert(JSON.stringify(data.userInfo));
        }
      });
    },
    // token校验
    checkToken() {
      vk.userCenter.checkToken({
        success: (data) => {
          vk.alert("token有效");
        }
      });
    },
    // 退出
    logout() {
      vk.userCenter.logout({
        success: (data) => {
          vk.alert("退出成功");
        }
      });
    },
    setUserInviteCode() {
      vk.userCenter.setUserInviteCode({
        success: (data) => {
          vk.alert(data.msg);
        }
      });
    },
    acceptInvite() {
      let that = this;
      let form1 = that.form1;
      if (!form1.inviteCode) {
        vk.alert("请填写邀请码");
        return;
      }
      vk.userCenter.acceptInvite({
        data: form1,
        success: (data) => {
          vk.alert("接受邀请成功");
        }
      });
    },
    // 上传头像到云储存,并设置为头像
    uploadAvatar() {
      let that = this;
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: (res) => {
          vk.uploadFile({
            title: "上传中...",
            filePath: res.tempFilePaths[0],
            fileType: "image",
            success: (res2) => {
              vk.userCenter.setAvatar({
                data: {
                  avatar: res2.url,
                  deleteOldFile: true
                },
                success: () => {
                  that.avatar = res2.url;
                }
              });
            }
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_u_avatar2 = common_vendor.resolveComponent("u-avatar");
  _easycom_u_avatar2();
}
const _easycom_u_avatar = () => "../../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
if (!Math) {
  _easycom_u_avatar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.avatar
  }, $data.avatar ? {
    b: common_vendor.p({
      src: $data.avatar,
      size: "140"
    })
  } : {}, {
    c: common_vendor.o((...args) => $options.setAvatar && $options.setAvatar(...args), "36"),
    d: common_vendor.o((...args) => $options.uploadAvatar && $options.uploadAvatar(...args), "76"),
    e: common_vendor.o((...args) => $options.updateUser && $options.updateUser(...args), "b9"),
    f: common_vendor.o((...args) => $options.getMyUserInfo && $options.getMyUserInfo(...args), "53"),
    g: common_vendor.o((...args) => $options.checkToken && $options.checkToken(...args), "6f"),
    h: common_vendor.o((...args) => $options.setUserInviteCode && $options.setUserInviteCode(...args), "3e"),
    i: $data.form1.inviteCode,
    j: common_vendor.o(($event) => $data.form1.inviteCode = $event.detail.value, "23"),
    k: common_vendor.o((...args) => $options.acceptInvite && $options.acceptInvite(...args), "92"),
    l: common_vendor.o((...args) => $options.logout && $options.logout(...args), "d2")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e8fb80ee"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/util/util.js.map
