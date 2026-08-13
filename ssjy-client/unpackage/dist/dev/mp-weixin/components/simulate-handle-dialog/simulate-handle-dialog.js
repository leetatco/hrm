"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "SimulateHandleDialog",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "流程试算结果"
    },
    simulateData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      activeNodes: []
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
    }
  },
  watch: {
    simulateData: {
      immediate: true,
      handler(newVal) {
        common_vendor.index.__f__("log", "at components/simulate-handle-dialog/simulate-handle-dialog.vue:236", "SimulateHandleDialog 接收到数据:", newVal);
        if (newVal && newVal.nodes && Array.isArray(newVal.nodes)) {
          this.activeNodes = newVal.nodes.map((node) => node.node_key);
          common_vendor.index.__f__("log", "at components/simulate-handle-dialog/simulate-handle-dialog.vue:240", "设置 activeNodes:", this.activeNodes);
        } else {
          this.activeNodes = [];
          common_vendor.index.__f__("warn", "at components/simulate-handle-dialog/simulate-handle-dialog.vue:243", "simulateData.nodes 不存在或不是数组:", newVal);
        }
      }
    }
  },
  methods: {
    handleClose() {
      this.show = false;
    },
    handleSubmit() {
      this.$emit("submit");
    },
    // 获取节点步骤样式
    getNodeStepClass(node) {
      const nodeType = node.node_type;
      if (nodeType === "start")
        return "step-start";
      if (nodeType === "end")
        return "step-end";
      if (nodeType === "userTask" || nodeType === "approval")
        return "step-task";
      if (nodeType === "gateway")
        return "step-gateway";
      return "step-default";
    },
    // 获取节点图标
    getNodeIcon(node) {
      const iconMap = {
        "start": "play-circle",
        "end": "checkmark-circle",
        "userTask": "account",
        "approval": "checkbox-mark",
        "gateway": "share"
      };
      return iconMap[node.node_type] || "question-circle";
    },
    // 获取节点类型文本
    getNodeTypeText(nodeType) {
      const typeMap = {
        "start": "开始节点",
        "end": "结束节点",
        "userTask": "用户任务",
        "approval": "审批节点",
        "gateway": "网关节点"
      };
      return typeMap[nodeType] || nodeType;
    },
    // 获取分配方式文本
    getAssigneeTypeText(assigneeType) {
      const typeMap = {
        "user": "指定用户",
        "role": "按角色",
        "department": "按部门",
        "variable": "变量指定",
        "previous": "上一处理人"
      };
      return typeMap[assigneeType] || assigneeType;
    },
    // 获取操作文本
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
    // 获取操作标签类型
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
    },
    // 根据节点KEY获取节点名称
    getNodeName(nodeKey) {
      if (!this.simulateData || !this.simulateData.nodes)
        return nodeKey;
      const node = this.simulateData.nodes.find((n) => n.node_key === nodeKey);
      return node ? node.node_name : nodeKey;
    }
  }
};
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_tag2 = common_vendor.resolveComponent("u-tag");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_collapse_item2 = common_vendor.resolveComponent("u-collapse-item");
  const _easycom_u_collapse2 = common_vendor.resolveComponent("u-collapse");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_modal2 = common_vendor.resolveComponent("u-modal");
  (_easycom_u_icon2 + _easycom_u_tag2 + _easycom_u_empty2 + _easycom_u_collapse_item2 + _easycom_u_collapse2 + _easycom_u_button2 + _easycom_u_modal2)();
}
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_tag = () => "../../uni_modules/vk-uview-ui/components/u-tag/u-tag.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_collapse_item = () => "../../uni_modules/vk-uview-ui/components/u-collapse-item/u-collapse-item.js";
const _easycom_u_collapse = () => "../../uni_modules/vk-uview-ui/components/u-collapse/u-collapse.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_modal = () => "../../uni_modules/vk-uview-ui/components/u-modal/u-modal.js";
if (!Math) {
  (_easycom_u_icon + _easycom_u_tag + _easycom_u_empty + _easycom_u_collapse_item + _easycom_u_collapse + _easycom_u_button + _easycom_u_modal)();
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
        a: "cb2c05df-4-" + i0 + ",cb2c05df-0",
        b: common_vendor.p({
          name: $options.getNodeIcon(node),
          size: "24",
          color: "#ffffff"
        }),
        c: common_vendor.n($options.getNodeStepClass(node)),
        d: index === 0
      }, index === 0 ? {} : index === $props.simulateData.nodes.length - 1 ? {} : {
        f: common_vendor.t(index)
      }, {
        e: index === $props.simulateData.nodes.length - 1,
        g: common_vendor.t(node.node_name),
        h: "cb2c05df-5-" + i0 + ",cb2c05df-0",
        i: common_vendor.p({
          text: $options.getNodeTypeText(node.node_type),
          type: "info",
          size: "mini",
          shape: "circle"
        }),
        j: node.estimated_assignee
      }, node.estimated_assignee ? {
        k: "cb2c05df-6-" + i0 + ",cb2c05df-0",
        l: common_vendor.p({
          name: "account",
          size: "20",
          color: "#666"
        }),
        m: common_vendor.t(node.estimated_assignee.name)
      } : {}, {
        n: node.duration_estimate
      }, node.duration_estimate ? {
        o: "cb2c05df-7-" + i0 + ",cb2c05df-0",
        p: common_vendor.p({
          name: "clock",
          size: "20",
          color: "#666"
        }),
        q: common_vendor.t(node.duration_estimate)
      } : {}, {
        r: node.assignee_type
      }, node.assignee_type ? {
        s: "cb2c05df-8-" + i0 + ",cb2c05df-0",
        t: common_vendor.p({
          name: "setting",
          size: "20",
          color: "#666"
        }),
        v: common_vendor.t($options.getAssigneeTypeText(node.assignee_type))
      } : {}, {
        w: node.actions && node.actions.length > 0
      }, node.actions && node.actions.length > 0 ? {
        x: common_vendor.f(node.actions, (action, k1, i1) => {
          return {
            a: "cb2c05df-9-" + i0 + "-" + i1 + ",cb2c05df-0",
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
        y: index < $props.simulateData.nodes.length - 1
      }, index < $props.simulateData.nodes.length - 1 ? {
        z: "cb2c05df-10-" + i0 + ",cb2c05df-0",
        A: common_vendor.p({
          name: "arrow-right",
          size: "20",
          color: "#c1c1c1"
        })
      } : {}, {
        B: node.node_key,
        C: common_vendor.n($options.getNodeStepClass(node))
      });
    })
  } : {
    j: common_vendor.p({
      mode: "list",
      icon: "/static/empty-data.png"
    })
  }, {
    k: common_vendor.p({
      name: "info-circle",
      size: "36",
      color: "#2979ff"
    }),
    l: $props.simulateData.nodes && $props.simulateData.nodes.length > 0
  }, $props.simulateData.nodes && $props.simulateData.nodes.length > 0 ? {
    m: common_vendor.f($props.simulateData.nodes, (node, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.getNodeTypeText(node.node_type)),
        b: node.estimated_assignee
      }, node.estimated_assignee ? {
        c: common_vendor.t(node.estimated_assignee.name),
        d: common_vendor.t($options.getAssigneeTypeText(node.assignee_type))
      } : {}, {
        e: node.assignee_type
      }, node.assignee_type ? {
        f: common_vendor.t($options.getAssigneeTypeText(node.assignee_type)),
        g: common_vendor.t(node.assignee_value || "未指定")
      } : {}, {
        h: node.duration_estimate
      }, node.duration_estimate ? {
        i: common_vendor.t(node.duration_estimate)
      } : {}, {
        j: node.actions && node.actions.length > 0
      }, node.actions && node.actions.length > 0 ? {
        k: common_vendor.f(node.actions, (action, k1, i1) => {
          return {
            a: "cb2c05df-15-" + i0 + "-" + i1 + "," + ("cb2c05df-14-" + i0),
            b: common_vendor.p({
              text: $options.getActionText(action),
              type: $options.getActionTagType(action),
              size: "small",
              shape: "circle"
            }),
            c: action
          };
        })
      } : {}, {
        l: node.conditions && node.conditions.length > 0
      }, node.conditions && node.conditions.length > 0 ? {
        m: common_vendor.f(node.conditions, (condition, k1, i1) => {
          return common_vendor.e({
            a: "cb2c05df-16-" + i0 + "-" + i1 + "," + ("cb2c05df-14-" + i0),
            b: common_vendor.p({
              text: condition.matched ? "匹配" : "未匹配",
              type: condition.matched ? "success" : "info",
              size: "small",
              shape: "circle"
            }),
            c: common_vendor.t($options.getNodeName(condition.target_node)),
            d: condition.condition_rule
          }, condition.condition_rule ? {
            e: common_vendor.t(condition.condition_rule)
          } : {}, {
            f: condition.is_default
          }, condition.is_default ? {} : {}, {
            g: condition.target_node
          });
        })
      } : {}, {
        n: node.next_node_keys && node.next_node_keys.length > 0
      }, node.next_node_keys && node.next_node_keys.length > 0 ? {
        o: common_vendor.t(node.next_node_keys.map((key) => $options.getNodeName(key)).join(" → "))
      } : {}, {
        p: node.node_key,
        q: "cb2c05df-14-" + i0 + ",cb2c05df-13",
        r: common_vendor.p({
          title: node.node_name,
          name: node.node_key,
          border: false
        })
      });
    }),
    n: common_vendor.p({
      accordion: false,
      value: $data.activeNodes
    })
  } : {
    o: common_vendor.p({
      mode: "list",
      icon: "/static/empty-data.png"
    })
  }) : {
    p: common_vendor.p({
      mode: "list",
      icon: "/static/empty-data.png"
    })
  }, {
    q: common_vendor.o($options.handleClose, "7a"),
    r: common_vendor.p({
      type: "default",
      ["custom-style"]: {
        width: "200rpx",
        height: "70rpx",
        marginRight: "20rpx"
      }
    }),
    s: common_vendor.o($options.handleSubmit, "c2"),
    t: common_vendor.p({
      type: "primary",
      ["custom-style"]: {
        width: "200rpx",
        height: "70rpx"
      }
    }),
    v: common_vendor.o(($event) => $options.show = $event, "04"),
    w: common_vendor.p({
      title: $props.title,
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
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cb2c05df"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/simulate-handle-dialog/simulate-handle-dialog.js.map
