"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FilePreviewDialog",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    fileData: {
      type: Object,
      default: () => ({
        url: "",
        name: "",
        type: "",
        size: 0,
        createTime: null
      })
    }
  },
  data() {
    return {
      // 支持的图片格式
      imageTypes: ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"],
      // 支持的Office文档格式
      officeTypes: [
        {
          ext: "doc",
          name: "Word文档",
          icon: "file-word"
        },
        {
          ext: "docx",
          name: "Word文档",
          icon: "file-word"
        },
        {
          ext: "xls",
          name: "Excel文档",
          icon: "file-excel"
        },
        {
          ext: "xlsx",
          name: "Excel文档",
          icon: "file-excel"
        },
        {
          ext: "ppt",
          name: "PPT文档",
          icon: "file-ppt"
        },
        {
          ext: "pptx",
          name: "PPT文档",
          icon: "file-ppt"
        }
      ]
    };
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },
    title() {
      return `文件预览 - ${this.fileData.name || "文件"}`;
    },
    isImageType() {
      if (!this.fileData.url)
        return false;
      const extension = this.getFileExtension(this.fileData.url);
      return this.imageTypes.includes(extension.toLowerCase());
    },
    isPdfType() {
      if (!this.fileData.url)
        return false;
      const extension = this.getFileExtension(this.fileData.url);
      return extension.toLowerCase() === "pdf";
    },
    isOfficeType() {
      if (!this.fileData.url)
        return false;
      const extension = this.getFileExtension(this.fileData.url);
      return this.officeTypes.some((item) => item.ext === extension.toLowerCase());
    },
    fileType() {
      if (!this.fileData.url)
        return "";
      const extension = this.getFileExtension(this.fileData.url);
      return extension ? extension.toUpperCase() : "未知类型";
    },
    getOfficeIcon() {
      if (!this.fileData.url)
        return "file-text";
      const extension = this.getFileExtension(this.fileData.url);
      const officeType = this.officeTypes.find((item) => item.ext === extension.toLowerCase());
      return officeType ? officeType.icon : "file-text";
    },
    getOfficeTypeName() {
      if (!this.fileData.url)
        return "Office文档";
      const extension = this.getFileExtension(this.fileData.url);
      const officeType = this.officeTypes.find((item) => item.ext === extension.toLowerCase());
      return officeType ? officeType.name : "Office文档";
    }
  },
  methods: {
    // 获取文件扩展名
    getFileExtension(url) {
      if (!url)
        return "";
      const cleanUrl = url.split(/[?#]/)[0];
      const filename = cleanUrl.split("/").pop() || "";
      return filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
    },
    handleDownload() {
      if (!this.fileData.url) {
        common_vendor.index.showToast({
          title: "无效的文件地址",
          icon: "none"
        });
        return;
      }
      this.$emit("download", this.fileData);
      this.handleClose();
    },
    // 预览图片
    previewImage() {
      if (this.isImageType) {
        common_vendor.index.previewImage({
          urls: [this.fileData.url],
          current: 0
        });
      }
    },
    // 在线预览Office文档
    handlePreviewOnline() {
      if (!this.isOfficeType || !this.fileData.url)
        return;
      const onlineUrl = `https://docs.qq.com/doc/${encodeURIComponent(this.fileData.url)}`;
      common_vendor.index.setClipboardData({
        data: onlineUrl,
        success: () => {
          common_vendor.index.showToast({
            title: "预览链接已复制，请在浏览器中打开",
            icon: "success",
            duration: 3e3
          });
        }
      });
    },
    // 下载文件
    // handleDownload() {
    // 	this.$emit('download', this.fileData);
    // },
    // 关闭对话框
    handleClose() {
      this.$emit("filePreviewClose", false);
    },
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0)
        return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp)
        return "-";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
  }
};
if (!Array) {
  const _easycom_u_loading2 = common_vendor.resolveComponent("u-loading");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_image2 = common_vendor.resolveComponent("u-image");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_modal2 = common_vendor.resolveComponent("u-modal");
  (_easycom_u_loading2 + _easycom_u_icon2 + _easycom_u_image2 + _easycom_u_button2 + _easycom_u_empty2 + _easycom_u_modal2)();
}
const _easycom_u_loading = () => "../../uni_modules/vk-uview-ui/components/u-loading/u-loading.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_image = () => "../../uni_modules/vk-uview-ui/components/u-image/u-image.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_modal = () => "../../uni_modules/vk-uview-ui/components/u-modal/u-modal.js";
if (!Math) {
  (_easycom_u_loading + _easycom_u_icon + _easycom_u_image + _easycom_u_button + _easycom_u_empty + _easycom_u_modal)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.fileData.url
  }, $props.fileData.url ? common_vendor.e({
    b: $options.isImageType
  }, $options.isImageType ? common_vendor.e({
    c: common_vendor.p({
      mode: "circle",
      color: "#2979ff",
      size: "40"
    }),
    d: common_vendor.p({
      name: "error-circle",
      size: "60",
      color: "#fa3534"
    }),
    e: common_vendor.o($options.previewImage, "d2"),
    f: common_vendor.p({
      src: $props.fileData.url,
      mode: "widthFix",
      width: "100%",
      height: "500rpx",
      ["lazy-load"]: true
    }),
    g: common_vendor.t($props.fileData.name),
    h: $props.fileData.size
  }, $props.fileData.size ? {
    i: common_vendor.t($options.formatFileSize($props.fileData.size))
  } : {}) : $options.isPdfType ? common_vendor.e({
    k: common_vendor.p({
      name: "file-text",
      size: "40",
      color: "#fa3534"
    }),
    l: common_vendor.t($props.fileData.name),
    m: common_vendor.p({
      name: "info-circle",
      size: "60",
      color: "#2979ff"
    }),
    n: common_vendor.p({
      name: "file-text",
      size: "24",
      color: "#666"
    }),
    o: $props.fileData.size
  }, $props.fileData.size ? {
    p: common_vendor.p({
      name: "info-circle",
      size: "24",
      color: "#666"
    }),
    q: common_vendor.t($options.formatFileSize($props.fileData.size))
  } : {}, {
    r: $props.fileData.createTime
  }, $props.fileData.createTime ? {
    s: common_vendor.p({
      name: "clock",
      size: "24",
      color: "#666"
    }),
    t: common_vendor.t($options.formatDate($props.fileData.createTime))
  } : {}) : $options.isOfficeType ? common_vendor.e({
    w: common_vendor.p({
      name: "file-text",
      size: "40",
      color: "#2979ff"
    }),
    x: common_vendor.t($props.fileData.name),
    y: common_vendor.p({
      name: $options.getOfficeIcon,
      size: "100",
      color: "#2979ff"
    }),
    z: common_vendor.p({
      name: "eye",
      size: "28"
    }),
    A: common_vendor.o($options.handlePreviewOnline, "05"),
    B: common_vendor.p({
      type: "primary",
      ["custom-style"]: {
        height: "70rpx",
        fontSize: "28rpx",
        marginBottom: "20rpx"
      }
    }),
    C: common_vendor.p({
      name: "download",
      size: "28"
    }),
    D: common_vendor.o($options.handleDownload, "13"),
    E: common_vendor.p({
      type: "success",
      ["custom-style"]: {
        height: "70rpx",
        fontSize: "28rpx"
      }
    }),
    F: common_vendor.p({
      name: "file-text",
      size: "24",
      color: "#666"
    }),
    G: common_vendor.t($options.getOfficeTypeName),
    H: $props.fileData.size
  }, $props.fileData.size ? {
    I: common_vendor.p({
      name: "info-circle",
      size: "24",
      color: "#666"
    }),
    J: common_vendor.t($options.formatFileSize($props.fileData.size))
  } : {}) : common_vendor.e({
    K: common_vendor.p({
      name: "file-text",
      size: "100",
      color: "#909399"
    }),
    L: common_vendor.p({
      name: "file-text",
      size: "24",
      color: "#666"
    }),
    M: common_vendor.t($props.fileData.name),
    N: $props.fileData.size
  }, $props.fileData.size ? {
    O: common_vendor.p({
      name: "info-circle",
      size: "24",
      color: "#666"
    }),
    P: common_vendor.t($options.formatFileSize($props.fileData.size))
  } : {}, {
    Q: $options.fileType
  }, $options.fileType ? {
    R: common_vendor.p({
      name: "tag",
      size: "24",
      color: "#666"
    }),
    S: common_vendor.t($options.fileType)
  } : {}), {
    j: $options.isPdfType,
    v: $options.isOfficeType
  }) : {
    T: common_vendor.p({
      mode: "error",
      icon: "/static/empty-error.png"
    })
  }, {
    U: common_vendor.o($options.handleClose, "c6"),
    V: common_vendor.p({
      type: "default",
      ["custom-style"]: {
        width: "200rpx",
        height: "70rpx",
        marginRight: "20rpx"
      }
    }),
    W: common_vendor.p({
      name: "download",
      size: "28"
    }),
    X: common_vendor.o($options.handleDownload, "9e"),
    Y: common_vendor.p({
      type: "primary",
      ["custom-style"]: {
        width: "200rpx",
        height: "70rpx"
      }
    }),
    Z: common_vendor.o(($event) => $options.show = $event, "04"),
    aa: common_vendor.p({
      title: $options.title,
      ["show-confirm-button"]: false,
      ["show-cancel-button"]: false,
      width: "800",
      zoom: false,
      ["mask-close-able"]: false,
      ["border-radius"]: 16,
      modelValue: $options.show
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-49798f59"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/file-preview-dialog/file-preview-dialog.js.map
