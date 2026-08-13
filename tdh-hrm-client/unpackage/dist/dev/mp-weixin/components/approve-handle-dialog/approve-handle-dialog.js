"use strict";
const common_vendor = require("../../common/vendor.js");
const ApproveHeaderDetail = () => "../approve-header-detail/approve-header-detail.js";
const _sfc_main = {
  name: "ApproveHandleDialog",
  components: {
    ApproveHeaderDetail
  },
  emits: ["preview-file", "download-file", "action-change", "submit", "update:showAddSignOption"],
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "审批处理"
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
    approvalHistory: {
      type: Array,
      default: () => []
    },
    formTypeConfigs: {
      type: Object,
      default: () => ({})
    },
    showAddSignOption: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    userList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      approveForm: {
        action: "",
        comment: "",
        transfer_user: "",
        add_sign_user: ""
      },
      showTransferUserPicker: false,
      showAddSignUserPicker: false,
      transferUserName: "",
      addSignUserName: "",
      transferSearchKeyword: "",
      addSignSearchKeyword: "",
      tempSelectedTransferUser: "",
      tempSelectedAddSignUser: "",
      filteredTransferUsers: [],
      filteredAddSignUsers: [],
      transferSearchTimer: null,
      addSignSearchTimer: null
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
    allowedActions() {
      var _a, _b;
      if (this.task && Array.isArray(this.task.actions))
        return this.task.actions;
      if ((_b = (_a = this.task) == null ? void 0 : _a.node_info) == null ? void 0 : _b.actions)
        return this.task.node_info.actions;
      return ["add_sign_complete"];
    },
    operationOptions() {
      const map = {
        approve: {
          label: "同意",
          value: "approve",
          color: "#19be6b"
        },
        reject: {
          label: "驳回",
          value: "reject",
          color: "#fa3534"
        },
        return: {
          label: "退回",
          value: "return",
          color: "#f0ad4e"
        },
        transfer: {
          label: "转办",
          value: "transfer",
          color: "#2979ff"
        },
        add_sign: {
          label: "加签",
          value: "add_sign",
          color: "#9c27b0"
        },
        add_sign_complete: {
          label: "加签完成",
          value: "add_sign_complete",
          color: "#19be6b"
        },
        confirm: {
          label: "确认",
          value: "confirm",
          color: "#19be6b"
        }
      };
      return this.allowedActions.filter((a) => map[a]).map((a) => map[a]);
    },
    showAddSignField() {
      return this.approveForm.action === "add_sign" || this.approveForm.action === "approve" && this.showAddSignOption;
    }
  },
  watch: {
    // 弹窗显示/隐藏
    value: {
      handler(newVal) {
        if (newVal) {
          this.resetForm();
          this.loadDefaultUsers();
        }
      },
      immediate: true
    },
    // 任务数据（这是关键！）
    task: {
      handler() {
        if (this.operationOptions.length > 0) {
          this.approveForm.action = this.operationOptions[0].value;
        }
      },
      deep: true,
      immediate: true
    },
    transferSearchKeyword(newVal) {
      if (this.transferSearchTimer)
        clearTimeout(this.transferSearchTimer);
      this.transferSearchTimer = setTimeout(() => {
        this.remoteSearchUsers(newVal, "transfer");
      }, 300);
    },
    addSignSearchKeyword(newVal) {
      if (this.addSignSearchTimer)
        clearTimeout(this.addSignSearchTimer);
      this.addSignSearchTimer = setTimeout(() => {
        this.remoteSearchUsers(newVal, "addSign");
      }, 300);
    }
  },
  created() {
    this.loadDefaultUsers();
  },
  methods: {
    handlePreviewFile(file) {
      this.$emit("preview-file", file);
    },
    handleDownloadFile(file) {
      this.$emit("download-file", file);
    },
    onActionChange(action) {
      var _a;
      this.$emit("action-change", action);
      this.$emit("update:showAddSignOption", action === "approve" && ((_a = this.task) == null ? void 0 : _a.allow_add_sign) === true);
    },
    handleSubmit() {
      if (!this.approveForm.action) {
        common_vendor.index.showToast({
          title: "请选择操作类型",
          icon: "none"
        });
        return;
      }
      if (!["approve", "confirm", "add_sign_complete"].includes(this.approveForm.action) && !this.approveForm.comment.trim()) {
        common_vendor.index.showToast({
          title: "请填写审批意见",
          icon: "none"
        });
        return;
      }
      if (this.approveForm.action === "transfer" && !this.approveForm.transfer_user) {
        common_vendor.index.showToast({
          title: "请选择转办人员",
          icon: "none"
        });
        return;
      }
      if (this.approveForm.action === "add_sign" && !this.approveForm.add_sign_user) {
        common_vendor.index.showToast({
          title: "请选择加签人员",
          icon: "none"
        });
        return;
      }
      const submitData = {
        task_id: this.task._id,
        action: this.approveForm.action,
        comment: this.approveForm.comment,
        transfer_user: this.approveForm.action === "transfer" ? this.approveForm.transfer_user : this.approveForm.action === "add_sign" ? this.approveForm.add_sign_user : void 0,
        applicationData: this.application
      };
      this.$emit("submit", submitData);
    },
    resetForm() {
      this.approveForm = {
        action: "",
        comment: "",
        transfer_user: "",
        add_sign_user: ""
      };
      this.transferUserName = "";
      this.addSignUserName = "";
      this.transferSearchKeyword = "";
      this.addSignSearchKeyword = "";
      this.tempSelectedTransferUser = "";
      this.tempSelectedAddSignUser = "";
      this.filteredTransferUsers = [];
      this.filteredAddSignUsers = [];
    },
    getCommentPlaceholder() {
      switch (this.approveForm.action) {
        case "approve":
          return "同意时可选填审批意见";
        case "reject":
          return "请填写驳回理由";
        case "return":
          return "请填写退回原因";
        case "transfer":
          return "请填写转办说明";
        case "add_sign":
          return "请填写加签说明（可选）";
        case "add_sign_complete":
          return "加签完成，可选填意见";
        case "confirm":
          return "确认时可选填意见";
        default:
          return "请输入审批意见";
      }
    },
    isTaskOverdue(task) {
      if (!(task == null ? void 0 : task.due_date))
        return false;
      return new Date(task.due_date).getTime() < Date.now();
    },
    formatDate(timestamp) {
      if (!timestamp)
        return "-";
      const vk2 = common_vendor.index.vk;
      return vk2.pubfn.timeFormat(timestamp, "yyyy-MM-dd hh:mm:ss");
    },
    async loadDefaultUsers() {
      try {
        const res = await vk.callFunction({
          url: "admin/hrm/employees/sys/getList",
          data: {
            pageIndex: 1,
            pageSize: 10
          }
        });
        if (res.code === 0 && res.rows) {
          const formatted = this.formatUsers(res.rows);
          this.filteredTransferUsers = formatted;
          this.filteredAddSignUsers = formatted;
        } else {
          this.filteredTransferUsers = [];
          this.filteredAddSignUsers = [];
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/approve-handle-dialog/approve-handle-dialog.vue:423", "加载默认用户失败", e);
      }
    },
    async remoteSearchUsers(keyword, type) {
      if (!keyword || keyword.trim() === "") {
        this.loadDefaultUsers();
        return;
      }
      try {
        const res = await vk.callFunction({
          url: "admin/hrm/employees/sys/getList",
          data: {
            keyword
          }
        });
        if (res.code === 0 && res.rows) {
          const formatted = this.formatUsers(res.rows);
          if (type === "transfer") {
            this.filteredTransferUsers = formatted;
          } else if (type === "addSign") {
            this.filteredAddSignUsers = formatted;
          }
        } else {
          if (type === "transfer")
            this.filteredTransferUsers = [];
          if (type === "addSign")
            this.filteredAddSignUsers = [];
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/approve-handle-dialog/approve-handle-dialog.vue:451", "远程搜索用户失败", e);
      }
    },
    formatUsers(userList) {
      return userList.map((user) => ({
        value: user.employee_id,
        label: `${user.employee_name}${user.employee_id ? ` (${user.employee_id})` : ""}`
      }));
    },
    onTransferSearchTrigger() {
    },
    onTransferSearchClear() {
      this.transferSearchKeyword = "";
    },
    selectTransferUser(user) {
      this.tempSelectedTransferUser = user.value;
    },
    confirmTransferUser() {
      if (!this.tempSelectedTransferUser) {
        common_vendor.index.showToast({
          title: "请选择转办人员",
          icon: "none"
        });
        return;
      }
      const user = this.filteredTransferUsers.find((u) => u.value === this.tempSelectedTransferUser);
      if (user) {
        this.approveForm.transfer_user = user.value;
        this.transferUserName = user.label;
        this.showTransferUserPicker = false;
      }
    },
    onAddSignSearchTrigger() {
    },
    onAddSignSearchClear() {
      this.addSignSearchKeyword = "";
    },
    selectAddSignUser(user) {
      this.tempSelectedAddSignUser = user.value;
    },
    confirmAddSignUser() {
      if (!this.tempSelectedAddSignUser) {
        common_vendor.index.showToast({
          title: "请选择加签人员",
          icon: "none"
        });
        return;
      }
      const user = this.filteredAddSignUsers.find((u) => u.value === this.tempSelectedAddSignUser);
      if (user) {
        this.approveForm.add_sign_user = user.value;
        this.addSignUserName = user.label;
        this.showAddSignUserPicker = false;
      }
    }
  }
};
if (!Array) {
  const _easycom_approve_header_detail2 = common_vendor.resolveComponent("approve-header-detail");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_radio2 = common_vendor.resolveComponent("u-radio");
  const _easycom_u_radio_group2 = common_vendor.resolveComponent("u-radio-group");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_easycom_approve_header_detail2 + _easycom_u_icon2 + _easycom_u_radio2 + _easycom_u_radio_group2 + _easycom_u_input2 + _easycom_u_button2 + _easycom_u_search2 + _easycom_u_empty2 + _easycom_u_popup2)();
}
const _easycom_approve_header_detail = () => "../approve-header-detail/approve-header-detail.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_radio = () => "../../uni_modules/vk-uview-ui/components/u-radio/u-radio.js";
const _easycom_u_radio_group = () => "../../uni_modules/vk-uview-ui/components/u-radio-group/u-radio-group.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
if (!Math) {
  (_easycom_approve_header_detail + _easycom_u_icon + _easycom_u_radio + _easycom_u_radio_group + _easycom_u_input + _easycom_u_button + _easycom_u_search + _easycom_u_empty + _easycom_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handlePreviewFile, "c4"),
    b: common_vendor.o($options.handleDownloadFile, "e8"),
    c: common_vendor.p({
      ["detail-data"]: $props.application,
      ["form-schema"]: $props.formSchema,
      ["process-info"]: $props.processInfo,
      ["status-history"]: $props.approvalHistory,
      ["show-basic-info"]: true,
      ["show-return-info"]: false,
      ["show-approval-flow"]: true,
      ["show-current-task"]: false,
      ["show-handle-form"]: false,
      ["basic-info-title"]: "基本信息",
      ["form-info-title"]: "申请信息",
      ["form-type-configs"]: $props.formTypeConfigs
    }),
    d: common_vendor.p({
      name: "edit-pen",
      size: "36",
      color: "#2979ff"
    }),
    e: common_vendor.f($options.operationOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: "6e0fbc99-3-" + i0 + ",6e0fbc99-2",
        c: common_vendor.p({
          name: opt.value,
          size: "28",
          ["active-color"]: opt.color
        }),
        d: opt.value
      };
    }),
    f: common_vendor.o($options.onActionChange, "b3"),
    g: common_vendor.o(($event) => $data.approveForm.action = $event, "16"),
    h: common_vendor.p({
      modelValue: $data.approveForm.action
    }),
    i: $data.approveForm.action !== "approve" && $data.approveForm.action !== "confirm" && $data.approveForm.action !== "add_sign_complete"
  }, $data.approveForm.action !== "approve" && $data.approveForm.action !== "confirm" && $data.approveForm.action !== "add_sign_complete" ? {} : {}, {
    j: common_vendor.o(($event) => $data.approveForm.comment = $event, "1d"),
    k: common_vendor.p({
      type: "textarea",
      placeholder: $options.getCommentPlaceholder(),
      maxlength: "500",
      height: 120,
      count: true,
      border: true,
      modelValue: $data.approveForm.comment
    }),
    l: $data.approveForm.action === "transfer" && $options.allowedActions.includes("transfer")
  }, $data.approveForm.action === "transfer" && $options.allowedActions.includes("transfer") ? {
    m: common_vendor.o(($event) => $data.showTransferUserPicker = true, "f2"),
    n: common_vendor.o(($event) => $data.transferUserName = $event, "a0"),
    o: common_vendor.p({
      placeholder: "请选择转办人员",
      ["suffix-icon"]: "search",
      ["suffix-icon-style"]: "color: #999",
      readonly: true,
      modelValue: $data.transferUserName
    })
  } : {}, {
    p: $options.showAddSignField
  }, $options.showAddSignField ? common_vendor.e({
    q: $data.approveForm.action === "add_sign"
  }, $data.approveForm.action === "add_sign" ? {} : {}, {
    r: common_vendor.o(($event) => $data.showAddSignUserPicker = true, "1d"),
    s: common_vendor.o(($event) => $data.addSignUserName = $event, "b3"),
    t: common_vendor.p({
      placeholder: "请选择加签人员",
      ["suffix-icon"]: "search",
      ["suffix-icon-style"]: "color: #999",
      readonly: true,
      modelValue: $data.addSignUserName
    })
  }) : {}, {
    v: common_vendor.o($options.handleSubmit, "e0"),
    w: common_vendor.p({
      type: "primary",
      loading: $props.loading
    }),
    x: common_vendor.o(($event) => $data.showTransferUserPicker = false, "2a"),
    y: common_vendor.p({
      type: "text"
    }),
    z: common_vendor.o($options.onTransferSearchTrigger, "04"),
    A: common_vendor.o($options.onTransferSearchClear, "13"),
    B: common_vendor.o(($event) => $data.transferSearchKeyword = $event, "13"),
    C: common_vendor.p({
      placeholder: "搜索姓名",
      ["show-action"]: false,
      modelValue: $data.transferSearchKeyword
    }),
    D: common_vendor.f($data.filteredTransferUsers, (user, k0, i0) => {
      return {
        a: common_vendor.t(user.label),
        b: "6e0fbc99-12-" + i0 + "," + ("6e0fbc99-11-" + i0),
        c: common_vendor.p({
          name: user.value
        }),
        d: "6e0fbc99-11-" + i0 + ",6e0fbc99-8",
        e: common_vendor.o(($event) => $data.tempSelectedTransferUser = $event, user.value),
        f: user.value,
        g: common_vendor.o(($event) => $options.selectTransferUser(user), user.value)
      };
    }),
    E: common_vendor.p({
      ["active-color"]: "#2979ff",
      modelValue: $data.tempSelectedTransferUser
    }),
    F: $data.filteredTransferUsers.length === 0
  }, $data.filteredTransferUsers.length === 0 ? {
    G: common_vendor.p({
      mode: "data",
      text: "暂无匹配人员"
    })
  } : {}, {
    H: common_vendor.o($options.confirmTransferUser, "3a"),
    I: common_vendor.p({
      type: "primary",
      ["custom-style"]: {
        width: "100%",
        height: "80rpx"
      }
    }),
    J: common_vendor.o(($event) => $data.showTransferUserPicker = $event, "dc"),
    K: common_vendor.p({
      mode: "bottom",
      round: 20,
      height: "70%",
      modelValue: $data.showTransferUserPicker
    }),
    L: common_vendor.o(($event) => $data.showAddSignUserPicker = false, "b1"),
    M: common_vendor.p({
      type: "text"
    }),
    N: common_vendor.o($options.onAddSignSearchTrigger, "f2"),
    O: common_vendor.o($options.onAddSignSearchClear, "95"),
    P: common_vendor.o(($event) => $data.addSignSearchKeyword = $event, "6a"),
    Q: common_vendor.p({
      placeholder: "搜索姓名",
      ["show-action"]: false,
      modelValue: $data.addSignSearchKeyword
    }),
    R: common_vendor.f($data.filteredAddSignUsers, (user, k0, i0) => {
      return {
        a: common_vendor.t(user.label),
        b: "6e0fbc99-19-" + i0 + "," + ("6e0fbc99-18-" + i0),
        c: common_vendor.p({
          name: user.value
        }),
        d: "6e0fbc99-18-" + i0 + ",6e0fbc99-15",
        e: common_vendor.o(($event) => $data.tempSelectedAddSignUser = $event, user.value),
        f: user.value,
        g: common_vendor.o(($event) => $options.selectAddSignUser(user), user.value)
      };
    }),
    S: common_vendor.p({
      ["active-color"]: "#2979ff",
      modelValue: $data.tempSelectedAddSignUser
    }),
    T: $data.filteredAddSignUsers.length === 0
  }, $data.filteredAddSignUsers.length === 0 ? {
    U: common_vendor.p({
      mode: "data",
      text: "暂无匹配人员"
    })
  } : {}, {
    V: common_vendor.o($options.confirmAddSignUser, "55"),
    W: common_vendor.p({
      type: "primary",
      ["custom-style"]: {
        width: "100%",
        height: "80rpx"
      }
    }),
    X: common_vendor.o(($event) => $data.showAddSignUserPicker = $event, "b5"),
    Y: common_vendor.p({
      mode: "bottom",
      round: 20,
      height: "70%",
      modelValue: $data.showAddSignUserPicker
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6e0fbc99"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/approve-handle-dialog/approve-handle-dialog.js.map
