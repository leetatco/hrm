"use strict";
const common_vendor = require("../../../../common/vendor.js");
const localeObj = {
  "zh-Hans": {
    "startText": "获取验证码",
    "changeText": "X秒重新获取",
    "endText": "重新获取",
    "tryAgainInSeconds": "秒后再重试",
    "pleaseEnterTheCorrectMobileNumber": "请输入正确的手机号码",
    "sending": "发送中...",
    "verificationCodeSent": "验证码已发送",
    "triggerDayLevelFlowControl": "触发天级流控",
    "pleaseTryAgainTomorrow": "短信发送频繁，请明日再试！",
    "pleaseTryAgainIn1Hour": "短信发送频繁，请过1小时后再试！",
    "triggerMinuteLevelFlowControl": "触发分钟级流控",
    "pleaseTryAgainLater": "短信发送频繁，请稍后再试！"
  },
  "zh-Hant": {
    "startText": "獲取驗證碼",
    "changeText": "X秒重新獲取",
    "endText": "重新獲取",
    "tryAgainInSeconds": "秒後再重試",
    "pleaseEnterTheCorrectMobileNumber": "請輸入正確的手機號碼",
    "sending": "發送中...",
    "verificationCodeSent": "驗證碼已發送",
    "triggerDayLevelFlowControl": "觸發天級流控",
    "pleaseTryAgainTomorrow": "短信發送頻繁，請明日再試！",
    "pleaseTryAgainIn1Hour": "短信發送頻繁，請過1小時後再試！",
    "triggerMinuteLevelFlowControl": "觸發分鐘級流控",
    "pleaseTryAgainLater": "短信發送頻繁，請稍後再試！"
  },
  "en": {
    "startText": "Get code",
    "changeText": "X second reacquire",
    "endText": "Reacquire",
    "tryAgainInSeconds": "Try again in seconds",
    "pleaseEnterTheCorrectMobileNumber": "Please enter the correct mobile number",
    "sending": "Sending...",
    "verificationCodeSent": "Verification code sent",
    "triggerDayLevelFlowControl": "Trigger day level flow control",
    "pleaseTryAgainTomorrow": "SMS sent frequently, please try again tomorrow!",
    "pleaseTryAgainIn1Hour": "SMS sent frequently, please try again in 1 hour",
    "triggerMinuteLevelFlowControl": "Trigger minute level flow control",
    "pleaseTryAgainLater": "SMS sent frequently, please try again later"
  }
};
const _sfc_main = {
  name: "vk-data-verification-code",
  emits: ["start", "end", "change", "send", "codeChange", "error", "success"],
  props: {
    // 模式，mobile 手机验证码 custom 自定义验证码 默认 mobile
    mode: {
      type: String,
      default: "mobile"
    },
    // 接收短信的手机号
    mobile: {
      type: String
    },
    // 短信类型，如 register、login、bind、unbind
    type: {
      type: String,
      default: "login"
    },
    customStyle: {
      type: [String, Object]
    },
    // 倒计时总秒数
    seconds: {
      type: [String, Number],
      default: 60
    },
    // 尚未开始时提示
    startText: {
      type: String,
      default: ""
    },
    // 正在倒计时中的提示
    changeText: {
      type: String,
      default: ""
    },
    // 倒计时结束时的提示
    endText: {
      type: String,
      default: ""
    },
    // 是否在H5刷新或各端返回再进入时继续倒计时
    keepRunning: {
      type: Boolean,
      default: false
    },
    // 为了区分多个页面，或者一个页面多个倒计时组件本地存储的继续倒计时变了
    uniqueKey: {
      type: String,
      default: ""
    },
    // 是否需要检测手机号对应的账号是否存在，默认false：不检测 设置为true：会检测，如果检测到用户不存在，则不发短信。
    checkUserExist: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      secNum: this.seconds,
      timer: null,
      canGetCode: true,
      // 是否可以执行验证码操作
      tips: "",
      locale: {}
      // 语言
    };
  },
  created() {
    if (typeof vk !== "undefined") {
      let locale = vk.pubfn.getLocale();
      this.locale = localeObj[locale];
    } else {
      this.locale = localeObj["zh-Hans"];
    }
  },
  mounted() {
    this.checkKeepRunning();
  },
  watch: {
    seconds: {
      immediate: true,
      handler(n) {
        this.secNum = n;
      }
    }
  },
  // 计算属性
  computed: {
    startTextCom() {
      return this.startText || this.locale.startText || "获取验证码";
    },
    changeTextCom() {
      return this.changeText || this.locale.changeText || "X秒重新获取";
    },
    endTextCom() {
      return this.endText || this.locale.endText || "重新获取";
    }
  },
  methods: {
    checkKeepRunning() {
      let lastTimestamp = Number(common_vendor.index.getStorageSync(this.uniqueKey + "_$uCountDownTimestamp"));
      if (!lastTimestamp)
        return this.changeEvent(this.startTextCom);
      let nowTimestamp = Math.floor(+/* @__PURE__ */ new Date() / 1e3);
      if (this.keepRunning && lastTimestamp && lastTimestamp > nowTimestamp) {
        this.secNum = lastTimestamp - nowTimestamp;
        common_vendor.index.removeStorageSync(this.uniqueKey + "_$uCountDownTimestamp");
        this.start();
      } else {
        this.changeEvent(this.startTextCom);
      }
    },
    // 开始倒计时
    start() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.$emit("start");
      this.canGetCode = false;
      this.changeEvent(this.changeTextCom.replace(/x|X/, this.secNum));
      this.setTimeToStorage();
      this.timer = setInterval(() => {
        if (--this.secNum) {
          this.changeEvent(this.changeTextCom.replace(/x|X/, this.secNum));
        } else {
          clearInterval(this.timer);
          this.timer = null;
          this.changeEvent(this.endTextCom);
          this.secNum = this.seconds;
          this.$emit("end");
          this.canGetCode = true;
        }
      }, 1e3);
    },
    // 重置，可以让用户再次获取验证码
    reset(text) {
      this.canGetCode = true;
      clearInterval(this.timer);
      this.secNum = this.seconds;
      this.changeEvent(text || this.endTextCom);
    },
    changeEvent(text) {
      this.codeChange(text);
      this.$emit("change", text);
    },
    // 保存时间戳，为了防止倒计时尚未结束，H5刷新或者各端的右上角返回上一页再进来
    setTimeToStorage() {
      if (!this.keepRunning || !this.timer)
        return;
      if (this.secNum > 0 && this.secNum <= this.seconds) {
        let nowTimestamp = Math.floor(+/* @__PURE__ */ new Date() / 1e3);
        common_vendor.index.setStorage({
          key: this.uniqueKey + "_$uCountDownTimestamp",
          data: nowTimestamp + Number(this.secNum)
        });
      }
    },
    // 倒计时进行时
    codeChange(text) {
      this.tips = text;
      this.$emit("codeChange", text);
    },
    // 发送短信验证码
    sendSmsCode() {
      let that = this;
      let vk2 = common_vendor.index.vk;
      let {
        mobile,
        type,
        canGetCode,
        checkUserExist,
        secNum,
        mode
      } = that;
      if (!canGetCode) {
        vk2.toast(`${secNum}${that.locale.tryAgainInSeconds}`, "none");
        return;
      }
      if (mode === "custom") {
        that.$emit("send", { type });
        return;
      }
      if (!vk2.pubfn.test(mobile, "mobile")) {
        vk2.toast(that.locale.pleaseEnterTheCorrectMobileNumber, "none");
        return;
      }
      that.tips = that.locale.sending;
      vk2.userCenter.sendSmsCode({
        needAlert: false,
        data: {
          mobile,
          type,
          checkUserExist
        },
        success: function(data) {
          vk2.toast(that.locale.verificationCodeSent);
          that.start();
          that.$emit("success", data);
        },
        fail: function(err) {
          that.tips = that.startTextCom;
          if (err.errMsg && err.errMsg.indexOf("触发天级流控") > -1) {
            vk2.alert(that.locale.pleaseTryAgainTomorrow, () => {
              that.$emit("error", err);
            });
          } else if (err.errMsg && err.errMsg.indexOf("触发小时级流控") > -1) {
            vk2.alert(that.locale.pleaseTryAgainIn1Hour, () => {
              that.$emit("error", err);
            });
          } else if (err.errMsg && err.errMsg.indexOf("触发分钟级流控") > -1) {
            vk2.alert(that.locale.pleaseTryAgainLater, () => {
              that.$emit("error", err);
            });
          } else if (err.msg) {
            vk2.alert(err.msg, () => {
              that.$emit("error", err);
            });
          } else {
            vk2.alert(that.locale.pleaseTryAgainLater, () => {
              that.$emit("error", err);
            });
          }
        }
      });
    }
  },
  // 组件销毁的时候，清除定时器，否则定时器会继续存在，系统不会自动清除
  beforeUnmount() {
    this.setTimeToStorage();
    clearTimeout(this.timer);
    this.timer = null;
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.tips),
    b: common_vendor.r("d", {
      tips: $data.tips,
      secNum: $data.secNum
    }),
    c: common_vendor.o((...args) => $options.sendSmsCode && $options.sendSmsCode(...args), "4b"),
    d: common_vendor.s($props.customStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/components/vk-data-verification-code/vk-data-verification-code.js.map
