"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      list: [],
      refreshing: false
    };
  },
  onShow() {
    this.loadData();
  },
  methods: {
    async loadData(fromRefresh = false) {
      if (this.loading)
        return;
      this.loading = true;
      if (fromRefresh) {
        this.refreshing = true;
      }
      try {
        const card = vk.getVuex("$user.employeeInfo.card") || "";
        if (!card) {
          common_vendor.index.showToast({
            title: "未获取到员工信息",
            icon: "none"
          });
          return;
        }
        const res = await vk.callFunction({
          url: "admin/hrm/salary/sys/payslip/getDetail",
          title: "加载中...",
          data: {
            card,
            status: 0
          }
        });
        if (res.code === 0) {
          this.list = res.rows || [];
        } else {
          common_vendor.index.showToast({
            title: res.msg || "查询失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/payslip/index.vue:72", e);
      } finally {
        this.loading = false;
        if (fromRefresh) {
          this.refreshing = false;
        }
      }
    },
    onRefresh() {
      if (this.loading)
        return;
      this.loadData(true);
    },
    goSign(item) {
      common_vendor.index.navigateTo({
        url: `/pages/payslip/sign?_id=${item._id}&attendance_ym=${item.attendance_ym}`
      });
    },
    formatDate(val) {
      if (!val)
        return "";
      const d = new Date(val);
      return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, "0")}月`;
    }
  }
};
if (!Array) {
  const _component_u_refresh = common_vendor.resolveComponent("u-refresh");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  (_component_u_refresh + _easycom_u_empty2)();
}
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
if (!Math) {
  _easycom_u_empty();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.onRefresh, "ae"),
    b: common_vendor.p({
      ["refresher-triggered"]: $data.refreshing
    }),
    c: $data.loading
  }, $data.loading ? {} : $data.list.length === 0 ? {
    e: common_vendor.p({
      text: "暂无待签薪资",
      mode: "list"
    })
  } : {
    f: common_vendor.f($data.list, (item, k0, i0) => {
      return {
        a: common_vendor.t($options.formatDate(item.attendance_ym_key)),
        b: common_vendor.t(item.employee_name),
        c: item._id,
        d: common_vendor.o(($event) => $options.goSign(item), item._id)
      };
    })
  }, {
    d: $data.list.length === 0,
    g: $data.refreshing,
    h: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args), "f6")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c522121b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/payslip/index.js.map
