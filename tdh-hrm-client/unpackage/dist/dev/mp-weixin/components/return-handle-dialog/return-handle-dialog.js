"use strict";
const common_vendor = require("../../common/vendor.js");
const ApproveHeaderDetail = () => "../approve-header-detail/approve-header-detail.js";
const _sfc_main = {
  name: "ReturnHandleDialog",
  components: {
    ApproveHeaderDetail
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "退回处理"
    },
    task: {
      type: Object,
      default: null
    },
    application: {
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
    formTypeConfigs: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      handleForm: {
        action: "resubmit",
        modify_comment: "",
        withdraw_reason: ""
      },
      handleFormRules: {
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
    show: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },
    returnInfo() {
      if (!this.task)
        return null;
      return {
        returnReason: this.task.task_data ? this.task.task_data.return_reason || "未指定原因" : "未指定原因",
        returnedFrom: this.task.task_data ? this.task.task_data.returned_from || "未知环节" : "未知环节",
        returnTime: this.task.create_time,
        task: this.task
      };
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  },
  methods: {
    handleClose() {
      this.show = false;
    },
    handlePreviewFile(file) {
      this.$emit("preview-file", file);
    },
    handleDownloadFile(file) {
      this.$emit("download-file", file);
    },
    handleEditApplication() {
      this.$emit("edit-application");
    },
    onHandleActionChange(action) {
      if (action === "resubmit") {
        this.handleForm.withdraw_reason = "";
      } else if (action === "withdraw") {
        this.handleForm.modify_comment = "";
      }
      this.$emit("handle-action-change", action);
    },
    async handleSubmit() {
      if (!this.handleForm.action) {
        common_vendor.index.showToast({ title: "请选择处理方式", icon: "none" });
        return;
      }
      if (this.handleForm.action === "resubmit") {
        if (!this.handleForm.modify_comment || !this.handleForm.modify_comment.trim()) {
          common_vendor.index.showToast({ title: "请填写修改说明", icon: "none" });
          return;
        }
      } else if (this.handleForm.action === "withdraw") {
        if (!this.handleForm.withdraw_reason || !this.handleForm.withdraw_reason.trim()) {
          common_vendor.index.showToast({ title: "请填写撤回原因", icon: "none" });
          return;
        }
      }
      const submitData = {
        task_id: this.task._id,
        action: this.handleForm.action,
        modify_comment: this.handleForm.modify_comment,
        withdraw_reason: this.handleForm.withdraw_reason
      };
      this.$emit("submit", submitData);
    },
    resetForm() {
      this.handleForm = {
        action: "resubmit",
        modify_comment: "",
        withdraw_reason: ""
      };
      if (this.$refs.handleFormRef) {
        this.$refs.handleFormRef.clearValidate();
      }
    },
    // 字段值格式化函数
    fieldValueFormatter(fieldName, value, field) {
      if (fieldName === "copies" && value !== null && value !== void 0) {
        return `${value} 份`;
      }
      if ((fieldName === "expected_date" || fieldName.includes("date")) && value) {
        return vk.pubfn.timeFormat(new Date(value), "yyyy-MM-dd");
      }
      return void 0;
    }
  }
};
if (!Array) {
  const _easycom_u_radio2 = common_vendor.resolveComponent("u-radio");
  const _easycom_u_radio_group2 = common_vendor.resolveComponent("u-radio-group");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _easycom_approve_header_detail2 = common_vendor.resolveComponent("approve-header-detail");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  (_easycom_u_radio2 + _easycom_u_radio_group2 + _easycom_u_form_item2 + _easycom_u_input2 + _easycom_u_form2 + _easycom_approve_header_detail2 + _easycom_u_button2)();
}
const _easycom_u_radio = () => "../../uni_modules/vk-uview-ui/components/u-radio/u-radio.js";
const _easycom_u_radio_group = () => "../../uni_modules/vk-uview-ui/components/u-radio-group/u-radio-group.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_approve_header_detail = () => "../approve-header-detail/approve-header-detail.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
if (!Math) {
  (_easycom_u_radio + _easycom_u_radio_group + _easycom_u_form_item + _easycom_u_input + _easycom_u_form + _easycom_approve_header_detail + _easycom_u_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      name: "resubmit",
      size: "28",
      ["active-color"]: "#2979ff"
    }),
    b: common_vendor.p({
      name: "withdraw",
      size: "28",
      ["active-color"]: "#fa3534"
    }),
    c: common_vendor.o($options.onHandleActionChange, "e8"),
    d: common_vendor.o(($event) => $data.handleForm.action = $event, "32"),
    e: common_vendor.p({
      modelValue: $data.handleForm.action
    }),
    f: common_vendor.p({
      label: "处理方式",
      prop: "action",
      ["border-bottom"]: false,
      required: true
    }),
    g: $data.handleForm.action === "resubmit"
  }, $data.handleForm.action === "resubmit" ? {
    h: common_vendor.o(($event) => $data.handleForm.modify_comment = $event, "04"),
    i: common_vendor.p({
      type: "textarea",
      placeholder: "请说明修改的内容",
      maxlength: "500",
      height: 120,
      count: true,
      border: true,
      clearable: false,
      modelValue: $data.handleForm.modify_comment
    }),
    j: common_vendor.p({
      label: "修改说明",
      prop: "modify_comment",
      ["border-bottom"]: false,
      required: true
    })
  } : {}, {
    k: $data.handleForm.action === "withdraw"
  }, $data.handleForm.action === "withdraw" ? {
    l: common_vendor.o(($event) => $data.handleForm.withdraw_reason = $event, "39"),
    m: common_vendor.p({
      type: "textarea",
      placeholder: "请说明撤回申请的原因",
      maxlength: "500",
      height: 120,
      count: true,
      border: true,
      clearable: false,
      modelValue: $data.handleForm.withdraw_reason
    }),
    n: common_vendor.p({
      label: "撤回原因",
      prop: "withdraw_reason",
      ["border-bottom"]: false,
      required: true
    })
  } : {}, {
    o: common_vendor.sr("handleFormRef", "4ba48fac-1,4ba48fac-0"),
    p: common_vendor.p({
      model: $data.handleForm,
      ["label-width"]: "150"
    }),
    q: common_vendor.sr("applicationDetail", "4ba48fac-0"),
    r: common_vendor.o($options.handlePreviewFile, "bf"),
    s: common_vendor.o($options.handleDownloadFile, "67"),
    t: common_vendor.o($options.handleEditApplication, "1b"),
    v: common_vendor.o($options.onHandleActionChange, "1a"),
    w: common_vendor.p({
      ["detail-data"]: $props.application,
      ["form-schema"]: $props.formSchema,
      ["process-info"]: $props.processInfo,
      ["status-history"]: $props.statusHistory,
      ["current-tasks"]: $props.currentTasks,
      ["return-info"]: $options.returnInfo,
      ["show-basic-info"]: true,
      ["show-return-info"]: true,
      ["show-approval-flow"]: true,
      ["show-current-task"]: false,
      ["show-handle-form"]: true,
      ["show-edit-prompt"]: true,
      ["basic-info-title"]: "基本信息",
      ["form-info-title"]: "申请信息",
      ["handle-form-title"]: "处理方式",
      ["handle-form"]: $data.handleForm,
      ["handle-form-rules"]: $data.handleFormRules,
      ["field-value-formatter"]: $options.fieldValueFormatter,
      ["form-type-configs"]: $props.formTypeConfigs
    }),
    x: common_vendor.o($options.handleSubmit, "4d"),
    y: common_vendor.p({
      type: "primary",
      loading: $props.loading,
      ["custom-style"]: {
        marginTop: "30rpx",
        height: "70rpx"
      }
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4ba48fac"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/return-handle-dialog/return-handle-dialog.js.map
