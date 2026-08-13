"use strict";
const common_vendor = require("../../../common/vendor.js");
const defaultAvatarUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAASFBMVEX09Pby8vTe3uDPz9DJycm/v8C9vb3BwcLLy8vR0dLp6evn5+i1tbWysrLb29zu7vDNzc7r6+26urrg4OG3t7fj4+TFxcbV1dY8QE/jAAABo0lEQVRo3u2Yi3KCMBBFCY8EIWs0Iv7/n7Y4djqFZEXCTVtnzw+cYZfsqygEQRAEQRAEQRCEt0OVVd1o0x66rNq+tvRFc8ymdSf6gTnn8XaeZthLDm8/0JIM5s5SiCvaq3TQS96BxRVFaLHeM0XBPuhTXAz9ZGfjYkJm+ch4CVnBak5cA8UDJx5wXkUsCiY+82Jcr+h5cf9+4o4X42qX48XACsIVLrI4b6E5sQaKW06M7BIlJy6BYsUk2eIKV8EMIEQV0lu4aJsYwENXtCPD9wkT9hq0NzJX2wy72/FXAj0xLr1jDm9g1LToNeLBYS4+5PEu23Kuq8Bi5oMWy78gvs7F8OX4QTMXN3m8gY3xlEHrgvtTDX/JF09BPPb80o0UZQSO1cw94J5pTLzVzdIT7A3wokv/THtP9d6jZm/WaCfMnquba9dqJ9rdUv08ufNU7xPl5jXtRLNDvG+vaydSP1qN27yf9STpZanVP/MSk2LeGOf0aG/4r75J6dKrqlUML+L/INYp4pQrUJUiTrlNqEr7jegq15gvCIIgCIIgCIIg7M4HkS5rj/A3dbUAAAAASUVORK5CYII=";
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      userInfo: {
        avatar: "",
        nickname: ""
      }
    };
  },
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options = {}) {
    vk = common_vendor.index.vk;
    this.options = options;
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
  // 函数
  methods: {
    // 页面数据初始化函数
    init(options) {
      this.userInfo.nickname = vk.getVuex("$user.userInfo.nickname");
      this.userInfo.avatar = vk.getVuex("$user.userInfo.avatar") || defaultAvatarUrl;
    },
    // 为了兼容微信小程序开发工具，需要这样写
    submit(e) {
      this.userInfo.nickname = e.detail.value.nickname;
      this.updateUserInfo();
    },
    onChooseAvatar(e) {
      const avatarUrl = e.detail.avatarUrl;
      this.userInfo.avatar = avatarUrl;
    },
    async updateUserInfo() {
      if (!this.userInfo.avatar || !this.userInfo.nickname) {
        vk.toast("头像和昵称不能为空");
        return;
      }
      let dataJson = {};
      if (this.userInfo.avatar.indexOf("https://") !== 0) {
        let uploadFileRes = await vk.uploadFile({
          filePath: this.userInfo.avatar,
          fileType: "image"
        });
        dataJson.avatar = uploadFileRes.url;
      } else {
        dataJson.avatar = this.userInfo.avatar;
      }
      dataJson.nickname = this.userInfo.nickname;
      vk.userCenter.updateUser({
        data: dataJson,
        success: (data) => {
          vk.alert("设置成功");
        }
      });
    }
  },
  // 监听器
  watch: {},
  // 计算属性
  computed: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatar,
    b: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args), "17"),
    c: $data.userInfo.nickname,
    d: common_vendor.o(($event) => $data.userInfo.nickname = $event.detail.value, "82"),
    e: common_vendor.o((...args) => $options.submit && $options.submit(...args), "d0")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-80ba51c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/uni-id/weixin/set-user-info.js.map
