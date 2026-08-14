"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      pageLoading: true,
      statusBarHeight: 20,
      popupStyle: {
        mode: "bottom",
        border_radius: 16,
        height: "90%"
      },
      userInfo: {},
      searchKeyword: "",
      swiperList: [],
      defaultSwiper: [{
        image: "/static/default_banner.png",
        title: "欢迎使用"
      }],
      menuList: [],
      menuSort: [666],
      showDetailPopup: false,
      noticeList: [],
      currentNotice: {
        title: "",
        content: "",
        publish_date: ""
      },
      colorPool: ["#2979ff", "#19be6b", "#ff9900", "#e74c3c", "#9b59b6", "#1abc9c", "#e67e22", "#3498db"],
      quickList: [
        {
          icon: "scan",
          text: "扫一扫",
          bgColor: "#2979ff",
          action: "scan"
        },
        {
          icon: "calendar",
          text: "今日考勤",
          bgColor: "#19be6b",
          action: "attendance"
        },
        {
          icon: "chat",
          text: "消息",
          bgColor: "#ff9900",
          action: "message"
        },
        {
          icon: "setting",
          text: "设置",
          bgColor: "#909399",
          action: "setting"
        }
      ],
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
    departMentName() {
      return vk.getVuex("$user.employeeInfo.department_name") || "人事部";
    },
    hasLogin() {
      return !!vk.getVuex("$user.userInfo.username");
    },
    displayMenuList() {
      return this.menuList.slice(0, 8);
    }
  },
  async onLoad() {
    const sysInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight || 20;
    this.pageLoading = true;
    this.loadUserInfo();
    await Promise.all([
      this.loadSwiperList(),
      this.loadMenuList(),
      this.loadNoticeList()
    ]);
    this.currentNotice = this.noticeList[0] || {
      title: "暂无通知",
      content: "暂无内容",
      publish_date: ""
    };
    this.pageLoading = false;
  },
  onShow() {
    this.refreshData();
    this.loadUnreadCount();
  },
  onPullDownRefresh() {
    this.refreshData();
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  methods: {
    async loadSwiperList() {
      try {
        const res = await this.vk.callFunction({
          url: "admin/opendb-banner/pub/getList",
          data: {
            pageSize: -1,
            pageIndex: 1
          }
        });
        if (res.code === 0 && res.rows.length) {
          this.swiperList = res.rows.map((e) => ({
            image: e.bannerfile,
            title: e.title || ""
          }));
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:311", "加载轮播图失败:", error);
      }
    },
    async loadMenuList() {
      try {
        const url = this.hasLogin ? "admin/common-functions/sys/getList" : "admin/common-functions/pub/getList";
        const res = await this.vk.callFunction({
          url,
          data: {
            status: "enabled",
            sort: this.menuSort,
            pageSize: -1,
            pageIndex: 1
          }
        });
        if (res.code === 0) {
          this.menuList = res.rows.map((item) => ({
            ...item,
            _imgLoaded: true
          }));
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:334", "加载常用功能失败:", error);
      }
    },
    async loadNoticeList() {
      try {
        if (!this.hasLogin)
          return;
        const res = await this.vk.callFunction({
          url: "admin/opendb-notice/pub/getListTop",
          data: {
            pageSize: -1,
            pageIndex: 1
          }
        });
        if (res.code === 0) {
          this.noticeList = res.rows;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:351", "加载通知失败:", error);
      }
    },
    async loadUnreadCount() {
      try {
        if (!this.hasLogin)
          return;
        const res = await this.vk.callFunction({
          url: "admin/bpmn/notification/pub/getUnreadCount",
          data: {
            userInfo: this.userInfo,
            pageSize: -1,
            pageIndex: 1
          }
        });
        if (res.code === 0) {
          this.tabbar[1].count = res.data.count || 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:369", "加载未读数量失败:", error);
      }
    },
    loadUserInfo() {
      try {
        this.userInfo = vk.getVuex("$user.userInfo") || {};
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:376", "加载用户信息失败:", error);
      }
    },
    refreshData() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:380", "刷新数据");
    },
    getColor(index) {
      return this.colorPool[index % this.colorPool.length];
    },
    onIconError(event, item) {
      item._imgLoaded = false;
      this.$forceUpdate();
    },
    getGreeting() {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 9)
        return "早上好 ☀️";
      if (hour < 12)
        return "上午好 🌤";
      if (hour < 14)
        return "中午好 🌞";
      if (hour < 18)
        return "下午好 🌥";
      return "晚上好 🌙";
    },
    onSearch() {
      common_vendor.index.navigateTo({
        url: "/pages/opendb-notice/index"
      });
    },
    onSwiperClick(index) {
      const item = this.swiperList[index];
      if (item == null ? void 0 : item.url) {
        common_vendor.index.navigateTo({
          url: item.url
        });
      }
    },
    goToPage(item) {
      if (!item.route) {
        common_vendor.index.showToast({
          title: "功能开发中",
          icon: "none"
        });
        return;
      }
      if (item.badge > 0)
        item.badge = 0;
      common_vendor.index.navigateTo({
        url: item.route
      });
    },
    viewAllFunctions() {
      common_vendor.index.navigateTo({
        url: "/pages/functions/index"
      });
    },
    viewAllNotices() {
      common_vendor.index.navigateTo({
        url: "/pages/opendb-notice/index"
      });
    },
    onNoticeClick(index) {
      if (this.noticeList[index]) {
        this.currentNotice = this.noticeList[index];
      }
    },
    showDetail(item) {
      if (!item.title)
        return;
      this.currentNotice = {
        ...item
      };
      this.showDetailPopup = true;
    },
    handleQuickAction(item) {
      switch (item.action) {
        case "scan":
          common_vendor.index.scanCode({
            success: (res) => {
              vk.alert(res, "提示", "确定");
            }
          });
          break;
        case "attendance":
          break;
        case "message":
          common_vendor.index.switchTab({
            url: "/pages/notice/index"
          });
          break;
        case "setting":
          common_vendor.index.navigateTo({
            url: "/pages/setting/index"
          });
          break;
      }
    },
    beforeTabSwitch(index) {
      return true;
    }
  }
};
if (!Array) {
  const _easycom_u_avatar2 = common_vendor.resolveComponent("u-avatar");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_swiper2 = common_vendor.resolveComponent("u-swiper");
  const _easycom_u_badge2 = common_vendor.resolveComponent("u-badge");
  const _easycom_u_grid_item2 = common_vendor.resolveComponent("u-grid-item");
  const _easycom_u_grid2 = common_vendor.resolveComponent("u-grid");
  const _easycom_u_notice_bar2 = common_vendor.resolveComponent("u-notice-bar");
  const _easycom_u_parse2 = common_vendor.resolveComponent("u-parse");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  const _easycom_u_tabbar2 = common_vendor.resolveComponent("u-tabbar");
  (_easycom_u_avatar2 + _easycom_u_icon2 + _easycom_u_swiper2 + _easycom_u_badge2 + _easycom_u_grid_item2 + _easycom_u_grid2 + _easycom_u_notice_bar2 + _easycom_u_parse2 + _easycom_u_popup2 + _easycom_u_tabbar2)();
}
const _easycom_u_avatar = () => "../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_swiper = () => "../../uni_modules/vk-uview-ui/components/u-swiper/u-swiper.js";
const _easycom_u_badge = () => "../../uni_modules/vk-uview-ui/components/u-badge/u-badge.js";
const _easycom_u_grid_item = () => "../../uni_modules/vk-uview-ui/components/u-grid-item/u-grid-item.js";
const _easycom_u_grid = () => "../../uni_modules/vk-uview-ui/components/u-grid/u-grid.js";
const _easycom_u_notice_bar = () => "../../uni_modules/vk-uview-ui/components/u-notice-bar/u-notice-bar.js";
const _easycom_u_parse = () => "../../uni_modules/vk-uview-ui/components/u-parse/u-parse.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
const _easycom_u_tabbar = () => "../../uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js";
if (!Math) {
  (_easycom_u_avatar + _easycom_u_icon + _easycom_u_swiper + _easycom_u_badge + _easycom_u_grid_item + _easycom_u_grid + _easycom_u_notice_bar + _easycom_u_parse + _easycom_u_popup + _easycom_u_tabbar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.pageLoading
  }, !$data.pageLoading ? common_vendor.e({
    b: $data.statusBarHeight + "px",
    c: common_vendor.p({
      src: $data.userInfo.avatar || "/static/txl/ico_logo_@3x.png",
      size: "76"
    }),
    d: common_vendor.t($data.userInfo.nickname || "欢迎回来"),
    e: common_vendor.t($options.getGreeting()),
    f: $options.hasLogin
  }, $options.hasLogin ? {
    g: common_vendor.p({
      name: "search",
      size: "32",
      color: "#999"
    }),
    h: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args), "e6")
  } : {}, {
    i: $options.hasLogin
  }, $options.hasLogin ? {
    j: common_vendor.o($options.onSwiperClick, "88"),
    k: common_vendor.p({
      list: $data.swiperList.length ? $data.swiperList : $data.defaultSwiper,
      height: "320",
      ["indicator-pos"]: "bottomCenter",
      circular: true,
      autoplay: true,
      interval: 3e3,
      duration: 500,
      bgColor: "#ffffff",
      radius: "16"
    })
  } : {}, {
    l: common_vendor.o((...args) => $options.viewAllFunctions && $options.viewAllFunctions(...args), "f7"),
    m: common_vendor.f($options.displayMenuList, (item, index, i0) => {
      return common_vendor.e({
        a: item.imgUrl && item._imgLoaded !== false
      }, item.imgUrl && item._imgLoaded !== false ? {
        b: item.imgUrl || "",
        c: common_vendor.o(($event) => $options.onIconError($event, item), index)
      } : {
        d: common_vendor.t(item.name.charAt(0)),
        e: $options.getColor(index)
      }, {
        f: common_vendor.t(item.name),
        g: item.badge
      }, item.badge ? {
        h: "1cf27b2a-5-" + i0 + "," + ("1cf27b2a-4-" + i0),
        i: common_vendor.p({
          value: item.badge,
          offset: [-5, -5],
          size: "mini"
        })
      } : {}, {
        j: index,
        k: common_vendor.o(($event) => $options.goToPage(item), index),
        l: "1cf27b2a-4-" + i0 + ",1cf27b2a-3"
      });
    }),
    n: common_vendor.p({
      col: 4,
      border: false,
      gap: 6
    }),
    o: $options.hasLogin
  }, $options.hasLogin ? {
    p: common_vendor.o((...args) => $options.viewAllNotices && $options.viewAllNotices(...args), "7c"),
    q: common_vendor.o($options.onNoticeClick, "e8"),
    r: common_vendor.p({
      list: $data.noticeList.map((item) => item.title),
      duration: 4e3,
      ["is-circular"]: false,
      bgColor: "#f5f7fa",
      color: "#ff9900",
      mode: "vertical"
    }),
    s: common_vendor.t($data.currentNotice.title || "暂无通知"),
    t: common_vendor.t($data.currentNotice.publish_date ? _ctx.vk.pubfn.timeFormat(new Date($data.currentNotice.publish_date), "MM-dd") : ""),
    v: $data.currentNotice.content || "暂无内容",
    w: common_vendor.o(($event) => $options.showDetail($data.currentNotice), "ce")
  } : {}, {
    x: $options.hasLogin
  }, $options.hasLogin ? {
    y: common_vendor.f($data.quickList, (item, index, i0) => {
      return {
        a: "1cf27b2a-7-" + i0,
        b: common_vendor.p({
          name: item.icon,
          size: "32",
          color: "#ffffff"
        }),
        c: item.bgColor,
        d: common_vendor.t(item.text),
        e: index,
        f: common_vendor.o(($event) => $options.handleQuickAction(item), index)
      };
    })
  } : {}, {
    z: $options.hasLogin
  }, $options.hasLogin ? common_vendor.e({
    A: common_vendor.t($data.currentNotice.title),
    B: common_vendor.t(_ctx.vk.pubfn.timeFormat(new Date($data.currentNotice.publish_date), "yyyy-MM-dd")),
    C: $data.currentNotice.publisher_name
  }, $data.currentNotice.publisher_name ? {
    D: common_vendor.t($data.currentNotice.publisher_name)
  } : {}, {
    E: common_vendor.p({
      html: $data.currentNotice.content
    }),
    F: common_vendor.o(($event) => $data.showDetailPopup = $event, "00"),
    G: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["mask-close-able"]: true,
      height: $data.popupStyle.height,
      ["border-radius"]: $data.popupStyle.border_radius,
      modelValue: $data.showDetailPopup
    })
  }) : {}) : {
    H: common_vendor.f(8, (i, k0, i0) => {
      return {
        a: i
      };
    }),
    I: common_vendor.f(4, (i, k0, i0) => {
      return {
        a: i
      };
    })
  }, {
    J: common_vendor.p({
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
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
