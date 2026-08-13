"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      show: false,
      type: "text",
      // 'loading', 'text', 'success', 'error'
      text: "",
      isHorizontal: true,
      // 是否启用横屏旋转（保持与签名界面方向一致）
      timer: null
    };
  },
  methods: {
    // 阻止冒泡的空函数
    noop() {
    },
    // 关闭遮罩（仅非 loading 状态可关闭）
    closeMask() {
      if (this.type === "loading")
        return;
      this.hide();
    },
    // 显示加载（需手动关闭）
    showLoading(text = "加载中...") {
      this.show = true;
      this.type = "loading";
      this.text = text;
      this.clearTimer();
    },
    // 显示文字提示（自动关闭）
    showToast(text, duration = 1500) {
      this.show = true;
      this.type = "text";
      this.text = text;
      this.clearTimer();
      this.setTimer(duration);
    },
    // 隐藏
    hide() {
      this.show = false;
      this.type = "text";
      this.text = "";
      this.clearTimer();
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    setTimer(duration) {
      this.timer = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.show
  }, $data.show ? common_vendor.e({
    b: $data.type === "loading"
  }, $data.type === "loading" ? {
    c: common_vendor.t($data.text || "加载中...")
  } : $data.type === "text" ? {
    e: common_vendor.t($data.text)
  } : {}, {
    d: $data.type === "text",
    f: $data.isHorizontal ? 1 : "",
    g: common_vendor.o((...args) => $options.noop && $options.noop(...args), "49"),
    h: common_vendor.o((...args) => $options.closeMask && $options.closeMask(...args), "80")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-63769bba"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/custom-toast/custom-toast.js.map
