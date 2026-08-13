"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "SimulateHandleDialog",
  props: {
    simulateData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isMobile: false
    };
  },
  mounted() {
    this.checkScreenWidth();
    common_vendor.index.onWindowResize(() => this.checkScreenWidth());
  },
  methods: {
    checkScreenWidth() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.isMobile = res.windowWidth <= 750;
        }
      });
    },
    getNodeStepClass(node) {
      const type = node.node_type;
      if (type === "start")
        return "step-start";
      if (type === "end")
        return "step-end";
      if (type === "userTask" || type === "approval")
        return "step-task";
      if (type === "review")
        return "step-review";
      if (type === "gateway")
        return "step-gateway";
      return "step-default";
    },
    getNodeIcon(node) {
      const map = {
        "start": "play-circle",
        "end": "checkmark-circle",
        "userTask": "account",
        "approval": "checkbox-mark",
        "review": "bell",
        "gateway": "share"
      };
      return map[node.node_type] || "question-circle";
    },
    getNodeTypeText(nodeType) {
      const map = {
        "start": "开始节点",
        "end": "结束节点",
        "userTask": "用户任务",
        "approval": "审批节点",
        "review": "通知节点",
        "gateway": "网关节点"
      };
      return map[nodeType] || nodeType;
    },
    getAssigneeTypeText(type) {
      const map = {
        "user": "指定用户",
        "role": "按角色",
        "department": "按部门",
        "variable": "变量指定",
        "previous": "上一处理人"
      };
      return map[type] || type;
    },
    getActionText(action) {
      const map = {
        "approve": "同意",
        "reject": "驳回",
        "return": "退回",
        "transfer": "转办",
        "add_sign": "加签",
        "add_sign_complete": "加签完成",
        "confirm": "确认",
        "resubmit": "重新提交",
        "create": "创建",
        "complete": "完成"
      };
      return map[action] || action;
    },
    getActionTagType(action) {
      const map = {
        "approve": "success",
        "reject": "error",
        "return": "warning",
        "transfer": "info",
        "add_sign": "primary",
        "add_sign_complete": "success",
        "confirm": "warning",
        "resubmit": "info",
        "create": "info",
        "complete": "success"
      };
      return map[action] || "info";
    },
    // 根据节点key获取节点名称（用于条件显示）
    getNodeName(nodeKey) {
      if (!this.simulateData || !this.simulateData.nodes)
        return nodeKey;
      const node = this.simulateData.nodes.find((n) => n.node_key === nodeKey);
      return node ? node.node_name : nodeKey;
    }
  },
  watch: {
    simulateData: {
      immediate: true,
      handler(newVal) {
        if (newVal && newVal.nodes)
          ;
      }
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
  var _a, _b;
  return common_vendor.e({
    a: $props.simulateData
  }, $props.simulateData ? common_vendor.e({
    b: common_vendor.p({
      name: "eye",
      size: "36",
      color: "#2979ff"
    }),
    c: common_vendor.t($props.simulateData.form_type || "未指定"),
    d: common_vendor.t(((_a = $props.simulateData.process_definition) == null ? void 0 : _a.name) || "未指定"),
    e: common_vendor.p({
      text: ((_b = $props.simulateData.estimated_duration) == null ? void 0 : _b.formatted) || "未知",
      type: "warning",
      size: "mini",
      shape: "circle"
    }),
    f: common_vendor.t($props.simulateData.total_nodes || 0),
    g: common_vendor.p({
      name: "list-dot",
      size: "36",
      color: "#2979ff"
    }),
    h: $props.simulateData.nodes && $props.simulateData.nodes.length > 0
  }, $props.simulateData.nodes && $props.simulateData.nodes.length > 0 ? {
    i: common_vendor.f($props.simulateData.nodes, (node, index, i0) => {
      return common_vendor.e({
        a: "cb2c05df-3-" + i0,
        b: common_vendor.p({
          name: $options.getNodeIcon(node),
          size: "28",
          color: "#ffffff"
        }),
        c: common_vendor.n($options.getNodeStepClass(node)),
        d: index === 0
      }, index === 0 ? {} : index === $props.simulateData.nodes.length - 1 ? {} : {
        f: common_vendor.t(index)
      }, {
        e: index === $props.simulateData.nodes.length - 1,
        g: common_vendor.t(node.node_name),
        h: "cb2c05df-4-" + i0,
        i: common_vendor.p({
          text: $options.getNodeTypeText(node.node_type),
          type: "info",
          size: "mini",
          shape: "circle"
        }),
        j: node.estimated_assignees && node.estimated_assignees.length > 0
      }, node.estimated_assignees && node.estimated_assignees.length > 0 ? common_vendor.e({
        k: "cb2c05df-5-" + i0,
        l: common_vendor.p({
          name: "account",
          size: "20",
          color: "#666"
        }),
        m: common_vendor.t(node.estimated_assignees.map((a) => a.name).join("、")),
        n: node.estimated_assignees.length > 1
      }, node.estimated_assignees.length > 1 ? {
        o: common_vendor.t(node.estimated_assignees.length)
      } : {}) : node.estimated_assignee ? {
        q: "cb2c05df-6-" + i0,
        r: common_vendor.p({
          name: "account",
          size: "20",
          color: "#666"
        }),
        s: common_vendor.t(node.estimated_assignee.name)
      } : {}, {
        p: node.estimated_assignee,
        t: node.required_approvals > 1
      }, node.required_approvals > 1 ? {
        v: "cb2c05df-7-" + i0,
        w: common_vendor.p({
          name: "people",
          size: "20",
          color: "#2979ff"
        }),
        x: common_vendor.t(node.required_approvals)
      } : {}, {
        y: node.duration_estimate
      }, node.duration_estimate ? {
        z: "cb2c05df-8-" + i0,
        A: common_vendor.p({
          name: "clock",
          size: "20",
          color: "#666"
        }),
        B: common_vendor.t(node.duration_estimate)
      } : {}, {
        C: node.assignee_type
      }, node.assignee_type ? common_vendor.e({
        D: "cb2c05df-9-" + i0,
        E: common_vendor.p({
          name: "setting",
          size: "20",
          color: "#666"
        }),
        F: common_vendor.t($options.getAssigneeTypeText(node.assignee_type)),
        G: Array.isArray(node.assignee_value)
      }, Array.isArray(node.assignee_value) ? {
        H: common_vendor.t(node.assignee_value.join(", "))
      } : node.assignee_value ? {
        J: common_vendor.t(node.assignee_value)
      } : {}, {
        I: node.assignee_value
      }) : {}, {
        K: node.conditions && node.conditions.length > 0
      }, node.conditions && node.conditions.length > 0 ? {
        L: "cb2c05df-10-" + i0,
        M: common_vendor.p({
          name: "share",
          size: "20",
          color: "#666"
        }),
        N: common_vendor.t(node.conditions.map((c) => $options.getNodeName(c.target_node) + (c.condition_rule ? "(" + c.condition_rule + ")" : "")).join(" / "))
      } : {}, {
        O: node.actions && node.actions.length > 0
      }, node.actions && node.actions.length > 0 ? {
        P: common_vendor.f(node.actions, (action, k1, i1) => {
          return {
            a: "cb2c05df-11-" + i0 + "-" + i1,
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
        Q: common_vendor.n($options.getNodeStepClass(node)),
        R: index < $props.simulateData.nodes.length - 1
      }, index < $props.simulateData.nodes.length - 1 ? common_vendor.e({
        S: !$data.isMobile
      }, !$data.isMobile ? {
        T: "cb2c05df-12-" + i0,
        U: common_vendor.p({
          name: "arrow-right",
          size: "24",
          color: "#c1c1c1"
        })
      } : {}) : {}, {
        V: node.node_key
      });
    })
  } : {
    j: common_vendor.p({
      mode: "list",
      icon: "/static/empty-data.png"
    })
  }) : {
    k: common_vendor.p({
      mode: "list",
      icon: "/static/empty-data.png"
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cb2c05df"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/simulate-handle-dialog/simulate-handle-dialog.js.map
