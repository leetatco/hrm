"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  emits: ["update:modelValue", "input", "confirm", "cancel"],
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
    // 列数据
    list: {
      type: Array,
      default() {
        return [];
      }
    },
    // 是否显示边框
    border: {
      type: Boolean,
      default: true
    },
    // "取消"按钮的颜色
    cancelColor: {
      type: String,
      default: "#606266"
    },
    // "确定"按钮的颜色
    confirmColor: {
      type: String,
      default: "#2979ff"
    },
    // 弹出的z-index值
    zIndex: {
      type: [String, Number],
      default: 0
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
    // 提供的默认选中的下标
    defaultValue: {
      type: Array,
      default() {
        return [0];
      }
    },
    // 模式选择，single-column-单列，mutil-column-多列，mutil-column-auto-多列联动
    mode: {
      type: String,
      default: "single-column"
    },
    // 自定义value属性名
    valueName: {
      type: String,
      default: "value"
    },
    // 自定义label属性名
    labelName: {
      type: String,
      default: "label"
    },
    // 自定义多列联动模式的children属性名
    childName: {
      type: String,
      default: "children"
    },
    // 顶部标题
    title: {
      type: String,
      default: ""
    },
    // 取消按钮的文字
    cancelText: {
      type: String,
      default: "取消"
    },
    // 确认按钮的文字
    confirmText: {
      type: String,
      default: "确认"
    },
    // 遮罩的模糊度
    blur: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      popupValue: false,
      // 用于列改变时，保存当前的索引，下一次变化时比较得出是哪一列发生了变化
      defaultSelector: [0],
      // picker-view的数据
      columnData: [],
      // 每次队列发生变化时，保存选择的结果
      selectValue: [],
      // 上一次列变化时的index
      lastSelectIndex: [],
      // 列数
      columnNum: 0,
      // 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
      moving: false,
      reset: false
    };
  },
  watch: {
    // 在select弹起的时候，重新初始化所有数据
    valueCom: {
      immediate: true,
      handler(val) {
        if (val) {
          this.reset = true;
          setTimeout(() => this.init(), 10);
        }
        this.popupValue = val;
      }
    }
  },
  computed: {
    uZIndex() {
      return this.zIndex ? this.zIndex : this.$u.zIndex.popup;
    },
    valueCom() {
      return this.modelValue;
    },
    // 用来兼容小程序、App、h5
    showColumnCom() {
      return !this.reset;
    }
  },
  methods: {
    // 标识滑动开始，只有微信小程序才有这样的事件
    pickstart() {
      this.moving = true;
    },
    // 标识滑动结束
    pickend() {
      this.moving = false;
    },
    init() {
      this.reset = false;
      this.setColumnNum();
      this.setDefaultSelector();
      this.setColumnData();
      this.setSelectValue();
    },
    // 获取默认选中列下标
    setDefaultSelector() {
      this.defaultSelector = this.defaultValue.length == this.columnNum ? this.defaultValue : Array(this.columnNum).fill(0);
      this.lastSelectIndex = this.$u.deepClone(this.defaultSelector);
    },
    // 计算列数
    setColumnNum() {
      if (this.mode == "single-column")
        this.columnNum = 1;
      else if (this.mode == "mutil-column")
        this.columnNum = this.list.length;
      else if (this.mode == "mutil-column-auto") {
        let num = 1;
        let column = this.list;
        while (column[0][this.childName]) {
          column = column[0] ? column[0][this.childName] : {};
          num++;
        }
        this.columnNum = num;
      }
    },
    // 获取需要展示在picker中的列数据
    setColumnData() {
      let data = [];
      this.selectValue = [];
      if (this.mode == "mutil-column-auto") {
        let column = this.list[this.defaultSelector.length ? this.defaultSelector[0] : 0];
        for (let i = 0; i < this.columnNum; i++) {
          if (i == 0) {
            data[i] = this.list;
            column = column[this.childName];
          } else {
            data[i] = column;
            column = column[this.defaultSelector[i]][this.childName];
          }
        }
      } else if (this.mode == "single-column") {
        data[0] = this.list;
      } else {
        data = this.list;
      }
      this.columnData = data;
    },
    // 获取默认选中的值，如果没有设置defaultValue，就默认选中每列的第一个
    setSelectValue() {
      let tmp = null;
      for (let i = 0; i < this.columnNum; i++) {
        tmp = this.columnData[i][this.defaultSelector[i]];
        let data = {
          index: this.defaultSelector[i],
          value: tmp ? tmp[this.valueName] : null,
          label: tmp ? tmp[this.labelName] : null
        };
        if (tmp && tmp.extra !== void 0)
          data.extra = tmp.extra;
        this.selectValue.push(data);
      }
    },
    // 列选项
    columnChange(e) {
      let index = null;
      let columnIndex = e.detail.value;
      this.selectValue = [];
      if (this.mode == "mutil-column-auto") {
        this.lastSelectIndex.map((val, idx) => {
          if (val != columnIndex[idx])
            index = idx;
        });
        this.defaultSelector = columnIndex;
        for (let i = index + 1; i < this.columnNum; i++) {
          this.columnData[i] = this.columnData[i - 1][i - 1 == index ? columnIndex[index] : 0][this.childName];
          this.defaultSelector[i] = 0;
        }
        columnIndex.map((item, index2) => {
          let data = this.columnData[index2][columnIndex[index2]];
          let tmp = {
            index: columnIndex[index2],
            value: data ? data[this.valueName] : null,
            label: data ? data[this.labelName] : null
          };
          if (data && data.extra !== void 0)
            tmp.extra = data.extra;
          this.selectValue.push(tmp);
        });
        this.lastSelectIndex = columnIndex;
      } else if (this.mode == "single-column") {
        let data = this.columnData[0][columnIndex[0]];
        let tmp = {
          index: columnIndex[0],
          value: data ? data[this.valueName] : null,
          label: data ? data[this.labelName] : null
        };
        if (data && data.extra !== void 0)
          tmp.extra = data.extra;
        this.selectValue.push(tmp);
        this.lastSelectIndex = columnIndex;
      } else if (this.mode == "mutil-column") {
        columnIndex.map((item, index2) => {
          let data = this.columnData[index2][columnIndex[index2]];
          let tmp = {
            index: columnIndex[index2],
            value: data ? data[this.valueName] : null,
            label: data ? data[this.labelName] : null
          };
          if (data && data.extra !== void 0)
            tmp.extra = data.extra;
          this.selectValue.push(tmp);
        });
        this.lastSelectIndex = columnIndex;
      }
    },
    close() {
      this.$emit("input", false);
      this.$emit("update:modelValue", false);
    },
    // 点击确定或者取消
    getResult(event = null) {
      if (this.moving)
        return;
      if (event)
        this.$emit(event, this.selectValue);
      this.close();
    },
    selectHandler() {
      this.$emit("click");
    }
  }
};
if (!Array) {
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  _easycom_u_popup2();
}
const _easycom_u_popup = () => "../u-popup/u-popup.js";
if (!Math) {
  _easycom_u_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($props.cancelText),
    b: $props.cancelColor,
    c: common_vendor.o(($event) => $options.getResult("cancel"), "ed"),
    d: common_vendor.t($props.title),
    e: common_vendor.t($props.confirmText),
    f: $data.moving ? $props.cancelColor : $props.confirmColor,
    g: common_vendor.o(() => {
    }, "c1"),
    h: common_vendor.o(($event) => $options.getResult("confirm"), "f0"),
    i: common_vendor.o(() => {
    }, "02"),
    j: $data.columnData && $data.columnData.length > 0
  }, $data.columnData && $data.columnData.length > 0 ? common_vendor.e({
    k: $options.showColumnCom
  }, $options.showColumnCom ? {
    l: common_vendor.f($data.columnData, (item, index, i0) => {
      return {
        a: common_vendor.f(item, (item1, index1, i1) => {
          return {
            a: common_vendor.t(item1[$props.labelName]),
            b: index1
          };
        }),
        b: index
      };
    })
  } : {}, {
    m: common_vendor.o((...args) => $options.columnChange && $options.columnChange(...args), "f9"),
    n: $data.defaultSelector,
    o: common_vendor.o((...args) => $options.pickstart && $options.pickstart(...args), "7a"),
    p: common_vendor.o((...args) => $options.pickend && $options.pickend(...args), "8e")
  }) : {}, {
    q: common_vendor.o($options.close, "86"),
    r: common_vendor.o(($event) => $data.popupValue = $event, "08"),
    s: common_vendor.p({
      blur: $props.blur,
      maskCloseAble: $props.maskCloseAble,
      mode: "bottom",
      popup: false,
      length: "auto",
      safeAreaInsetBottom: $props.safeAreaInsetBottom,
      ["z-index"]: $options.uZIndex,
      modelValue: $data.popupValue
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2ab5fcb0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/components/u-select/u-select.js.map
