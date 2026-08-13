"use strict";
const common_vendor = require("../../../common/vendor.js");
const DynamicFormDialog = () => "../../../components/dynamic-form-dialog/dynamic-form-dialog.js";
const SimulateHandleDialog = () => "../../../components/simulate-handle-dialog/simulate-handle-dialog.js";
const FilePreviewDialog = () => "../../../components/file-preview-dialog/file-preview-dialog.js";
const ApproveHeaderDetail = () => "../../../components/approve-header-detail/approve-header-detail.js";
const _sfc_main = {
  name: "SealApply",
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
      // 按钮自定义样式对象
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
        },
        warningPlain: {
          padding: "0 24rpx",
          border: "1rpx solid #e6a23c",
          color: "#e6a23c",
          background: "transparent"
        }
      },
      // 加载状态
      loading: true,
      refreshing: false,
      // 按钮加载状态
      addLoading: false,
      saveFormLoading: false,
      submitFormLoading: false,
      simulateFormLoading: false,
      // 表单配置
      formSchema: null,
      formTypeCode: "SEAL_APPLY",
      formTypeConfigs: {},
      // 列表数据
      tableData: [],
      totalCount: 0,
      draftCount: 0,
      pendingCount: 0,
      // 分页
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
      // 状态筛选
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
      // 查询表单
      queryForm1: {
        formData: {
          form_type_code: "SEAL_APPLY",
          status: ""
        }
      },
      // 弹窗相关
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
        title: "用印申请详情",
        currentTasks: [],
        data: null
      },
      deleteDialog: {
        show: false,
        content: "确定删除该用印申请吗？",
        data: null
      },
      // 审批流程
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
  onPullDownRefresh() {
    this.onPullDownRefresh();
  },
  methods: {
    normalizeSimulateData(rawData) {
      var _a, _b;
      let nodes = rawData.nodes || ((_a = rawData.data) == null ? void 0 : _a.nodes) || ((_b = rawData.process) == null ? void 0 : _b.nodes) || rawData.steps || rawData.tasks;
      if (!Array.isArray(nodes))
        nodes = [];
      const standardNodes = nodes.map((node) => ({
        node_key: node.node_key || node.id || `node_${Math.random()}`,
        node_name: node.node_name || node.name || "未命名节点",
        node_type: node.node_type || node.type || "userTask",
        estimated_assignee: node.estimated_assignee || node.assignee || null,
        assignee_type: node.assignee_type || node.assignType || "user",
        assignee_value: node.assignee_value || node.assignValue || "",
        duration_estimate: node.duration_estimate || node.duration || 0,
        actions: node.actions || node.availableActions || [],
        conditions: node.conditions || [],
        next_node_keys: node.next_node_keys || node.nextNodes || []
      }));
      let estimatedDuration = rawData.estimated_duration || rawData.estimatedDuration;
      if (estimatedDuration && typeof estimatedDuration === "number") {
        estimatedDuration = {
          formatted: `${estimatedDuration} 小时`
        };
      } else if (estimatedDuration && !estimatedDuration.formatted) {
        estimatedDuration = {
          formatted: "未知"
        };
      }
      return {
        nodes: standardNodes,
        process_definition: rawData.process_definition || rawData.processDefinition || null,
        estimated_duration: estimatedDuration,
        total_nodes: standardNodes.length,
        form_type: rawData.form_type || rawData.formType || "未指定",
        ...rawData
        // 保留其他原始字段
      };
    },
    filePreviewClose() {
      this.filePreview.show = false;
    },
    // 关闭表单弹窗
    closeFormDialog() {
      this.formDialog.show = false;
    },
    async init(options) {
      try {
        this.loading = true;
        await this.loadFormTypes();
        await this.getFormTypeSchema();
        if (!this.formSchema) {
          common_vendor.index.__f__("warn", "at pages/workflow/seal/index.vue:409", "表单配置加载失败，使用备用表单");
          this.useDefaultFormSchema();
        }
        await this.loadListData();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:416", "初始化失败:", error);
        this.useDefaultFormSchema();
      } finally {
        this.loading = false;
      }
    },
    // 加载表单类型
    async loadFormTypes() {
      try {
        const res = await vk.callFunction({
          url: "admin/bpmn/form-type/sys/getList",
          data: {
            status: "active",
            pageIndex: 1,
            pageSize: -1
          }
        });
        common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:436", "加载表单类型结果:", res);
        if (res.code === 0 && res.rows) {
          const configs = {};
          res.rows.forEach((formType) => {
            configs[formType.code] = formType;
          });
          this.formTypeConfigs = configs;
          common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:444", "表单类型配置已加载:", Object.keys(configs));
        } else {
          common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:446", "加载表单类型失败:", res.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:449", "加载表单类型失败:", error);
      }
    },
    // 获取表单schema - 优化版本
    async getFormTypeSchema() {
      try {
        const res = await vk.callFunction({
          url: "admin/bpmn/form-type/sys/getList",
          data: {
            code: this.formTypeCode,
            status: "active"
          }
        });
        if (res.code === 0 && res.rows && res.rows.length > 0) {
          const formType = res.rows[0];
          common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:467", "直接获取表单类型成功:", formType);
          if (formType.form_schema) {
            try {
              this.formSchema = JSON.parse(formType.form_schema);
              common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:472", "表单schema解析成功");
              return;
            } catch (parseError) {
              common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:475", "表单schema解析失败:", parseError);
            }
          }
        }
        if (this.formTypeConfigs[this.formTypeCode]) {
          const formType = this.formTypeConfigs[this.formTypeCode];
          if (formType.form_schema) {
            try {
              this.formSchema = JSON.parse(formType.form_schema);
              common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:486", "从缓存获取表单schema成功");
              return;
            } catch (parseError) {
              common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:489", "表单schema解析失败:", parseError);
            }
          }
        }
        common_vendor.index.__f__("warn", "at pages/workflow/seal/index.vue:495", "无法加载表单配置，使用默认表单");
        this.useDefaultFormSchema();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:499", "获取表单schema失败:", error);
        this.useDefaultFormSchema();
      }
    },
    // 使用默认表单配置
    useDefaultFormSchema() {
      this.formSchema = {
        fields: [
          {
            name: "file_name",
            label: "文件名称",
            type: "text",
            required: true,
            placeholder: "请输入文件名称",
            rules: [{
              required: true,
              message: "请输入文件名称"
            }]
          },
          {
            name: "seal_type",
            label: "用印类型",
            type: "select",
            required: true,
            placeholder: "请选择用印类型",
            options: [
              {
                value: "company_seal",
                label: "公司印章"
              },
              {
                value: "finance_seal",
                label: "财务印章"
              },
              {
                value: "contract_seal",
                label: "合同专用章"
              },
              {
                value: "legal_seal",
                label: "法人章"
              }
            ],
            rules: [{
              required: true,
              message: "请选择用印类型"
            }]
          },
          {
            name: "file_type",
            label: "文件类型",
            type: "select",
            required: true,
            placeholder: "请选择文件类型",
            options: [
              {
                value: "contract",
                label: "合同"
              },
              {
                value: "certificate",
                label: "证明文件"
              },
              {
                value: "report",
                label: "报告"
              },
              {
                value: "agreement",
                label: "协议"
              },
              {
                value: "other",
                label: "其他"
              }
            ],
            rules: [{
              required: true,
              message: "请选择文件类型"
            }]
          },
          {
            name: "copies",
            label: "份数",
            type: "number",
            required: true,
            placeholder: "请输入份数",
            min: 1,
            max: 100,
            rules: [
              {
                required: true,
                message: "请输入份数"
              },
              {
                type: "number",
                min: 1,
                message: "份数必须大于0"
              }
            ]
          },
          {
            name: "remark",
            label: "备注",
            type: "textarea",
            placeholder: "请输入备注信息（可选）",
            rows: 3
          }
        ]
      };
      common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:606", "已使用默认表单配置");
    },
    // 加载列表数据
    async loadListData(reset = true) {
      try {
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
          const total = res.total || 0;
          if (reset) {
            this.tableData = data;
          } else {
            this.tableData = [...this.tableData, ...data];
          }
          this.pagination.total = total;
          this.totalCount = this.tableData.length;
          this.draftCount = this.tableData.filter((item) => item.status === "draft").length;
          this.pendingCount = this.tableData.filter((item) => item.status === "pending").length;
          if (data.length < this.pagination.pageSize) {
            this.hasMore = false;
            this.loadMoreStatus = "nomore";
          } else {
            this.hasMore = true;
            this.loadMoreStatus = "loadmore";
          }
        } else {
          common_vendor.index.showToast({
            title: res.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:661", "加载列表数据失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
        common_vendor.index.stopPullDownRefresh();
      }
    },
    // 下拉刷新
    onPullDownRefresh() {
      this.refreshing = true;
      this.loadListData(true);
    },
    // 加载更多
    loadMore() {
      if (!this.hasMore || this.loadMoreStatus === "loading" || this.loading) {
        return;
      }
      this.loadMoreStatus = "loading";
      this.pagination.pageIndex++;
      this.loadListData(false);
    },
    // 获取状态标题
    getStatusTitle() {
      const status = this.queryForm1.formData.status;
      if (!status)
        return "全部状态";
      const option = this.statusOptions.find((opt) => opt.value === status);
      return option ? option.label : "状态";
    },
    // 状态筛选变化
    handleStatusChange(status) {
      this.queryForm1.formData.status = status;
      this.loadListData(true);
    },
    // 获取状态标签类型
    getStatusTagType(status) {
      switch (status) {
        case "draft":
          return "info";
        case "pending":
          return "warning";
        case "rejected":
          return "error";
        case "withdrawn":
          return "default";
        case "approved":
          return "success";
        default:
          return "default";
      }
    },
    // 获取状态文本
    getStatusText(status) {
      switch (status) {
        case "draft":
          return "草稿";
        case "pending":
          return "待处理";
        case "rejected":
          return "已驳回";
        case "withdrawn":
          return "已撤回";
        case "approved":
          return "已通过";
        default:
          return status;
      }
    },
    // 判断是否可以编辑
    canEdit(item) {
      const userInfo = vk.getVuex("$user.userInfo");
      return item.status === "draft" && item.applicant_id === ((userInfo == null ? void 0 : userInfo.username) || (userInfo == null ? void 0 : userInfo.user_id));
    },
    // 判断是否可以删除
    canDelete(item) {
      const userInfo = vk.getVuex("$user.userInfo");
      return item.status === "draft" && item.applicant_id === ((userInfo == null ? void 0 : userInfo.username) || (userInfo == null ? void 0 : userInfo.user_id));
    },
    // 处理编辑
    handleEdit(item) {
      this.updateBtn({
        item
      });
    },
    // 处理删除
    handleDelete(item) {
      this.deleteDialog.data = item;
      this.deleteDialog.show = true;
    },
    // 确认删除
    async confirmDelete() {
      var _a;
      const item = this.deleteDialog.data;
      if (!item)
        return;
      try {
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
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:796", "删除失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      } finally {
        this.deleteDialog.show = false;
      }
    },
    // 取消删除
    cancelDelete() {
      this.deleteDialog.show = false;
    },
    // 新建按钮 - 优化版本
    addBtn() {
      if (!this.formSchema) {
        common_vendor.index.__f__("warn", "at pages/workflow/seal/index.vue:815", "表单schema未加载，尝试重新加载");
        this.loadFormSchemaAndOpenDialog();
        return;
      }
      this.openFormDialog();
    },
    // 加载表单schema并打开对话框
    async loadFormSchemaAndOpenDialog() {
      this.addLoading = true;
      try {
        await this.getFormTypeSchema();
        if (this.formSchema) {
          this.openFormDialog();
        } else {
          common_vendor.index.showToast({
            title: "表单配置加载失败，请稍后重试",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:838", "加载表单schema失败:", error);
        common_vendor.index.showToast({
          title: "表单配置加载失败",
          icon: "none"
        });
      } finally {
        this.addLoading = false;
      }
    },
    // 打开表单对话框
    openFormDialog() {
      this.formDialog = {
        show: true,
        title: "新建用印申请",
        data: {
          form_type_code: this.formTypeCode,
          form_data: {}
        }
      };
      common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:858", "打开表单对话框，formSchema:", this.formSchema);
    },
    // 编辑按钮
    updateBtn({
      item
    }) {
      if (!this.formSchema) {
        common_vendor.index.showToast({
          title: "表单配置加载中，请稍后重试",
          icon: "none"
        });
        return;
      }
      const formData = {
        ...item
      };
      if (item.form_data) {
        Object.keys(item.form_data).forEach((key) => {
          formData[key] = item.form_data[key];
        });
      }
      this.formDialog = {
        show: true,
        title: "编辑用印申请",
        data: formData
      };
    },
    // 刷新按钮
    refresh() {
      this.loadListData(true);
    },
    // 显示详情
    async showDetail(item) {
      this.detailDialog.data = item;
      await this.loadProcessFlow(item);
      await this.loadStatusHistory(item);
      this.detailDialog.show = true;
    },
    // 加载审批流程
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
        if (taskRes.code === 0) {
          this.processInfo.tasks = taskRes.rows || [];
        }
        if (item.process_instance_id) {
          const instanceRes = await vk.callFunction({
            url: "admin/bpmn/instance/sys/getList",
            data: {
              formData: {
                _id: item.process_instance_id
              }
            }
          });
          if (instanceRes.code === 0 && ((_a = instanceRes.rows) == null ? void 0 : _a.length) > 0) {
            this.processInfo.instance = instanceRes.rows[0];
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:940", "加载审批流程失败:", error);
      }
    },
    // 加载审批历史
    async loadStatusHistory(item) {
      try {
        this.statusHistory = [];
        this.statusHistory.push({
          action: "create",
          operation_time: item._add_time,
          operator_name: item.applicant_name,
          comment: "创建用印申请",
          task_name: "申请创建"
        });
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
          historyRes.rows.forEach((history) => {
            this.statusHistory.push({
              action: history.action,
              operation_time: history.operation_time,
              operator_name: history.operator_name,
              comment: history.comment,
              task_name: this.getTaskNameFromHistory(history)
            });
          });
        }
        this.statusHistory.sort((a, b) => a.operation_time - b.operation_time);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:982", "加载状态历史失败:", error);
      }
    },
    getTaskNameFromHistory(history) {
      var _a;
      if ((_a = history.task_data) == null ? void 0 : _a.node_info) {
        return history.task_data.node_info.node_name;
      }
      if (history.task_snapshot) {
        return history.task_snapshot.task_name;
      }
      return "任务处理";
    },
    // 表单保存
    async handleFormSave(formData) {
      formData._id = formData._id ? formData._id : this.formDialog.data._id;
      this.saveFormLoading = true;
      try {
        let url = "admin/bpmn/application-form/sys/add";
        if (formData._id) {
          url = "admin/bpmn/application-form/sys/update";
        }
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
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:1028", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        this.saveFormLoading = false;
      }
    },
    // 表单提交
    async handleFormSubmit(formData) {
      var _a, _b;
      formData._id = formData._id ? formData._id : this.formDialog.data._id;
      this.submitFormLoading = true;
      try {
        const userInfo = vk.getVuex("$user.userInfo");
        const calculatedValues = {
          file_count: 1,
          total_pages: ((_a = formData.form_data) == null ? void 0 : _a.copies) || 1
        };
        const title = `${(userInfo == null ? void 0 : userInfo.username) || "用户"}的${this.getFieldOptionLabel("seal_type", (_b = formData.form_data) == null ? void 0 : _b.seal_type)}用印申请`;
        const submitData = {
          ...formData,
          calculated_values: calculatedValues,
          userInfo,
          title
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
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:1083", "提交失败:", error);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      } finally {
        this.submitFormLoading = false;
      }
    },
    // 试算流程
    async handleSimulate(formData) {
      var _a;
      this.simulateFormLoading = true;
      try {
        const userInfo = vk.getVuex("$user.userInfo");
        const calculatedValues = {
          file_count: 1,
          total_pages: ((_a = formData.form_data) == null ? void 0 : _a.copies) || 1
        };
        const simulateData = {
          form_type_code: this.formTypeCode,
          form_data: formData.form_data,
          calculated_values: calculatedValues,
          userInfo
        };
        const res = await vk.callFunction({
          url: "admin/bpmn/process-engine/pub/simulate",
          data: simulateData
        });
        if (res.code === 0) {
          let simulateResult = res.data;
          if (res.data && res.data.data) {
            simulateResult = res.data.data;
          }
          this.showSimulateResult(simulateResult);
        } else {
          common_vendor.index.showToast({
            title: res.msg || "试算失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:1129", "试算失败:", error);
        common_vendor.index.showToast({
          title: "试算失败",
          icon: "none"
        });
      } finally {
        this.simulateFormLoading = false;
      }
    },
    // 显示试算结果
    showSimulateResult(result) {
      const normalizedData = this.normalizeSimulateData(result);
      common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:1142", "标准化后数据:", normalizedData);
      if (!normalizedData.nodes.length) {
        common_vendor.index.showToast({
          title: "试算结果格式异常",
          icon: "none"
        });
      }
      this.simulateDialog.data = normalizedData;
      this.simulateDialog.show = true;
    },
    // 确认提交申请
    submitAfterSimulate() {
      this.simulateDialog.show = false;
      this.handleFormSubmit(this.formDialog.data);
    },
    // 获取字段选项标签
    getFieldOptionLabel(fieldName, value) {
      var _a;
      if (!((_a = this.formSchema) == null ? void 0 : _a.fields))
        return value;
      const field = this.formSchema.fields.find((f) => f.name === fieldName);
      if (!(field == null ? void 0 : field.options))
        return value;
      const option = field.options.find((opt) => opt.value === value);
      return option ? option.label : value;
    },
    // 格式化日期
    formatDate(timestamp, formatStr) {
      if (!timestamp)
        return "-";
      return vk.pubfn.timeFormat(timestamp, formatStr || "yyyy-MM-dd hh:mm:ss");
    },
    // 文件预览
    previewFile(file) {
      common_vendor.index.__f__("log", "at pages/workflow/seal/index.vue:1176", file);
      if (!(file == null ? void 0 : file.url)) {
        common_vendor.index.showToast({
          title: "文件地址无效",
          icon: "none"
        });
        return;
      }
      this.filePreview.data = {
        url: file.url,
        name: file.name,
        type: this.getFileType(file)
      };
      this.filePreview.show = true;
    },
    // 下载文件			
    downloadFile(file) {
      if (!(file == null ? void 0 : file.url)) {
        common_vendor.index.showToast({
          title: "文件地址无效",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "准备下载"
      });
      common_vendor.index.downloadFile({
        url: file.url,
        success: (res) => {
          if (res.statusCode === 200) {
            common_vendor.index.saveFile({
              tempFilePath: res.tempFilePath,
              success: (saveRes) => {
                common_vendor.index.showToast({
                  title: `文件已保存到: ${saveRes.savedFilePath}`,
                  icon: "success",
                  duration: 3e3
                });
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:1223", "保存文件失败", err);
                common_vendor.index.showToast({
                  title: "保存失败: " + err.errMsg,
                  icon: "none"
                });
              }
            });
          } else {
            common_vendor.index.showToast({
              title: `下载失败(${res.statusCode})`,
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/workflow/seal/index.vue:1238", "下载失败", err);
          common_vendor.index.showToast({
            title: "下载失败: " + (err.errMsg || "网络错误"),
            icon: "none",
            duration: 3e3
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    },
    // 获取文件类型
    getFileType(file) {
      if (!file)
        return "unknown";
      const name = file.name || "";
      const type = file.type || "";
      if (type.includes("pdf") || name.toLowerCase().endsWith(".pdf")) {
        return "pdf";
      } else if (type.includes("image") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) {
        return "image";
      } else if (type.includes("text") || /\.(txt|md)$/i.test(name)) {
        return "text";
      } else {
        return "other";
      }
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
    d: common_vendor.sr("statusFilter", "10c552cd-0"),
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
    j: common_vendor.o(($event) => $options.handleStatusChange(""), "c3"),
    k: common_vendor.t($data.draftCount),
    l: common_vendor.o(($event) => $options.handleStatusChange("draft"), "0f"),
    m: common_vendor.t($data.pendingCount),
    n: common_vendor.o(($event) => $options.handleStatusChange("pending"), "59"),
    o: $data.loading && !$data.formSchema
  }, $data.loading && !$data.formSchema ? {
    p: common_vendor.f(3, (i, k0, i0) => {
      return {
        a: i
      };
    })
  } : common_vendor.e({
    q: common_vendor.f($data.tableData, (item, index, i0) => {
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: "10c552cd-4-" + i0,
        b: common_vendor.t(((_a = item.form_data) == null ? void 0 : _a.file_name) || "未命名文件"),
        c: common_vendor.t($options.getStatusText(item.status)),
        d: "10c552cd-5-" + i0,
        e: common_vendor.p({
          type: $options.getStatusTagType(item.status),
          size: "mini",
          border: false
        }),
        f: common_vendor.t($options.getFieldOptionLabel("seal_type", (_b = item.form_data) == null ? void 0 : _b.seal_type)),
        g: common_vendor.t($options.getFieldOptionLabel("file_type", (_c = item.form_data) == null ? void 0 : _c.file_type)),
        h: common_vendor.t(((_d = item.form_data) == null ? void 0 : _d.copies) || 1),
        i: common_vendor.t(item.applicant_name || "未知"),
        j: item._add_time
      }, item._add_time ? {
        k: "10c552cd-6-" + i0,
        l: common_vendor.p({
          name: "clock",
          size: "24",
          color: "#c0c4cc"
        }),
        m: common_vendor.t($options.formatDate(item._add_time))
      } : {}, {
        n: $options.canEdit(item)
      }, $options.canEdit(item) ? {
        o: common_vendor.o(($event) => $options.handleEdit(item), index),
        p: "10c552cd-7-" + i0,
        q: common_vendor.p({
          type: "primary",
          size: "medium",
          plain: true,
          ["custom-style"]: $data.buttonStyle.plain
        })
      } : {}, {
        r: $options.canDelete(item)
      }, $options.canDelete(item) ? {
        s: common_vendor.o(($event) => $options.handleDelete(item), index),
        t: "10c552cd-8-" + i0,
        v: common_vendor.p({
          type: "error",
          size: "medium",
          plain: true,
          ["custom-style"]: $data.buttonStyle.dangerPlain
        })
      } : {}, {
        w: common_vendor.o(($event) => $options.showDetail(item), index),
        x: "10c552cd-9-" + i0,
        y: index
      });
    }),
    r: common_vendor.p({
      name: "file-text-fill",
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
    v: common_vendor.o($options.addBtn, "1c"),
    w: common_vendor.p({
      type: "primary",
      shape: "circle",
      customStyle: $data.buttonStyle.primary
    }),
    x: common_vendor.p({
      mode: "data",
      icon: "/static/empty.png",
      text: "暂无申请记录"
    })
  } : {}, {
    y: $data.hasMore && $data.tableData.length > 0
  }, $data.hasMore && $data.tableData.length > 0 ? {
    z: common_vendor.o($options.loadMore, "4f"),
    A: common_vendor.p({
      status: $data.loadMoreStatus,
      ["load-text"]: $data.loadText
    })
  } : {}, {
    B: $data.refreshing,
    C: common_vendor.o((...args) => $options.onPullDownRefresh && $options.onPullDownRefresh(...args), "65"),
    D: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "79")
  }), {
    E: common_vendor.t($data.formDialog.title),
    F: !$data.formSchema
  }, !$data.formSchema ? {
    G: common_vendor.p({
      mode: "circle",
      size: "36",
      color: "#2979ff"
    })
  } : {
    H: common_vendor.o($options.handleFormSave, "7c"),
    I: common_vendor.o($options.handleFormSubmit, "2c"),
    J: common_vendor.o($options.handleSimulate, "fd"),
    K: common_vendor.o($options.previewFile, "66"),
    L: common_vendor.o($options.closeFormDialog, "cf"),
    M: common_vendor.o($options.downloadFile, "3a"),
    N: common_vendor.p({
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
    O: common_vendor.o(($event) => $data.formDialog.show = $event, "f7"),
    P: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      ["close-on-click-overlay"]: true,
      modelValue: $data.formDialog.show
    }),
    Q: common_vendor.p({
      ["simulate-data"]: $data.simulateDialog.data
    }),
    R: common_vendor.o(($event) => $data.simulateDialog.show = $event, "b0"),
    S: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.simulateDialog.show
    }),
    T: !$data.formSchema
  }, !$data.formSchema ? {
    U: common_vendor.p({
      mode: "circle",
      size: "36",
      color: "#2979ff"
    })
  } : {
    V: common_vendor.o($options.previewFile, "b3"),
    W: common_vendor.o($options.downloadFile, "32"),
    X: common_vendor.p({
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
    Y: common_vendor.o(($event) => $data.detailDialog.show = $event, "6d"),
    Z: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.detailDialog.show
    }),
    aa: common_vendor.o($options.confirmDelete, "00"),
    ab: common_vendor.o($options.cancelDelete, "2e"),
    ac: common_vendor.o(($event) => $data.deleteDialog.show = $event, "f3"),
    ad: common_vendor.p({
      ["show-cancel-button"]: true,
      ["show-confirm-button"]: true,
      ["async-close"]: true,
      content: $data.deleteDialog.content,
      modelValue: $data.deleteDialog.show
    }),
    ae: common_vendor.o($options.filePreviewClose, "84"),
    af: common_vendor.o($options.downloadFile, "e2"),
    ag: common_vendor.p({
      value: $data.filePreview.show,
      ["file-data"]: $data.filePreview.data
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-10c552cd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/workflow/seal/index.js.map
