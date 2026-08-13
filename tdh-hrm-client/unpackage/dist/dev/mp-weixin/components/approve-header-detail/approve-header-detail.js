"use strict";
const common_vendor = require("../../common/vendor.js");
const ApproveWorkFlow = () => "../approve-work-flow/approve-work-flow.js";
const _sfc_main = {
  name: "ApproveHeaderDetail",
  components: {
    ApproveWorkFlow
  },
  props: {
    // 数据相关
    detailData: {
      type: Object,
      default: null
    },
    formSchema: {
      type: Object,
      default: null
    },
    processInfo: {
      type: Object,
      default: () => ({
        tasks: [],
        instance: null
      })
    },
    statusHistory: {
      type: Array,
      default: () => []
    },
    currentTasks: {
      type: Array,
      default: () => []
    },
    returnInfo: {
      type: Object,
      default: null
    },
    // 显示控制
    showBasicInfo: {
      type: Boolean,
      default: true
    },
    showReturnInfo: {
      type: Boolean,
      default: false
    },
    showApprovalFlow: {
      type: Boolean,
      default: true
    },
    showCurrentTask: {
      type: Boolean,
      default: false
    },
    showHandleForm: {
      type: Boolean,
      default: false
    },
    showEditPrompt: {
      type: Boolean,
      default: false
    },
    // 标题自定义
    basicInfoTitle: {
      type: String,
      default: "基本信息"
    },
    formInfoTitle: {
      type: String,
      default: "申请信息"
    },
    handleFormTitle: {
      type: String,
      default: "处理方式"
    },
    // 表单相关
    handleForm: {
      type: Object,
      default: () => ({
        action: "resubmit",
        modify_comment: "",
        withdraw_reason: ""
      })
    },
    handleFormRules: {
      type: Object,
      default: () => ({})
    },
    // 工具函数
    fieldValueFormatter: {
      type: Function,
      default: null
    },
    formTypeConfigs: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      defaultHandleFormRules: {
        action: [{
          required: true,
          message: "请选择处理方式",
          trigger: ["change"]
        }],
        modify_comment: [{
          validator: (rule, value, callback) => {
            if (this.handleForm.action === "resubmit" && !value) {
              callback(new Error("请填写修改说明"));
            } else {
              callback();
            }
          },
          trigger: ["blur", "change"]
        }],
        withdraw_reason: [{
          validator: (rule, value, callback) => {
            if (this.handleForm.action === "withdraw" && !value) {
              callback(new Error("请填写撤回原因"));
            } else {
              callback();
            }
          },
          trigger: ["blur", "change"]
        }]
      }
    };
  },
  computed: {
    mergedHandleFormRules() {
      return {
        ...this.defaultHandleFormRules,
        ...this.handleFormRules
      };
    },
    basicInfoList() {
      if (!this.detailData)
        return [];
      return [
        {
          key: "id",
          label: "申请单号",
          value: this.detailData._id || "-",
          type: "text"
        },
        {
          key: "applicant",
          label: "申请人",
          value: this.detailData.applicant_name || "-",
          type: "text"
        },
        {
          key: "department",
          label: "申请部门",
          value: this.detailData.applicant_department || "-",
          type: "text"
        },
        {
          key: "type",
          label: "申请类型",
          value: this.getFormTypeName(this.detailData.form_type_code),
          type: "text"
        },
        {
          key: "status",
          label: "申请状态",
          value: this.getStatusText(this.detailData.status),
          type: "status"
        },
        {
          key: "time",
          label: "申请时间",
          value: this.formatDate(this.detailData._add_time),
          type: "text"
        },
        {
          key: "currentTask",
          label: "当前环节",
          value: this.detailData.current_task || "-",
          type: "text"
        }
      ];
    }
  },
  methods: {
    // 表单验证
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs.handleFormRef.validate().then((res) => resolve(res)).catch((err) => reject(err));
      });
    },
    clearFormValidation() {
      if (this.$refs.handleFormRef)
        this.$refs.handleFormRef.clearValidate();
    },
    handleFileAction(action, file) {
      if (action === "preview") {
        this.$emit("preview-file", file);
      } else if (action === "download") {
        this.$emit("download-file", file);
      }
    },
    handleEditApplication() {
      this.$emit("edit-application");
    },
    onHandleActionChange(action) {
      this.$emit("handle-action-change", action);
    },
    getFileName(url) {
      if (!url)
        return "未知文件";
      return url.split("/").pop();
    },
    formatFileSize(bytes) {
      if (!bytes)
        return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
    // 获取各类字段
    getNormalFields() {
      var _a, _b;
      return ((_b = (_a = this.formSchema) == null ? void 0 : _a.fields) == null ? void 0 : _b.filter((f) => !["textarea", "file", "array<object>"].includes(f.type))) || [];
    },
    getTextareaFields() {
      var _a, _b;
      return ((_b = (_a = this.formSchema) == null ? void 0 : _a.fields) == null ? void 0 : _b.filter((f) => f.type === "textarea")) || [];
    },
    getArrayObjectFields() {
      var _a, _b;
      return ((_b = (_a = this.formSchema) == null ? void 0 : _a.fields) == null ? void 0 : _b.filter((f) => f.type === "array<object>")) || [];
    },
    getFileFields() {
      var _a, _b;
      return ((_b = (_a = this.formSchema) == null ? void 0 : _a.fields) == null ? void 0 : _b.filter((f) => f.type === "file")) || [];
    },
    getFieldValue(fieldName) {
      var _a, _b;
      return (_b = (_a = this.detailData) == null ? void 0 : _a.form_data) == null ? void 0 : _b[fieldName];
    },
    getFieldDisplayValue(field) {
      const value = this.getFieldValue(field.name);
      if (this.fieldValueFormatter) {
        const formatted = this.fieldValueFormatter(field.name, value, field);
        if (formatted !== void 0)
          return formatted;
      }
      if (value == null || value === "")
        return "-";
      if (field.displayNameKey) {
        const displayValue = this.getFieldValue(field.displayNameKey);
        if (displayValue != null && displayValue !== "")
          return displayValue;
      }
      const selectTypes = ["select", "remote-select", "table-select", "cascader"];
      if (selectTypes.includes(field.type)) {
        if (field.options && Array.isArray(field.options)) {
          const option = field.options.find((opt) => opt.value === value);
          if (option)
            return option.label;
        }
        const labelKey = field.name + "_label";
        const labelValue = this.getFieldValue(labelKey);
        if (labelValue != null && labelValue !== "")
          return labelValue;
        return value;
      }
      if (field.type === "date" || field.type === "datetime") {
        const format = field.type === "date" ? "yyyy-MM-dd" : "yyyy-MM-dd hh:mm:ss";
        return this.formatDate(value, format);
      }
      return value;
    },
    // 格式化 array<object> 项
    formatArrayObjectItem(item, formatConfig) {
      if (!formatConfig)
        return JSON.stringify(item);
      if (typeof formatConfig === "string") {
        return this.formatWithStringTemplate(item, formatConfig);
      }
      if (typeof formatConfig === "function") {
        return formatConfig(item);
      }
      if (Array.isArray(formatConfig)) {
        const parts = formatConfig.map((fc) => {
          let fieldName, label;
          if (typeof fc === "string") {
            fieldName = fc;
            label = fc;
          } else if (fc && typeof fc === "object") {
            fieldName = fc.name || fc.field;
            label = fc.label || fieldName;
          } else {
            return "";
          }
          const val = this.getNestedProperty(item, fieldName);
          const displayVal = fc.transform && typeof fc.transform === "function" ? fc.transform(val) : val;
          return `<span style="color:#666;">${label}:</span> <span style="color:#333;font-weight:500;">${displayVal !== void 0 && displayVal !== null ? displayVal : ""}</span>`;
        });
        return parts.filter((p) => p).join("<br>");
      }
      return JSON.stringify(item);
    },
    formatWithStringTemplate(item, template) {
      return template.replace(/\${([^}]+)}/g, (match, fieldName) => {
        const parts = fieldName.split(/[.[\]]/).filter((p) => p);
        let val = item;
        for (const p of parts) {
          if (val && typeof val === "object" && p in val)
            val = val[p];
          else
            return "";
        }
        return val !== void 0 && val !== null ? val : "";
      });
    },
    getNestedProperty(obj, path) {
      const parts = path.split(/[.[\]]/).filter((p) => p);
      let val = obj;
      for (const p of parts) {
        if (val && typeof val === "object" && p in val)
          val = val[p];
        else
          return void 0;
      }
      return val;
    },
    getFormTypeName(formTypeCode) {
      const formType = this.formTypeConfigs[formTypeCode];
      return formType ? formType.name : formTypeCode;
    },
    getStatusType(status) {
      const map = {
        draft: "info",
        pending: "warning",
        approved: "success",
        rejected: "error",
        cancelled: "info",
        withdrawn: "info",
        returned: "warning",
        completed: "success"
      };
      return map[status] || "info";
    },
    getStatusText(status) {
      const map = {
        draft: "草稿",
        pending: "审批中",
        approved: "已通过",
        rejected: "已驳回",
        cancelled: "已取消",
        withdrawn: "已撤回",
        returned: "已退回",
        completed: "已完成"
      };
      return map[status] || status;
    },
    formatDate(timestamp, formatStr) {
      if (!timestamp)
        return "-";
      const vk = common_vendor.index.vk;
      return vk.pubfn.timeFormat(timestamp, formatStr || "yyyy-MM-dd hh:mm:ss");
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_tag2 = common_vendor.resolveComponent("u-tag");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_approve_work_flow2 = common_vendor.resolveComponent("approve-work-flow");
  const _easycom_u_radio2 = common_vendor.resolveComponent("u-radio");
  const _easycom_u_radio_group2 = common_vendor.resolveComponent("u-radio-group");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _component_u_alert = common_vendor.resolveComponent("u-alert");
  (_easycom_u_icon2 + _easycom_u_tag2 + _easycom_u_button2 + _easycom_approve_work_flow2 + _easycom_u_radio2 + _easycom_u_radio_group2 + _easycom_u_form_item2 + _easycom_u_input2 + _easycom_u_form2 + _component_u_alert)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_tag = () => "../../uni_modules/vk-uview-ui/components/u-tag/u-tag.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_approve_work_flow = () => "../approve-work-flow/approve-work-flow.js";
const _easycom_u_radio = () => "../../uni_modules/vk-uview-ui/components/u-radio/u-radio.js";
const _easycom_u_radio_group = () => "../../uni_modules/vk-uview-ui/components/u-radio-group/u-radio-group.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_tag + _easycom_u_button + _easycom_approve_work_flow + _easycom_u_radio + _easycom_u_radio_group + _easycom_u_form_item + _easycom_u_input + _easycom_u_form)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.showBasicInfo
  }, $props.showBasicInfo ? {
    b: common_vendor.p({
      name: "info-circle",
      size: "36",
      color: "#2979ff"
    }),
    c: common_vendor.t($props.basicInfoTitle),
    d: common_vendor.f($options.basicInfoList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.label),
        b: item.type === "status"
      }, item.type === "status" ? {
        c: "c500772c-1-" + i0,
        d: common_vendor.p({
          text: item.value,
          type: $options.getStatusType(item.value),
          size: "mini",
          shape: "circle"
        })
      } : {
        e: common_vendor.t(item.value)
      }, {
        f: common_vendor.n(item.type),
        g: item.key
      });
    })
  } : {}, {
    e: $props.showReturnInfo && $props.returnInfo
  }, $props.showReturnInfo && $props.returnInfo ? common_vendor.e({
    f: common_vendor.p({
      name: "back",
      size: "36",
      color: "#fa3534"
    }),
    g: common_vendor.p({
      name: "close-circle",
      size: "24",
      color: "#fa3534"
    }),
    h: common_vendor.p({
      name: "info-circle",
      size: "24",
      color: "#666"
    }),
    i: common_vendor.t($props.returnInfo.returnReason || "无"),
    j: common_vendor.p({
      name: "list-dot",
      size: "24",
      color: "#666"
    }),
    k: common_vendor.t($props.returnInfo.returnedFrom || "-"),
    l: common_vendor.p({
      name: "clock",
      size: "24",
      color: "#666"
    }),
    m: common_vendor.t($options.formatDate($props.returnInfo.returnTime)),
    n: $props.returnInfo.task
  }, $props.returnInfo.task ? {
    o: common_vendor.p({
      name: "arrow-right",
      size: "24",
      color: "#666"
    }),
    p: common_vendor.p({
      text: $props.returnInfo.task.task_name,
      type: "warning",
      size: "mini",
      shape: "circle"
    })
  } : {}) : {}, {
    q: $props.formSchema && $props.formSchema.fields
  }, $props.formSchema && $props.formSchema.fields ? common_vendor.e({
    r: common_vendor.p({
      name: "file-text",
      size: "36",
      color: "#2979ff"
    }),
    s: common_vendor.t($props.formInfoTitle),
    t: $options.getNormalFields().length > 0
  }, $options.getNormalFields().length > 0 ? {
    v: common_vendor.f($options.getNormalFields(), (field, k0, i0) => {
      return {
        a: common_vendor.t(field.label),
        b: common_vendor.t($options.getFieldDisplayValue(field)),
        c: field.name
      };
    })
  } : {}, {
    w: common_vendor.f($options.getArrayObjectFields(), (field, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(field.label),
        b: $options.getFieldValue(field.name) && $options.getFieldValue(field.name).length
      }, $options.getFieldValue(field.name) && $options.getFieldValue(field.name).length ? {
        c: common_vendor.f($options.getFieldValue(field.name), (item, index, i1) => {
          return common_vendor.e({
            a: $options.formatArrayObjectItem(item, field.itemFormat),
            b: index < $options.getFieldValue(field.name).length - 1
          }, index < $options.getFieldValue(field.name).length - 1 ? {} : {}, {
            c: index
          });
        })
      } : {}, {
        d: field.name + "_array"
      });
    }),
    x: common_vendor.f($options.getTextareaFields(), (field, k0, i0) => {
      return {
        a: common_vendor.t(field.label),
        b: common_vendor.t($options.getFieldDisplayValue(field)),
        c: field.name + "_textarea"
      };
    }),
    y: common_vendor.f($options.getFileFields(), (field, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(field.label),
        b: $options.getFieldValue(field.name) && $options.getFieldValue(field.name).length > 0
      }, $options.getFieldValue(field.name) && $options.getFieldValue(field.name).length > 0 ? {
        c: common_vendor.f($options.getFieldValue(field.name), (file, index, i1) => {
          return common_vendor.e({
            a: "c500772c-10-" + i0 + "-" + i1,
            b: common_vendor.t(file.name || $options.getFileName(file.url)),
            c: file.size
          }, file.size ? {
            d: common_vendor.t($options.formatFileSize(file.size))
          } : {}, {
            e: common_vendor.o(($event) => $options.handleFileAction("preview", file), index),
            f: common_vendor.o(($event) => $options.handleFileAction("download", file), index),
            g: "c500772c-11-" + i0 + "-" + i1,
            h: common_vendor.o(($event) => $options.handleFileAction("preview", file), index),
            i: "c500772c-12-" + i0 + "-" + i1,
            j: index
          });
        }),
        d: common_vendor.p({
          name: "file-text",
          size: "28",
          color: "#2979ff"
        }),
        e: common_vendor.p({
          type: "primary",
          size: "mini",
          ["custom-style"]: {
            marginLeft: "10rpx",
            height: "50rpx",
            fontSize: "24rpx"
          }
        }),
        f: common_vendor.p({
          type: "default",
          size: "mini",
          ["custom-style"]: {
            marginLeft: "10rpx",
            height: "50rpx",
            fontSize: "24rpx"
          }
        })
      } : {}, {
        g: field.name + "_file"
      });
    })
  }) : {}, {
    z: $props.showApprovalFlow && $props.processInfo.tasks && $props.processInfo.tasks.length > 0
  }, $props.showApprovalFlow && $props.processInfo.tasks && $props.processInfo.tasks.length > 0 ? {
    A: common_vendor.p({
      name: "list-dot",
      size: "36",
      color: "#2979ff"
    }),
    B: common_vendor.p({
      tasks: $props.processInfo.tasks,
      history: $props.statusHistory,
      ["create-record"]: {
        create_time: $props.detailData._add_time,
        operator_name: $props.detailData.applicant_name,
        comment: "创建申请"
      },
      ["format-date-fn"]: $options.formatDate,
      ["history-title"]: "审批记录"
    })
  } : {}, {
    C: $props.showCurrentTask && $props.currentTasks && $props.currentTasks.length > 0
  }, $props.showCurrentTask && $props.currentTasks && $props.currentTasks.length > 0 ? {
    D: common_vendor.p({
      name: "clock-fill",
      size: "36",
      color: "#f0ad4e"
    }),
    E: common_vendor.f($props.currentTasks, (task, index, i0) => {
      return common_vendor.e({
        a: "c500772c-16-" + i0,
        b: common_vendor.t(task.task_name),
        c: "c500772c-17-" + i0,
        d: "c500772c-18-" + i0,
        e: common_vendor.t(task.assignee_name || task.assignee),
        f: "c500772c-19-" + i0,
        g: common_vendor.t($options.formatDate(task._add_time)),
        h: task.due_date
      }, task.due_date ? {
        i: "c500772c-20-" + i0,
        j: common_vendor.p({
          name: "calendar",
          size: "24",
          color: "#fa3534"
        }),
        k: common_vendor.t($options.formatDate(task.due_date))
      } : {}, {
        l: index
      });
    }),
    F: common_vendor.p({
      name: "checkbox-mark",
      size: "28",
      color: "#f0ad4e"
    }),
    G: common_vendor.p({
      text: "待处理",
      type: "warning",
      size: "mini",
      shape: "circle"
    }),
    H: common_vendor.p({
      name: "account",
      size: "24",
      color: "#666"
    }),
    I: common_vendor.p({
      name: "clock",
      size: "24",
      color: "#666"
    })
  } : {}, {
    J: $props.showHandleForm
  }, $props.showHandleForm ? common_vendor.e({
    K: common_vendor.p({
      name: "edit-pen",
      size: "36",
      color: "#2979ff"
    }),
    L: common_vendor.t($props.handleFormTitle),
    M: common_vendor.p({
      name: "resubmit",
      label: "重新提交",
      size: "28"
    }),
    N: common_vendor.p({
      name: "withdraw",
      label: "撤回申请",
      size: "28"
    }),
    O: common_vendor.o($options.onHandleActionChange, "23"),
    P: common_vendor.o(($event) => $props.handleForm.action = $event, "c7"),
    Q: common_vendor.p({
      modelValue: $props.handleForm.action
    }),
    R: common_vendor.p({
      label: "处理方式",
      prop: "action",
      ["border-bottom"]: false
    }),
    S: $props.handleForm.action === "resubmit"
  }, $props.handleForm.action === "resubmit" ? {
    T: common_vendor.o(($event) => $props.handleForm.modify_comment = $event, "f5"),
    U: common_vendor.p({
      type: "textarea",
      placeholder: "请说明修改的内容",
      maxlength: "500",
      height: 120,
      count: true,
      border: true,
      modelValue: $props.handleForm.modify_comment
    }),
    V: common_vendor.p({
      label: "修改说明",
      prop: "modify_comment",
      ["border-bottom"]: false
    })
  } : {}, {
    W: $props.handleForm.action === "withdraw"
  }, $props.handleForm.action === "withdraw" ? {
    X: common_vendor.o(($event) => $props.handleForm.withdraw_reason = $event, "4d"),
    Y: common_vendor.p({
      type: "textarea",
      placeholder: "请说明撤回申请的原因",
      maxlength: "500",
      height: 120,
      count: true,
      border: true,
      modelValue: $props.handleForm.withdraw_reason
    }),
    Z: common_vendor.p({
      label: "撤回原因",
      prop: "withdraw_reason",
      ["border-bottom"]: false
    })
  } : {}, {
    aa: common_vendor.sr("handleFormRef", "c500772c-22"),
    ab: common_vendor.p({
      model: $props.handleForm,
      ["label-width"]: "150"
    })
  }) : {}, {
    ac: $props.showEditPrompt && $props.handleForm.action === "resubmit"
  }, $props.showEditPrompt && $props.handleForm.action === "resubmit" ? {
    ad: common_vendor.p({
      name: "info-circle",
      size: "36",
      color: "#2979ff"
    }),
    ae: common_vendor.p({
      type: "info",
      title: "如需修改申请信息，请点击下方按钮进行修改",
      ["show-icon"]: true,
      closable: false
    }),
    af: common_vendor.p({
      name: "edit-pen",
      size: "28"
    }),
    ag: common_vendor.o($options.handleEditApplication, "96"),
    ah: common_vendor.p({
      type: "primary",
      ["custom-style"]: {
        marginTop: "30rpx",
        height: "70rpx"
      }
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c500772c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/approve-header-detail/approve-header-detail.js.map
