"use strict";
const common_vendor = require("../../../common/vendor.js");
const DynamicFormDialog = () => "../../../components/dynamic-form-dialog/dynamic-form-dialog.js";
const SimulateHandleDialog = () => "../../../components/simulate-handle-dialog/simulate-handle-dialog.js";
const FilePreviewDialog = () => "../../../components/file-preview-dialog/file-preview-dialog.js";
const ApproveHeaderDetail = () => "../../../components/approve-header-detail/approve-header-detail.js";
const _sfc_main = {
  name: "ReimbursementApply",
  components: {
    DynamicFormDialog,
    SimulateHandleDialog,
    FilePreviewDialog,
    ApproveHeaderDetail
  },
  data() {
    return {
      popupStyle: {
        mode: "bottom",
        border_radius: 16,
        height: "90%"
      },
      buttonStyle: {
        primary: {
          height: "64rpx",
          padding: "0 24rpx"
        },
        plain: {
          padding: "0 24rpx",
          border: "1rpx solid #2979ff",
          color: "#2979ff",
          background: "transparent"
        },
        dangerPlain: {
          padding: "0 24rpx",
          border: "1rpx solid #f56c6c",
          color: "#f56c6c",
          background: "transparent"
        },
        infoPlain: {
          padding: "0 24rpx",
          border: "1rpx solid #909399",
          color: "#606266",
          background: "transparent"
        }
      },
      loading: true,
      refreshing: false,
      saveFormLoading: false,
      submitFormLoading: false,
      simulateFormLoading: false,
      formSchema: null,
      formTypeCode: "REIMBURSEMENT_APPLICATION",
      formTypeConfigs: {},
      tableData: [],
      totalCount: 0,
      draftCount: 0,
      pendingCount: 0,
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      },
      hasMore: true,
      loadMoreStatus: "loadmore",
      loadText: {
        loadmore: "点击加载更多",
        loading: "正在加载...",
        nomore: "没有更多了"
      },
      statusOptions: [
        {
          value: "",
          label: "全部状态"
        },
        {
          value: "draft",
          label: "草稿"
        },
        {
          value: "pending",
          label: "待处理"
        },
        {
          value: "rejected",
          label: "已驳回"
        },
        {
          value: "withdrawn",
          label: "已撤回"
        },
        {
          value: "approved",
          label: "已通过"
        }
      ],
      queryForm1: {
        formData: {
          form_type_code: "REIMBURSEMENT_APPLICATION",
          status: ""
        }
      },
      formDialog: {
        show: false,
        title: "",
        data: null
      },
      simulateDialog: {
        show: false,
        data: null
      },
      filePreview: {
        show: false,
        data: {
          url: "",
          name: "",
          type: ""
        }
      },
      detailDialog: {
        show: false,
        currentTasks: [],
        data: null
      },
      deleteDialog: {
        show: false,
        content: "确定删除该报销申请吗？",
        data: null
      },
      processInfo: {
        tasks: [],
        instance: null
      },
      statusHistory: []
    };
  },
  onLoad(options = {}) {
    this.init(options);
  },
  onShow() {
    this.loadListData(true);
  },
  methods: {
    /* ---------- 工具 ---------- */
    getReimbursementTypeText(type) {
      const map = {
        travel: "差旅费",
        office_supplies: "办公用品",
        entertainment: "招待费",
        training: "培训费",
        transportation: "交通费",
        other: "其他"
      };
      return map[type] || type || "未指定";
    },
    filePreviewClose() {
      this.filePreview.show = false;
    },
    closeFormDialog() {
      this.formDialog.show = false;
    },
    getStatusTagType(s) {
      const m = {
        draft: "info",
        pending: "warning",
        rejected: "error",
        withdrawn: "default",
        approved: "success"
      };
      return m[s] || "default";
    },
    getStatusText(s) {
      const m = {
        draft: "草稿",
        pending: "待处理",
        rejected: "已驳回",
        withdrawn: "已撤回",
        approved: "已通过"
      };
      return m[s] || s;
    },
    formatDate(ts, fmt) {
      if (!ts)
        return "-";
      return vk.pubfn.timeFormat(ts, fmt || "yyyy-MM-dd hh:mm:ss");
    },
    /* ---------- 初始化 ---------- */
    async init() {
      try {
        this.loading = true;
        await this.loadFormTypes();
        await this.getFormTypeSchema();
        if (!this.formSchema)
          this.useDefaultFormSchema();
        await this.loadListData();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/workflow/reimbursement/index.vue:369", "init error", e);
        this.useDefaultFormSchema();
      } finally {
        this.loading = false;
      }
    },
    async loadFormTypes() {
      const res = await vk.callFunction({
        url: "admin/bpmn/form-type/sys/getList",
        data: {
          status: "active",
          pageIndex: 1,
          pageSize: -1
        }
      });
      if (res.code === 0 && res.rows) {
        const configs = {};
        res.rows.forEach((ft) => configs[ft.code] = ft);
        this.formTypeConfigs = configs;
      }
    },
    async getFormTypeSchema() {
      var _a;
      const ft = this.formTypeConfigs[this.formTypeCode];
      if (ft == null ? void 0 : ft.form_schema) {
        this.formSchema = JSON.parse(ft.form_schema);
      } else {
        const res = await vk.callFunction({
          url: "admin/bpmn/form-type/sys/getList",
          data: {
            code: this.formTypeCode,
            status: "active"
          }
        });
        if (res.code === 0 && ((_a = res.rows) == null ? void 0 : _a.length) > 0) {
          this.formSchema = res.rows[0].form_schema ? JSON.parse(res.rows[0].form_schema) : null;
        }
      }
    },
    useDefaultFormSchema() {
      this.formSchema = {
        fields: [
          {
            name: "reimbursement_title",
            label: "报销标题",
            type: "text",
            required: true,
            placeholder: "如：差旅费报销、办公用品采购",
            defaultValue: ""
          },
          {
            name: "reimbursement_currency",
            label: "币种",
            type: "select",
            disabled: true,
            required: true,
            options: [{
              value: "CNY",
              label: "人民币"
            }, {
              value: "USD",
              label: "美元"
            }],
            defaultValue: "CNY"
          },
          {
            name: "reimbursement_type",
            label: "报销类型",
            type: "select",
            required: true,
            options: [{
              value: "travel",
              label: "差旅费"
            }, {
              value: "office_supplies",
              label: "办公用品"
            }, {
              value: "entertainment",
              label: "招待费"
            }, {
              value: "training",
              label: "培训费"
            }, {
              value: "transportation",
              label: "交通费"
            }, {
              value: "other",
              label: "其他"
            }],
            defaultValue: "travel"
          },
          {
            name: "items",
            label: "费用明细",
            type: "array<object>",
            required: true,
            showAdd: true,
            showClear: true,
            showSort: true,
            defaultValue: {
              expense_type: "",
              expense_amount: 0,
              expense_remark: ""
            },
            columns: [
              {
                key: "expense_type",
                title: "费用科目",
                type: "text",
                required: true,
                placeholder: "如：机票、住宿、餐饮"
              },
              {
                key: "expense_amount",
                title: "金额",
                type: "number",
                required: true,
                min: 0.01,
                step: 0.01,
                placeholder: "请输入金额"
              },
              {
                key: "expense_remark",
                title: "说明",
                type: "text",
                required: false,
                placeholder: "备注说明（可选）",
                maxLength: 200
              }
            ]
          },
          {
            name: "total_detail_amount",
            label: "报销合计金额",
            type: "text",
            disabled: true,
            defaultValue: "0"
          },
          {
            name: "reimbursement_reason",
            label: "报销事由",
            type: "textarea",
            required: true,
            placeholder: "请详细说明报销事由",
            rows: 4,
            maxLength: 500
          },
          {
            name: "remarks",
            label: "备注",
            type: "textarea",
            required: false,
            placeholder: "其他需要说明的事项",
            rows: 3,
            maxLength: 500
          },
          {
            name: "file_attachments",
            label: "相关附件",
            type: "file",
            required: false,
            multiple: true,
            accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png",
            maxSize: 10,
            maxCount: 10
          }
        ],
        layout: {
          type: "grid",
          columns: 2,
          groups: [
            {
              title: "基本信息",
              fields: ["reimbursement_title", "reimbursement_currency", "reimbursement_type"]
            },
            {
              title: "费用明细",
              fields: ["items"],
              fullWidth: true
            },
            {
              title: "报销合计金额",
              fields: ["total_detail_amount"]
            },
            {
              title: "报销事由",
              fields: ["reimbursement_reason"],
              fullWidth: true
            },
            {
              title: "备注与附件",
              fields: ["remarks", "file_attachments"],
              fullWidth: true
            }
          ]
        }
      };
    },
    /* ---------- 数据加载 ---------- */
    async loadListData(reset = true) {
      if (reset) {
        this.pagination.pageIndex = 1;
        this.hasMore = true;
        this.loadMoreStatus = "loadmore";
      }
      const params = {
        pageIndex: this.pagination.pageIndex,
        pageSize: this.pagination.pageSize,
        ...this.queryForm1.formData
      };
      const res = await vk.callFunction({
        url: "client/bpmn/application-form/sys/getList",
        data: params
      });
      if (res.code === 0) {
        const data = res.rows || [];
        if (reset)
          this.tableData = data;
        else
          this.tableData = [...this.tableData, ...data];
        this.pagination.total = res.total || 0;
        this.countStats();
        this.hasMore = data.length >= this.pagination.pageSize;
        this.loadMoreStatus = this.hasMore ? "loadmore" : "nomore";
      }
      this.loading = false;
      this.refreshing = false;
      common_vendor.index.stopPullDownRefresh();
    },
    countStats() {
      this.totalCount = this.tableData.length;
      this.draftCount = this.tableData.filter((i) => i.status === "draft").length;
      this.pendingCount = this.tableData.filter((i) => i.status === "pending").length;
    },
    onPullDownRefresh() {
      this.refreshing = true;
      this.loadListData(true);
    },
    loadMore() {
      if (!this.hasMore || this.loadMoreStatus === "loading" || this.loading)
        return;
      this.loadMoreStatus = "loading";
      this.pagination.pageIndex++;
      this.loadListData(false);
    },
    /* ---------- 筛选 ---------- */
    getStatusTitle() {
      var _a;
      const v = this.queryForm1.formData.status;
      if (!v)
        return "全部状态";
      return ((_a = this.statusOptions.find((o) => o.value === v)) == null ? void 0 : _a.label) || "状态";
    },
    handleStatusChange(status) {
      this.queryForm1.formData.status = status;
      this.loadListData(true);
    },
    /* ---------- 权限 ---------- */
    canEdit(item) {
      var _a;
      return item.status === "draft" && item.applicant_id === ((_a = vk.getVuex("$user.userInfo")) == null ? void 0 : _a.username);
    },
    canDelete(item) {
      return this.canEdit(item);
    },
    /* ---------- 操作 ---------- */
    addBtn() {
      if (!this.formSchema) {
        common_vendor.index.showToast({
          title: "表单配置加载中",
          icon: "none"
        });
        return;
      }
      this.formDialog = {
        show: true,
        title: "新建报销申请",
        data: {
          form_type_code: this.formTypeCode,
          form_data: {}
        }
      };
    },
    handleEdit(item) {
      const formData = {
        ...item
      };
      if (item.form_data) {
        Object.keys(item.form_data).forEach((k) => formData[k] = item.form_data[k]);
      }
      this.formDialog = {
        show: true,
        title: "编辑报销申请",
        data: formData
      };
    },
    handleDelete(item) {
      this.deleteDialog.data = item;
      this.deleteDialog.show = true;
    },
    async confirmDelete() {
      var _a;
      const item = this.deleteDialog.data;
      const res = await vk.callFunction({
        url: "admin/bpmn/application-form/sys/delete",
        data: {
          id: item._id
        }
      });
      (_a = item.form_data) == null ? void 0 : _a.file_attachments.forEach((e) => {
        vk.myfn.deleteFile(e);
      });
      if (res.code === 0) {
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
        this.loadListData(true);
      } else {
        common_vendor.index.showToast({
          title: res.msg || "删除失败",
          icon: "none"
        });
      }
      this.deleteDialog.show = false;
    },
    cancelDelete() {
      this.deleteDialog.show = false;
    },
    /* ---------- 保存/提交/试算 ---------- */
    async handleFormSave(formData) {
      formData._id = formData._id || this.formDialog.data._id;
      this.saveFormLoading = true;
      try {
        let url = "admin/bpmn/application-form/sys/add";
        if (formData._id)
          url = "admin/bpmn/application-form/sys/update";
        const res = await vk.callFunction({
          url,
          data: {
            ...formData,
            _id: formData._id
          }
        });
        if (res.code === 0) {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          this.formDialog.show = false;
          this.loadListData(true);
        } else {
          common_vendor.index.showToast({
            title: res.msg || "保存失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        this.saveFormLoading = false;
      }
    },
    async handleFormSubmit(formData) {
      var _a, _b;
      formData._id = formData._id || this.formDialog.data._id;
      this.submitFormLoading = true;
      try {
        const details = ((_a = formData.form_data) == null ? void 0 : _a.items) || [];
        const userInfo = vk.getVuex("$user.userInfo");
        const submitData = {
          ...formData,
          calculated_values: {
            total_amount: total,
            detail_count: details.length
          },
          userInfo,
          title: ((_b = formData.form_data) == null ? void 0 : _b.reimbursement_title) || "报销申请"
        };
        if (formData._id) {
          submitData._id = formData._id;
          submitData.status = "pending";
        }
        const res = await vk.callFunction({
          url: "admin/bpmn/application-form/pub/submit",
          data: submitData
        });
        if (res.code === 0) {
          common_vendor.index.showToast({
            title: "提交成功",
            icon: "success"
          });
          this.formDialog.show = false;
          this.loadListData(true);
        } else {
          common_vendor.index.showToast({
            title: res.msg || "提交失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      } finally {
        this.submitFormLoading = false;
      }
    },
    async handleSimulate(formData) {
      var _a;
      this.simulateFormLoading = true;
      try {
        const details = ((_a = formData.form_data) == null ? void 0 : _a.items) || [];
        const userInfo = vk.getVuex("$user.userInfo");
        const simulateData = {
          form_type_code: this.formTypeCode,
          form_data: formData.form_data,
          calculated_values: {
            total_amount: formData.form_data.total_detail_amount,
            detail_count: details.length
          },
          process_definition_key: "REIMBURSEMENT_APPLICATION",
          userInfo
        };
        const res = await vk.callFunction({
          url: "admin/bpmn/process-engine/pub/simulate",
          data: simulateData
        });
        if (res.code === 0) {
          this.showSimulateResult(this.normalizeSimulateData(res.data));
        } else {
          common_vendor.index.showToast({
            title: res.msg || "试算失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "试算失败",
          icon: "none"
        });
      } finally {
        this.simulateFormLoading = false;
      }
    },
    normalizeSimulateData(rawData) {
      var _a, _b;
      let nodes = rawData.nodes || ((_a = rawData.data) == null ? void 0 : _a.nodes) || ((_b = rawData.process) == null ? void 0 : _b.nodes) || rawData.steps || rawData.tasks || [];
      const standardNodes = nodes.map((n) => ({
        node_key: n.node_key || n.id || `node_${Math.random()}`,
        node_name: n.node_name || n.name || "未命名节点",
        node_type: n.node_type || n.type || "userTask",
        estimated_assignee: n.estimated_assignee || n.assignee || null,
        assignee_type: n.assignee_type || n.assignType || "user",
        assignee_value: n.assignee_value || n.assignValue || "",
        duration_estimate: n.duration_estimate || n.duration || 0,
        actions: n.actions || n.availableActions || [],
        conditions: n.conditions || [],
        next_node_keys: n.next_node_keys || n.nextNodes || []
      }));
      let est = rawData.estimated_duration || rawData.estimatedDuration;
      if (typeof est === "number")
        est = {
          formatted: `${est} 小时`
        };
      else if (!(est == null ? void 0 : est.formatted))
        est = {
          formatted: "未知"
        };
      return {
        nodes: standardNodes,
        process_definition: rawData.process_definition || rawData.processDefinition || null,
        estimated_duration: est,
        total_nodes: standardNodes.length,
        form_type: rawData.form_type || rawData.formType || "未指定",
        ...rawData
      };
    },
    showSimulateResult(result) {
      this.simulateDialog.data = result;
      this.simulateDialog.show = true;
    },
    /* ---------- 详情 ---------- */
    async showDetail(item) {
      this.detailDialog.data = item;
      await this.loadProcessFlow(item);
      await this.loadStatusHistory(item);
      this.detailDialog.show = true;
    },
    async loadProcessFlow(item) {
      var _a;
      try {
        const userInfo = vk.getVuex("$user.userInfo");
        const taskRes = await vk.callFunction({
          url: "admin/bpmn/task/pub/getProcessFlow",
          data: {
            formData: {
              application_id: item._id
            },
            userInfo,
            orderBy: "sequence asc"
          }
        });
        if (taskRes.code === 0)
          this.processInfo.tasks = taskRes.rows || [];
        if (item.process_instance_id) {
          const instanceRes = await vk.callFunction({
            url: "admin/bpmn/instance/sys/getList",
            data: {
              formData: {
                _id: item.process_instance_id
              }
            }
          });
          if (instanceRes.code === 0 && ((_a = instanceRes.rows) == null ? void 0 : _a.length) > 0)
            this.processInfo.instance = instanceRes.rows[0];
        }
      } catch (e) {
      }
    },
    async loadStatusHistory(item) {
      try {
        this.statusHistory = [{
          action: "create",
          operation_time: item._add_time,
          operator_name: item.applicant_name,
          comment: "创建报销申请",
          task_name: "申请创建"
        }];
        const historyRes = await vk.callFunction({
          url: "admin/bpmn/task-history/sys/getList",
          data: {
            formData: {
              application_id: item._id,
              action: "create"
            },
            orderBy: "operation_time asc"
          }
        });
        if (historyRes.code === 0 && historyRes.rows) {
          historyRes.rows.forEach((h) => this.statusHistory.push({
            action: h.action,
            operation_time: h.operation_time,
            operator_name: h.operator_name,
            comment: h.comment,
            task_name: this.getTaskNameFromHistory(h)
          }));
        }
        this.statusHistory.sort((a, b) => a.operation_time - b.operation_time);
      } catch (e) {
      }
    },
    getTaskNameFromHistory(h) {
      var _a;
      if ((_a = h.task_data) == null ? void 0 : _a.node_info)
        return h.task_data.node_info.node_name;
      if (h.task_snapshot)
        return h.task_snapshot.task_name;
      return "任务处理";
    },
    /* ---------- 文件 ---------- */
    previewFile(file) {
      if (!(file == null ? void 0 : file.url)) {
        common_vendor.index.showToast({
          title: "文件地址无效",
          icon: "none"
        });
        return;
      }
      this.filePreview.data = {
        url: file.url,
        name: file.name || "未命名文件",
        type: this.getFileType(file)
      };
      this.filePreview.show = true;
    },
    downloadFile(file) {
      if (!(file == null ? void 0 : file.url)) {
        common_vendor.index.showToast({
          title: "文件地址无效",
          icon: "none"
        });
        return;
      }
      common_vendor.index.downloadFile({
        url: file.url,
        success: (res) => {
          if (res.statusCode === 200) {
            common_vendor.index.saveFile({
              tempFilePath: res.tempFilePath,
              success: () => common_vendor.index.showToast({
                title: "下载成功",
                icon: "success"
              }),
              fail: () => common_vendor.index.showToast({
                title: "保存失败",
                icon: "none"
              })
            });
          } else {
            common_vendor.index.showToast({
              title: "下载失败",
              icon: "none"
            });
          }
        },
        fail: () => common_vendor.index.showToast({
          title: "下载失败",
          icon: "none"
        })
      });
    },
    getFileType(file) {
      if (!file)
        return "unknown";
      const name = file.name || "", type = file.type || "";
      if (type.includes("pdf") || /\.pdf$/i.test(name))
        return "pdf";
      if (type.includes("image") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name))
        return "image";
      if (type.includes("text") || /\.(txt|md)$/i.test(name))
        return "text";
      return "other";
    }
  }
};
if (!Array) {
  const _easycom_u_dropdown_item2 = common_vendor.resolveComponent("u-dropdown-item");
  const _easycom_u_dropdown2 = common_vendor.resolveComponent("u-dropdown");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_tag2 = common_vendor.resolveComponent("u-tag");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_loadmore2 = common_vendor.resolveComponent("u-loadmore");
  const _easycom_u_loading2 = common_vendor.resolveComponent("u-loading");
  const _easycom_dynamic_form_dialog2 = common_vendor.resolveComponent("dynamic-form-dialog");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  const _easycom_simulate_handle_dialog2 = common_vendor.resolveComponent("simulate-handle-dialog");
  const _easycom_approve_header_detail2 = common_vendor.resolveComponent("approve-header-detail");
  const _easycom_u_modal2 = common_vendor.resolveComponent("u-modal");
  const _easycom_file_preview_dialog2 = common_vendor.resolveComponent("file-preview-dialog");
  (_easycom_u_dropdown_item2 + _easycom_u_dropdown2 + _easycom_u_icon2 + _easycom_u_button2 + _easycom_u_tag2 + _easycom_u_empty2 + _easycom_u_loadmore2 + _easycom_u_loading2 + _easycom_dynamic_form_dialog2 + _easycom_u_popup2 + _easycom_simulate_handle_dialog2 + _easycom_approve_header_detail2 + _easycom_u_modal2 + _easycom_file_preview_dialog2)();
}
const _easycom_u_dropdown_item = () => "../../../uni_modules/vk-uview-ui/components/u-dropdown-item/u-dropdown-item.js";
const _easycom_u_dropdown = () => "../../../uni_modules/vk-uview-ui/components/u-dropdown/u-dropdown.js";
const _easycom_u_icon = () => "../../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_button = () => "../../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_tag = () => "../../../uni_modules/vk-uview-ui/components/u-tag/u-tag.js";
const _easycom_u_empty = () => "../../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loadmore = () => "../../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
const _easycom_u_loading = () => "../../../uni_modules/vk-uview-ui/components/u-loading/u-loading.js";
const _easycom_dynamic_form_dialog = () => "../../../components/dynamic-form-dialog/dynamic-form-dialog.js";
const _easycom_u_popup = () => "../../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
const _easycom_simulate_handle_dialog = () => "../../../components/simulate-handle-dialog/simulate-handle-dialog.js";
const _easycom_approve_header_detail = () => "../../../components/approve-header-detail/approve-header-detail.js";
const _easycom_u_modal = () => "../../../uni_modules/vk-uview-ui/components/u-modal/u-modal.js";
const _easycom_file_preview_dialog = () => "../../../components/file-preview-dialog/file-preview-dialog.js";
if (!Math) {
  (_easycom_u_dropdown_item + _easycom_u_dropdown + _easycom_u_icon + _easycom_u_button + _easycom_u_tag + _easycom_u_empty + _easycom_u_loadmore + _easycom_u_loading + _easycom_dynamic_form_dialog + _easycom_u_popup + _easycom_simulate_handle_dialog + _easycom_approve_header_detail + _easycom_u_modal + _easycom_file_preview_dialog)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleStatusChange, "51"),
    b: common_vendor.o(($event) => $data.queryForm1.formData.status = $event, "a0"),
    c: common_vendor.p({
      title: $options.getStatusTitle(),
      options: $data.statusOptions,
      modelValue: $data.queryForm1.formData.status
    }),
    d: common_vendor.sr("statusFilter", "4f13b818-0"),
    e: common_vendor.p({
      ["active-color"]: "#2979ff"
    }),
    f: common_vendor.p({
      name: "plus",
      size: "20",
      color: "#fff"
    }),
    g: common_vendor.o($options.addBtn, "2a"),
    h: common_vendor.p({
      type: "primary",
      shape: "circle",
      size: "medium",
      plain: false,
      ["custom-style"]: $data.buttonStyle.primary
    }),
    i: common_vendor.t($data.totalCount),
    j: common_vendor.o(($event) => $options.handleStatusChange(""), "b3"),
    k: common_vendor.t($data.draftCount),
    l: common_vendor.o(($event) => $options.handleStatusChange("draft"), "a5"),
    m: common_vendor.t($data.pendingCount),
    n: common_vendor.o(($event) => $options.handleStatusChange("pending"), "33"),
    o: $data.loading && !$data.formSchema
  }, $data.loading && !$data.formSchema ? {
    p: common_vendor.f(3, (i, k0, i0) => {
      return {
        a: i
      };
    })
  } : common_vendor.e({
    q: common_vendor.f($data.tableData, (item, index, i0) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: "4f13b818-4-" + i0,
        b: common_vendor.t(((_a = item.form_data) == null ? void 0 : _a.reimbursement_title) || "未命名报销"),
        c: common_vendor.t($options.getStatusText(item.status)),
        d: "4f13b818-5-" + i0,
        e: common_vendor.p({
          type: $options.getStatusTagType(item.status),
          size: "mini",
          border: false
        }),
        f: common_vendor.t($options.getReimbursementTypeText((_b = item.form_data) == null ? void 0 : _b.reimbursement_type)),
        g: common_vendor.t(((_c = item.form_data) == null ? void 0 : _c.total_detail_amount) || "0"),
        h: common_vendor.t(item.applicant_name || "未知"),
        i: common_vendor.t($options.formatDate(item._add_time, "yyyy-MM-dd")),
        j: $options.canEdit(item)
      }, $options.canEdit(item) ? {
        k: common_vendor.o(($event) => $options.handleEdit(item), index),
        l: "4f13b818-6-" + i0,
        m: common_vendor.p({
          type: "primary",
          size: "medium",
          plain: true,
          ["custom-style"]: $data.buttonStyle.plain
        })
      } : {}, {
        n: $options.canDelete(item)
      }, $options.canDelete(item) ? {
        o: common_vendor.o(($event) => $options.handleDelete(item), index),
        p: "4f13b818-7-" + i0,
        q: common_vendor.p({
          type: "error",
          size: "medium",
          plain: true,
          ["custom-style"]: $data.buttonStyle.dangerPlain
        })
      } : {}, {
        r: common_vendor.o(($event) => $options.showDetail(item), index),
        s: "4f13b818-8-" + i0,
        t: index
      });
    }),
    r: common_vendor.p({
      name: "rmb-circle",
      size: "32",
      color: "#2979ff"
    }),
    s: common_vendor.p({
      type: "info",
      size: "medium",
      plain: true,
      ["custom-style"]: $data.buttonStyle.infoPlain
    }),
    t: !$data.loading && $data.tableData.length === 0
  }, !$data.loading && $data.tableData.length === 0 ? {
    v: common_vendor.o($options.addBtn, "13"),
    w: common_vendor.p({
      type: "primary",
      shape: "circle",
      customStyle: $data.buttonStyle.primary
    }),
    x: common_vendor.p({
      mode: "data",
      icon: "/static/empty.png",
      text: "暂无报销申请记录"
    })
  } : {}, {
    y: $data.hasMore && $data.tableData.length > 0
  }, $data.hasMore && $data.tableData.length > 0 ? {
    z: common_vendor.p({
      status: $data.loadMoreStatus,
      ["load-text"]: $data.loadText
    })
  } : {}, {
    A: $data.refreshing,
    B: common_vendor.o((...args) => $options.onPullDownRefresh && $options.onPullDownRefresh(...args), "ae"),
    C: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "d5")
  }), {
    D: common_vendor.t($data.formDialog.title),
    E: !$data.formSchema
  }, !$data.formSchema ? {
    F: common_vendor.p({
      mode: "circle",
      size: "36",
      color: "#2979ff"
    })
  } : {
    G: common_vendor.o($options.handleFormSave, "69"),
    H: common_vendor.o($options.handleFormSubmit, "6f"),
    I: common_vendor.o($options.handleSimulate, "15"),
    J: common_vendor.o($options.previewFile, "d6"),
    K: common_vendor.o($options.closeFormDialog, "f9"),
    L: common_vendor.o($options.downloadFile, "54"),
    M: common_vendor.p({
      ["form-schema"]: $data.formSchema,
      ["form-type-code"]: $data.formTypeCode,
      value: $data.formDialog.show,
      ["initial-data"]: $data.formDialog.data,
      butVisible: true,
      saveLoading: $data.saveFormLoading,
      submitLoading: $data.submitFormLoading,
      simulateLoading: $data.simulateFormLoading
    })
  }, {
    N: common_vendor.o(($event) => $data.formDialog.show = $event, "b4"),
    O: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.formDialog.show
    }),
    P: common_vendor.p({
      ["simulate-data"]: $data.simulateDialog.data
    }),
    Q: common_vendor.o(($event) => $data.simulateDialog.show = $event, "de"),
    R: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.simulateDialog.show
    }),
    S: !$data.formSchema
  }, !$data.formSchema ? {
    T: common_vendor.p({
      mode: "circle",
      size: "36",
      color: "#2979ff"
    })
  } : {
    U: common_vendor.o($options.previewFile, "c7"),
    V: common_vendor.o($options.downloadFile, "1f"),
    W: common_vendor.p({
      ["detail-data"]: $data.detailDialog.data,
      ["form-schema"]: $data.formSchema,
      ["process-info"]: $data.processInfo,
      ["status-history"]: $data.statusHistory,
      ["current-tasks"]: $data.detailDialog.currentTasks,
      ["show-basic-info"]: true,
      ["show-return-info"]: false,
      ["show-approval-flow"]: true,
      ["show-current-task"]: true,
      ["show-handle-form"]: false,
      ["form-type-configs"]: $data.formTypeConfigs
    })
  }, {
    X: common_vendor.o(($event) => $data.detailDialog.show = $event, "c6"),
    Y: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.detailDialog.show
    }),
    Z: common_vendor.o($options.confirmDelete, "5f"),
    aa: common_vendor.o($options.cancelDelete, "cf"),
    ab: common_vendor.o(($event) => $data.deleteDialog.show = $event, "a1"),
    ac: common_vendor.p({
      ["show-cancel-button"]: true,
      ["show-confirm-button"]: true,
      ["async-close"]: true,
      content: $data.deleteDialog.content,
      modelValue: $data.deleteDialog.show
    }),
    ad: common_vendor.o($options.filePreviewClose, "77"),
    ae: common_vendor.o($options.downloadFile, "e2"),
    af: common_vendor.p({
      value: $data.filePreview.show,
      ["file-data"]: $data.filePreview.data
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4f13b818"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/workflow/reimbursement/index.js.map
