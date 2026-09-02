"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        employee_id: "",
        bssid: "",
        type: "",
        img: "",
        clockintime: "",
        remark: ""
      },
      is_submit: false,
      time: "00:00",
      bssidKeys: /* @__PURE__ */ new Set(),
      bssidMap: /* @__PURE__ */ new Map(),
      bssid_current: "",
      ssid_current: "",
      is_range: true,
      is_range_content: "你已在打卡范围内，将按公司卡记录！",
      today: "",
      avatarDir: "/clockin"
    };
  },
  onShow() {
    this.loadData();
    this.getConnectedWifi();
  },
  onLoad() {
    common_vendor.index.setNavigationBarTitle({
      title: "打卡"
    });
    this.initDateTime();
    this.startTimeUpdater();
  },
  methods: {
    //========== 拍照并上传 ==========
    chooseAndUploadImage() {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1e4);
      vk.chooseAndUploadFile({
        type: "image",
        count: 1,
        sourceType: ["camera"],
        sizeType: ["compressed"],
        title: "上传中...",
        onChooseFile: (res) => {
          var _a;
          let tempFiles = res.tempFiles.slice(0, 1);
          const file = tempFiles[0];
          const ext = (((_a = file.name) == null ? void 0 : _a.split(".").pop()) || "jpg").toLowerCase();
          tempFiles[0].cloudPath = `public${this.avatarDir}/${timestamp}_${random}.${ext}`;
          return {
            tempFilePaths: res.tempFilePaths.slice(0, 1),
            tempFiles
          };
        },
        success: (res) => {
          const file = res.tempFiles[0];
          this.formData.img = file.url;
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success"
          });
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes("cancel")) {
            return;
          }
          common_vendor.index.__f__("error", "at pages/clockin/clockin.vue:184", "上传失败:", err);
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
        }
      });
    },
    //========== 预览图片 ==========
    previewImage() {
      if (!this.formData.img)
        return;
      common_vendor.index.previewImage({
        urls: [this.formData.img],
        current: this.formData.img
      });
    },
    //========== 删除图片 ==========
    async removeImage() {
      if (!this.formData.img)
        return;
      try {
        await vk.myfn.deleteFile({
          url: this.formData.img
        });
        common_vendor.index.__f__("log", "at pages/clockin/clockin.vue:209", "删除云文件:", this.formData.img);
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/clockin/clockin.vue:211", "删除云文件失败:", e);
      }
      this.formData.img = "";
      common_vendor.index.showToast({
        title: "已删除",
        icon: "none"
      });
    },
    // 初始化日期与星期
    initDateTime() {
      const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      const now = /* @__PURE__ */ new Date();
      const dateStr = vk.pubfn.timeFormat(now, "yyyy-MM-dd");
      this.today = `${dateStr} ${weeks[now.getDay()]}`;
    },
    // 启动时间更新器
    startTimeUpdater() {
      setInterval(() => {
        const date = /* @__PURE__ */ new Date();
        const hour = date.getHours();
        const minute = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
        this.time = `${hour}:${minute}`;
      }, 1e3);
    },
    // 加载打卡点配置
    async loadData(callback) {
      const res = await vk.callFunction({
        url: "admin/hrm/clockin/sys/setting/getList",
        title: "加载中...",
        data: {
          pageSize: -1,
          pageIndex: 1
        }
      });
      if (res.code === 0) {
        if (res.total === 0) {
          vk.alert("请先设定打卡点");
          return;
        }
        this.ssidKeys = new Set(res.rows.map((item) => item.ssid));
        this.bssidKeys = new Set(res.rows.map((item) => item.bssid));
        res.rows.forEach((item) => {
          this.bssidMap.set(item.bssid, item);
        });
        this.getCurrentAddress();
      }
      if (typeof callback === "function")
        callback();
    },
    // 下拉刷新
    onPullDownRefresh() {
      this.loadData(() => {
        common_vendor.index.stopPullDownRefresh();
      });
    },
    // 获取当前连接的Wi-Fi
    getConnectedWifi() {
      common_vendor.index.startWifi({
        success: () => {
          common_vendor.index.getConnectedWifi({
            success: (res) => {
              this.bssid_current = res.wifi.BSSID || "无";
              this.ssid_current = res.wifi.SSID;
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/clockin/clockin.vue:281", "获取当前Wi-Fi失败", err);
              this.bssid_current = "获取失败";
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/clockin/clockin.vue:287", "启动Wi-Fi模块失败", err);
          this.bssid_current = "无法获取";
        }
      });
    },
    // 判断打卡范围
    getCurrentAddress() {
      if (this.bssidKeys.has(this.bssid_current)) {
        this.is_range = true;
        this.formData.type = "公司卡";
        this.is_range_content = "✅ 您已在打卡范围内，将按公司卡记录";
        this.formData.ssid = this.ssid_current;
        this.formData.bssid = this.bssid_current;
      } else {
        this.is_range = false;
        this.formData.type = "出差卡";
        this.is_range_content = "⚠️ 您已超出打卡范围，将按出差卡记录（需拍照）";
        this.formData.ssid = "无法获取";
        this.formData.bssid = "无法获取";
      }
    },
    // 跳回记录页
    toMain() {
      common_vendor.index.navigateTo({
        url: "/pages/clockin/index"
      });
    },
    // 提交打卡
    submit() {
      this.formData.employee_id = vk.getVuex("$user.userInfo.username");
      if (!this.formData.employee_id)
        return vk.alert("没有人员工号");
      if (!this.formData.bssid)
        return vk.alert("请先设定打卡点");
      if (!this.is_range && !this.formData.img)
        return vk.alert("出差打卡必须拍照上传");
      if (this.is_submit)
        return;
      this.is_submit = true;
      this.formData.clockintime = vk.pubfn.timeFormat(/* @__PURE__ */ new Date(), "yyyy-MM-dd hh:mm:ss");
      vk.callFunction({
        url: "admin/hrm/clockin/sys/add",
        title: "提交中...",
        data: this.formData
      }).then((res) => {
        this.is_submit = false;
        if (res.code === 0) {
          vk.alert("打卡成功", "提示", "确定", () => {
            this.toMain();
          });
        } else {
          vk.alert(res.msg);
        }
      }).catch(() => {
        this.is_submit = false;
        vk.alert("提交失败，请重试");
      });
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
    a: common_vendor.p({
      name: "calendar",
      size: "36",
      color: "#2d8cff"
    }),
    b: common_vendor.t($data.today),
    c: !$data.is_range
  }, !$data.is_range ? {
    d: common_vendor.p({
      name: "info-circle-fill",
      size: "32",
      color: "#ff9f43"
    })
  } : {}, {
    e: common_vendor.p({
      name: "wifi",
      size: "32",
      color: "#2d8cff"
    }),
    f: common_vendor.t($data.formData.ssid || "未设置"),
    g: common_vendor.t($data.formData.bssid || "未设置"),
    h: common_vendor.t($data.bssid_current || "未连接"),
    i: common_vendor.p({
      name: "camera",
      size: "32",
      color: "#2d8cff"
    }),
    j: !$data.is_range
  }, !$data.is_range ? {} : {}, {
    k: !$data.formData.img
  }, !$data.formData.img ? {
    l: common_vendor.p({
      name: "camera",
      size: "48",
      color: "#2979ff"
    }),
    m: common_vendor.o((...args) => $options.chooseAndUploadImage && $options.chooseAndUploadImage(...args), "4c")
  } : {
    n: $data.formData.img,
    o: common_vendor.o((...args) => $options.previewImage && $options.previewImage(...args), "90"),
    p: common_vendor.p({
      name: "close",
      size: "20",
      color: "#fff"
    }),
    q: common_vendor.o((...args) => $options.removeImage && $options.removeImage(...args), "ea"),
    r: common_vendor.o((...args) => $options.chooseAndUploadImage && $options.chooseAndUploadImage(...args), "25")
  }, {
    s: common_vendor.p({
      name: "compose",
      size: "32",
      color: "#2d8cff"
    }),
    t: $data.formData.remark,
    v: common_vendor.o(($event) => $data.formData.remark = $event.detail.value, "31"),
    w: common_vendor.p({
      type: "location-filled",
      size: "48",
      color: $data.is_range ? "#4caf50" : "#f44336"
    }),
    x: common_vendor.t($data.is_range_content),
    y: common_vendor.n($data.is_range ? "text-success" : "text-danger"),
    z: common_vendor.t($data.formData.type),
    A: common_vendor.t($data.time),
    B: common_vendor.o((...args) => $options.submit && $options.submit(...args), "8b"),
    C: $data.is_submit ? 1 : "",
    D: !$data.is_range ? 1 : "",
    E: $data.is_submit
  }, $data.is_submit ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-60f3b423"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/clockin/clockin.js.map
