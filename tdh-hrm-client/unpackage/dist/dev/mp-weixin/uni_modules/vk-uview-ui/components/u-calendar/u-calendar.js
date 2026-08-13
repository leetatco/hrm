"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "u-calendar",
  emits: ["update:modelValue", "input", "change"],
  props: {
    // 通过双向绑定控制组件的弹出与收起
    value: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Boolean,
      default: false
    },
    safeAreaInsetBottom: {
      type: Boolean,
      default: false
    },
    // 是否允许通过点击遮罩关闭Picker
    maskCloseAble: {
      type: Boolean,
      default: true
    },
    // 弹出的z-index值
    zIndex: {
      type: [String, Number],
      default: 0
    },
    // 是否允许切换年份
    changeYear: {
      type: Boolean,
      default: true
    },
    // 是否允许切换月份
    changeMonth: {
      type: Boolean,
      default: true
    },
    // date-单个日期选择，range-开始日期+结束日期选择
    mode: {
      type: String,
      default: "date"
    },
    // 可切换的最大年份
    maxYear: {
      type: [Number, String],
      default: 2050
    },
    // 可切换的最小年份
    minYear: {
      type: [Number, String],
      default: 1950
    },
    // 最小可选日期(不在范围内日期禁用不可选)
    minDate: {
      type: [Number, String],
      default: "1950-01-01"
    },
    /**
     * 最大可选日期
     * 默认最大值为今天，之后的日期不可选
     * 2030-12-31
     * */
    maxDate: {
      type: [Number, String],
      default: ""
    },
    // 弹窗顶部左右两边的圆角值
    borderRadius: {
      type: [String, Number],
      default: 20
    },
    // 月份切换按钮箭头颜色
    monthArrowColor: {
      type: String,
      default: "#606266"
    },
    // 年份切换按钮箭头颜色
    yearArrowColor: {
      type: String,
      default: "#909399"
    },
    // 默认日期字体颜色
    color: {
      type: String,
      default: "#303133"
    },
    // 选中|起始结束日期背景色
    activeBgColor: {
      type: String,
      default: "#2979ff"
    },
    // 选中|起始结束日期字体颜色
    activeColor: {
      type: String,
      default: "#ffffff"
    },
    // 范围内日期背景色
    rangeBgColor: {
      type: String,
      default: "rgba(41,121,255,0.13)"
    },
    // 范围内日期字体颜色
    rangeColor: {
      type: String,
      default: "#2979ff"
    },
    // mode=range时生效，起始日期自定义文案
    startText: {
      type: String,
      default: "开始"
    },
    // mode=range时生效，结束日期自定义文案
    endText: {
      type: String,
      default: "结束"
    },
    //按钮样式类型
    btnType: {
      type: String,
      default: "primary"
    },
    // 当前选中日期带选中效果
    isActiveCurrent: {
      type: Boolean,
      default: true
    },
    // 切换年月是否触发事件 mode=date时生效
    isChange: {
      type: Boolean,
      default: false
    },
    // 是否显示右上角的关闭图标
    closeable: {
      type: Boolean,
      default: true
    },
    // 顶部的提示文字
    toolTip: {
      type: String,
      default: "选择日期"
    },
    // 遮罩的模糊度
    blur: {
      type: [Number, String],
      default: 0
    },
    confirmText: {
      type: String,
      default: "确定"
    },
    toText: {
      type: String,
      default: "至"
    },
    yearText: {
      type: String,
      default: "年"
    },
    monthText: {
      type: String,
      default: "月"
    }
  },
  data() {
    return {
      popupValue: false,
      // 星期几,值为1-7
      weekday: 1,
      weekdayArr: [],
      // 当前月有多少天
      days: 0,
      daysArr: [],
      showTitle: "",
      year: 2020,
      month: 0,
      day: 0,
      startYear: 0,
      startMonth: 0,
      startDay: 0,
      endYear: 0,
      endMonth: 0,
      endDay: 0,
      today: "",
      activeDate: "",
      startDate: "",
      endDate: "",
      isStart: true,
      min: null,
      max: null,
      weekDayZh: ["日", "一", "二", "三", "四", "五", "六"]
    };
  },
  computed: {
    valueCom() {
      return this.modelValue;
    },
    dataChange() {
      return `${this.mode}-${this.minDate}-${this.maxDate}`;
    },
    uZIndex() {
      return this.zIndex ? this.zIndex : this.$u.zIndex.popup;
    }
  },
  watch: {
    dataChange(val) {
      this.init();
    },
    valueCom: {
      immediate: true,
      handler(val) {
        this.popupValue = val;
      }
    }
  },
  created() {
    this.init();
  },
  methods: {
    getColor(index, type) {
      let color = type == 1 ? "" : this.color;
      let day = index + 1;
      let date = `${this.year}-${this.month}-${day}`;
      let timestamp = new Date(date.replace(/\-/g, "/")).getTime();
      let start = this.startDate.replace(/\-/g, "/");
      let end = this.endDate.replace(/\-/g, "/");
      if (this.isActiveCurrent && this.activeDate == date || this.startDate == date || this.endDate == date) {
        color = type == 1 ? this.activeBgColor : this.activeColor;
      } else if (this.endDate && timestamp > new Date(start).getTime() && timestamp < new Date(end).getTime()) {
        color = type == 1 ? this.rangeBgColor : this.rangeColor;
      }
      return color;
    },
    init() {
      let now = /* @__PURE__ */ new Date();
      this.year = now.getFullYear();
      this.month = now.getMonth() + 1;
      this.day = now.getDate();
      this.today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      this.activeDate = this.today;
      this.min = this.initDate(this.minDate);
      this.max = this.initDate(this.maxDate || this.today);
      this.startDate = "";
      this.startYear = 0;
      this.startMonth = 0;
      this.startDay = 0;
      this.endYear = 0;
      this.endMonth = 0;
      this.endDay = 0;
      this.endDate = "";
      this.isStart = true;
      this.changeData();
    },
    //日期处理
    initDate(date) {
      let fdate = date.split("-");
      return {
        year: Number(fdate[0] || 1920),
        month: Number(fdate[1] || 1),
        day: Number(fdate[2] || 1)
      };
    },
    openDisAbled: function(year, month, day) {
      let bool = true;
      let date = `${year}/${month}/${day}`;
      let min = `${this.min.year}/${this.min.month}/${this.min.day}`;
      let max = `${this.max.year}/${this.max.month}/${this.max.day}`;
      let timestamp = new Date(date).getTime();
      if (timestamp >= new Date(min).getTime() && timestamp <= new Date(max).getTime()) {
        bool = false;
      }
      return bool;
    },
    generateArray: function(start, end) {
      return Array.from(new Array(end + 1).keys()).slice(start);
    },
    formatNum: function(num) {
      return num < 10 ? "0" + num : num + "";
    },
    //一个月有多少天
    getMonthDay(year, month) {
      let days = new Date(year, month, 0).getDate();
      return days;
    },
    getWeekday(year, month) {
      let date = /* @__PURE__ */ new Date(`${year}/${month}/01 00:00:00`);
      return date.getDay();
    },
    checkRange(year) {
      let overstep = false;
      if (year < this.minYear || year > this.maxYear) {
        common_vendor.index.showToast({
          title: "日期超出范围啦~",
          icon: "none"
        });
        overstep = true;
      }
      return overstep;
    },
    changeMonthHandler(isAdd) {
      if (isAdd) {
        let month = this.month + 1;
        let year = month > 12 ? this.year + 1 : this.year;
        if (!this.checkRange(year)) {
          this.month = month > 12 ? 1 : month;
          this.year = year;
          this.changeData();
        }
      } else {
        let month = this.month - 1;
        let year = month < 1 ? this.year - 1 : this.year;
        if (!this.checkRange(year)) {
          this.month = month < 1 ? 12 : month;
          this.year = year;
          this.changeData();
        }
      }
    },
    changeYearHandler(isAdd) {
      let year = isAdd ? this.year + 1 : this.year - 1;
      if (!this.checkRange(year)) {
        this.year = year;
        this.changeData();
      }
    },
    changeData() {
      this.days = this.getMonthDay(this.year, this.month);
      this.daysArr = this.generateArray(1, this.days);
      this.weekday = this.getWeekday(this.year, this.month);
      this.weekdayArr = this.generateArray(1, this.weekday);
      this.showTitle = `${this.year}${this.yearText}${this.month}${this.monthText}`;
      if (this.isChange && this.mode == "date") {
        this.btnFix(true);
      }
    },
    dateClick: function(day) {
      day += 1;
      if (!this.openDisAbled(this.year, this.month, day)) {
        this.day = day;
        let date = `${this.year}-${this.month}-${day}`;
        if (this.mode == "date") {
          this.activeDate = date;
        } else {
          let compare = new Date(date.replace(/\-/g, "/")).getTime() < new Date(this.startDate.replace(/\-/g, "/")).getTime();
          if (this.isStart || compare) {
            this.startDate = date;
            this.startYear = this.year;
            this.startMonth = this.month;
            this.startDay = this.day;
            this.endYear = 0;
            this.endMonth = 0;
            this.endDay = 0;
            this.endDate = "";
            this.activeDate = "";
            this.isStart = false;
          } else {
            this.endDate = date;
            this.endYear = this.year;
            this.endMonth = this.month;
            this.endDay = this.day;
            this.isStart = true;
          }
        }
      }
    },
    close() {
      this.$emit("input", false);
      this.$emit("update:modelValue", false);
    },
    getWeekText(date) {
      date = /* @__PURE__ */ new Date(`${date.replace(/\-/g, "/")} 00:00:00`);
      let week = date.getDay();
      return "星期" + ["日", "一", "二", "三", "四", "五", "六"][week];
    },
    btnFix(show) {
      if (!show) {
        this.close();
      }
      if (this.mode == "date") {
        let arr = this.activeDate.split("-");
        let year = this.isChange ? this.year : Number(arr[0]);
        let month = this.isChange ? this.month : Number(arr[1]);
        let day = this.isChange ? this.day : Number(arr[2]);
        let days = this.getMonthDay(year, month);
        let result = `${year}-${this.formatNum(month)}-${this.formatNum(day)}`;
        let weekText = this.getWeekText(result);
        let isToday = false;
        if (`${year}-${month}-${day}` == this.today) {
          isToday = true;
        }
        this.$emit("change", {
          year,
          month,
          day,
          days,
          result,
          week: weekText,
          isToday
          // switch: show //是否是切换年月操作
        });
      } else {
        if (!this.startDate || !this.endDate)
          return;
        let startMonth = this.formatNum(this.startMonth);
        let startDay = this.formatNum(this.startDay);
        let startDate = `${this.startYear}-${startMonth}-${startDay}`;
        let startWeek = this.getWeekText(startDate);
        let endMonth = this.formatNum(this.endMonth);
        let endDay = this.formatNum(this.endDay);
        let endDate = `${this.endYear}-${endMonth}-${endDay}`;
        let endWeek = this.getWeekText(endDate);
        this.$emit("change", {
          startYear: this.startYear,
          startMonth: this.startMonth,
          startDay: this.startDay,
          startDate,
          startWeek,
          endYear: this.endYear,
          endMonth: this.endMonth,
          endDay: this.endDay,
          endDate,
          endWeek
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_easycom_u_icon2 + _easycom_u_button2 + _easycom_u_popup2)();
}
const _easycom_u_icon = () => "../u-icon/u-icon.js";
const _easycom_u_button = () => "../u-button/u-button.js";
const _easycom_u_popup = () => "../u-popup/u-popup.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_button + _easycom_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !_ctx.$slots["tooltip"]
  }, !_ctx.$slots["tooltip"] ? {
    b: common_vendor.t($props.toolTip)
  } : {}, {
    c: $props.changeYear
  }, $props.changeYear ? {
    d: common_vendor.o(($event) => $options.changeYearHandler(0), "c5"),
    e: common_vendor.p({
      name: "arrow-left-double",
      color: $props.yearArrowColor
    })
  } : {}, {
    f: $props.changeMonth
  }, $props.changeMonth ? {
    g: common_vendor.o(($event) => $options.changeMonthHandler(0), "ed"),
    h: common_vendor.p({
      name: "arrow-left",
      color: $props.monthArrowColor
    })
  } : {}, {
    i: common_vendor.t($data.showTitle),
    j: $props.changeMonth
  }, $props.changeMonth ? {
    k: common_vendor.o(($event) => $options.changeMonthHandler(1), "2f"),
    l: common_vendor.p({
      name: "arrow-right",
      color: $props.monthArrowColor
    })
  } : {}, {
    m: $props.changeYear
  }, $props.changeYear ? {
    n: common_vendor.o(($event) => $options.changeYearHandler(1), "7e"),
    o: common_vendor.p({
      name: "arrow-right-double",
      color: $props.yearArrowColor
    })
  } : {}, {
    p: common_vendor.f($data.weekDayZh, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index
      };
    }),
    q: common_vendor.f($data.weekdayArr, (item, index, i0) => {
      return {
        a: index
      };
    }),
    r: common_vendor.f($data.daysArr, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(index + 1),
        b: $options.getColor(index, 2),
        c: $props.mode == "range" && $data.startDate == `${$data.year}-${$data.month}-${index + 1}` && $data.startDate != $data.endDate
      }, $props.mode == "range" && $data.startDate == `${$data.year}-${$data.month}-${index + 1}` && $data.startDate != $data.endDate ? {
        d: common_vendor.t($props.startText),
        e: $props.activeColor
      } : {}, {
        f: $props.mode == "range" && $data.endDate == `${$data.year}-${$data.month}-${index + 1}`
      }, $props.mode == "range" && $data.endDate == `${$data.year}-${$data.month}-${index + 1}` ? {
        g: common_vendor.t($props.endText),
        h: $props.activeColor
      } : {}, {
        i: $options.openDisAbled($data.year, $data.month, index + 1) ? 1 : "",
        j: $props.mode == "range" && $data.startDate == `${$data.year}-${$data.month}-${index + 1}` || $props.mode == "date" ? 1 : "",
        k: $props.mode == "range" && $data.endDate == `${$data.year}-${$data.month}-${index + 1}` || $props.mode == "date" ? 1 : "",
        l: $options.getColor(index, 1),
        m: index,
        n: common_vendor.o(($event) => $options.dateClick(index), index)
      });
    }),
    s: common_vendor.t($data.month),
    t: common_vendor.t($props.mode == "date" ? $data.activeDate : $data.startDate),
    v: $data.endDate
  }, $data.endDate ? {
    w: common_vendor.t($props.toText),
    x: common_vendor.t($data.endDate)
  } : {}, {
    y: common_vendor.t($props.confirmText),
    z: common_vendor.o(($event) => $options.btnFix(false), "f7"),
    A: common_vendor.p({
      type: $props.btnType,
      shape: "circle",
      size: "default",
      disabled: $props.mode == "range" && !$data.endDate
    }),
    B: common_vendor.o($options.close, "1e"),
    C: common_vendor.o(($event) => $data.popupValue = $event, "74"),
    D: common_vendor.p({
      blur: $props.blur,
      closeable: true,
      maskCloseAble: $props.maskCloseAble,
      mode: "bottom",
      popup: false,
      length: "auto",
      safeAreaInsetBottom: $props.safeAreaInsetBottom,
      ["z-index"]: $options.uZIndex,
      ["border-radius"]: $props.borderRadius,
      closeable: $props.closeable,
      modelValue: $data.popupValue
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eedd27cf"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-calendar/u-calendar.js.map
