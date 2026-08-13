"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 功能列表
      functionList: [
        {
          icon: "order",
          text: "我的审批",
          bgColor: "linear-gradient(135deg, #2979ff, #4dabff)",
          action: "approval",
          badge: 3
        },
        {
          icon: "calendar",
          text: "考勤记录",
          bgColor: "linear-gradient(135deg, #19be6b, #36cf89)",
          action: "attendance"
        },
        {
          icon: "file-text",
          text: "公文管理",
          bgColor: "linear-gradient(135deg, #ff9900, #ffad33)",
          action: "document"
        },
        {
          icon: "setting",
          text: "系统设置",
          bgColor: "linear-gradient(135deg, #909399, #a6a9ad)",
          action: "setting"
        }
      ],
      avatar: "../static/txl/ico_logo_@3x.png",
      // 用户信息
      userInfo: {},
      // 应用版本
      appVersion: "1.0.0",
      // 未读通知数量
      unreadNotifications: 0,
      // 个人资料是否完善
      profileUncompleted: false,
      // 底部导航
      tabbar: [
        {
          iconPath: "/static/icon_home.png",
          selectedIconPath: "/static/icon_home_sel.png",
          pagePath: "/pages/index/index",
          text: "首页"
        },
        {
          iconPath: "/static/icon_msg.png",
          selectedIconPath: "/static/icon_msg_sel.png",
          pagePath: "/pages/notice/index",
          text: "消息"
        },
        {
          iconPath: "/static/icon_mailList.png",
          selectedIconPath: "/static/icon_mailList_sel.png",
          pagePath: "/pages/contacts/index",
          text: "通讯录"
        },
        {
          iconPath: "/static/icon_user.png",
          selectedIconPath: "/static/icon_user_sel.png",
          pagePath: "/pages/user/index",
          text: "我的"
        }
      ]
    };
  },
  computed: {
    // 是否已登录
    hasLogin() {
      var _a, _b;
      return ((_b = (_a = this.vk) == null ? void 0 : _a.getVuex("$user.userInfo")) == null ? void 0 : _b.username) ? true : false;
    },
    // 当前年份
    currentYear() {
      return (/* @__PURE__ */ new Date()).getFullYear();
    }
  },
  onLoad() {
    this.vk = common_vendor.index.vk;
    this.getAppVersion();
  },
  onShow() {
    this.updateUserInfo();
    this.updateNotifications();
  },
  methods: {
    // 切换tab前的拦截
    beforeTabSwitch(index) {
      return true;
    },
    // 更新用户信息
    updateUserInfo() {
      if (this.hasLogin) {
        this.userInfo = this.vk.getVuex("$user.userInfo") || {};
        common_vendor.index.__f__("log", "at pages/user/index.vue:253", "用户信息:", this.userInfo);
        this.checkProfileCompletion();
      } else {
        this.userInfo = {};
      }
    },
    // 检查资料是否完善
    checkProfileCompletion() {
      const requiredFields = ["avatar", "nickname"];
      this.profileUncompleted = requiredFields.some((field) => {
        const value = this.userInfo[field];
        return !value || value.trim() === "";
      });
    },
    // 获取应用版本
    getAppVersion() {
    },
    // 更新通知数量
    updateNotifications() {
    },
    // 绑定登录
    bindLogin() {
      if (!this.hasLogin) {
        this.vk.navigateToLogin();
      } else {
        this.goto("profile");
      }
    },
    // 跳转页面
    goto(value) {
      if (!this.hasLogin && value !== "about") {
        this.vk.navigateToLogin();
        return;
      }
      const routes = {
        "setting": "/pages/setting/index",
        "notification": "/pages/notification/index",
        "about": "/pages/about/index"
      };
      if (routes[value]) {
        common_vendor.index.navigateTo({
          url: routes[value]
        });
      }
    },
    // 处理功能点击
    handleFunction(item) {
      if (!this.hasLogin) {
        this.vk.navigateToLogin();
        return;
      }
      const actionMap = {
        "approval": "/pages/approval/list",
        "attendance": "/pages/attendance/record",
        "document": "/pages/gongwen/index",
        "setting": "/pages/setting/index"
      };
      if (actionMap[item.action]) {
        common_vendor.index.navigateTo({
          url: actionMap[item.action]
        });
      }
    },
    // 反馈
    tofeedback(e) {
      common_vendor.index.__f__("log", "at pages/user/index.vue:338", "打开反馈页面");
    },
    // 退出登录
    logout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        confirmColor: "#ff4444",
        success: (res) => {
          if (res.confirm) {
            this.vk.userCenter.logout();
            setTimeout(() => {
              common_vendor.index.showToast({
                title: "已退出登录",
                icon: "success"
              });
              this.userInfo = {};
              this.$forceUpdate();
            }, 300);
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_u_status_bar = common_vendor.resolveComponent("u-status-bar");
  const _easycom_u_avatar2 = common_vendor.resolveComponent("u-avatar");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_badge2 = common_vendor.resolveComponent("u-badge");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_tabbar2 = common_vendor.resolveComponent("u-tabbar");
  (_component_u_status_bar + _easycom_u_avatar2 + _easycom_u_icon2 + _easycom_u_badge2 + _easycom_u_button2 + _easycom_u_tabbar2)();
}
const _easycom_u_avatar = () => "../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_badge = () => "../../uni_modules/vk-uview-ui/components/u-badge/u-badge.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_tabbar = () => "../../uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js";
if (!Math) {
  (_easycom_u_avatar + _easycom_u_icon + _easycom_u_badge + _easycom_u_button + _easycom_u_tabbar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      bgColor: "transparent"
    }),
    b: common_vendor.p({
      src: $options.hasLogin && $data.userInfo.avatar ? $data.userInfo.avatar : "/static/txl/ico_logo_@3x.png",
      size: "120",
      mode: "aspectFill",
      shape: "circle"
    }),
    c: common_vendor.t($options.hasLogin ? $data.userInfo.nickname || "未设置昵称" : "点击登录/注册"),
    d: $options.hasLogin
  }, $options.hasLogin ? {
    e: common_vendor.t($data.userInfo.username || $data.userInfo.mobile || "未绑定账号")
  } : {}, {
    f: $options.hasLogin && $data.userInfo.position
  }, $options.hasLogin && $data.userInfo.position ? {
    g: common_vendor.t($data.userInfo.position)
  } : {}, {
    h: $options.hasLogin
  }, $options.hasLogin ? {
    i: common_vendor.t($data.userInfo.attendance || 0),
    j: common_vendor.t($data.userInfo.tasks || 0),
    k: common_vendor.t($data.userInfo.notices || 0)
  } : {}, {
    l: !$options.hasLogin
  }, !$options.hasLogin ? {
    m: common_vendor.p({
      name: "arrow-right",
      color: "#ffffff",
      size: "24"
    })
  } : {}, {
    n: common_vendor.o((...args) => $options.bindLogin && $options.bindLogin(...args), "da"),
    o: !$options.hasLogin ? 1 : "",
    p: common_vendor.f($data.functionList, (item, index, i0) => {
      return common_vendor.e({
        a: "79e6a490-3-" + i0,
        b: common_vendor.p({
          name: item.icon,
          size: "32",
          color: "#ffffff"
        }),
        c: item.bgColor,
        d: common_vendor.t(item.text),
        e: item.badge
      }, item.badge ? {
        f: "79e6a490-4-" + i0,
        g: common_vendor.p({
          value: item.badge,
          offset: [-5, -5],
          size: "mini"
        })
      } : {}, {
        h: index,
        i: common_vendor.o(($event) => $options.handleFunction(item), index)
      });
    }),
    q: common_vendor.p({
      name: "account",
      size: "24",
      color: "#ffffff"
    }),
    r: $data.profileUncompleted
  }, $data.profileUncompleted ? {} : {}, {
    s: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    t: common_vendor.o(($event) => $options.goto("setting"), "fc"),
    v: common_vendor.p({
      name: "bell",
      size: "24",
      color: "#ffffff"
    }),
    w: $data.unreadNotifications > 0
  }, $data.unreadNotifications > 0 ? {
    x: common_vendor.p({
      value: $data.unreadNotifications,
      type: "error",
      size: "mini"
    })
  } : {}, {
    y: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    z: common_vendor.o(($event) => $options.goto("notification"), "6f"),
    A: common_vendor.p({
      name: "chat",
      size: "24",
      color: "#ffffff"
    }),
    B: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    C: common_vendor.o((...args) => $options.tofeedback && $options.tofeedback(...args), "ec"),
    D: common_vendor.p({
      name: "info-circle",
      size: "24",
      color: "#ffffff"
    }),
    E: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    F: common_vendor.o(($event) => $options.goto("about"), "f1"),
    G: $options.hasLogin
  }, $options.hasLogin ? {
    H: common_vendor.o($options.logout, "a6"),
    I: common_vendor.p({
      type: "error",
      shape: "circle",
      customStyle: {
        height: "90rpx",
        fontSize: "32rpx",
        margin: "40rpx 0",
        background: "linear-gradient(135deg, #ff4444, #ff6b6b)"
      }
    })
  } : {}, {
    J: common_vendor.t($data.appVersion),
    K: common_vendor.t($options.currentYear),
    L: common_vendor.p({
      list: $data.tabbar,
      ["before-switch"]: $options.beforeTabSwitch,
      ["icon-size"]: "50",
      ["border-top"]: true,
      ["hide-tab-bar"]: true
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-79e6a490"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/index.js.map
