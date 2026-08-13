"use strict";
const common_vendor = require("../../../common/vendor.js");
const ApproeWorkFlow = () => "../../../components/approve-work-flow/approve-work-flow.js";
const DynamicFormDialog = () => "../../../components/dynamic-form-dialog/dynamic-form-dialog.js";
const FilePreviewDialog = () => "../../../components/file-preview-dialog/file-preview-dialog.js";
const ApproveHeaderDetail = () => "../../../components/approve-header-detail/approve-header-detail.js";
const ReturnHandleDialog = () => "../../../components/return-handle-dialog/return-handle-dialog.js";
const ApproveHandleDialog = () => "../../../components/approve-handle-dialog/approve-handle-dialog.js";
let vk = common_vendor.index.vk;
const _sfc_main = {
  name: "TaskCenter",
  components: {
    ApproeWorkFlow,
    DynamicFormDialog,
    FilePreviewDialog,
    ApproveHeaderDetail,
    ReturnHandleDialog,
    ApproveHandleDialog
  },
  data() {
    return {
      loading: true,
      refreshing: false,
      userList: [],
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
      // 统计数量
      stats: {
        pending: 0,
        completed: 0
      },
      // 列表数据
      tableData: [],
      pagination: {
        pageIndex: 1,
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
      multipleSelection: [],
      // 筛选
      queryForm: {
        formData: {
          status: "",
          form_type_code: ""
        }
      },
      formTypeOptions: [],
      // 表单类型配置
      formTypeConfigs: {},
      // 审批弹窗
      approveDialog: {
        show: false,
        title: "审批处理",
        approvalHistory: [],
        processFlow: {
          tasks: []
        }
      },
      approveLoading: false,
      currentTask: null,
      currentApplication: null,
      showReturnOption: true,
      showTransferOption: true,
      showAddSignOption: false,
      // 详情弹窗
      detailDialog: {
        show: false,
        title: "申请详情",
        data: null,
        approvalHistory: [],
        currentTasks: [],
        processFlow: {
          tasks: []
        }
      },
      // 批量审批
      batchApproveDialog: {
        show: false,
        selectedItems: []
      },
      batchApproveForm: {
        action: "approve",
        comment: ""
      },
      batchApproveLoading: false,
      // 退回处理
      returnDialog: {
        show: false,
        title: "退回处理",
        task: null,
        application: null,
        processFlow: {
          tasks: []
        },
        statusHistory: []
      },
      returnLoading: false,
      // 撤回申请
      withdrawDialog: {
        show: false,
        data: null
      },
      withdrawForm: {
        reason: ""
      },
      withdrawLoading: false,
      // 动态表单
      dynamicFormDialog: {
        show: false,
        title: "",
        formSchema: null,
        formTypeCode: "",
        data: null
      },
      saveFormLoading: false,
      // 文件预览
      filePreview: {
        show: false,
        data: {
          url: "",
          name: "",
          type: ""
        }
      }
    };
  },
  onLoad(options = {}) {
    this.init();
  },
  onShow() {
    this.refresh();
  },
  onPullDownRefresh() {
    this.onPullDownRefresh();
  },
  methods: {
    async init() {
      try {
        this.loading = true;
        await this.loadFormTypes();
        await this.loadListData();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:462", "初始化失败:", error);
        common_vendor.index.showToast({
          title: "页面初始化失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    async loadFormTypes() {
      try {
        const res = await vk.callFunction({
          url: "admin/bpmn/form-type/sys/getList",
          data: {
            pageSize: 100
          }
        });
        if (res.code === 0 && res.rows) {
          res.rows.forEach((formType) => {
            this.formTypeConfigs[formType.code] = formType;
          });
          this.formTypeOptions = [
            {
              value: "",
              label: "全部类型"
            },
            ...res.rows.map((item) => ({
              value: item.code,
              label: item.name
            }))
          ];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:495", "加载表单类型失败:", error);
      }
    },
    getFormTypeSchema(formTypeCode) {
      const formType = this.formTypeConfigs[formTypeCode];
      if (formType && formType.form_schema) {
        try {
          return JSON.parse(formType.form_schema);
        } catch (e) {
          return null;
        }
      }
      return null;
    },
    getFormTypeName(formTypeCode) {
      const formType = this.formTypeConfigs[formTypeCode];
      return formType ? formType.name : formTypeCode;
    },
    getFormTypeTitle() {
      const value = this.queryForm.formData.form_type_code;
      if (!value)
        return "全部类型";
      const option = this.formTypeOptions.find((opt) => opt.value === value);
      return option ? option.label : "申请类型";
    },
    filterByStatus(status) {
      this.queryForm.formData.status = status;
      this.loadListData(true);
    },
    handleFormTypeChange(value) {
      this.queryForm.formData.form_type_code = value;
      this.loadListData(true);
    },
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
          formData: {
            ...this.queryForm.formData
          }
        };
        const res = await vk.callFunction({
          url: "admin/bpmn/task/sys/getList",
          data: params
        });
        if (res.code === 0) {
          const data = res.rows || [];
          const total = res.total || 0;
          const processedData = data.map((item) => ({
            ...item,
            _checked: false
          }));
          if (reset) {
            this.tableData = processedData;
          } else {
            this.tableData = [...this.tableData, ...processedData];
          }
          this.pagination.total = total;
          const pendingCount = data.filter((item) => item.status === "pending").length;
          const completedCount = data.filter((item) => item.status === "completed").length;
          this.stats.pending = pendingCount;
          this.stats.completed = completedCount;
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
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:591", "加载列表失败:", error);
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
    refresh() {
      this.loadListData(true);
    },
    onItemCheck(checked, item) {
      item._checked = checked.value;
      this.multipleSelection = this.tableData.filter((i) => i._checked);
    },
    canHandleTask(task) {
      const userInfo = vk.getVuex("$user.userInfo");
      return task.assignee === userInfo.username || task.candidate_users && task.candidate_users.includes(userInfo.username) || task.candidate_groups && task.candidate_groups.some((group) => userInfo.role && userInfo.role.includes(group));
    },
    canHandleReturnTask(task) {
      const userInfo = vk.getVuex("$user.userInfo");
      return task.node_type === "return" && task.assignee === userInfo.username;
    },
    canTransferTask(task) {
      const userInfo = vk.getVuex("$user.userInfo");
      return task.assignee === userInfo.username;
    },
    canHandleCurrentTask(application) {
      const userInfo = vk.getVuex("$user.userInfo");
      const currentTask = this.detailDialog.currentTasks[0];
      if (!application || !this.detailDialog.currentTasks || this.detailDialog.currentTasks.length === 0 || currentTask.node_type == "return")
        return false;
      return currentTask.assignee === userInfo.username || currentTask.candidate_users && currentTask.candidate_users.includes(userInfo.username);
    },
    hasReturnTask(application) {
      if (!application || !this.detailDialog.currentTasks)
        return false;
      return this.detailDialog.currentTasks.some((task) => task.node_type === "return");
    },
    canWithdrawApplication(application) {
      if (!application)
        return false;
      const userInfo = vk.getVuex("$user.userInfo");
      return application.applicant_id === userInfo.username && (application.status === "pending" || application.status === "returned");
    },
    async showDetail(item) {
      try {
        const appRes = await vk.callFunction({
          url: "admin/bpmn/application-form/pub/detail",
          data: {
            userInfo: vk.getVuex("$user.userInfo"),
            _id: item.application_id
          }
        });
        if (appRes.code === 0) {
          this.detailDialog.data = appRes.data.application;
          this.detailDialog.approvalHistory = appRes.data.history || [];
          this.detailDialog.title = `${this.getFormTypeName(appRes.data.application.form_type_code)} - 申请详情`;
          const taskRes = await vk.callFunction({
            url: "admin/bpmn/task/sys/getList",
            data: {
              formData: {
                application_id: item.application_id,
                status: "pending"
              }
            }
          });
          this.detailDialog.currentTasks = taskRes.code === 0 ? taskRes.rows : [];
          await this.loadProcessFlow(item.application_id, "detail");
        } else {
          this.detailDialog.data = item;
          this.detailDialog.approvalHistory = [];
          this.detailDialog.currentTasks = [];
          this.detailDialog.title = "申请详情";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:698", "加载详情失败:", error);
        this.detailDialog.data = item;
        this.detailDialog.approvalHistory = [];
        this.detailDialog.currentTasks = [];
        this.detailDialog.title = "申请详情";
      }
      this.detailDialog.show = true;
    },
    async loadProcessFlow(applicationId, type = "approve") {
      try {
        if (this.queryForm.formData.status === "pending") {
          if (type === "approve") {
            return this.approveDialog.processFlow.tasks = this.detailDialog.currentTasks;
          } else {
            return this.detailDialog.processFlow.tasks = this.detailDialog.currentTasks;
          }
        }
        const taskRes = await vk.callFunction({
          url: "admin/bpmn/task/sys/getList",
          data: {
            formData: {
              application_id: applicationId,
              status: this.queryForm.formData.status
            },
            orderBy: "sequence asc"
          }
        });
        if (taskRes.code === 0) {
          if (type === "approve") {
            this.approveDialog.processFlow.tasks = taskRes.rows || [];
          } else {
            this.detailDialog.processFlow.tasks = taskRes.rows || [];
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:736", "加载流程失败:", error);
      }
    },
    async showApproveDialog(task) {
      this.currentTask = task;
      try {
        const res = await vk.callFunction({
          url: "admin/bpmn/application-form/pub/detail",
          data: {
            userInfo: vk.getVuex("$user.userInfo"),
            _id: task.application_id
          }
        });
        if (res.code === 0) {
          this.currentApplication = res.data.application;
          this.approveDialog.title = `${this.getFormTypeName(this.currentApplication.form_type_code)} - 审批处理`;
          this.approveDialog.approvalHistory = res.data.history;
          this.showReturnOption = task.task_key !== "start";
          this.showTransferOption = true;
          this.showAddSignOption = task.allow_add_sign === true;
          await this.loadProcessFlow(task.application_id);
          this.approveDialog.show = true;
        } else {
          common_vendor.index.showToast({
            title: "获取申请详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:767", "获取申请详情失败:", error);
        common_vendor.index.showToast({
          title: "获取申请详情失败",
          icon: "none"
        });
      }
    },
    onActionChange(action) {
      if (action === "approve") {
        this.showAddSignOption = this.currentTask && this.currentTask.allow_add_sign === true;
      } else {
        this.showAddSignOption = false;
      }
    },
    async handleApproveSubmit(submitData) {
      try {
        this.approveLoading = true;
        const completeData = {
          ...submitData,
          userInfo: vk.getVuex("$user.userInfo")
        };
        const res = await vk.callFunction({
          url: "admin/bpmn/task/pub/complete",
          data: completeData
        });
        if (res.code === 0) {
          common_vendor.index.showToast({
            title: "处理成功",
            icon: "success"
          });
          this.approveDialog.show = false;
          this.refresh();
        } else {
          common_vendor.index.showToast({
            title: res.msg || "处理失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:808", "处理失败:", error);
        common_vendor.index.showToast({
          title: error.message || "处理失败",
          icon: "none"
        });
      } finally {
        this.approveLoading = false;
      }
    },
    handleTaskFromDetail(application) {
      if (this.detailDialog.currentTasks && this.detailDialog.currentTasks.length > 0) {
        const task = this.detailDialog.currentTasks[0];
        this.showApproveDialog(task);
        this.detailDialog.show = false;
      }
    },
    async handleTransfer(task) {
      try {
        const userInfo = vk.getVuex("$user.userInfo");
        if (task.assignee !== userInfo.username) {
          common_vendor.index.showToast({
            title: "只有当前任务处理人可以转交任务",
            icon: "none"
          });
          return;
        }
        await this.showApproveDialog(task);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:838", "转交任务失败:", error);
        common_vendor.index.showToast({
          title: "转交任务失败",
          icon: "none"
        });
      }
    },
    showBatchApproveDialog() {
      if (this.multipleSelection.length === 0) {
        common_vendor.index.showToast({
          title: "请选择要处理的待办任务",
          icon: "none"
        });
        return;
      }
      this.batchApproveDialog.selectedItems = this.multipleSelection;
      this.batchApproveForm = {
        action: "approve",
        comment: ""
      };
      this.batchApproveDialog.show = true;
    },
    async handleBatchApprove() {
      try {
        if (!this.batchApproveForm.comment) {
          common_vendor.index.showToast({
            title: "请输入审批意见",
            icon: "none"
          });
          return;
        }
        this.batchApproveLoading = true;
        const res = await vk.callFunction({
          url: "admin/bpmn/task/sys/batchComplete",
          data: {
            task_ids: this.batchApproveDialog.selectedItems.map((item) => item._id),
            action: this.batchApproveForm.action,
            comment: this.batchApproveForm.comment
          }
        });
        if (res.code === 0) {
          common_vendor.index.showToast({
            title: `批量处理成功，共处理 ${res.data.processed_count} 个任务`,
            icon: "success"
          });
          this.batchApproveDialog.show = false;
          this.multipleSelection = [];
          this.refresh();
        } else {
          common_vendor.index.showToast({
            title: res.msg || "批量处理失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:895", "批量处理失败:", error);
        common_vendor.index.showToast({
          title: "批量处理失败",
          icon: "none"
        });
      } finally {
        this.batchApproveLoading = false;
      }
    },
    async handleReturnTask(task) {
      try {
        if (task.node_type !== "return") {
          common_vendor.index.showToast({
            title: "该任务不是退回任务",
            icon: "none"
          });
          return;
        }
        const userInfo = vk.getVuex("$user.userInfo");
        if (task.assignee !== userInfo.username) {
          common_vendor.index.showToast({
            title: "只有申请人可以处理退回任务",
            icon: "none"
          });
          return;
        }
        this.returnDialog.task = task;
        const appRes = await vk.callFunction({
          url: "admin/bpmn/application-form/pub/detail",
          data: {
            userInfo,
            _id: task.application_id
          }
        });
        if (appRes.code === 0) {
          this.returnDialog.application = appRes.data.application;
          this.returnDialog.statusHistory = appRes.data.history || [];
        } else {
          this.returnDialog.application = null;
        }
        this.returnDialog.title = `退回处理 - ${this.getFormTypeName(task.form_type_code)}`;
        this.returnDialog.show = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:939", "处理退回任务失败:", error);
        common_vendor.index.showToast({
          title: "处理退回任务失败",
          icon: "none"
        });
      }
    },
    handleReturnTaskFromDetail(application) {
      const returnTask = this.detailDialog.currentTasks.find((task) => task.node_type === "return");
      if (returnTask) {
        this.handleReturnTask(returnTask);
        this.detailDialog.show = false;
      }
    },
    editApplicationContent() {
      if (!this.returnDialog.application) {
        common_vendor.index.showToast({
          title: "申请信息不存在",
          icon: "none"
        });
        return;
      }
      const application = this.returnDialog.application;
      const formTypeCode = application.form_type_code;
      const formSchema = this.getFormTypeSchema(formTypeCode);
      if (!formSchema) {
        common_vendor.index.showToast({
          title: "表单配置不存在",
          icon: "none"
        });
        return;
      }
      const formData = {
        ...application
      };
      if (application.form_data) {
        Object.keys(application.form_data).forEach((key) => {
          formData[key] = application.form_data[key];
        });
      }
      this.dynamicFormDialog = {
        show: true,
        title: `修改申请信息 - ${this.getFormTypeName(formTypeCode)}`,
        formSchema,
        formTypeCode,
        data: formData
      };
      common_vendor.index.__f__("log", "at pages/workflow/application-form/list.vue:989", this.dynamicFormDialog);
    },
    async handleDynamicFormSave(formData) {
      try {
        this.saveFormLoading = true;
        const res = await vk.callFunction({
          url: "admin/bpmn/application-form/sys/update",
          data: {
            ...formData,
            _id: this.returnDialog.application._id
          }
        });
        if (res.code === 0) {
          if (this.returnDialog.application) {
            this.returnDialog.application = {
              ...this.returnDialog.application,
              ...formData
            };
          }
          common_vendor.index.showToast({
            title: "申请信息修改成功",
            icon: "success"
          });
          this.dynamicFormDialog.show = false;
        } else {
          common_vendor.index.showToast({
            title: res.msg || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:1022", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        this.saveFormLoading = false;
      }
    },
    handleDynamicFormCancel() {
      this.dynamicFormDialog.show = false;
    },
    async handleReturnSubmit(submitData) {
      try {
        this.returnLoading = true;
        const res = await vk.callFunction({
          url: "admin/bpmn/task/pub/handleReturn",
          data: {
            ...submitData,
            userInfo: vk.getVuex("$user.userInfo")
          }
        });
        if (res.code === 0) {
          common_vendor.index.showToast({
            title: "处理成功",
            icon: "success"
          });
          this.returnDialog.show = false;
          this.refresh();
          if (submitData.action === "resubmit") {
            common_vendor.index.showToast({
              title: "申请已重新提交，等待审批",
              icon: "success"
            });
          } else if (submitData.action === "withdraw") {
            common_vendor.index.showToast({
              title: "申请已撤回",
              icon: "success"
            });
          }
        } else {
          common_vendor.index.showToast({
            title: res.msg || "处理失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:1071", "处理失败:", error);
        common_vendor.index.showToast({
          title: "处理失败",
          icon: "none"
        });
      } finally {
        this.returnLoading = false;
      }
    },
    handleWithdrawApplication(application) {
      this.withdrawDialog.data = application;
      this.withdrawForm.reason = "";
      this.withdrawDialog.show = true;
    },
    async handleWithdrawConfirm() {
      try {
        const task = this.detailDialog.currentTasks[0] || {};
        if (!this.withdrawForm.reason) {
          common_vendor.index.showToast({
            title: "请填写撤回原因",
            icon: "none"
          });
          return;
        }
        this.withdrawLoading = true;
        const res = await vk.callFunction({
          url: "admin/bpmn/task/pub/handleReturn",
          data: {
            action: "withdraw",
            task_id: task._id,
            reason: this.withdrawForm.reason,
            userInfo: vk.getVuex("$user.userInfo")
          }
        });
        if (res.code === 0) {
          common_vendor.index.showToast({
            title: "申请已撤回",
            icon: "success"
          });
          this.withdrawDialog.show = false;
          this.detailDialog.show = false;
          this.refresh();
        } else {
          common_vendor.index.showToast({
            title: res.msg || "撤回失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:1124", "撤回失败:", error);
        common_vendor.index.showToast({
          title: "撤回失败",
          icon: "none"
        });
      } finally {
        this.withdrawLoading = false;
      }
    },
    formatDate(timestamp) {
      if (!timestamp)
        return "-";
      return vk.pubfn.timeFormat(timestamp, "yyyy-MM-dd hh:mm:ss");
    },
    formatDueDate(dueDate) {
      if (!dueDate)
        return "-";
      const now = Date.now();
      const dueTime = new Date(dueDate).getTime();
      const diffHours = Math.ceil((dueTime - now) / (1e3 * 60 * 60));
      if (diffHours < 0) {
        return `已超时 ${Math.abs(diffHours)}小时`;
      } else if (diffHours < 24) {
        return `剩余 ${diffHours}小时`;
      } else {
        return this.formatDate(dueDate);
      }
    },
    getDueDateColor(dueDate) {
      if (!dueDate)
        return "#909399";
      const now = Date.now();
      const dueTime = new Date(dueDate).getTime();
      if (dueTime < now)
        return "#f56c6c";
      if (dueTime - now < 24 * 60 * 60 * 1e3)
        return "#e6a23c";
      return "#909399";
    },
    getTaskTypeTag(nodeType) {
      const map = {
        userTask: "info",
        approval: "warning",
        return: "error"
      };
      return map[nodeType] || "default";
    },
    getTaskTypeText(nodeType) {
      const map = {
        userTask: "普通任务",
        approval: "审批任务",
        return: "退回任务"
      };
      return map[nodeType] || nodeType;
    },
    filePreviewClose() {
      this.filePreview.show = false;
    },
    previewFile(file) {
      if (!file || !file.url) {
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
    downloadFile(file) {
      if (!file || !file.url) {
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
                common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:1225", "保存文件失败", err);
                common_vendor.index.showToast({
                  title: "保存失败",
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
          common_vendor.index.__f__("error", "at pages/workflow/application-form/list.vue:1240", "下载失败", err);
          common_vendor.index.showToast({
            title: "下载失败",
            icon: "none"
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    },
    getFileType(file) {
      if (!file)
        return "unknown";
      const name = file.name || "";
      const type = file.type || "";
      if (type.includes("pdf") || name.toLowerCase().endsWith(".pdf"))
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
  const _easycom_approve_handle_dialog2 = common_vendor.resolveComponent("approve-handle-dialog");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  const _easycom_approve_header_detail2 = common_vendor.resolveComponent("approve-header-detail");
  const _component_u_alert = common_vendor.resolveComponent("u-alert");
  const _easycom_u_radio2 = common_vendor.resolveComponent("u-radio");
  const _easycom_u_radio_group2 = common_vendor.resolveComponent("u-radio-group");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _component_u_textarea = common_vendor.resolveComponent("u-textarea");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _easycom_return_handle_dialog2 = common_vendor.resolveComponent("return-handle-dialog");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_dynamic_form_dialog2 = common_vendor.resolveComponent("dynamic-form-dialog");
  const _easycom_file_preview_dialog2 = common_vendor.resolveComponent("file-preview-dialog");
  (_easycom_u_dropdown_item2 + _easycom_u_dropdown2 + _easycom_u_icon2 + _easycom_u_button2 + _easycom_u_tag2 + _easycom_u_empty2 + _easycom_u_loadmore2 + _easycom_approve_handle_dialog2 + _easycom_u_popup2 + _easycom_approve_header_detail2 + _component_u_alert + _easycom_u_radio2 + _easycom_u_radio_group2 + _easycom_u_form_item2 + _component_u_textarea + _easycom_u_form2 + _easycom_return_handle_dialog2 + _easycom_u_input2 + _easycom_dynamic_form_dialog2 + _easycom_file_preview_dialog2)();
}
const _easycom_u_dropdown_item = () => "../../../uni_modules/vk-uview-ui/components/u-dropdown-item/u-dropdown-item.js";
const _easycom_u_dropdown = () => "../../../uni_modules/vk-uview-ui/components/u-dropdown/u-dropdown.js";
const _easycom_u_icon = () => "../../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_button = () => "../../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_tag = () => "../../../uni_modules/vk-uview-ui/components/u-tag/u-tag.js";
const _easycom_u_empty = () => "../../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loadmore = () => "../../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
const _easycom_approve_handle_dialog = () => "../../../components/approve-handle-dialog/approve-handle-dialog.js";
const _easycom_u_popup = () => "../../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
const _easycom_approve_header_detail = () => "../../../components/approve-header-detail/approve-header-detail.js";
const _easycom_u_radio = () => "../../../uni_modules/vk-uview-ui/components/u-radio/u-radio.js";
const _easycom_u_radio_group = () => "../../../uni_modules/vk-uview-ui/components/u-radio-group/u-radio-group.js";
const _easycom_u_form_item = () => "../../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_form = () => "../../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_return_handle_dialog = () => "../../../components/return-handle-dialog/return-handle-dialog.js";
const _easycom_u_input = () => "../../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_dynamic_form_dialog = () => "../../../components/dynamic-form-dialog/dynamic-form-dialog.js";
const _easycom_file_preview_dialog = () => "../../../components/file-preview-dialog/file-preview-dialog.js";
if (!Math) {
  (_easycom_u_dropdown_item + _easycom_u_dropdown + _easycom_u_icon + _easycom_u_button + _easycom_u_tag + _easycom_u_empty + _easycom_u_loadmore + _easycom_approve_handle_dialog + _easycom_u_popup + _easycom_approve_header_detail + _easycom_u_radio + _easycom_u_radio_group + _easycom_u_form_item + _easycom_u_form + _easycom_return_handle_dialog + _easycom_u_input + _easycom_dynamic_form_dialog + _easycom_file_preview_dialog)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleFormTypeChange, "34"),
    b: common_vendor.o(($event) => $data.queryForm.formData.form_type_code = $event, "ec"),
    c: common_vendor.p({
      title: $options.getFormTypeTitle(),
      options: $data.formTypeOptions,
      modelValue: $data.queryForm.formData.form_type_code
    }),
    d: common_vendor.sr("typeFilter", "a8e85c39-0"),
    e: common_vendor.p({
      ["active-color"]: "#2979ff"
    }),
    f: common_vendor.p({
      name: "reload",
      size: "20",
      color: "#fff"
    }),
    g: common_vendor.o($options.refresh, "5b"),
    h: common_vendor.p({
      type: "primary",
      shape: "circle",
      size: "medium",
      plain: false,
      ["custom-style"]: $data.buttonStyle.primary,
      loading: $data.loading
    }),
    i: !$data.loading
  }, !$data.loading ? {
    j: common_vendor.t($data.stats.pending),
    k: common_vendor.o(($event) => $options.filterByStatus("pending"), "98"),
    l: common_vendor.t($data.stats.completed),
    m: common_vendor.o(($event) => $options.filterByStatus("completed"), "10")
  } : {}, {
    n: $data.loading
  }, $data.loading ? {
    o: common_vendor.f(3, (i, k0, i0) => {
      return {
        a: i
      };
    })
  } : common_vendor.e({
    p: common_vendor.f($data.tableData, (item, index, i0) => {
      return common_vendor.e({
        a: "a8e85c39-4-" + i0,
        b: common_vendor.t(item.task_name || "未命名任务"),
        c: common_vendor.t($options.getTaskTypeText(item.node_type)),
        d: "a8e85c39-5-" + i0,
        e: common_vendor.p({
          type: $options.getTaskTypeTag(item.node_type),
          size: "mini",
          border: false
        }),
        f: common_vendor.t(item.application_title || "-"),
        g: common_vendor.t($options.getFormTypeName(item.form_type_code)),
        h: common_vendor.t(item.applicant_name || "-"),
        i: common_vendor.t(item.applicant_department || "-"),
        j: "a8e85c39-6-" + i0,
        k: common_vendor.t($options.formatDate(item._add_time)),
        l: item.due_date
      }, item.due_date ? {
        m: "a8e85c39-7-" + i0,
        n: common_vendor.p({
          name: "warning",
          size: "24",
          color: $options.getDueDateColor(item.due_date)
        }),
        o: common_vendor.t($options.formatDueDate(item.due_date)),
        p: $options.getDueDateColor(item.due_date)
      } : {}, {
        q: common_vendor.o(($event) => $options.showDetail(item), index),
        r: "a8e85c39-8-" + i0,
        s: $options.canHandleTask(item) && item.node_type !== "return" && item.status == "pending"
      }, $options.canHandleTask(item) && item.node_type !== "return" && item.status == "pending" ? {
        t: common_vendor.o(($event) => $options.showApproveDialog(item), index),
        v: "a8e85c39-9-" + i0,
        w: common_vendor.p({
          type: "primary",
          size: "medium",
          plain: true,
          ["custom-style"]: $data.buttonStyle.plain
        })
      } : {}, {
        x: item.node_type === "return" && $options.canHandleReturnTask(item) && item.status == "pending"
      }, item.node_type === "return" && $options.canHandleReturnTask(item) && item.status == "pending" ? {
        y: common_vendor.o(($event) => $options.handleReturnTask(item), index),
        z: "a8e85c39-10-" + i0,
        A: common_vendor.p({
          type: "warning",
          size: "medium",
          plain: true,
          ["custom-style"]: $data.buttonStyle.warningPlain
        })
      } : {}, {
        B: index
      });
    }),
    q: common_vendor.p({
      name: "file-text-fill",
      size: "32",
      color: "#2979ff"
    }),
    r: common_vendor.p({
      name: "clock",
      size: "24",
      color: "#c0c4cc"
    }),
    s: common_vendor.p({
      type: "info",
      size: "medium",
      plain: true,
      ["custom-style"]: $data.buttonStyle.infoPlain
    }),
    t: !$data.loading && $data.tableData.length === 0
  }, !$data.loading && $data.tableData.length === 0 ? {
    v: common_vendor.o($options.refresh, "d4"),
    w: common_vendor.p({
      type: "primary",
      shape: "circle",
      ["custom-style"]: $data.buttonStyle.primary
    }),
    x: common_vendor.p({
      mode: "data",
      icon: "/static/empty.png",
      text: "暂无待办任务"
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
    B: common_vendor.o((...args) => $options.onPullDownRefresh && $options.onPullDownRefresh(...args), "13"),
    C: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "cf")
  }), {
    D: common_vendor.t($data.approveDialog.title),
    E: common_vendor.o($options.previewFile, "81"),
    F: common_vendor.o($options.downloadFile, "d8"),
    G: common_vendor.o($options.onActionChange, "d5"),
    H: common_vendor.o($options.handleApproveSubmit, "e8"),
    I: common_vendor.p({
      task: $data.currentTask,
      application: $data.currentApplication,
      ["form-schema"]: $options.getFormTypeSchema($data.currentApplication ? $data.currentApplication.form_type_code : ""),
      ["process-info"]: $data.approveDialog.processFlow,
      ["approval-history"]: $data.approveDialog.approvalHistory,
      ["form-type-configs"]: $data.formTypeConfigs,
      ["show-return-option"]: $data.showReturnOption,
      ["user-list"]: $data.userList,
      ["show-transfer-option"]: $data.showTransferOption,
      ["show-add-sign-option"]: $data.showAddSignOption,
      loading: $data.approveLoading
    }),
    J: common_vendor.o(($event) => $data.approveDialog.show = $event, "af"),
    K: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.approveDialog.show
    }),
    L: common_vendor.t($data.detailDialog.title),
    M: common_vendor.o($options.previewFile, "43"),
    N: common_vendor.o($options.downloadFile, "2f"),
    O: common_vendor.p({
      ["detail-data"]: $data.detailDialog.data,
      ["form-schema"]: $options.getFormTypeSchema($data.detailDialog.data ? $data.detailDialog.data.form_type_code : ""),
      ["process-info"]: $data.detailDialog.processFlow,
      ["status-history"]: $data.detailDialog.approvalHistory,
      ["current-tasks"]: $data.detailDialog.currentTasks,
      ["show-basic-info"]: true,
      ["show-return-info"]: false,
      ["show-approval-flow"]: true,
      ["show-current-task"]: true,
      ["show-handle-form"]: false,
      ["form-type-configs"]: $data.formTypeConfigs
    }),
    P: common_vendor.o(($event) => $data.detailDialog.show = $event, "a4"),
    Q: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      height: $data.popupStyle.height,
      ["border-radius"]: $data.popupStyle.border_radius,
      modelValue: $data.detailDialog.show
    }),
    R: common_vendor.p({
      type: "info",
      title: `已选择 ${$data.batchApproveDialog.selectedItems.length} 个待办任务`
    }),
    S: common_vendor.p({
      label: "approve"
    }),
    T: common_vendor.p({
      label: "reject"
    }),
    U: common_vendor.o(($event) => $data.batchApproveForm.action = $event, "7f"),
    V: common_vendor.p({
      modelValue: $data.batchApproveForm.action
    }),
    W: common_vendor.p({
      label: "审批操作",
      prop: "action",
      required: true
    }),
    X: common_vendor.o(($event) => $data.batchApproveForm.comment = $event, "d5"),
    Y: common_vendor.p({
      placeholder: "请输入统一的审批意见",
      maxlength: 200,
      modelValue: $data.batchApproveForm.comment
    }),
    Z: common_vendor.p({
      label: "审批意见",
      prop: "comment",
      required: true
    }),
    aa: common_vendor.sr("batchApproveFormRef", "a8e85c39-20,a8e85c39-18"),
    ab: common_vendor.p({
      model: $data.batchApproveForm,
      ["label-position"]: "top"
    }),
    ac: common_vendor.o(($event) => $data.batchApproveDialog.show = false, "36"),
    ad: common_vendor.o($options.handleBatchApprove, "10"),
    ae: common_vendor.p({
      type: "primary",
      loading: $data.batchApproveLoading
    }),
    af: common_vendor.o(($event) => $data.batchApproveDialog.show = $event, "9a"),
    ag: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.batchApproveDialog.show
    }),
    ah: common_vendor.t($data.returnDialog.title),
    ai: common_vendor.o($options.previewFile, "23"),
    aj: common_vendor.o($options.downloadFile, "59"),
    ak: common_vendor.o($options.editApplicationContent, "e0"),
    al: common_vendor.o($options.handleReturnSubmit, "54"),
    am: common_vendor.p({
      task: $data.returnDialog.task,
      application: $data.returnDialog.application,
      ["form-schema"]: $options.getFormTypeSchema($data.returnDialog.application ? $data.returnDialog.application.form_type_code : ""),
      ["process-info"]: $data.returnDialog.processFlow,
      ["status-history"]: $data.returnDialog.statusHistory,
      ["form-type-configs"]: $data.formTypeConfigs,
      loading: $data.returnLoading
    }),
    an: common_vendor.o(($event) => $data.returnDialog.show = $event, "95"),
    ao: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.returnDialog.show
    }),
    ap: common_vendor.p({
      type: "warning",
      title: "撤回申请后，将无法恢复，请谨慎操作！",
      closable: false
    }),
    aq: common_vendor.o(($event) => $data.withdrawForm.reason = $event, "0a"),
    ar: common_vendor.p({
      type: "textarea",
      placeholder: "请说明撤回申请的原因",
      maxlength: 500,
      modelValue: $data.withdrawForm.reason
    }),
    as: common_vendor.p({
      label: "撤回原因",
      prop: "reason",
      required: true
    }),
    at: common_vendor.sr("withdrawFormRef", "a8e85c39-33,a8e85c39-31"),
    av: common_vendor.p({
      model: $data.withdrawForm,
      ["label-position"]: "top"
    }),
    aw: common_vendor.o(($event) => $data.withdrawDialog.show = false, "e9"),
    ax: common_vendor.o($options.handleWithdrawConfirm, "3d"),
    ay: common_vendor.p({
      type: "danger",
      loading: $data.withdrawLoading
    }),
    az: common_vendor.o(($event) => $data.withdrawDialog.show = $event, "b1"),
    aA: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.withdrawDialog.show
    }),
    aB: common_vendor.o($options.handleDynamicFormSave, "e2"),
    aC: common_vendor.o($options.handleDynamicFormCancel, "7b"),
    aD: common_vendor.o($options.previewFile, "d3"),
    aE: common_vendor.o($options.downloadFile, "6c"),
    aF: common_vendor.o(($event) => $data.dynamicFormDialog.show = $event, "5b"),
    aG: common_vendor.p({
      title: $data.dynamicFormDialog.title,
      butVisible: false,
      ["form-schema"]: $data.dynamicFormDialog.formSchema,
      ["form-type-code"]: $data.dynamicFormDialog.formTypeCode,
      saveLoading: $data.saveFormLoading,
      ["initial-data"]: $data.dynamicFormDialog.data,
      modelValue: $data.dynamicFormDialog.show
    }),
    aH: common_vendor.o(($event) => $data.dynamicFormDialog.show = $event, "9e"),
    aI: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.dynamicFormDialog.show
    }),
    aJ: common_vendor.o($options.filePreviewClose, "38"),
    aK: common_vendor.o($options.downloadFile, "a2"),
    aL: common_vendor.p({
      value: $data.filePreview.show,
      ["file-data"]: $data.filePreview.data
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a8e85c39"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/workflow/application-form/list.js.map
