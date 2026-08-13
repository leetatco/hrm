"use strict";
const common_vendor = require("../../../common/vendor.js");
let vk = common_vendor.index.vk;
const _sfc_main = {
  data() {
    return {
      action: "template/db_api/pub/getList",
      // 获取list数据的云函数请求路径
      // init请求返回的数据
      data: {
        list: [],
        // 列表数据
        pageKey: true,
        // 是否还能加载下一页
        loadmore: "loading"
      },
      // 表单请求数据
      form1: {
        addTime: "",
        endTime: "",
        searchvalue: "",
        pageIndex: 1,
        //当前页码
        pageSize: 10
        //每页显示数量
      },
      scrollTop: 0
    };
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
  },
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options = {}) {
    vk = common_vendor.index.vk;
    this.options = options;
    this.init(options);
  },
  // 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
  onReady() {
  },
  // 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
  onShow() {
  },
  // 监听 - 页面每次【隐藏时】执行(如：返回)
  onHide() {
  },
  // 监听 - 页面下拉刷新
  onPullDownRefresh() {
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  // 监听 - 页面触底部
  onReachBottom(options) {
    this.nextPage();
  },
  // 监听 - 窗口尺寸变化(仅限:App、微信小程序)
  onResize() {
  },
  // 监听 - 点击右上角转发时
  onShareAppMessage(options) {
  },
  // 函数
  methods: {
    // 页面数据初始化函数
    init(options) {
      common_vendor.index.__f__("log", "at pages_template/db-test/list/list.vue:98", "init: ", options);
      this.getList({
        success: () => {
        }
      });
    },
    pageTo(path) {
      vk.navigateTo(path);
    },
    // 查询list数据
    getList(obj = {}) {
      let that = this;
      vk.pubfn.getListData({
        that,
        url: that.action,
        success: obj.success
      });
    },
    // 加载下一页数据
    nextPage() {
      let that = this;
      if (that.data.loadmore == "loadmore") {
        that.data.loadmore = "loading";
        that.form1.pageIndex++;
        that.getList();
      }
    },
    // 搜索
    onSearch(e) {
      let that = this;
      common_vendor.index.__f__("log", "at pages_template/db-test/list/list.vue:127", "搜索", that.form1.searchvalue);
      that.form1.pageIndex = 1;
      that.data.pageKey = true;
      that.getList();
    },
    // 列的点击事件
    itemBtn(item) {
      common_vendor.index.__f__("log", "at pages_template/db-test/list/list.vue:134", "点击", item);
      vk.toast("点击" + item._id.substring(20));
    }
  },
  // 计算属性
  computed: {}
};
if (!Array) {
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_loadmore2 = common_vendor.resolveComponent("u-loadmore");
  (_easycom_u_search2 + _easycom_u_empty2 + _easycom_u_loadmore2)();
}
const _easycom_u_search = () => "../../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_empty = () => "../../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loadmore = () => "../../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_empty + _easycom_u_loadmore)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.onSearch, "5b"),
    b: common_vendor.o($options.onSearch, "43"),
    c: common_vendor.o(($event) => $data.form1.searchvalue = $event, "f1"),
    d: common_vendor.p({
      placeholder: "输入金额搜索",
      ["show-action"]: false,
      ["input-align"]: "center",
      shape: "square",
      modelValue: $data.form1.searchvalue
    }),
    e: common_vendor.t($data.data.total),
    f: $data.data.list.length == 0
  }, $data.data.list.length == 0 ? {
    g: common_vendor.p({
      text: "暂无内容",
      mode: "list"
    })
  } : {}, {
    h: $data.data.list.length > 0
  }, $data.data.list.length > 0 ? {
    i: common_vendor.f($data.data.list, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: common_vendor.t(item._id.substring(20)),
        c: common_vendor.t(item.money),
        d: common_vendor.o(($event) => $options.itemBtn(item), item._id),
        e: item._id
      };
    }),
    j: common_vendor.o($options.nextPage, "0d"),
    k: common_vendor.p({
      status: $data.data.loadmore,
      ["bg-color"]: "#f8f8f8",
      ["margin-bottom"]: "30"
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-25614e50"]]);
_sfc_main.__runtimeHooks = 3;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages_template/db-test/list/list.js.map
