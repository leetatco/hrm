"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      pageLoading: true,
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
      // 颜色池（用于占位图标）
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
    // 只显示前8个功能
    displayMenuList() {
      return this.menuList.slice(0, 8);
    }
  },
  async onLoad() {
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
    // -------- 数据加载 --------
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:321", "加载轮播图失败:", error);
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
            // 标记图片加载状态
          }));
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:344", "加载常用功能失败:", error);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:361", "加载通知失败:", error);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:379", "加载未读数量失败:", error);
      }
    },
    loadUserInfo() {
      try {
        this.userInfo = vk.getVuex("$user.userInfo") || {};
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:386", "加载用户信息失败:", error);
      }
    },
    refreshData() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:390", "刷新数据");
    },
    // -------- 图标颜色 --------
    getColor(index) {
      return this.colorPool[index % this.colorPool.length];
    },
    // -------- 图片加载失败处理 --------
    onIconError(event, item) {
      item._imgLoaded = false;
      this.$forceUpdate();
    },
    // -------- 交互事件 --------
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
    b: common_vendor.p({
      src: $data.userInfo.avatar || "/static/txl/ico_logo_@3x.png",
      size: "80"
    }),
    c: common_vendor.t($data.userInfo.nickname || "欢迎回来"),
    d: common_vendor.t($options.getGreeting()),
    e: common_vendor.p({
      name: "grid",
      size: "24",
      color: "#4a4a6a"
    }),
    f: common_vendor.t($options.departMentName),
    g: $options.hasLogin
  }, $options.hasLogin ? {
    h: common_vendor.p({
      name: "search",
      size: "32",
      color: "#999"
    }),
    i: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args), "88")
  } : {}, {
    j: $options.hasLogin
  }, $options.hasLogin ? {
    k: common_vendor.o($options.onSwiperClick, "80"),
    l: common_vendor.p({
      list: $data.swiperList.length ? $data.swiperList : $data.defaultSwiper,
      height: "300",
      ["indicator-pos"]: "bottomCenter",
      circular: true,
      autoplay: true,
      interval: 3e3,
      duration: 500,
      bgColor: "#f0f2f5",
      radius: "20"
    })
  } : {}, {
    m: common_vendor.o((...args) => $options.viewAllFunctions && $options.viewAllFunctions(...args), "38"),
    n: common_vendor.f($options.displayMenuList, (item, index, i0) => {
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
        h: "1cf27b2a-6-" + i0 + "," + ("1cf27b2a-5-" + i0),
        i: common_vendor.p({
          value: item.badge,
          offset: [-5, -5],
          size: "mini"
        })
      } : {}, {
        j: index,
        k: common_vendor.o(($event) => $options.goToPage(item), index),
        l: "1cf27b2a-5-" + i0 + ",1cf27b2a-4"
      });
    }),
    o: common_vendor.p({
      col: 4,
      border: false,
      gap: 10
    }),
    p: $options.hasLogin
  }, $options.hasLogin ? {
    q: common_vendor.o((...args) => $options.viewAllNotices && $options.viewAllNotices(...args), "53"),
    r: common_vendor.o($options.onNoticeClick, "8b"),
    s: common_vendor.p({
      list: $data.noticeList.map((item) => item.title),
      duration: 4e3,
      ["is-circular"]: false,
      bgColor: "#f5f7fa",
      color: "#ff9900",
      mode: "vertical"
    }),
    t: common_vendor.t($data.currentNotice.title || "暂无通知"),
    v: common_vendor.t($data.currentNotice.publish_date ? _ctx.vk.pubfn.timeFormat(new Date($data.currentNotice.publish_date), "MM-dd") : ""),
    w: $data.currentNotice.content || "暂无内容",
    x: common_vendor.o(($event) => $options.showDetail($data.currentNotice), "63")
  } : {}, {
    y: $options.hasLogin
  }, $options.hasLogin ? {
    z: common_vendor.f($data.quickList, (item, index, i0) => {
      return {
        a: "1cf27b2a-8-" + i0,
        b: common_vendor.p({
          name: item.icon,
          size: "36",
          color: "#ffffff"
        }),
        c: item.bgColor,
        d: common_vendor.t(item.text),
        e: index,
        f: common_vendor.o(($event) => $options.handleQuickAction(item), index)
      };
    })
  } : {}, {
    A: $options.hasLogin
  }, $options.hasLogin ? common_vendor.e({
    B: common_vendor.t($data.currentNotice.title),
    C: common_vendor.t(_ctx.vk.pubfn.timeFormat(new Date($data.currentNotice.publish_date), "yyyy-MM-dd")),
    D: $data.currentNotice.publisher_name
  }, $data.currentNotice.publisher_name ? {
    E: common_vendor.t($data.currentNotice.publisher_name)
  } : {}, {
    F: common_vendor.p({
      html: $data.currentNotice.content
    }),
    G: common_vendor.o(($event) => $data.showDetailPopup = $event, "51"),
    H: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["mask-close-able"]: true,
      height: $data.popupStyle.height,
      ["border-radius"]: $data.popupStyle.border_radius,
      modelValue: $data.showDetailPopup
    })
  }) : {}) : {
    I: common_vendor.f(8, (i, k0, i0) => {
      return {
        a: i
      };
    }),
    J: common_vendor.f(4, (i, k0, i0) => {
      return {
        a: i
      };
    })
  }, {
    K: common_vendor.p({
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
