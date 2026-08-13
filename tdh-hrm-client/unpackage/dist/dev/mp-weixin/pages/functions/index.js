"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      menuSort: [666],
      keyword: "",
      // 搜索关键词
      functionList: [],
      // 功能列表
      pageIndex: 1,
      // 当前页码
      pageSize: 20,
      // 每页数量（功能数量一般不多，设大一点）
      total: 0,
      // 总条数
      loading: false,
      // 是否加载中
      loadStatus: "loadmore",
      // loadmore状态
      // 颜色池（用于占位图标）
      colorPool: ["#2979ff", "#19be6b", "#ff9900", "#e74c3c", "#9b59b6", "#1abc9c", "#e67e22", "#3498db"]
    };
  },
  computed: {
    loadIconType() {
      return this.loadStatus === "loading" ? "flower" : "arrow-down";
    },
    // 判断是否登录
    hasLogin() {
      return !!vk.getVuex("$user.userInfo.username");
    }
  },
  onLoad() {
    this.getFunctionList(true);
  },
  // 上拉加载更多
  onReachBottom() {
    if (this.loadStatus === "loadmore" && this.functionList.length < this.total) {
      this.loadMore();
    }
  },
  methods: {
    // -------- 获取功能列表 --------
    async getFunctionList(reset = false) {
      if (reset) {
        this.pageIndex = 1;
        this.functionList = [];
        this.total = 0;
        this.loadStatus = "loadmore";
      }
      if (this.loading)
        return;
      this.loading = true;
      this.loadStatus = "loading";
      try {
        const url = "admin/common-functions/sys/getList";
        const res = await vk.callFunction({
          url,
          title: "加载中...",
          data: {
            status: "enabled",
            // 只获取启用的功能
            sort: this.menuSort,
            name: this.keyword || "",
            // 按名称模糊搜索
            pageIndex: this.pageIndex,
            pageSize: this.pageSize
          }
        });
        if (res.code === 0) {
          const { rows, total } = res;
          const processedRows = rows.map((item) => ({
            ...item,
            _imgLoaded: true
          }));
          if (this.pageIndex === 1) {
            this.functionList = processedRows;
          } else {
            this.functionList = [...this.functionList, ...processedRows];
          }
          this.total = total;
          if (this.functionList.length >= total) {
            this.loadStatus = "nomore";
          } else {
            this.loadStatus = "loadmore";
          }
        } else {
          common_vendor.index.showToast({
            title: res.message || "查询失败",
            icon: "none"
          });
          this.loadStatus = "loadmore";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/functions/index.vue:147", "获取功能列表失败", e);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
        this.loadStatus = "loadmore";
      } finally {
        this.loading = false;
      }
    },
    // -------- 搜索和清空 --------
    handleSearch() {
      this.getFunctionList(true);
    },
    handleClear() {
      this.keyword = "";
      this.getFunctionList(true);
    },
    // -------- 加载更多 --------
    loadMore() {
      if (this.loadStatus === "nomore" || this.loading)
        return;
      this.pageIndex++;
      this.getFunctionList(false);
    },
    // -------- 图标颜色（占位用） --------
    getColor(index) {
      return this.colorPool[index % this.colorPool.length];
    },
    // -------- 图标加载失败处理 --------
    onIconError(item) {
      item._imgLoaded = false;
      this.$forceUpdate();
    },
    // -------- 点击功能项跳转 --------
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
    }
  }
};
if (!Array) {
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_badge2 = common_vendor.resolveComponent("u-badge");
  const _easycom_u_grid_item2 = common_vendor.resolveComponent("u-grid-item");
  const _easycom_u_grid2 = common_vendor.resolveComponent("u-grid");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_loadmore2 = common_vendor.resolveComponent("u-loadmore");
  (_easycom_u_search2 + _easycom_u_badge2 + _easycom_u_grid_item2 + _easycom_u_grid2 + _easycom_u_empty2 + _easycom_u_loadmore2)();
}
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_badge = () => "../../uni_modules/vk-uview-ui/components/u-badge/u-badge.js";
const _easycom_u_grid_item = () => "../../uni_modules/vk-uview-ui/components/u-grid-item/u-grid-item.js";
const _easycom_u_grid = () => "../../uni_modules/vk-uview-ui/components/u-grid/u-grid.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loadmore = () => "../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_badge + _easycom_u_grid_item + _easycom_u_grid + _easycom_u_empty + _easycom_u_loadmore)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleSearch, "8e"),
    b: common_vendor.o($options.handleClear, "6c"),
    c: common_vendor.o(($event) => $data.keyword = $event, "93"),
    d: common_vendor.p({
      placeholder: "搜索功能名称",
      shape: "round",
      ["bg-color"]: "#f5f5f5",
      height: "70",
      showAction: false,
      modelValue: $data.keyword
    }),
    e: $data.functionList.length > 0
  }, $data.functionList.length > 0 ? {
    f: common_vendor.f($data.functionList, (item, index, i0) => {
      return common_vendor.e({
        a: item.imgUrl && item._imgLoaded !== false
      }, item.imgUrl && item._imgLoaded !== false ? {
        b: item.imgUrl || "",
        c: common_vendor.o(($event) => $options.onIconError(item), item._id)
      } : {
        d: common_vendor.t(item.name.charAt(0)),
        e: $options.getColor(index)
      }, {
        f: common_vendor.t(item.name),
        g: item.badge
      }, item.badge ? {
        h: "339666d5-3-" + i0 + "," + ("339666d5-2-" + i0),
        i: common_vendor.p({
          value: item.badge,
          offset: [-5, -5],
          size: "mini"
        })
      } : {}, {
        j: item._id,
        k: common_vendor.o(($event) => $options.goToPage(item), item._id),
        l: "339666d5-2-" + i0 + ",339666d5-1"
      });
    }),
    g: common_vendor.p({
      col: 4,
      border: false,
      gap: 10
    })
  } : {}, {
    h: !$data.loading && $data.functionList.length === 0
  }, !$data.loading && $data.functionList.length === 0 ? {
    i: common_vendor.p({
      text: "暂无功能",
      mode: "list"
    })
  } : {}, {
    j: $data.functionList.length > 0
  }, $data.functionList.length > 0 ? {
    k: common_vendor.o($options.loadMore, "e4"),
    l: common_vendor.p({
      status: $data.loadStatus,
      ["icon-type"]: $options.loadIconType
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-339666d5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/functions/index.js.map
