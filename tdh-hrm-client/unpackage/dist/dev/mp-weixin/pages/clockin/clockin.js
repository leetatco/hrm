"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        employee_id: "",
        bssid: "",
        ssid: "",
        setting_bssid: "",
        // 新增：设定打卡点的 bssid
        setting_ssid: "",
        // 新增：设定打卡点的 ssid
        type: "",
        img: "",
        clockintime: "",
        remark: ""
      },
      is_submit: false,
      time: "00:00",
      bssid_current: "",
      ssid_current: "",
      signalStrength_current: 0,
      is_range: true,
      is_range_content: "正在检测打卡范围...",
      today: "",
      avatarDir: "/clockin",
      // 考勤组与打卡点
      groupName: "",
      attendanceGroupId: "",
      punchLocation: null,
      requiredSignalStrength: 0,
      canSubmitByWifi: false,
      disableSubmit: false,
      _signalModalShowing: false
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
          common_vendor.index.__f__("error", "at pages/clockin/clockin.vue:200", "上传失败:", err);
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
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/clockin/clockin.vue:226", "删除云文件失败:", e);
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
    // ========== 加载打卡点（通过公共云函数） ==========
    async loadData(callback) {
      const employeeId = vk.getVuex("$user.userInfo.username");
      if (!employeeId) {
        vk.alert("没有获取到工号");
        return;
      }
      this.formData.employee_id = employeeId;
      try {
        const res = await vk.callFunction({
          url: "admin/hrm/clockin/pub/getClockinLocation",
          title: "加载打卡点...",
          data: {
            employee_id: employeeId
          }
        });
        if (res.code !== 0) {
          this.disableSubmit = true;
          this.is_range = false;
          this.is_range_content = res.msg || "打卡点加载失败";
          if (typeof callback === "function")
            callback();
          return;
        }
        const info = res.data || {};
        this.groupName = info.attendance_group_name || "";
        this.attendanceGroupId = info.attendance_group_id || "";
        if (!info.punch_location) {
          this.disableSubmit = true;
          this.is_range = false;
          this.is_range_content = "未匹配到打卡点，无法打卡";
          if (typeof callback === "function")
            callback();
          return;
        }
        this.punchLocation = info.punch_location;
        this.requiredSignalStrength = info.punch_location.signalStrength || 0;
        this.getCurrentAddress();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/clockin/clockin.vue:298", "加载打卡点异常:", e);
        this.disableSubmit = true;
        this.is_range = false;
        this.is_range_content = "打卡点加载异常";
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
    // 获取当前连接的 Wi-Fi 及信号强度
    getConnectedWifi() {
      common_vendor.index.startWifi({
        success: () => {
          common_vendor.index.getConnectedWifi({
            success: (res) => {
              this.bssid_current = res.wifi.BSSID || "无";
              this.ssid_current = res.wifi.SSID || "";
              this.signalStrength_current = res.wifi.signalStrength || 0;
              this.getCurrentAddress();
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/clockin/clockin.vue:327", "获取当前Wi-Fi失败", err);
              this.bssid_current = "获取失败";
              this.ssid_current = "";
              this.signalStrength_current = 0;
              this.getCurrentAddress();
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/clockin/clockin.vue:336", "启动Wi-Fi模块失败", err);
          this.bssid_current = "无法获取";
          this.ssid_current = "";
          this.signalStrength_current = 0;
          this.getCurrentAddress();
        }
      });
    },
    // 判断打卡范围（Wi-Fi 匹配 + 信号强度判断）
    getCurrentAddress() {
      if (!this.punchLocation) {
        this.is_range = false;
        this.canSubmitByWifi = false;
        this.disableSubmit = true;
        this.is_range_content = "未匹配到打卡点";
        return;
      }
      const settingBssid = this.punchLocation.bssid || "";
      const settingSsid = this.punchLocation.ssid || "";
      this.formData.setting_ssid = settingSsid;
      this.formData.setting_bssid = settingBssid;
      const currentBssid = this.bssid_current || "";
      const currentSsid = this.ssid_current || "";
      const matchWifi = currentBssid && currentBssid === settingBssid;
      const required = this.requiredSignalStrength || 0;
      if (!matchWifi) {
        this.is_range = false;
        this.canSubmitByWifi = false;
        this.disableSubmit = false;
        this.formData.type = "出差卡";
        this.is_range_content = "⚠️ 您已超出打卡范围，将按出差卡记录（需拍照）";
        this.formData.ssid = currentSsid || "无法获取";
        this.formData.bssid = currentBssid || "无法获取";
        return;
      }
      if (required > 0 && this.signalStrength_current < required) {
        this.is_range = false;
        this.canSubmitByWifi = false;
        this.disableSubmit = false;
        this.formData.type = "出差卡";
        this.is_range_content = `⚠️ 信号强度不足（当前 ${this.signalStrength_current}，需要 ${required}）`;
        this.formData.ssid = currentSsid;
        this.formData.bssid = currentBssid;
        this.showSignalModal(required, this.signalStrength_current);
        return;
      }
      this.is_range = true;
      this.canSubmitByWifi = true;
      this.disableSubmit = false;
      this.formData.type = "公司卡";
      this.is_range_content = "✅ 您已在打卡范围内，将按公司卡记录";
      this.formData.ssid = currentSsid;
      this.formData.bssid = currentBssid;
    },
    // 信号强度不达标弹窗
    showSignalModal(required, current) {
      if (this._signalModalShowing)
        return;
      this._signalModalShowing = true;
      common_vendor.index.showModal({
        title: "信号强度不足",
        content: `当前信号强度：${current}
设定信号强度：${required}

请靠近 Wi-Fi 路由器后重试，或按出差卡拍照提交。`,
        showCancel: true,
        confirmText: "重新检测",
        cancelText: "知道了",
        success: (res) => {
          this._signalModalShowing = false;
          if (res.confirm) {
            this.getConnectedWifi();
          }
        },
        fail: () => {
          this._signalModalShowing = false;
        }
      });
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
      if (this.disableSubmit)
        return vk.alert("当前无法打卡");
      if (!this.formData.bssid)
        return vk.alert("请先设定打卡点");
      if (!this.is_range && !this.formData.img)
        return vk.alert("出差打卡必须拍照上传");
      if (this.is_submit)
        return;
      if (this.is_range && this.requiredSignalStrength > 0) {
        if (this.signalStrength_current < this.requiredSignalStrength) {
          return this.showSignalModal(this.requiredSignalStrength, this.signalStrength_current);
        }
      }
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
    c: !$data.is_range && !$data.disableSubmit
  }, !$data.is_range && !$data.disableSubmit ? {
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
    f: common_vendor.t($data.formData.setting_ssid || "未设置"),
    g: common_vendor.t($data.formData.setting_bssid || "未设置"),
    h: common_vendor.t($data.bssid_current || "未连接"),
    i: common_vendor.t($data.signalStrength_current),
    j: $data.requiredSignalStrength > 0
  }, $data.requiredSignalStrength > 0 ? {
    k: common_vendor.t($data.requiredSignalStrength)
  } : {}, {
    l: $data.requiredSignalStrength > 0 && $data.signalStrength_current < $data.requiredSignalStrength ? 1 : "",
    m: common_vendor.t($data.groupName || "未匹配"),
    n: common_vendor.p({
      name: "camera",
      size: "32",
      color: "#2d8cff"
    }),
    o: !$data.is_range
  }, !$data.is_range ? {} : {}, {
    p: !$data.formData.img
  }, !$data.formData.img ? {
    q: common_vendor.p({
      name: "camera",
      size: "48",
      color: "#2979ff"
    }),
    r: common_vendor.o((...args) => $options.chooseAndUploadImage && $options.chooseAndUploadImage(...args), "44")
  } : {
    s: $data.formData.img,
    t: common_vendor.o((...args) => $options.previewImage && $options.previewImage(...args), "bd"),
    v: common_vendor.p({
      name: "close",
      size: "20",
      color: "#fff"
    }),
    w: common_vendor.o((...args) => $options.removeImage && $options.removeImage(...args), "64"),
    x: common_vendor.o((...args) => $options.chooseAndUploadImage && $options.chooseAndUploadImage(...args), "d2")
  }, {
    y: common_vendor.p({
      name: "compose",
      size: "32",
      color: "#2d8cff"
    }),
    z: $data.formData.remark,
    A: common_vendor.o(($event) => $data.formData.remark = $event.detail.value, "d1"),
    B: common_vendor.p({
      type: "location-filled",
      size: "48",
      color: $data.is_range ? "#4caf50" : "#f44336"
    }),
    C: common_vendor.t($data.is_range_content),
    D: common_vendor.n($data.is_range ? "text-success" : "text-danger"),
    E: common_vendor.t($data.formData.type || "未知"),
    F: common_vendor.t($data.time),
    G: common_vendor.t($data.disableSubmit ? "不可打卡" : "打卡"),
    H: common_vendor.o((...args) => $options.submit && $options.submit(...args), "7c"),
    I: $data.is_submit || $data.disableSubmit ? 1 : "",
    J: !$data.is_range ? 1 : "",
    K: $data.is_submit
  }, $data.is_submit ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-60f3b423"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/clockin/clockin.js.map
