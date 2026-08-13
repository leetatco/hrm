"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      isEmpty: true,
      // 是否未连接Wi-Fi（用于显示提示）
      formData: {
        _id: "",
        address: "",
        bssid: "",
        ssid: "",
        signalStrength: 0
      },
      type: "add",
      // add / edit
      submitting: false
    };
  },
  onShow() {
    this.getConnectedWifi();
  },
  onLoad(options) {
    let title = "打卡点设置";
    this.type = options.type || "add";
    if (this.type === "edit") {
      title = "编辑打卡点";
      this.loadDetail(options.id);
    }
    common_vendor.index.setNavigationBarTitle({
      title
    });
  },
  methods: {
    // 获取当前连接的Wi-Fi信息
    getConnectedWifi() {
      common_vendor.index.startWifi({
        success: () => {
          common_vendor.index.getConnectedWifi({
            success: (res) => {
              this.formData.bssid = res.wifi.BSSID || "";
              this.formData.ssid = res.wifi.SSID || "";
              this.formData.signalStrength = res.wifi.signalStrength || 0;
              this.isEmpty = false;
              common_vendor.index.showToast({
                title: "已获取当前Wi-Fi信息",
                icon: "success"
              });
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/clockin/setting_edit.vue:119", "获取已连接的Wi-Fi失败", err);
              this.isEmpty = true;
              common_vendor.index.showToast({
                title: "未检测到Wi-Fi连接",
                icon: "none"
              });
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/clockin/setting_edit.vue:129", "启动Wi-Fi模块失败", err);
          this.isEmpty = true;
          common_vendor.index.showToast({
            title: "请手动开启Wi-Fi",
            icon: "none"
          });
        }
      });
    },
    // 加载编辑详情
    loadDetail(id) {
      vk.callFunction({
        url: "admin/hrm/clockin/sys/setting/getList",
        title: "加载中...",
        data: {
          _id: id
        }
      }).then((res) => {
        if (res.code === 0) {
          const detail = res.rows[0];
          for (let key in this.formData) {
            if (detail[key] !== void 0)
              this.formData[key] = detail[key];
          }
          this.isEmpty = false;
        } else {
          vk.alert("未找到该记录");
        }
      });
    },
    // 返回列表页
    toSetting() {
      common_vendor.index.navigateBack();
    },
    // 提交表单
    async submit() {
      if (this.submitting)
        return;
      if (!this.formData.address) {
        vk.alert("请输入位置描述");
        return;
      }
      if (!this.formData.bssid || !this.formData.ssid) {
        vk.alert("请先点击「读入Wi-Fi信息」获取当前Wi-Fi");
        return;
      }
      const signal = parseInt(this.formData.signalStrength);
      if (isNaN(signal) || signal > 100 || signal <= 50) {
        vk.alert("信号强度必须为 50 ～ 100 之间的整数（例如 60）");
        return;
      }
      this.formData.signalStrength = signal;
      this.submitting = true;
      const url = this.type === "add" ? "admin/hrm/clockin/sys/setting/add" : "admin/hrm/clockin/sys/setting/update";
      const data = {
        ...this.formData
      };
      if (this.type === "add")
        delete data._id;
      try {
        const res = await vk.callFunction({
          url,
          title: "提交中...",
          data
        });
        if (res.code === 0 || res.errCode === 0) {
          vk.alert(this.type === "add" ? "添加成功" : "编辑成功");
          setTimeout(() => this.toSetting(), 1500);
        } else {
          vk.alert(res.msg);
        }
      } catch (e) {
        vk.alert("操作失败，请重试");
      } finally {
        this.submitting = false;
      }
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  _easycom_u_icon2();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
if (!Math) {
  _easycom_u_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isEmpty
  }, $data.isEmpty ? {
    b: common_vendor.p({
      name: "error-circle",
      size: "32",
      color: "#ff9f43"
    })
  } : {}, {
    c: common_vendor.p({
      name: "wifi",
      size: "32",
      color: "#2d8cff"
    }),
    d: $data.formData.address,
    e: common_vendor.o(($event) => $data.formData.address = $event.detail.value, "f0"),
    f: $data.formData.ssid,
    g: common_vendor.o(($event) => $data.formData.ssid = $event.detail.value, "e4"),
    h: $data.formData.bssid,
    i: common_vendor.o(($event) => $data.formData.bssid = $event.detail.value, "3d"),
    j: $data.formData.signalStrength,
    k: common_vendor.o(($event) => $data.formData.signalStrength = $event.detail.value, "ea"),
    l: common_vendor.p({
      name: "pushpin",
      size: "32",
      color: "#2d8cff"
    }),
    m: common_vendor.p({
      name: "scan",
      size: "28",
      color: "#ffffff"
    }),
    n: common_vendor.o((...args) => $options.getConnectedWifi && $options.getConnectedWifi(...args), "32"),
    o: common_vendor.p({
      name: "checkmark",
      size: "28",
      color: "#ffffff"
    }),
    p: common_vendor.t($data.submitting ? "提交中..." : "提交"),
    q: $data.submitting ? 1 : "",
    r: common_vendor.o((...args) => $options.submit && $options.submit(...args), "c5")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2d28db0a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/clockin/setting_edit.js.map
