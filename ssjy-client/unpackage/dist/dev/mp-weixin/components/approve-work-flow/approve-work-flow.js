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
        { type: "completed", text: "已完成" },
        { type: "current", text: "当前环节" },
        { type: "waiting", text: "待处理" },
        { type: "rejected", text: "已驳回" },
        { type: "cancelled", text: "已取消" }
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
    },
    pendingTasksCount() {
      if (!this.tasks)
        return 0;
      return this.tasks.filter((task) => task.status === "pending").length;
    },
    waitingTasksCount() {
      if (!this.tasks)
        return 0;
      return this.tasks.filter((task) => task.status === "waiting").length;
    }
  },
  methods: {
    formatDate(timestamp, formatStr) {
      if (this.formatDateFn) {
        return this.formatDateFn(timestamp, formatStr);
      }
      if (!timestamp)
        return "-";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      if (formatStr === "MM-dd hh:mm") {
        return `${month}-${day} ${hours}:${minutes}`;
      }
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    getStepStatusClass(task) {
      const status = task.status;
      const action = task.action;
      if (action === "reject") {
        return "step-rejected";
      }
      if (status === "completed") {
        return "step-completed";
      } else if (status === "pending") {
        return "step-current";
      } else if (status === "waiting") {
        return "step-waiting";
      } else if (status === "cancelled") {
        return "step-cancelled";
      }
      return "step-waiting";
    },
    getStepIcon(task) {
      const status = task.status;
      const action = task.action;
      if (action === "reject") {
        return "close-circle";
      }
      if (status === "completed") {
        return "checkmark-circle";
      } else if (status === "pending") {
        return "clock";
      } else if (status === "waiting") {
        return "time";
      } else if (status === "cancelled") {
        return "close";
      }
      return "time";
    },
    getConnectorClass(prevTask, currentTask) {
      const prevStatus = this.getStepStatusClass(prevTask);
      const currentStatus = this.getStepStatusClass(currentTask);
      if (prevStatus === "step-completed" && currentStatus === "step-completed") {
        return "connector-completed";
      } else if (prevStatus === "step-completed" && currentStatus !== "step-completed") {
        return "connector-partial";
      } else {
        return "connector-waiting";
      }
    },
    getHistoryItemClass(record) {
      const action = record.action;
      if (action === "approve") {
        return "history-approve";
      } else if (action === "reject") {
        return "history-reject";
      } else if (action === "return") {
        return "history-return";
      } else if (action === "create") {
        return "history-create";
      }
      return "history-default";
    },
    getHistoryIcon(record) {
      const action = record.action;
      if (action === "approve") {
        return "checkmark-circle";
      } else if (action === "reject") {
        return "close-circle";
      } else if (action === "return") {
        return "arrow-left";
      } else if (action === "create") {
        return "plus-circle";
      } else if (action === "transfer") {
        return "arrow-right";
      }
      return "list-dot";
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
        "withdraw": "info"
      };
      return typeMap[action] || "info";
    },
    getActionText(action) {
      const textMap = {
        "approve": "同意",
        "reject": "驳回",
        "return": "退回",
        "transfer": "转办",
        "delegate": "委托",
        "create": "创建",
        "complete": "完成",
        "claim": "认领",
        "withdraw": "撤回"
      };
      return textMap[action] || action;
    },
    getActionTagType(action) {
      const typeMap = {
        "approve": "success",
        "reject": "error",
        "return": "warning",
        "transfer": "info",
        "delegate": "info",
        "create": "info",
        "complete": "success",
        "claim": "warning",
        "withdraw": "info"
      };
      return typeMap[action] || "info";
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
    b: common_vendor.p({
      name: "list-dot",
      size: "36",
      color: "#2979ff"
    }),
    c: common_vendor.t($props.title || "审批流程"),
    d: common_vendor.t($props.tasks.length),
    e: common_vendor.t($options.completedTasksCount),
    f: common_vendor.f($data.legendList, (item, k0, i0) => {
      return {
        a: common_vendor.n(item.type),
        b: common_vendor.t(item.text),
        c: item.type
      };
    }),
    g: common_vendor.f($props.tasks, (task, index, i0) => {
      return common_vendor.e({
        a: index > 0
      }, index > 0 ? {
        b: common_vendor.n($options.getConnectorClass($props.tasks[index - 1], task))
      } : {}, {
        c: "69d38a91-1-" + i0,
        d: common_vendor.p({
          name: $options.getStepIcon(task),
          size: "24",
          color: "#ffffff",
          ["custom-style"]: {
            lineHeight: "24px"
          }
        }),
        e: common_vendor.n($options.getStepStatusClass(task)),
        f: common_vendor.t(index + 1),
        g: common_vendor.t(task.task_name || "审批环节"),
        h: "69d38a91-2-" + i0,
        i: common_vendor.p({
          text: $options.getTaskStatusText(task.status),
          type: $options.getTaskStatusType(task.status),
          size: "mini",
          shape: "circle"
        }),
        j: task.assignee_name || task.assignee
      }, task.assignee_name || task.assignee ? {
        k: "69d38a91-3-" + i0,
        l: common_vendor.p({
          name: "account",
          size: "20",
          color: "#666"
        }),
        m: common_vendor.t(task.assignee_name || task.assignee)
      } : {}, {
        n: task.complete_time
      }, task.complete_time ? {
        o: "69d38a91-4-" + i0,
        p: common_vendor.p({
          name: "clock",
          size: "20",
          color: "#666"
        }),
        q: common_vendor.t($options.formatDate(task.complete_time, "MM-dd hh:mm"))
      } : {}, {
        r: task.comment
      }, task.comment ? {
        s: "69d38a91-5-" + i0,
        t: common_vendor.p({
          name: "chat",
          size: "20",
          color: "#666"
        }),
        v: common_vendor.t(task.comment)
      } : {}, {
        w: task.actions && task.actions.length > 0
      }, task.actions && task.actions.length > 0 ? {
        x: common_vendor.f(task.actions, (action, k1, i1) => {
          return {
            a: "69d38a91-6-" + i0 + "-" + i1,
            b: common_vendor.p({
              text: $options.getActionText(action),
              type: $options.getActionTagType(action),
              size: "mini",
              shape: "circle"
            }),
            c: action
          };
        })
      } : {}, {
        y: task._id,
        z: common_vendor.n($options.getStepStatusClass(task))
      });
    })
  } : {}, {
    h: common_vendor.p({
      name: "history",
      size: "36",
      color: "#2979ff"
    }),
    i: common_vendor.t($props.historyTitle || "审批记录"),
    j: common_vendor.f($props.history, (record, index, i0) => {
      return common_vendor.e({
        a: "69d38a91-8-" + i0,
        b: common_vendor.p({
          name: $options.getHistoryIcon(record),
          size: "20",
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
          shape: "circle"
        }),
        g: common_vendor.t($options.formatDate(record.operation_time)),
        h: "69d38a91-10-" + i0,
        i: common_vendor.t(record.operator_name || "未知"),
        j: record.task_name
      }, record.task_name ? {
        k: "69d38a91-11-" + i0,
        l: common_vendor.p({
          name: "list-dot",
          size: "20",
          color: "#666"
        }),
        m: common_vendor.t(record.task_name)
      } : {}, {
        n: record.comment
      }, record.comment ? {
        o: "69d38a91-12-" + i0,
        p: common_vendor.p({
          name: "chat",
          size: "20",
          color: "#666"
        }),
        q: common_vendor.t(record.comment)
      } : {}, {
        r: index,
        s: common_vendor.n($options.getHistoryItemClass(record))
      });
    }),
    k: common_vendor.p({
      name: "account",
      size: "20",
      color: "#666"
    }),
    l: $props.history.length === 0 && $props.createRecord
  }, $props.history.length === 0 && $props.createRecord ? common_vendor.e({
    m: common_vendor.p({
      name: "plus-circle",
      size: "20",
      color: "#ffffff"
    }),
    n: common_vendor.p({
      text: "创建申请",
      type: "info",
      size: "mini",
      shape: "circle"
    }),
    o: common_vendor.t($options.formatDate($props.createRecord.create_time)),
    p: common_vendor.p({
      name: "account",
      size: "20",
      color: "#666"
    }),
    q: common_vendor.t($props.createRecord.operator_name || "未知"),
    r: $props.createRecord.comment
  }, $props.createRecord.comment ? {
    s: common_vendor.p({
      name: "chat",
      size: "20",
      color: "#666"
    }),
    t: common_vendor.t($props.createRecord.comment || "创建申请")
  } : {}) : {}, {
    v: $props.history.length === 0 && !$props.createRecord
  }, $props.history.length === 0 && !$props.createRecord ? {
    w: common_vendor.p({
      mode: "list",
      icon: "http://cdn.uviewui.com/uview/empty/list.png"
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-69d38a91"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/approve-work-flow/approve-work-flow.js.map
