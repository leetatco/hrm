"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 主题色
      themeColor: "#2d8cff",
      // 图片样式配置
      imageStyle: {
        border: {
          radius: "12rpx"
        },
        height: "140rpx",
        width: "140rpx"
      },
      // 请求数据
      reqdata: {
        clockintime: "",
        todayStart: "",
        todayEnd: ""
      },
      empty: false,
      mode: "date",
      showCalendar: false,
      clocks: [],
      is_submit: 1,
      platform: "",
      platform_name: "",
      currentDateStr: "",
      // 当前显示的日期字符串
      currentWeekday: "",
      // 当前星期几
      scrollHeight: 0,
      // 滚动区域高度
      refreshing: false,
      // 下拉刷新状态
      loadingMore: false
      // 上拉加载更多状态
    };
  },
  watch: {
    clocks(e) {
      let empty = e.length === 0;
      if (this.empty !== empty) {
        this.empty = empty;
      }
    }
  },
  onLoad() {
    this.initScrollHeight();
  },
  onShow() {
    this.loadData();
  },
  methods: {
    // 初始化滚动区域高度
    initScrollHeight() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      const navBarHeight = 100;
      const operAreaHeight = 120;
      const rpxToPx = systemInfo.windowWidth / 750;
      const navHeight = navBarHeight * rpxToPx;
      const operHeight = operAreaHeight * rpxToPx;
      this.scrollHeight = windowHeight - navHeight - operHeight;
    },
    // 获取星期几
    getWeekday(date) {
      const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      return weekdays[date.getDay()];
    },
    // 更新显示的日期
    updateDisplayDate() {
      let date = new Date(this.reqdata.clockintime);
      this.currentDateStr = vk.pubfn.timeFormat(date, "yyyy年MM月dd日");
      this.currentWeekday = this.getWeekday(date);
    },
    // 打开日历
    openCalendar() {
      this.showCalendar = true;
    },
    // 日历选择回调
    async handleCalendarChange(e) {
      this.reqdata.clockintime = e.result;
      this.updateDisplayDate();
      await this.loadData();
    },
    // 前一天
    async prevDay() {
      let currentDate = new Date(this.reqdata.clockintime);
      let prevDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1e3);
      this.reqdata.clockintime = vk.pubfn.timeFormat(prevDate, "yyyy-MM-dd");
      this.updateDisplayDate();
      await this.loadData();
    },
    // 后一天
    async nextDay() {
      let currentDate = new Date(this.reqdata.clockintime);
      let nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1e3);
      this.reqdata.clockintime = vk.pubfn.timeFormat(nextDate, "yyyy-MM-dd");
      this.updateDisplayDate();
      await this.loadData();
    },
    // 获取今日记录
    async todayDatas() {
      this.reqdata.clockintime = vk.pubfn.timeFormat(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
      this.updateDisplayDate();
      await this.loadData();
    },
    // 加载数据
    async loadData() {
      if (!this.reqdata.clockintime) {
        this.reqdata.clockintime = vk.pubfn.timeFormat(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
      }
      this.updateDisplayDate();
      let {
        todayStart,
        todayEnd
      } = vk.pubfn.getCommonTime(new Date(this.reqdata.clockintime));
      this.reqdata.todayStart = todayStart;
      this.reqdata.todayEnd = todayEnd;
      let res = await vk.callFunction({
        url: "admin/hrm/clockin/sys/getList",
        title: "加载中...",
        data: this.reqdata
      });
      if (res.code === 0) {
        this.empty = res.total > 0 ? false : true;
        this.clocks = res.rows;
        this.is_submit = 0;
        this.clocks.forEach((el) => {
          if (el.img) {
            el.img = {
              url: el.img
            };
          }
        });
        return;
      }
      vk.alert(res.msg);
    },
    // 跳转打卡页
    toClockin() {
      common_vendor.index.navigateTo({
        url: "/pages/clockin/clockin"
      });
    },
    // 跳转设置页
    toSetting() {
      common_vendor.index.navigateTo({
        url: "/pages/clockin/setting"
      });
    },
    // 获取打卡类型样式类
    getTypeClass(type) {
      const typeMap = {
        "上班": "type-work",
        "下班": "type-offwork",
        "加班": "type-overtime",
        "外出": "type-outside"
      };
      return typeMap[type] || "type-default";
    },
    // 下拉刷新：重新加载当前日期
    async onRefresherRefresh() {
      if (this.refreshing)
        return;
      this.refreshing = true;
      try {
        await this.loadData();
      } finally {
        this.refreshing = false;
      }
    },
    // 上拉加载更多：切换到前一天（相当于加载更早的记录）
    async onScrollToLower() {
      if (this.loadingMore)
        return;
      this.loadingMore = true;
      try {
        await this.prevDay();
      } finally {
        this.loadingMore = false;
      }
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_u_calendar2 = common_vendor.resolveComponent("u-calendar");
  (_easycom_u_icon2 + _easycom_u_empty2 + _easycom_uni_file_picker2 + _easycom_u_calendar2)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_u_calendar = () => "../../uni_modules/vk-uview-ui/components/u-calendar/u-calendar.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_empty + _easycom_uni_file_picker + _easycom_u_calendar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      name: "arrow-left",
      size: "32",
      color: "#666"
    }),
    b: common_vendor.o((...args) => $options.prevDay && $options.prevDay(...args), "ed"),
    c: common_vendor.t($data.currentDateStr),
    d: common_vendor.t($data.currentWeekday),
    e: common_vendor.p({
      name: "calendar",
      size: "28",
      color: "#999"
    }),
    f: common_vendor.o((...args) => $options.openCalendar && $options.openCalendar(...args), "bb"),
    g: common_vendor.p({
      name: "arrow-right",
      size: "32",
      color: "#666"
    }),
    h: common_vendor.o((...args) => $options.nextDay && $options.nextDay(...args), "93"),
    i: !$data.empty && $data.clocks.length > 0
  }, !$data.empty && $data.clocks.length > 0 ? {
    j: common_vendor.p({
      name: "checkmark-circle",
      size: "40",
      color: "#2d8cff"
    }),
    k: common_vendor.t($data.clocks.length)
  } : {}, {
    l: $data.empty
  }, $data.empty ? {
    m: common_vendor.p({
      text: `${$data.currentDateStr} 暂无打卡记录`,
      mode: "list",
      icon: "http://cdn.uviewui.com/uview/empty/list.png"
    })
  } : {}, {
    n: common_vendor.f($data.clocks, (item, index, i0) => {
      var _a;
      return common_vendor.e({
        a: "1a0765fa-5-" + i0,
        b: common_vendor.t(_ctx.vk.pubfn.timeFormat(new Date(item.clockintime), "hh:mm")),
        c: common_vendor.t(item.type),
        d: common_vendor.n($options.getTypeClass(item.type)),
        e: item.img && item.img.url
      }, item.img && item.img.url ? {
        f: "1a0765fa-6-" + i0,
        g: common_vendor.o(($event) => item.img = $event, index),
        h: common_vendor.p({
          fileMediatype: "image",
          returnType: "object",
          ["image-styles"]: $data.imageStyle,
          ["del-icon"]: false,
          disabled: true,
          modelValue: item.img
        })
      } : {}, {
        i: item.wifis
      }, item.wifis ? {
        j: "1a0765fa-7-" + i0,
        k: common_vendor.p({
          name: "wifi",
          size: "28",
          color: "#999"
        }),
        l: common_vendor.t(item.wifis.ssid)
      } : {}, {
        m: "1a0765fa-8-" + i0,
        n: common_vendor.t(item.bssid || "未获取"),
        o: "1a0765fa-9-" + i0,
        p: common_vendor.t(((_a = item.employeeInfo) == null ? void 0 : _a.employee_name) || ""),
        q: "1a0765fa-10-" + i0,
        r: common_vendor.t(item.remark),
        s: !(item.img && item.img.url) ? 1 : "",
        t: index
      });
    }),
    o: common_vendor.p({
      name: "clock",
      size: "28",
      color: "#2d8cff"
    }),
    p: common_vendor.p({
      name: "map",
      size: "28",
      color: "#999"
    }),
    q: common_vendor.p({
      name: "account",
      size: "28",
      color: "#999"
    }),
    r: common_vendor.p({
      name: "edit-pen",
      size: "28",
      color: "#999"
    }),
    s: $data.scrollHeight + "px",
    t: $data.refreshing,
    v: common_vendor.o((...args) => $options.onRefresherRefresh && $options.onRefresherRefresh(...args), "b7"),
    w: common_vendor.o((...args) => $options.onScrollToLower && $options.onScrollToLower(...args), "9d"),
    x: common_vendor.p({
      name: "calendar",
      size: "44",
      color: "#666"
    }),
    y: common_vendor.o((...args) => $options.openCalendar && $options.openCalendar(...args), "57"),
    z: common_vendor.p({
      name: "order",
      size: "44",
      color: "#666"
    }),
    A: common_vendor.o((...args) => $options.todayDatas && $options.todayDatas(...args), "74"),
    B: _ctx.uniIDHasRole("clockinAdmin") || _ctx.uniIDHasRole("admin")
  }, _ctx.uniIDHasRole("clockinAdmin") || _ctx.uniIDHasRole("admin") ? {
    C: common_vendor.p({
      name: "setting",
      size: "44",
      color: "#666"
    }),
    D: common_vendor.o((...args) => $options.toSetting && $options.toSetting(...args), "3d")
  } : {}, {
    E: common_vendor.p({
      name: "map",
      size: "40",
      color: "#ffffff"
    }),
    F: common_vendor.o((...args) => $options.toClockin && $options.toClockin(...args), "8f"),
    G: common_vendor.o($options.handleCalendarChange, "4b"),
    H: common_vendor.o(($event) => $data.showCalendar = $event, "a6"),
    I: common_vendor.p({
      mode: $data.mode,
      color: $data.themeColor,
      ["bg-color"]: "#ffffff",
      ["month-bg"]: "#f5f5f5",
      ["btn-type"]: "primary",
      modelValue: $data.showCalendar
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/clockin/index.js.map
