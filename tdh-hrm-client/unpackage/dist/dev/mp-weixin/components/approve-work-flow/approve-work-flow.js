"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "ApproveWorkFlow",
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    history: {
      type: Array,
      default: () => []
    },
    createRecord: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: "审批流程"
    },
    historyTitle: {
      type: String,
      default: "审批记录"
    },
    formatDateFn: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      legendList: [
        {
          type: "completed",
          text: "已完成"
        },
        {
          type: "current",
          text: "当前环节"
        },
        {
          type: "waiting",
          text: "待处理"
        },
        {
          type: "rejected",
          text: "已驳回"
        },
        {
          type: "cancelled",
          text: "已取消"
        }
      ]
    };
  },
  computed: {
    completedTasksCount() {
      if (!this.tasks)
        return 0;
      return this.tasks.filter(
        (task) => task.status === "completed" && task.action !== "reject"
      ).length;
    }
  },
  methods: {
    formatDate(timestamp, formatStr) {
      if (this.formatDateFn)
        return this.formatDateFn(timestamp, formatStr);
      if (!timestamp)
        return "-";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      if (formatStr === "MM-dd hh:mm")
        return `${month}-${day} ${hours}:${minutes}`;
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    getStepStatusClass(task) {
      const {
        status,
        action
      } = task;
      if (action === "reject")
        return "step-rejected";
      if (status === "completed")
        return "step-completed";
      if (status === "pending")
        return "step-current";
      if (status === "waiting")
        return "step-waiting";
      if (status === "cancelled")
        return "step-cancelled";
      return "step-waiting";
    },
    getStepIcon(task) {
      const {
        status,
        action
      } = task;
      if (action === "reject")
        return "close-circle";
      if (status === "completed")
        return "checkmark-circle";
      if (status === "pending")
        return "clock";
      if (status === "waiting")
        return "time";
      if (status === "cancelled")
        return "close";
      return "time";
    },
    getTaskStatusType(status) {
      const typeMap = {
        "pending": "warning",
        "completed": "success",
        "cancelled": "info",
        "transferred": "info",
        "waiting": "info"
      };
      return typeMap[status] || "info";
    },
    getTaskStatusText(status) {
      const textMap = {
        "pending": "待处理",
        "completed": "已完成",
        "cancelled": "已取消",
        "transferred": "已转办",
        "waiting": "等待中"
      };
      return textMap[status] || status;
    },
    getActionType(action) {
      const typeMap = {
        "create": "info",
        "approve": "success",
        "reject": "error",
        "return": "warning",
        "transfer": "info",
        "complete": "success",
        "claim": "warning",
        "withdraw": "info",
        "add_sign": "primary",
        "add_sign_complete": "success",
        "confirm": "warning",
        "resubmit": "info"
      };
      return typeMap[action] || "info";
    },
    getActionText(action) {
      const textMap = {
        "approve": "同意",
        "reject": "驳回",
        "return": "退回",
        "transfer": "转办",
        "create": "创建",
        "complete": "完成",
        "withdraw": "撤回",
        "add_sign": "加签",
        "add_sign_complete": "加签完成",
        "confirm": "确认",
        "resubmit": "重新提交"
      };
      return textMap[action] || action;
    },
    getActionTagType(action) {
      const typeMap = {
        "approve": "success",
        "reject": "error",
        "return": "warning",
        "transfer": "info",
        "create": "info",
        "complete": "success",
        "withdraw": "info",
        "add_sign": "primary",
        "add_sign_complete": "success",
        "confirm": "warning",
        "resubmit": "info"
      };
      return typeMap[action] || "info";
    },
    getHistoryItemClass(record) {
      const action = record.action;
      if (action === "approve" || action === "add_sign_complete")
        return "history-approve";
      if (action === "reject")
        return "history-reject";
      if (action === "return")
        return "history-return";
      if (action === "create")
        return "history-create";
      return "history-default";
    },
    getHistoryIcon(record) {
      const action = record.action;
      if (action === "approve" || action === "add_sign_complete")
        return "checkmark-circle";
      if (action === "reject")
        return "close-circle";
      if (action === "return")
        return "arrow-left";
      if (action === "create")
        return "plus-circle";
      if (action === "transfer")
        return "arrow-right";
      if (action === "add_sign")
        return "plus";
      if (action === "confirm")
        return "checkmark";
      return "list-dot";
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_tag2 = common_vendor.resolveComponent("u-tag");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  (_easycom_u_icon2 + _easycom_u_tag2 + _easycom_u_empty2)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_tag = () => "../../uni_modules/vk-uview-ui/components/u-tag/u-tag.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_tag + _easycom_u_empty)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.tasks && $props.tasks.length > 0
  }, $props.tasks && $props.tasks.length > 0 ? {
    b: common_vendor.t($props.tasks.length),
    c: common_vendor.t($options.completedTasksCount),
    d: common_vendor.f($data.legendList, (item, k0, i0) => {
      return {
        a: common_vendor.n(item.type),
        b: common_vendor.t(item.text),
        c: item.type
      };
    }),
    e: common_vendor.f($props.tasks, (task, index, i0) => {
      return common_vendor.e({
        a: "69d38a91-0-" + i0,
        b: common_vendor.p({
          name: $options.getStepIcon(task),
          size: "28",
          color: "#ffffff"
        }),
        c: common_vendor.n($options.getStepStatusClass(task)),
        d: index < $props.tasks.length - 1
      }, index < $props.tasks.length - 1 ? {} : {}, {
        e: common_vendor.t(task.task_name || "审批环节"),
        f: "69d38a91-1-" + i0,
        g: common_vendor.p({
          text: $options.getTaskStatusText(task.status),
          type: $options.getTaskStatusType(task.status),
          size: "mini",
          shape: "plain"
        }),
        h: task.assignee_name || task.assignee
      }, task.assignee_name || task.assignee ? {
        i: "69d38a91-2-" + i0,
        j: common_vendor.p({
          name: "account",
          size: "24",
          color: "#8c8c8c"
        }),
        k: common_vendor.t(task.assignee_name || task.assignee)
      } : {}, {
        l: task.required_approvals > 1
      }, task.required_approvals > 1 ? {
        m: "69d38a91-3-" + i0,
        n: common_vendor.p({
          name: "people",
          size: "24",
          color: "#2979ff"
        }),
        o: common_vendor.t(task.current_approvals || 0),
        p: common_vendor.t(task.required_approvals)
      } : {}, {
        q: task.complete_time
      }, task.complete_time ? {
        r: "69d38a91-4-" + i0,
        s: common_vendor.p({
          name: "calendar",
          size: "24",
          color: "#8c8c8c"
        }),
        t: common_vendor.t($options.formatDate(task.complete_time, "MM-dd hh:mm"))
      } : {}, {
        v: task.comment
      }, task.comment ? {
        w: "69d38a91-5-" + i0,
        x: common_vendor.p({
          name: "chat-fill",
          size: "24",
          color: "#8c8c8c"
        }),
        y: common_vendor.t(task.comment)
      } : {}, {
        z: task.actions && task.actions.length > 0
      }, task.actions && task.actions.length > 0 ? {
        A: common_vendor.f(task.actions, (action, k1, i1) => {
          return {
            a: "69d38a91-6-" + i0 + "-" + i1,
            b: common_vendor.p({
              text: $options.getActionText(action),
              type: $options.getActionTagType(action),
              size: "mini",
              shape: "plain"
            }),
            c: action
          };
        })
      } : {}, {
        B: task._id
      });
    })
  } : {}, {
    f: common_vendor.p({
      name: "file-text",
      size: "32",
      color: "#2979ff"
    }),
    g: common_vendor.t($props.historyTitle || "审批记录"),
    h: common_vendor.f($props.history, (record, index, i0) => {
      return common_vendor.e({
        a: "69d38a91-8-" + i0,
        b: common_vendor.p({
          name: $options.getHistoryIcon(record),
          size: "22",
          color: "#ffffff"
        }),
        c: common_vendor.n($options.getHistoryItemClass(record)),
        d: index < $props.history.length - 1
      }, index < $props.history.length - 1 ? {} : {}, {
        e: "69d38a91-9-" + i0,
        f: common_vendor.p({
          text: $options.getActionText(record.action),
          type: $options.getActionType(record.action),
          size: "mini",
          shape: "plain"
        }),
        g: common_vendor.t($options.formatDate(record.operation_time)),
        h: "69d38a91-10-" + i0,
        i: common_vendor.t(record.operator_name || "未知"),
        j: record.task_name
      }, record.task_name ? {
        k: "69d38a91-11-" + i0,
        l: common_vendor.p({
          name: "order",
          size: "22",
          color: "#8c8c8c"
        }),
        m: common_vendor.t(record.task_name)
      } : {}, {
        n: record.comment
      }, record.comment ? {
        o: "69d38a91-12-" + i0,
        p: common_vendor.p({
          name: "chat-fill",
          size: "22",
          color: "#8c8c8c"
        }),
        q: common_vendor.t(record.comment)
      } : {}, {
        r: index,
        s: common_vendor.n($options.getHistoryItemClass(record))
      });
    }),
    i: common_vendor.p({
      name: "account-fill",
      size: "22",
      color: "#8c8c8c"
    }),
    j: $props.history.length === 0 && $props.createRecord
  }, $props.history.length === 0 && $props.createRecord ? common_vendor.e({
    k: common_vendor.p({
      name: "plus-circle",
      size: "22",
      color: "#ffffff"
    }),
    l: common_vendor.p({
      text: "创建申请",
      type: "info",
      size: "mini",
      shape: "plain"
    }),
    m: common_vendor.t($options.formatDate($props.createRecord.create_time)),
    n: common_vendor.p({
      name: "account-fill",
      size: "22",
      color: "#8c8c8c"
    }),
    o: common_vendor.t($props.createRecord.operator_name || "未知"),
    p: $props.createRecord.comment
  }, $props.createRecord.comment ? {
    q: common_vendor.p({
      name: "chat-fill",
      size: "22",
      color: "#8c8c8c"
    }),
    r: common_vendor.t($props.createRecord.comment || "创建申请")
  } : {}) : {}, {
    s: $props.history.length === 0 && !$props.createRecord
  }, $props.history.length === 0 && !$props.createRecord ? {
    t: common_vendor.p({
      mode: "list",
      icon: "/static/empty-data.png"
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-69d38a91"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/approve-work-flow/approve-work-flow.js.map
