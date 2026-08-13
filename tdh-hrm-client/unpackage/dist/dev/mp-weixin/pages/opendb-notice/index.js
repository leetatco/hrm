"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      keyword: "",
      // 搜索关键词
      noticeList: [],
      // 公告列表数据
      pageIndex: 1,
      // 当前页码
      pageSize: 10,
      // 每页数量
      total: 0,
      // 总条数
      loading: false,
      // 是否加载中
      loadStatus: "loadmore",
      // loadmore状态: loadmore, loading, nomore
      showDetailPopup: false,
      // 详情弹窗显示状态
      currentNotice: {
        // 当前查看的公告详情
        title: "",
        publish_date: null,
        content: "",
        publisher_name: ""
      }
    };
  },
  computed: {
    loadIconType() {
      return this.loadStatus === "loading" ? "flower" : "arrow-down";
    }
  },
  onLoad() {
    this.getNoticeList(true);
  },
  // 上拉加载更多
  onReachBottom() {
    if (this.loadStatus === "loadmore" && this.noticeList.length < this.total) {
      this.loadMore();
    }
  },
  methods: {
    // 回到主页
    goHome() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    },
    // 格式化日期
    formatDate(date) {
      if (!date)
        return "未知时间";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    // 获取公告列表（支持分页和模糊搜索）
    async getNoticeList(reset = false) {
      var _a;
      if (reset) {
        this.pageIndex = 1;
        this.noticeList = [];
        this.total = 0;
        this.loadStatus = "loadmore";
      }
      if (this.loading)
        return;
      this.loading = true;
      this.loadStatus = "loading";
      try {
        let res = await vk.callFunction({
          url: "admin/opendb-notice/pub/getListIndex",
          title: "请求中...",
          data: {
            title: this.keyword || "",
            pageIndex: this.pageIndex,
            pageSize: this.pageSize
          }
        });
        if (res.code === 0) {
          const {
            rows,
            total
          } = res;
          if (this.pageIndex === 1) {
            this.noticeList = rows;
          } else {
            this.noticeList = [...this.noticeList, ...rows];
          }
          this.total = total;
          if (this.noticeList.length >= total) {
            this.loadStatus = "nomore";
          } else {
            this.loadStatus = "loadmore";
          }
        } else {
          common_vendor.index.showToast({
            title: ((_a = res.result) == null ? void 0 : _a.message) || "查询失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/opendb-notice/index.vue:154", "获取公告列表失败", e);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
        this.loadStatus = "loadmore";
      } finally {
        this.loading = false;
      }
    },
    // 搜索
    handleSearch() {
      this.getNoticeList(true);
    },
    // 清空搜索
    handleClear() {
      this.keyword = "";
      this.getNoticeList(true);
    },
    // 加载更多
    loadMore() {
      if (this.loadStatus === "nomore" || this.loading)
        return;
      this.pageIndex++;
      this.getNoticeList(false);
    },
    // 显示公告详情弹窗
    showDetail(item) {
      this.currentNotice = {
        ...item
      };
      this.showDetailPopup = true;
    }
  }
};
if (!Array) {
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_loadmore2 = common_vendor.resolveComponent("u-loadmore");
  const _easycom_u_parse2 = common_vendor.resolveComponent("u-parse");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_easycom_u_search2 + _easycom_u_icon2 + _easycom_u_empty2 + _easycom_u_loadmore2 + _easycom_u_parse2 + _easycom_u_popup2)();
}
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loadmore = () => "../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
const _easycom_u_parse = () => "../../uni_modules/vk-uview-ui/components/u-parse/u-parse.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_icon + _easycom_u_empty + _easycom_u_loadmore + _easycom_u_parse + _easycom_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleSearch, "f3"),
    b: common_vendor.o($options.handleClear, "e7"),
    c: common_vendor.o(($event) => $data.keyword = $event, "ef"),
    d: common_vendor.p({
      placeholder: "请输入公告标题",
      shape: "round",
      ["bg-color"]: "#ffffff",
      height: "70",
      showAction: false,
      modelValue: $data.keyword
    }),
    e: $data.noticeList.length > 0
  }, $data.noticeList.length > 0 ? {
    f: common_vendor.f($data.noticeList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.title),
        b: "51646c99-1-" + i0,
        c: common_vendor.t($options.formatDate(item.publish_date)),
        d: item.publisher_name
      }, item.publisher_name ? {
        e: common_vendor.t(item.publisher_name)
      } : {}, {
        f: item._id,
        g: common_vendor.o(($event) => $options.showDetail(item), item._id)
      });
    }),
    g: common_vendor.p({
      name: "arrow-right",
      size: "16",
      color: "#b0b7c3"
    })
  } : {}, {
    h: !$data.loading && $data.noticeList.length === 0
  }, !$data.loading && $data.noticeList.length === 0 ? {
    i: common_vendor.p({
      text: "暂无公告",
      mode: "list"
    })
  } : {}, {
    j: $data.noticeList.length > 0
  }, $data.noticeList.length > 0 ? {
    k: common_vendor.o($options.loadMore, "dd"),
    l: common_vendor.p({
      status: $data.loadStatus,
      ["icon-type"]: $options.loadIconType
    })
  } : {}, {
    m: common_vendor.t($data.currentNotice.title),
    n: common_vendor.t($options.formatDate($data.currentNotice.publish_date)),
    o: $data.currentNotice.publisher_name
  }, $data.currentNotice.publisher_name ? {
    p: common_vendor.t($data.currentNotice.publisher_name)
  } : {}, {
    q: common_vendor.p({
      html: $data.currentNotice.content
    }),
    r: common_vendor.o(($event) => $data.showDetailPopup = $event, "79"),
    s: common_vendor.p({
      mode: "bottom",
      closeable: true,
      ["mask-close-able"]: true,
      width: "100%",
      height: "90%",
      ["border-radius"]: "16",
      modelValue: $data.showDetailPopup
    }),
    t: common_vendor.p({
      name: "home",
      size: "24",
      color: "#ffffff"
    }),
    v: common_vendor.o((...args) => $options.goHome && $options.goHome(...args), "83")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-51646c99"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/opendb-notice/index.js.map
