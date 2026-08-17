"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      popupStyle: {
        mode: "bottom",
        border_radius: 16,
        height: "90%"
      },
      functionList: [
        {
          icon: "order",
          text: "我的任务",
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
      showDetailPopup: false,
      currentNotice: {},
      userInfo: {},
      appVersion: "1.0.0",
      unreadNotifications: 0,
      profileUncompleted: false,
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
    hasLogin() {
      return !!vk.getVuex("$user.userInfo.username");
    },
    currentYear() {
      return (/* @__PURE__ */ new Date()).getFullYear();
    }
  },
  onLoad() {
    this.getAppVersion();
  },
  onShow() {
    this.loadUnreadCount();
    this.loadUnApproveCount();
    this.loadAttendCount();
    this.updateUserInfo();
    this.updateNotifications();
    this.loadNoticeList();
  },
  methods: {
    async loadNoticeList() {
      try {
        const res = await vk.callFunction({
          url: "admin/opendb-notice/pub/getListType",
          data: {
            type: "about",
            status: "published"
          }
        });
        if (res.code === 0 && res.total > 0) {
          this.currentNotice = res.rows[0];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/index.vue:263", "加载公告失败:", error);
      }
    },
    showDetail() {
      this.showDetailPopup = true;
    },
    async loadUnreadCount() {
      try {
        const res = await vk.callFunction({
          url: "admin/bpmn/notification/pub/getUnreadCount",
          data: {
            userInfo: vk.getVuex("$user.userInfo")
          }
        });
        if (res.code === 0) {
          this.tabbar[1].count = res.data.count || 0;
          this.userInfo.notices = this.tabbar[1].count;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/index.vue:282", "加载未读数量失败:", error);
      }
    },
    async loadUnApproveCount() {
      try {
        const res = await vk.callFunction({
          url: "admin/bpmn/task/sys/getList",
          data: {
            formData: {
              status: "pending"
            }
          }
        });
        if (res.code === 0) {
          this.userInfo.tasks = res.total;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/index.vue:299", "加载待办任务失败:", error);
      }
    },
    async loadAttendCount() {
      try {
        const res = await vk.callFunction({
          url: "admin/hrm/clockin/pub/getListDays",
          data: {
            userInfo: vk.getVuex("$user.userInfo")
          }
        });
        if (res.code === 0) {
          this.userInfo.attendance = res.totalDays;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/index.vue:314", "加载考勤天数失败:", error);
      }
    },
    beforeTabSwitch(index) {
      return true;
    },
    updateUserInfo() {
      if (this.hasLogin) {
        this.userInfo = vk.getVuex("$user.userInfo") || {};
        this.checkProfileCompletion();
      } else {
        this.userInfo = {};
      }
    },
    checkProfileCompletion() {
      const requiredFields = ["avatar", "nickname"];
      this.profileUncompleted = requiredFields.some((field) => {
        const value = this.userInfo[field];
        return !value || value.trim() === "";
      });
    },
    getAppVersion() {
    },
    updateNotifications() {
    },
    bindLogin() {
      if (!this.hasLogin) {
        vk.navigateToLogin();
      } else {
        this.goto("setting");
      }
    },
    async goto(value) {
      if (!this.hasLogin && value !== "about") {
        vk.navigateToLogin();
        return;
      }
      if (value === "about") {
        this.showDetail();
        return;
      }
      if (value === "unbindWeixin") {
        await this.unbindWeixin();
        return;
      }
      const routes = {
        "setting": "/pages/setting/index",
        "notification": "/pages/notice/index",
        "about": "/pages/about/index"
      };
      if (routes[value]) {
        vk.navigateTo(routes[value]);
      }
    },
    async unbindWeixin() {
      try {
        await vk.userCenter.unbindWeixin();
        common_vendor.index.clearStorageSync();
        vk.alert("解除绑定微信成功", "提示", "确定", () => {
          vk.navigateToLogin();
        });
      } catch (e) {
        common_vendor.index.__f__("log", "at pages/user/index.vue:374", "解除绑定微信失败:", e);
        common_vendor.index.clearStorageSync();
        vk.navigateToLogin();
      }
    },
    handleFunction(item) {
      if (!this.hasLogin) {
        vk.navigateToLogin();
        return;
      }
      const actionMap = {
        "approval": "/pages/workflow/application-form/list",
        "document": "/pages/opendb-notice/index",
        "notice": "/pages/notice/index",
        "setting": "/pages/setting/index"
      };
      if (actionMap[item.action]) {
        vk.navigateTo({
          url: actionMap[item.action]
        });
      }
    },
    tofeedback(e) {
      common_vendor.index.__f__("log", "at pages/user/index.vue:397", "打开客服反馈");
    },
    logout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        confirmColor: "#ff4444",
        success: (res) => {
          if (res.confirm) {
            vk.userCenter.logout();
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
  const _easycom_u_parse2 = common_vendor.resolveComponent("u-parse");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  const _easycom_u_tabbar2 = common_vendor.resolveComponent("u-tabbar");
  (_component_u_status_bar + _easycom_u_avatar2 + _easycom_u_icon2 + _easycom_u_badge2 + _easycom_u_parse2 + _easycom_u_popup2 + _easycom_u_tabbar2)();
}
const _easycom_u_avatar = () => "../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_badge = () => "../../uni_modules/vk-uview-ui/components/u-badge/u-badge.js";
const _easycom_u_parse = () => "../../uni_modules/vk-uview-ui/components/u-parse/u-parse.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
const _easycom_u_tabbar = () => "../../uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js";
if (!Math) {
  (_easycom_u_avatar + _easycom_u_icon + _easycom_u_badge + _easycom_u_parse + _easycom_u_popup + _easycom_u_tabbar)();
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
    h: !$options.hasLogin
  }, !$options.hasLogin ? {
    i: common_vendor.p({
      name: "arrow-right",
      color: "rgba(255,255,255,0.8)",
      size: "36"
    })
  } : {}, {
    j: common_vendor.o((...args) => $options.bindLogin && $options.bindLogin(...args), "28"),
    k: $options.hasLogin
  }, $options.hasLogin ? {
    l: common_vendor.t($data.userInfo.attendance || 0),
    m: common_vendor.t((/* @__PURE__ */ new Date()).getMonth() + 1),
    n: common_vendor.t($data.userInfo.tasks || 0),
    o: common_vendor.o(($event) => $options.handleFunction({
      action: "approval"
    }), "38"),
    p: common_vendor.t($data.userInfo.notices || 0),
    q: common_vendor.o(($event) => $options.handleFunction({
      action: "notice"
    }), "2f")
  } : {}, {
    r: !$options.hasLogin ? 1 : "",
    s: common_vendor.f($data.functionList, (item, index, i0) => {
      return {
        a: "79e6a490-3-" + i0,
        b: common_vendor.p({
          name: item.icon,
          size: "45",
          color: "#ffffff"
        }),
        c: item.bgColor,
        d: common_vendor.t(item.text),
        e: index,
        f: common_vendor.o(($event) => $options.handleFunction(item), index)
      };
    }),
    t: common_vendor.p({
      name: "account",
      size: "40",
      color: "#ffffff"
    }),
    v: $data.profileUncompleted
  }, $data.profileUncompleted ? {} : {}, {
    w: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    x: common_vendor.o(($event) => $options.goto("setting"), "90"),
    y: common_vendor.p({
      name: "bell",
      size: "40",
      color: "#ffffff"
    }),
    z: $data.unreadNotifications > 0
  }, $data.unreadNotifications > 0 ? {
    A: common_vendor.p({
      value: $data.unreadNotifications,
      type: "error",
      size: "mini"
    })
  } : {}, {
    B: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    C: common_vendor.o(($event) => $options.goto("notification"), "15"),
    D: common_vendor.p({
      name: "chat",
      size: "40",
      color: "#ffffff"
    }),
    E: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    F: common_vendor.o((...args) => $options.tofeedback && $options.tofeedback(...args), "06"),
    G: _ctx.$hasRole("admin")
  }, _ctx.$hasRole("admin") ? {
    H: common_vendor.p({
      name: "lock-open",
      size: "40",
      color: "#ffffff"
    }),
    I: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    J: common_vendor.o(($event) => $options.goto("unbindWeixin"), "eb")
  } : {}, {
    K: common_vendor.p({
      name: "info-circle",
      size: "40",
      color: "#ffffff"
    }),
    L: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    M: common_vendor.o(($event) => $options.goto("about"), "31"),
    N: common_vendor.t($data.currentNotice.title),
    O: common_vendor.t(_ctx.vk.pubfn.timeFormat(new Date($data.currentNotice.publish_date), "yyyy-MM-dd")),
    P: $data.currentNotice.publisher_name
  }, $data.currentNotice.publisher_name ? {
    Q: common_vendor.t($data.currentNotice.publisher_name)
  } : {}, {
    R: common_vendor.p({
      html: $data.currentNotice.content
    }),
    S: common_vendor.o(($event) => $data.showDetailPopup = $event, "0e"),
    T: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["mask-close-able"]: true,
      height: $data.popupStyle.height,
      ["border-radius"]: $data.popupStyle.border_radius,
      modelValue: $data.showDetailPopup
    }),
    U: common_vendor.p({
      list: $data.tabbar,
      ["before-switch"]: $options.beforeTabSwitch,
      ["icon-size"]: "48",
      ["font-size"]: "20",
      ["border-top"]: true,
      ["hide-tab-bar"]: true,
      ["active-color"]: "#2979ff",
      ["inactive-color"]: "#999"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-79e6a490"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/index.js.map
