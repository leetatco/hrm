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
      // 功能列表
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
          bgColor: "linear-gradient(135deg, #19be6b, #36cf89)"
          // action: 'attendance'
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
      showDetailPopup: false,
      // 详情弹窗显示状态
      currentNotice: {},
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
      return vk.getVuex("$user.userInfo.username") ? true : false;
    },
    // 当前年份
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
    //通告信息
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
        common_vendor.index.__f__("error", "at pages/user/index.vue:294", "加载未读数量失败:", error);
      }
    },
    // 显示公告详情弹窗
    showDetail() {
      this.showDetailPopup = true;
    },
    // 加载未读数量
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
        common_vendor.index.__f__("error", "at pages/user/index.vue:317", "加载未读数量失败:", error);
      }
    },
    // 加载审核数量
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
        common_vendor.index.__f__("error", "at pages/user/index.vue:337", "加载未读数量失败:", error);
      }
    },
    // 加载考勤天数
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
        common_vendor.index.__f__("error", "at pages/user/index.vue:355", "加载考勤天数失败:", error);
      }
    },
    // 切换tab前的拦截
    beforeTabSwitch(index) {
      return true;
    },
    // 更新用户信息
    updateUserInfo() {
      if (this.hasLogin) {
        this.userInfo = vk.getVuex("$user.userInfo") || {};
        common_vendor.index.__f__("log", "at pages/user/index.vue:374", "用户信息:", this.userInfo);
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
        vk.navigateToLogin();
      } else {
        this.goto("setting");
      }
    },
    // 跳转页面
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
      vk.navigateTo(routes[value]);
    },
    // 解除绑定微信
    async unbindWeixin() {
      try {
        await vk.userCenter.unbindWeixin();
        common_vendor.index.clearStorageSync();
        vk.alert("解除绑定微信成功", "提示", "确定", () => {
          vk.navigateToLogin();
        });
      } catch (e) {
        common_vendor.index.__f__("log", "at pages/user/index.vue:450", "解除绑定微信失败:", e);
        common_vendor.index.clearStorageSync();
        vk.navigateToLogin();
      }
    },
    // 处理功能点击
    handleFunction(item) {
      if (!this.hasLogin) {
        vk.navigateToLogin();
        return;
      }
      const actionMap = {
        "approval": "/pages/workflow/application-form/list",
        "attendance": "/pages/clockin/index",
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
    // 反馈
    tofeedback(e) {
      common_vendor.index.__f__("log", "at pages/user/index.vue:481", "打开反馈页面");
    },
    // 退出登录
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
  const _easycom_u_tabbar2 = common_vendor.resolveComponent("u-tabbar");
  const _easycom_u_parse2 = common_vendor.resolveComponent("u-parse");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_component_u_status_bar + _easycom_u_avatar2 + _easycom_u_icon2 + _easycom_u_badge2 + _easycom_u_tabbar2 + _easycom_u_parse2 + _easycom_u_popup2)();
}
const _easycom_u_avatar = () => "../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_badge = () => "../../uni_modules/vk-uview-ui/components/u-badge/u-badge.js";
const _easycom_u_tabbar = () => "../../uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js";
const _easycom_u_parse = () => "../../uni_modules/vk-uview-ui/components/u-parse/u-parse.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
if (!Math) {
  (_easycom_u_avatar + _easycom_u_icon + _easycom_u_badge + _easycom_u_tabbar + _easycom_u_parse + _easycom_u_popup)();
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
    h: common_vendor.o((...args) => $options.bindLogin && $options.bindLogin(...args), "54"),
    i: $options.hasLogin
  }, $options.hasLogin ? {
    j: common_vendor.t($data.userInfo.attendance || 0),
    k: common_vendor.t((/* @__PURE__ */ new Date()).getMonth() + 1),
    l: common_vendor.t($data.userInfo.tasks || 0),
    m: common_vendor.o(($event) => $options.handleFunction({
      action: "approval"
    }), "24"),
    n: common_vendor.t($data.userInfo.notices || 0),
    o: common_vendor.o(($event) => $options.handleFunction({
      action: "notice"
    }), "c1")
  } : {}, {
    p: !$options.hasLogin
  }, !$options.hasLogin ? {
    q: common_vendor.p({
      name: "arrow-right",
      color: "#ffffff",
      size: "24"
    })
  } : {}, {
    r: !$options.hasLogin ? 1 : "",
    s: common_vendor.f($data.functionList, (item, index, i0) => {
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
    t: common_vendor.p({
      name: "account",
      size: "24",
      color: "#ffffff"
    }),
    v: $data.profileUncompleted
  }, $data.profileUncompleted ? {} : {}, {
    w: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    x: common_vendor.o(($event) => $options.goto("setting"), "89"),
    y: common_vendor.p({
      name: "bell",
      size: "24",
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
    C: common_vendor.o(($event) => $options.goto("notification"), "28"),
    D: common_vendor.p({
      name: "chat",
      size: "24",
      color: "#ffffff"
    }),
    E: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    F: common_vendor.o((...args) => $options.tofeedback && $options.tofeedback(...args), "33"),
    G: _ctx.$hasRole("admin")
  }, _ctx.$hasRole("admin") ? {
    H: common_vendor.p({
      name: "lock-open",
      size: "24",
      color: "#ffffff"
    }),
    I: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    J: common_vendor.o(($event) => $options.goto("unbindWeixin"), "95")
  } : {}, {
    K: common_vendor.p({
      name: "info-circle",
      size: "24",
      color: "#ffffff"
    }),
    L: common_vendor.p({
      name: "arrow-right",
      color: "#c0c4cc",
      size: "20"
    }),
    M: common_vendor.o(($event) => $options.goto("about"), "15"),
    N: common_vendor.p({
      list: $data.tabbar,
      ["before-switch"]: $options.beforeTabSwitch,
      ["icon-size"]: "50",
      ["border-top"]: true,
      ["hide-tab-bar"]: true
    }),
    O: common_vendor.t($data.currentNotice.title),
    P: common_vendor.t(_ctx.vk.pubfn.timeFormat(new Date($data.currentNotice.publish_date), "yyyy-MM-dd")),
    Q: $data.currentNotice.publisher_name
  }, $data.currentNotice.publisher_name ? {
    R: common_vendor.t($data.currentNotice.publisher_name)
  } : {}, {
    S: common_vendor.p({
      html: $data.currentNotice.content
    }),
    T: common_vendor.o(($event) => $data.showDetailPopup = $event, "fb"),
    U: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["mask-close-able"]: true,
      height: $data.popupStyle.height,
      ["border-radius"]: $data.popupStyle.border_radius,
      modelValue: $data.showDetailPopup
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-79e6a490"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/index.js.map
