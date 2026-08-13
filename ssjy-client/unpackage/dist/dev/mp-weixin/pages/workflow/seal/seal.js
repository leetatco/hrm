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
        page: 1,
        pageSize: 20,
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
    this.vk = common_vendor.index.vk;
    this.init(options);
  },
  onShow() {
    this.loadListData(true);
  },
  onPullDownRefresh() {
    this.onPullDownRefresh();
  },
  methods: {
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
          common_vendor.index.__f__("warn", "at pages/workflow/seal/seal.vue:347", "表单配置加载失败，使用备用表单");
          this.useDefaultFormSchema();
        }
        await this.loadListData();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:354", "初始化失败:", error);
        this.useDefaultFormSchema();
      } finally {
        this.loading = false;
      }
    },
    // 加载表单类型
    async loadFormTypes() {
      try {
        const res = await this.vk.callFunction({
          url: "admin/bpmn/form-type/sys/getList",
          data: {
            status: "active"
          }
        });
        common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:372", "加载表单类型结果:", res);
        if (res.code === 0 && res.rows) {
          const configs = {};
          res.rows.forEach((formType) => {
            configs[formType.code] = formType;
          });
          this.formTypeConfigs = configs;
          common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:380", "表单类型配置已加载:", Object.keys(configs));
        } else {
          common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:382", "加载表单类型失败:", res.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:385", "加载表单类型失败:", error);
      }
    },
    // 获取表单schema - 优化版本
    async getFormTypeSchema() {
      try {
        const res = await this.vk.callFunction({
          url: "admin/bpmn/form-type/sys/getList",
          data: {
            code: this.formTypeCode,
            status: "active"
          }
        });
        if (res.code === 0 && res.rows && res.rows.length > 0) {
          const formType = res.rows[0];
          common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:403", "直接获取表单类型成功:", formType);
          if (formType.form_schema) {
            try {
              this.formSchema = JSON.parse(formType.form_schema);
              common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:408", "表单schema解析成功");
              return;
            } catch (parseError) {
              common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:411", "表单schema解析失败:", parseError);
            }
          }
        }
        if (this.formTypeConfigs[this.formTypeCode]) {
          const formType = this.formTypeConfigs[this.formTypeCode];
          if (formType.form_schema) {
            try {
              this.formSchema = JSON.parse(formType.form_schema);
              common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:422", "从缓存获取表单schema成功");
              return;
            } catch (parseError) {
              common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:425", "表单schema解析失败:", parseError);
            }
          }
        }
        common_vendor.index.__f__("warn", "at pages/workflow/seal/seal.vue:431", "无法加载表单配置，使用默认表单");
        this.useDefaultFormSchema();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:435", "获取表单schema失败:", error);
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
      common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:542", "已使用默认表单配置");
    },
    // 加载列表数据
    async loadListData(reset = true) {
      try {
        if (reset) {
          this.pagination.page = 1;
          this.hasMore = true;
          this.loadMoreStatus = "loadmore";
        }
        const params = {
          page: this.pagination.page,
          size: this.pagination.pageSize,
          ...this.queryForm1.formData
        };
        const res = await this.vk.callFunction({
          url: "admin/bpmn/application-form/sys/getList",
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
          this.totalCount = total;
          this.draftCount = data.filter((item) => item.status === "draft").length;
          this.pendingCount = data.filter((item) => item.status === "pending").length;
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
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:597", "加载列表数据失败:", error);
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
      this.pagination.page++;
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
      const userInfo = this.vk.getVuex("$user.userInfo");
      return item.status === "draft" && item.applicant_id === ((userInfo == null ? void 0 : userInfo.username) || (userInfo == null ? void 0 : userInfo.user_id));
    },
    // 判断是否可以删除
    canDelete(item) {
      const userInfo = this.vk.getVuex("$user.userInfo");
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
      const item = this.deleteDialog.data;
      if (!item)
        return;
      try {
        const res = await this.vk.callFunction({
          url: "admin/bpmn/application-form/sys/delete",
          data: {
            id: item._id
          }
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
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:727", "删除失败:", error);
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
        common_vendor.index.__f__("warn", "at pages/workflow/seal/seal.vue:746", "表单schema未加载，尝试重新加载");
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
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:769", "加载表单schema失败:", error);
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
      common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:789", "打开表单对话框，formSchema:", this.formSchema);
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
        const userInfo = this.vk.getVuex("$user.userInfo");
        const taskRes = await this.vk.callFunction({
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
          const instanceRes = await this.vk.callFunction({
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
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:868", "加载审批流程失败:", error);
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
        const historyRes = await this.vk.callFunction({
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
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:910", "加载状态历史失败:", error);
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
      this.saveFormLoading = true;
      try {
        let url = "admin/bpmn/application-form/sys/add";
        if (formData._id) {
          url = "admin/bpmn/application-form/sys/update";
        }
        const res = await this.vk.callFunction({
          url,
          data: formData
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
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:952", "保存失败:", error);
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
      this.submitFormLoading = true;
      try {
        const userInfo = this.vk.getVuex("$user.userInfo");
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
        const res = await this.vk.callFunction({
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
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:1006", "提交失败:", error);
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
        const userInfo = this.vk.getVuex("$user.userInfo");
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
        const res = await this.vk.callFunction({
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
        common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:1052", "试算失败:", error);
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
      common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:1064", "试算结果数据:", result);
      common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:1065", "试算结果数据类型:", typeof result);
      common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:1066", "试算结果是否有nodes:", result && result.nodes);
      common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:1067", "试算结果nodes长度:", result && result.nodes ? result.nodes.length : 0);
      if (result && typeof result === "object") {
        this.simulateDialog.data = result;
      } else {
        common_vendor.index.__f__("warn", "at pages/workflow/seal/seal.vue:1073", "试算结果数据格式不正确:", result);
        this.simulateDialog.data = null;
      }
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
      return this.vk.pubfn.timeFormat(timestamp, formatStr || "yyyy-MM-dd hh:mm:ss");
    },
    // 文件预览
    previewFile(file) {
      common_vendor.index.__f__("log", "at pages/workflow/seal/seal.vue:1102", file);
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
                common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:1149", "保存文件失败", err);
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
          common_vendor.index.__f__("error", "at pages/workflow/seal/seal.vue:1164", "下载失败", err);
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
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_loading2 = common_vendor.resolveComponent("u-loading");
  const _easycom_u_tag2 = common_vendor.resolveComponent("u-tag");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_loadmore2 = common_vendor.resolveComponent("u-loadmore");
  const _easycom_dynamic_form_dialog2 = common_vendor.resolveComponent("dynamic-form-dialog");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  const _easycom_simulate_handle_dialog2 = common_vendor.resolveComponent("simulate-handle-dialog");
  const _easycom_file_preview_dialog2 = common_vendor.resolveComponent("file-preview-dialog");
  const _easycom_approve_header_detail2 = common_vendor.resolveComponent("approve-header-detail");
  const _easycom_u_modal2 = common_vendor.resolveComponent("u-modal");
  (_easycom_u_dropdown_item2 + _easycom_u_dropdown2 + _easycom_u_button2 + _easycom_u_loading2 + _easycom_u_tag2 + _easycom_u_icon2 + _easycom_u_empty2 + _easycom_u_loadmore2 + _easycom_dynamic_form_dialog2 + _easycom_u_popup2 + _easycom_simulate_handle_dialog2 + _easycom_file_preview_dialog2 + _easycom_approve_header_detail2 + _easycom_u_modal2)();
}
const _easycom_u_dropdown_item = () => "../../../uni_modules/vk-uview-ui/components/u-dropdown-item/u-dropdown-item.js";
const _easycom_u_dropdown = () => "../../../uni_modules/vk-uview-ui/components/u-dropdown/u-dropdown.js";
const _easycom_u_button = () => "../../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_loading = () => "../../../uni_modules/vk-uview-ui/components/u-loading/u-loading.js";
const _easycom_u_tag = () => "../../../uni_modules/vk-uview-ui/components/u-tag/u-tag.js";
const _easycom_u_icon = () => "../../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_empty = () => "../../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loadmore = () => "../../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
const _easycom_dynamic_form_dialog = () => "../../../components/dynamic-form-dialog/dynamic-form-dialog.js";
const _easycom_u_popup = () => "../../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
const _easycom_simulate_handle_dialog = () => "../../../components/simulate-handle-dialog/simulate-handle-dialog.js";
const _easycom_file_preview_dialog = () => "../../../components/file-preview-dialog/file-preview-dialog.js";
const _easycom_approve_header_detail = () => "../../../components/approve-header-detail/approve-header-detail.js";
const _easycom_u_modal = () => "../../../uni_modules/vk-uview-ui/components/u-modal/u-modal.js";
if (!Math) {
  (_easycom_u_dropdown_item + _easycom_u_dropdown + _easycom_u_button + _easycom_u_loading + _easycom_u_tag + _easycom_u_icon + _easycom_u_empty + _easycom_u_loadmore + _easycom_dynamic_form_dialog + _easycom_u_popup + _easycom_simulate_handle_dialog + _easycom_file_preview_dialog + _easycom_approve_header_detail + _easycom_u_modal)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleStatusChange, "04"),
    b: common_vendor.o(($event) => $data.queryForm1.formData.status = $event, "0a"),
    c: common_vendor.p({
      title: $options.getStatusTitle(),
      options: $data.statusOptions,
      modelValue: $data.queryForm1.formData.status
    }),
    d: common_vendor.sr("statusFilter", "30652a03-0"),
    e: common_vendor.o($options.addBtn, "52"),
    f: common_vendor.p({
      type: "primary",
      icon: "plus",
      shape: "circle",
      size: "medium",
      customStyle: {
        marginRight: "20rpx"
      },
      loading: $data.addLoading,
      disabled: $data.loading
    }),
    g: common_vendor.o($options.refresh, "44"),
    h: common_vendor.p({
      type: "warning",
      icon: "refresh",
      shape: "circle",
      size: "medium",
      loading: $data.loading
    }),
    i: common_vendor.t($data.totalCount),
    j: common_vendor.t($data.draftCount),
    k: common_vendor.t($data.pendingCount),
    l: $data.loading && !$data.formSchema
  }, $data.loading && !$data.formSchema ? {
    m: common_vendor.p({
      mode: "circle",
      size: "36",
      color: "#2979ff"
    })
  } : common_vendor.e({
    n: common_vendor.f($data.tableData, (item, index, i0) => {
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: common_vendor.t(((_a = item.form_data) == null ? void 0 : _a.file_name) || "未命名文件"),
        b: common_vendor.t($options.getStatusText(item.status)),
        c: "30652a03-5-" + i0,
        d: common_vendor.p({
          type: $options.getStatusTagType(item.status),
          size: "mini",
          border: false
        }),
        e: "30652a03-6-" + i0,
        f: common_vendor.t($options.getFieldOptionLabel("seal_type", (_b = item.form_data) == null ? void 0 : _b.seal_type)),
        g: "30652a03-7-" + i0,
        h: common_vendor.t($options.getFieldOptionLabel("file_type", (_c = item.form_data) == null ? void 0 : _c.file_type)),
        i: "30652a03-8-" + i0,
        j: common_vendor.t(((_d = item.form_data) == null ? void 0 : _d.copies) || 1),
        k: "30652a03-9-" + i0,
        l: common_vendor.t(item.applicant_name || "未知"),
        m: item._add_time
      }, item._add_time ? {
        n: "30652a03-10-" + i0,
        o: common_vendor.p({
          name: "clock",
          size: "28",
          color: "#909399"
        }),
        p: common_vendor.t($options.formatDate(item._add_time, "MM-dd hh:mm"))
      } : {}, {
        q: $options.canEdit(item)
      }, $options.canEdit(item) ? {
        r: common_vendor.o(($event) => $options.handleEdit(item), index),
        s: "30652a03-11-" + i0,
        t: common_vendor.p({
          type: "primary",
          size: "mini",
          plain: true,
          shape: "circle"
        })
      } : {}, {
        v: $options.canDelete(item)
      }, $options.canDelete(item) ? {
        w: common_vendor.o(($event) => $options.handleDelete(item), index),
        x: "30652a03-12-" + i0,
        y: common_vendor.p({
          type: "error",
          size: "mini",
          plain: true,
          shape: "circle"
        })
      } : {}, {
        z: common_vendor.o(($event) => $options.showDetail(item), index),
        A: "30652a03-13-" + i0,
        B: index,
        C: common_vendor.o(($event) => $options.showDetail(item), index)
      });
    }),
    o: common_vendor.p({
      name: "map-pin",
      size: "28",
      color: "#2979ff"
    }),
    p: common_vendor.p({
      name: "file-text",
      size: "28",
      color: "#19be6b"
    }),
    q: common_vendor.p({
      name: "copy",
      size: "28",
      color: "#ff9900"
    }),
    r: common_vendor.p({
      name: "map-pin",
      size: "28",
      color: "#2979ff"
    }),
    s: common_vendor.p({
      type: "info",
      size: "mini",
      plain: true,
      shape: "circle"
    }),
    t: !$data.loading && $data.tableData.length === 0
  }, !$data.loading && $data.tableData.length === 0 ? {
    v: common_vendor.o($options.addBtn, "6c"),
    w: common_vendor.p({
      type: "primary",
      size: "medium",
      shape: "circle"
    }),
    x: common_vendor.p({
      mode: "data",
      icon: "/static/empty.png",
      text: "暂无数据"
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
    B: common_vendor.o((...args) => $options.onPullDownRefresh && $options.onPullDownRefresh(...args), "c8"),
    C: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "4d")
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
    G: common_vendor.o($options.handleFormSave, "e0"),
    H: common_vendor.o($options.handleFormSubmit, "e8"),
    I: common_vendor.o($options.handleSimulate, "38"),
    J: common_vendor.o($options.previewFile, "7c"),
    K: common_vendor.o($options.closeFormDialog, "0a"),
    L: common_vendor.p({
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
    M: common_vendor.o(($event) => $data.formDialog.show = $event, "65"),
    N: common_vendor.p({
      mode: "center",
      closeable: true,
      ["border-radius"]: 20,
      ["close-on-click-overlay"]: true,
      modelValue: $data.formDialog.show
    }),
    O: common_vendor.o($options.submitAfterSimulate, "87"),
    P: common_vendor.o(($event) => $data.simulateDialog.show = $event, "5d"),
    Q: common_vendor.p({
      ["simulate-data"]: $data.simulateDialog.data,
      modelValue: $data.simulateDialog.show
    }),
    R: common_vendor.o(($event) => $data.simulateDialog.show = $event, "4a"),
    S: common_vendor.p({
      mode: "center",
      closeable: true,
      ["border-radius"]: 20,
      modelValue: $data.simulateDialog.show
    }),
    T: common_vendor.o($options.filePreviewClose, "46"),
    U: common_vendor.o($options.downloadFile, "59"),
    V: common_vendor.p({
      value: $data.filePreview.show,
      ["file-data"]: $data.filePreview.data
    }),
    W: !$data.formSchema
  }, !$data.formSchema ? {
    X: common_vendor.p({
      mode: "circle",
      size: "36",
      color: "#2979ff"
    })
  } : {
    Y: common_vendor.o($options.previewFile, "98"),
    Z: common_vendor.o($options.downloadFile, "b0"),
    aa: common_vendor.p({
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
    ab: common_vendor.o(($event) => $data.detailDialog.show = false, "c4"),
    ac: common_vendor.p({
      type: "default",
      shape: "circle"
    }),
    ad: common_vendor.o(($event) => $data.detailDialog.show = $event, "61"),
    ae: common_vendor.p({
      mode: "bottom",
      closeable: true,
      round: 20,
      height: "80%",
      modelValue: $data.detailDialog.show
    }),
    af: common_vendor.o($options.confirmDelete, "1c"),
    ag: common_vendor.o($options.cancelDelete, "ad"),
    ah: common_vendor.o(($event) => $data.deleteDialog.show = $event, "07"),
    ai: common_vendor.p({
      ["show-cancel-button"]: true,
      ["show-confirm-button"]: true,
      ["async-close"]: true,
      content: $data.deleteDialog.content,
      modelValue: $data.deleteDialog.show
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-30652a03"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/workflow/seal/seal.js.map
