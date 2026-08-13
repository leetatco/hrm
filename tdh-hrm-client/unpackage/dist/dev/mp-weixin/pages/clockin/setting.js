"use strict";
const common_vendor = require("../../common/vendor.js");
const useTotop = () => "../../components/use-totop/use-totop.js";
const useLoadmore = () => "../../components/use-loadmore/use-loadmore.js";
const _sfc_main = {
  components: {
    useTotop,
    useLoadmore
  },
  data() {
    return {
      empty: false,
      headerPosition: "fixed",
      setDatas: [],
      loadmoreType: "more",
      reqdata: {
        pageIndex: 1,
        pageSize: 8
      },
      scrollTop: 0,
      refreshing: false
      // 防止下拉刷新重复请求
    };
  },
  watch: {
    setDatas(e) {
      let empty = e.length === 0;
      if (this.empty !== empty) {
        this.empty = empty;
      }
    }
  },
  onPageScroll(e) {
    if (e.scrollTop >= 0) {
      this.headerPosition = "fixed";
    } else {
      this.headerPosition = "absolute";
    }
    this.$refs.usetop.change(e.scrollTop);
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (this.refreshing) {
      common_vendor.index.stopPullDownRefresh();
      return;
    }
    this.refreshing = true;
    this.loadData("refresh").finally(() => {
      this.refreshing = false;
      common_vendor.index.stopPullDownRefresh();
    });
  },
  // 上拉加载更多
  onReachBottom() {
    this.loadData("add");
  },
  async onLoad(options) {
    this.loadData();
  },
  methods: {
    // 删除打卡点
    deleteSetting(id) {
      let _this = this;
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除该打卡点？",
        success: function(res) {
          if (res.confirm) {
            if (!id)
              return _this.loadData("refresh");
            vk.callFunction({
              url: "admin/hrm/clockin/sys/setting/delete",
              title: "请求中...",
              data: { _id: id }
            }).then((res2) => {
              if (res2.code === 0) {
                _this.loadData("refresh");
              }
            });
          }
        }
      });
    },
    // 加载数据（支持刷新和加载更多）
    async loadData(type = "add", loading) {
      if (this.loadmoreType === "loading" && type !== "refresh") {
        return;
      }
      if (type === "refresh") {
        this.reqdata.pageIndex = 1;
        this.loadmoreType = "loading";
        this.setDatas = [];
      }
      if (loading == 1) {
        this.setDatas = [];
      }
      if (type === "add") {
        if (this.loadmoreType === "nomore")
          return;
        this.loadmoreType = "loading";
      }
      try {
        const res = await vk.callFunction({
          url: "admin/hrm/clockin/sys/setting/getList",
          title: type === "refresh" ? "刷新中..." : "请求中...",
          data: this.reqdata
        });
        if (res.code === 0) {
          const rows = res.rows || [];
          if (type === "refresh") {
            this.setDatas = rows;
          } else {
            this.setDatas = [...this.setDatas, ...rows];
          }
          if (rows.length >= this.reqdata.pageSize) {
            this.reqdata.pageIndex++;
            this.loadmoreType = "more";
          } else {
            this.loadmoreType = "nomore";
          }
        } else {
          this.loadmoreType = "nomore";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/clockin/setting.vue:199", e);
        this.loadmoreType = "more";
      } finally {
        if (loading == 1 || type === "refresh") {
          common_vendor.index.hideLoading();
        }
        if (this.setDatas.length === 0) {
          this.empty = true;
        } else {
          this.empty = false;
        }
      }
    },
    toSetting(options) {
      vk.navigateTo({
        url: `/pages/clockin/setting_edit?id=${options.id}&type=${options.type}`
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_use_loadmore2 = common_vendor.resolveComponent("use-loadmore");
  const _easycom_use_totop2 = common_vendor.resolveComponent("use-totop");
  (_easycom_uni_icons2 + _easycom_u_empty2 + _easycom_u_icon2 + _easycom_use_loadmore2 + _easycom_use_totop2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_use_loadmore = () => "../../components/use-loadmore/use-loadmore.js";
const _easycom_use_totop = () => "../../components/use-totop/use-totop.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_u_empty + _easycom_u_icon + _easycom_use_loadmore + _easycom_use_totop)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      type: "info-filled",
      size: "32",
      color: "#ff9f43"
    }),
    b: $data.empty
  }, $data.empty ? {
    c: common_vendor.p({
      text: "暂无打卡点，点击下方按钮添加",
      mode: "list"
    })
  } : {}, {
    d: common_vendor.f($data.setDatas, (item, index, i0) => {
      return {
        a: common_vendor.t(item.address || "未填写"),
        b: common_vendor.t(item.ssid || "未填写"),
        c: common_vendor.t(item.bssid),
        d: common_vendor.t(item.signalStrength || "未设置"),
        e: common_vendor.t(_ctx.vk.pubfn.timeFormat(new Date(item.update_date), "yyyy-MM-dd")),
        f: "1e2e1e82-2-" + i0,
        g: common_vendor.o(($event) => $options.toSetting({
          id: item._id,
          type: "edit"
        }), index),
        h: "1e2e1e82-3-" + i0,
        i: common_vendor.o(($event) => $options.deleteSetting(item._id), index),
        j: common_vendor.o(($event) => $options.toSetting({
          id: item._id,
          type: "edit"
        }), index),
        k: index
      };
    }),
    e: common_vendor.p({
      name: "edit-pen",
      size: "36",
      color: "#2d8cff"
    }),
    f: common_vendor.p({
      name: "trash",
      size: "36",
      color: "#f44336"
    }),
    g: common_vendor.p({
      type: $data.loadmoreType
    }),
    h: common_vendor.sr("usetop", "1e2e1e82-5"),
    i: common_vendor.p({
      name: "plus",
      size: "32",
      color: "#ffffff"
    }),
    j: common_vendor.o(($event) => $options.toSetting({
      id: "",
      type: "add"
    }), "07")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1e2e1e82"]]);
_sfc_main.__runtimeHooks = 1;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/clockin/setting.js.map
