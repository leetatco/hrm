"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "picker-color",
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    bottom: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      colorArr: [
        [
          "#000000",
          "#111111",
          "#222222",
          "#333333",
          "#444444",
          "#666666",
          "#999999",
          "#CCCCCC",
          "#EEEEEE",
          "#FFFFFF"
        ],
        [
          "#ff0000",
          "#ff0033",
          "#ff3399",
          "#ff33cc",
          "#cc00ff",
          "#9900ff",
          "#cc00cc",
          "#cc0099",
          "#cc3399",
          "#cc0066"
        ],
        [
          "#cc3300",
          "#cc6600",
          "#ff9933",
          "#ff9966",
          "#ff9999",
          "#ff99cc",
          "#ff99ff",
          "#cc66ff",
          "#9966ff",
          "#cc33ff"
        ],
        [
          "#663300",
          "#996600",
          "#996633",
          "#cc9900",
          "#a58800",
          "#cccc00",
          "#ffff66",
          "#ffff99",
          "#ffffcc",
          "#ffcccc"
        ],
        [
          "#336600",
          "#669900",
          "#009900",
          "#009933",
          "#00cc00",
          "#66ff66",
          "#339933",
          "#339966",
          "#009999",
          "#33cccc"
        ],
        [
          "#003366",
          "#336699",
          "#3366cc",
          "#0099ff",
          "#000099",
          "#0000cc",
          "#660066",
          "#993366",
          "#993333",
          "#800000"
        ]
      ],
      pickerColor: "",
      pickerArr: [-1, -1]
    };
  },
  methods: {
    picker(e) {
      let data = e.currentTarget.dataset;
      this.pickerColor = data.color;
      this.pickerArr = [data.index, data.i];
      this.$emit("callback", this.pickerColor);
    },
    hide() {
      this.$emit("callback", "");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.colorArr, (item, index, i0) => {
      return {
        a: common_vendor.f(item, (v, i, i1) => {
          return {
            a: i,
            b: v,
            c: v,
            d: i,
            e: index == $data.pickerArr[0] && i == $data.pickerArr[1] ? 1 : "",
            f: common_vendor.o((...args) => $options.picker && $options.picker(...args), i)
          };
        }),
        b: index,
        c: index
      };
    }),
    b: common_vendor.o((...args) => $options.hide && $options.hide(...args), "68"),
    c: $props.isShow
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e158bdf1"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/payslip/pickerColor.js.map
