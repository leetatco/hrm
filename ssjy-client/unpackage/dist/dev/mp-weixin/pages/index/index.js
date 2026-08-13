"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 用户信息
      userInfo: {
        avatar: "",
        nickname: ""
      },
      // 搜索关键词
      searchKeyword: "",
      // 轮播图数据
      swiperList: [
        {
          image: "/static/banner/1.jpg",
          title: "企业公告：新系统上线通知"
        },
        {
          image: "/static/banner/4.jpg",
          title: "人力资源政策更新"
        },
        {
          image: "/static/banner/5.jpg",
          title: "季度优秀员工评选"
        }
      ],
      // 功能菜单
      menuList: [
        {
          name: "用印申请",
          imgUrl: "/static/ico_workOvertime.png",
          route: "/pages/workflow/seal/seal"
        },
        {
          name: "客户查询",
          imgUrl: "/static/ico_leave.png",
          route: "/pages/customer/index"
        }
        // {
        // 	name: "请假申请",
        // 	imgUrl: "/static/ico_leave.png",
        // 	route: "/pagesOA/leave/index"
        // },
        // {
        // 	name: "外出申请",
        // 	imgUrl: "/static/ico_goOut.png",
        // 	route: "/pagesOA/goOut/index"
        // },
        // {
        // 	name: "补卡申请",
        // 	imgUrl: "/static/ico_patchCard.png",
        // 	route: "/pagesOA/patchCard/index"
        // }
      ],
      // 通知列表
      noticeList: [
        {
          id: 1,
          title: "人事考勤系统即将上线，敬请期待！",
          content: "为提升公司管理效率，人事考勤系统将于下周一正式上线，请各位同事提前熟悉操作流程。",
          time: "2024-01-15",
          type: "system"
        },
        {
          id: 2,
          title: "春节放假安排通知",
          content: "根据国务院办公厅通知，结合公司实际情况，现将2024年春节放假安排通知如下...",
          time: "2024-01-10",
          type: "holiday"
        },
        {
          id: 3,
          title: "年度员工体检通知",
          content: "公司定于本月25日组织年度员工体检，请各部门安排好工作，准时参加。",
          time: "2024-01-08",
          type: "health"
        }
      ],
      currentNotice: {},
      // 快捷入口
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
          count: 2,
          text: "消息"
        },
        // {
        // 	iconPath: "static/icon_bak.png",
        // 	selectedIconPath: "static/icon_bak_sel.png",
        // 	pagePath: "pages/notice/index",
        // 	midButton: true,
        // 	text: "待办"
        // },
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
  onLoad() {
    this.loadUserInfo();
    this.currentNotice = this.noticeList[0];
  },
  onShow() {
    this.refreshData();
  },
  onPullDownRefresh() {
    this.refreshData();
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        this.userInfo = vk.getVuex("$user.userInfo");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:255", "加载用户信息失败:", error);
      }
    },
    // 刷新数据
    refreshData() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:262", "刷新数据");
    },
    // 获取问候语
    getGreeting() {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 9)
        return "早上好！";
      if (hour < 12)
        return "上午好！";
      if (hour < 14)
        return "中午好！";
      if (hour < 18)
        return "下午好！";
      return "晚上好！";
    },
    // 搜索
    onSearch(value) {
      if (!value) {
        common_vendor.index.showToast({
          title: "请输入搜索内容",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/search/result?keyword=${encodeURIComponent(value)}`
      });
    },
    // 跳转到功能页面
    goToPage(item) {
      if (!item.route) {
        common_vendor.index.showToast({
          title: "功能开发中",
          icon: "none"
        });
        return;
      }
      if (item.badge > 0) {
        item.badge = 0;
      }
      common_vendor.index.navigateTo({
        url: item.route
      });
    },
    // 显示所有功能
    showAllFunctions() {
      common_vendor.index.navigateTo({
        url: "/pages/functions/index"
      });
    },
    // 查看通知详情
    onNoticeClick(index) {
      this.currentNotice = this.noticeList[index];
    },
    // 查看所有通知
    viewAllNotices() {
      common_vendor.index.navigateTo({
        url: "/pages/notice/index"
      });
    },
    // 处理快捷操作
    handleQuickAction(item) {
      switch (item.action) {
        case "scan":
          common_vendor.index.scanCode({
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/index/index.vue:335", "扫码结果:", res);
              common_vendor.index.showToast({
                title: "扫描成功",
                icon: "success"
              });
            }
          });
          break;
        case "attendance":
          common_vendor.index.navigateTo({
            url: "/pages/attendance/today"
          });
          break;
        case "message":
          common_vendor.index.switchTab({
            url: "/pages/message/index"
          });
          break;
        case "setting":
          common_vendor.index.navigateTo({
            url: "/pages/setting/index"
          });
          break;
      }
    },
    // 切换tab前的拦截
    beforeTabSwitch(index) {
      return true;
    },
    // 显示中间按钮操作
    showCenterAction() {
      common_vendor.index.showActionSheet({
        itemList: ["发布通知", "发起审批", "添加联系人"],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              common_vendor.index.navigateTo({
                url: "/pages/notice/create"
              });
              break;
            case 1:
              common_vendor.index.navigateTo({
                url: "/pages/approval/create"
              });
              break;
            case 2:
              common_vendor.index.navigateTo({
                url: "/pages/contacts/add"
              });
              break;
          }
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_u_avatar2 = common_vendor.resolveComponent("u-avatar");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_swiper2 = common_vendor.resolveComponent("u-swiper");
  const _easycom_u_image2 = common_vendor.resolveComponent("u-image");
  const _easycom_u_badge2 = common_vendor.resolveComponent("u-badge");
  const _easycom_u_grid_item2 = common_vendor.resolveComponent("u-grid-item");
  const _easycom_u_grid2 = common_vendor.resolveComponent("u-grid");
  const _easycom_u_notice_bar2 = common_vendor.resolveComponent("u-notice-bar");
  const _easycom_u_card2 = common_vendor.resolveComponent("u-card");
  const _easycom_u_tabbar2 = common_vendor.resolveComponent("u-tabbar");
  (_easycom_u_avatar2 + _easycom_u_icon2 + _easycom_u_search2 + _easycom_u_swiper2 + _easycom_u_image2 + _easycom_u_badge2 + _easycom_u_grid_item2 + _easycom_u_grid2 + _easycom_u_notice_bar2 + _easycom_u_card2 + _easycom_u_tabbar2)();
}
const _easycom_u_avatar = () => "../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_swiper = () => "../../uni_modules/vk-uview-ui/components/u-swiper/u-swiper.js";
const _easycom_u_image = () => "../../uni_modules/vk-uview-ui/components/u-image/u-image.js";
const _easycom_u_badge = () => "../../uni_modules/vk-uview-ui/components/u-badge/u-badge.js";
const _easycom_u_grid_item = () => "../../uni_modules/vk-uview-ui/components/u-grid-item/u-grid-item.js";
const _easycom_u_grid = () => "../../uni_modules/vk-uview-ui/components/u-grid/u-grid.js";
const _easycom_u_notice_bar = () => "../../uni_modules/vk-uview-ui/components/u-notice-bar/u-notice-bar.js";
const _easycom_u_card = () => "../../uni_modules/vk-uview-ui/components/u-card/u-card.js";
const _easycom_u_tabbar = () => "../../uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js";
if (!Math) {
  (_easycom_u_avatar + _easycom_u_icon + _easycom_u_search + _easycom_u_swiper + _easycom_u_image + _easycom_u_badge + _easycom_u_grid_item + _easycom_u_grid + _easycom_u_notice_bar + _easycom_u_card + _easycom_u_tabbar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      src: $data.userInfo.avatar || "/static/txl/ico_logo_@3x.png",
      size: "80"
    }),
    b: common_vendor.t($data.userInfo.nickname || "欢迎回来"),
    c: common_vendor.t($options.getGreeting()),
    d: common_vendor.p({
      name: "sunny",
      size: "36",
      color: "#ff9900"
    }),
    e: $data.userInfo.employeeInfo
  }, $data.userInfo.employeeInfo ? {
    f: common_vendor.t($data.userInfo.employeeInfo.department_name || "测试部")
  } : {}, {
    g: common_vendor.o($options.onSearch, "4d"),
    h: common_vendor.o($options.onSearch, "93"),
    i: common_vendor.o(($event) => $data.searchKeyword = $event, "71"),
    j: common_vendor.p({
      placeholder: "搜索功能、通知、联系人...",
      shape: "round",
      showAction: false,
      height: "60",
      clearabled: true,
      modelValue: $data.searchKeyword
    }),
    k: common_vendor.p({
      list: $data.swiperList,
      height: "320",
      ["indicator-pos"]: "bottomCenter",
      circular: true,
      autoplay: true,
      interval: 3e3,
      duration: 500,
      bgColor: "#ffffff",
      radius: "30"
    }),
    l: common_vendor.o((...args) => $options.showAllFunctions && $options.showAllFunctions(...args), "a1"),
    m: common_vendor.f($data.menuList, (item, index, i0) => {
      return common_vendor.e({
        a: "1cf27b2a-6-" + i0 + "," + ("1cf27b2a-5-" + i0),
        b: common_vendor.p({
          width: "80rpx",
          height: "80rpx",
          src: item.imgUrl,
          mode: "aspectFit"
        }),
        c: common_vendor.t(item.name),
        d: item.badge
      }, item.badge ? {
        e: "1cf27b2a-7-" + i0 + "," + ("1cf27b2a-5-" + i0),
        f: common_vendor.p({
          value: item.badge,
          offset: [-5, -5],
          size: "mini"
        })
      } : {}, {
        g: index,
        h: common_vendor.o(($event) => $options.goToPage(item), index),
        i: "1cf27b2a-5-" + i0 + ",1cf27b2a-4"
      });
    }),
    n: common_vendor.p({
      col: 4,
      border: false
    }),
    o: common_vendor.o((...args) => $options.viewAllNotices && $options.viewAllNotices(...args), "d3"),
    p: common_vendor.o($options.onNoticeClick, "1e"),
    q: common_vendor.p({
      list: $data.noticeList.map((item) => item.title),
      type: "vertical",
      duration: 4e3,
      ["is-circular"]: true,
      bgColor: "#fff7e6",
      color: "#fa8c16",
      mode: "vertical"
    }),
    r: common_vendor.t($data.currentNotice.content),
    s: common_vendor.p({
      title: $data.currentNotice.title,
      ["sub-title"]: $data.currentNotice.time,
      ["title-size"]: "32",
      ["sub-title-size"]: "24",
      border: false,
      padding: "30",
      margin: "20",
      ["head-border-bottom"]: false
    }),
    t: common_vendor.f($data.quickList, (item, index, i0) => {
      return {
        a: "1cf27b2a-10-" + i0,
        b: common_vendor.p({
          name: item.icon,
          size: "40",
          color: "#ffffff"
        }),
        c: item.bgColor,
        d: common_vendor.t(item.text),
        e: index,
        f: common_vendor.o(($event) => $options.handleQuickAction(item), index)
      };
    }),
    v: common_vendor.p({
      list: $data.tabbar,
      ["before-switch"]: $options.beforeTabSwitch,
      ["icon-size"]: "50",
      ["border-top"]: true,
      ["hide-tab-bar"]: true
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
