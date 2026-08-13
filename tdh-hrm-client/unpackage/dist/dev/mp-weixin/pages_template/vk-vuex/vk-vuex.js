"use strict";
const common_vendor = require("../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      form1: {
        username: "admin",
        password: "123456"
      }
    };
  },
  onLoad(options) {
    vk = common_vendor.index.vk;
  },
  methods: {
    // 用户注册
    register() {
      let form1 = this.form1;
      vk.userCenter.register({
        data: form1,
        success: (data) => {
          vk.alert("注册成功!");
        }
      });
    },
    // 用户登录
    login() {
      let form1 = this.form1;
      vk.userCenter.login({
        data: form1,
        success: (data) => {
          vk.setVuex("$user.userInfo", data.userInfo);
          vk.alert("登录成功!");
        }
      });
    },
    // 退出
    logout() {
      vk.userCenter.logout({
        success: (data) => {
          vk.setVuex("$user.userInfo", {});
          vk.alert("退出成功");
        }
      });
    },
    // 上传头像到云储存,并设置为头像
    uploadAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: (res) => {
          vk.uploadFile({
            title: "上传中...",
            filePath: res.tempFilePaths[0],
            fileType: "image",
            success(res2) {
              vk.userCenter.setAvatar({
                data: {
                  avatar: res2.url
                },
                success() {
                  vk.setVuex("$user.userInfo.avatar", res2.url);
                }
              });
            }
          });
        }
      });
    }
  },
  // 计算属性
  computed: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.vk.getVuex("$user.userInfo._id")
  }, _ctx.vk.getVuex("$user.userInfo._id") ? {
    b: common_vendor.t(_ctx.vk.getVuex("$user.userInfo.nickname") || _ctx.vk.getVuex("$user.userInfo.username")),
    c: _ctx.vk.getVuex("$user.userInfo.avatar")
  } : {}, {
    d: $data.form1.username,
    e: common_vendor.o(($event) => $data.form1.username = $event.detail.value, "7e"),
    f: $data.form1.password,
    g: common_vendor.o(($event) => $data.form1.password = $event.detail.value, "18"),
    h: common_vendor.o((...args) => $options.register && $options.register(...args), "40"),
    i: common_vendor.o((...args) => $options.login && $options.login(...args), "a9"),
    j: common_vendor.o((...args) => $options.uploadAvatar && $options.uploadAvatar(...args), "1b"),
    k: common_vendor.o((...args) => $options.logout && $options.logout(...args), "3b")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-29c68ecb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages_template/vk-vuex/vk-vuex.js.map
