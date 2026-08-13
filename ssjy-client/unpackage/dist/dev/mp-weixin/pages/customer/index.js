"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      keyword: "",
      // 搜索关键词
      list: [],
      // 企业列表
      loading: false,
      // 是否加载中
      pageNo: 1,
      // 当前页码
      pageSize: 15,
      // 每页数量
      total: 0,
      // 总记录数
      loadStatus: "loadmore",
      // loadmore 组件状态：loadmore/loading/nomore
      loadText: {
        loadmore: "上拉加载更多",
        loading: "加载中...",
        nomore: "没有更多了"
      }
    };
  },
  methods: {
    /**
     * 执行搜索（重置列表，从第一页开始）
     */
    async doSearch() {
      if (!this.keyword.trim()) {
        common_vendor.index.showToast({
          title: "请输入企业名称",
          icon: "none"
        });
        return;
      }
      this.resetSearch();
      await this.fetchData();
    },
    /**
     * 重置搜索状态
     */
    resetSearch() {
      this.list = [];
      this.pageNo = 1;
      this.total = 0;
      this.loadStatus = "loadmore";
    },
    /**
     * 加载更多（上拉触底）
     */
    async loadMore() {
      if (this.loadStatus === "nomore" || this.loading)
        return;
      if (this.list.length >= this.total && this.total > 0) {
        this.loadStatus = "nomore";
        return;
      }
      this.pageNo++;
      await this.fetchData(true);
    },
    /**
     * 请求数据
     * @param {Boolean} isAppend 是否追加到现有列表
     */
    async fetchData(isAppend = false) {
      if (!isAppend)
        this.loading = true;
      else
        this.loadStatus = "loading";
      try {
        const res = await vk.callFunction({
          url: "client/customer/pub/list",
          title: "请求中...",
          data: {
            keyword: this.keyword.trim(),
            pageNo: this.pageNo,
            pageSize: this.pageSize
          }
        });
        if (res.code === 0) {
          const newList = res.rows || [];
          this.total = res.total || 0;
          if (isAppend) {
            this.list = [...this.list, ...newList];
          } else {
            this.list = newList;
          }
          if (this.list.length >= this.total && this.total > 0) {
            this.loadStatus = "nomore";
          } else {
            this.loadStatus = "loadmore";
          }
        } else {
          common_vendor.index.showToast({
            title: res.msg || "查询失败",
            icon: "none"
          });
          if (!isAppend)
            this.list = [];
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/customer/index.vue:141", err);
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
        if (!isAppend)
          this.list = [];
      } finally {
        if (!isAppend)
          this.loading = false;
        else if (this.loadStatus === "loading")
          this.loadStatus = "loadmore";
      }
    },
    goDetail() {
      vk.navigateTo({
        url: `/pages/customer/detail`,
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          update: (data) => {
          }
        },
        success: (res) => {
          res.eventChannel.emit("data", {
            customer: this.list[0] || {}
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _component_u_list_item = common_vendor.resolveComponent("u-list-item");
  const _component_u_list = common_vendor.resolveComponent("u-list");
  const _easycom_u_loadmore2 = common_vendor.resolveComponent("u-loadmore");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_loading2 = common_vendor.resolveComponent("u-loading");
  (_easycom_u_search2 + _easycom_u_icon2 + _component_u_list_item + _component_u_list + _easycom_u_loadmore2 + _easycom_u_empty2 + _easycom_u_loading2)();
}
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_loadmore = () => "../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loading = () => "../../uni_modules/vk-uview-ui/components/u-loading/u-loading.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_icon + _easycom_u_loadmore + _easycom_u_empty + _easycom_u_loading)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.doSearch, "29"),
    b: common_vendor.o($options.doSearch, "10"),
    c: common_vendor.o(($event) => $data.keyword = $event, "02"),
    d: common_vendor.p({
      placeholder: "请输入企业名称",
      shape: "round",
      ["show-action"]: true,
      ["action-text"]: "搜索",
      modelValue: $data.keyword
    }),
    e: !$data.loading || $data.list.length
  }, !$data.loading || $data.list.length ? common_vendor.e({
    f: $data.list.length
  }, $data.list.length ? {
    g: common_vendor.f($data.list, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.company_name),
        b: common_vendor.t(item.legal_person || "—"),
        c: common_vendor.t(item.industry || "—"),
        d: "0aa7e036-3-" + i0 + "," + ("0aa7e036-2-" + i0),
        e: common_vendor.t(item.address || "暂无地址"),
        f: common_vendor.o(($event) => $options.goDetail(item._id), item._id),
        g: item._id,
        h: "0aa7e036-2-" + i0 + ",0aa7e036-1"
      };
    }),
    h: common_vendor.p({
      name: "map",
      size: "28",
      color: "#999"
    }),
    i: common_vendor.o($options.loadMore, "68"),
    j: common_vendor.p({
      ["lower-threshold"]: 100
    })
  } : {}, {
    k: $data.list.length
  }, $data.list.length ? {
    l: common_vendor.p({
      status: $data.loadStatus,
      ["load-text"]: $data.loadText
    })
  } : {}, {
    m: !$data.loading && $data.list.length === 0 && $data.keyword
  }, !$data.loading && $data.list.length === 0 && $data.keyword ? {
    n: common_vendor.p({
      text: "暂无数据",
      mode: "data"
    })
  } : {}) : {}, {
    o: $data.loading && $data.list.length === 0
  }, $data.loading && $data.list.length === 0 ? {
    p: common_vendor.p({
      mode: "circle"
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0aa7e036"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/customer/index.js.map
