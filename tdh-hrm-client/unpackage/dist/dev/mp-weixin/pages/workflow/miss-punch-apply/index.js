"use strict";
const common_vendor = require("../../../common/vendor.js");
const DynamicFormDialog = () => "../../../components/dynamic-form-dialog/dynamic-form-dialog.js";
const SimulateHandleDialog = () => "../../../components/simulate-handle-dialog/simulate-handle-dialog.js";
const FilePreviewDialog = () => "../../../components/file-preview-dialog/file-preview-dialog.js";
const ApproveHeaderDetail = () => "../../../components/approve-header-detail/approve-header-detail.js";
const _sfc_main = {
  name: "MissPunchApply",
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
      addLoading: false,
      saveFormLoading: false,
      submitFormLoading: false,
      simulateFormLoading: false,
      formSchema: null,
      formTypeCode: "MISS_PUNCH_RECORD",
      // 签卡申请表单类型代码
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
          form_type_code: "MISS_PUNCH_RECORD",
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
        title: "签卡申请详情",
        currentTasks: [],
        data: null
      },
      deleteDialog: {
        show: false,
        content: "确定删除该签卡申请吗？",
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
      };
    },
    filePreviewClose() {
      this.filePreview.show = false;
    },
    closeFormDialog() {
      this.formDialog.show = false;
    },
    async init(options) {
      try {
        this.loading = true;
        await this.loadFormTypes();
        await this.getFormTypeSchema();
        if (!this.formSchema) {
          this.useDefaultFormSchema();
        }
        await this.loadListData();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:396", "初始化失败:", error);
        this.useDefaultFormSchema();
      } finally {
        this.loading = false;
      }
    },
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
        if (res.code === 0 && res.rows) {
          const configs = {};
          res.rows.forEach((formType) => {
            configs[formType.code] = formType;
          });
          this.formTypeConfigs = configs;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:420", "加载表单类型失败:", error);
      }
    },
    async getFormTypeSchema() {
      var _a;
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
          if (formType.form_schema) {
            this.formSchema = JSON.parse(formType.form_schema);
            return;
          }
        }
        if ((_a = this.formTypeConfigs[this.formTypeCode]) == null ? void 0 : _a.form_schema) {
          this.formSchema = JSON.parse(this.formTypeConfigs[this.formTypeCode].form_schema);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:443", "获取表单schema失败:", error);
      }
    },
    useDefaultFormSchema() {
      this.formSchema = {
        fields: [
          {
            name: "miss_date",
            label: "签卡日期",
            type: "date",
            required: true,
            defaultValue: "",
            placeholder: "请选择签卡发生的日期"
          },
          {
            name: "miss_type",
            label: "签卡类型",
            type: "select",
            required: true,
            options: [
              {
                value: "clock_in",
                label: "上班签到卡"
              },
              {
                value: "clock_out",
                label: "下班签退卡"
              }
            ],
            defaultValue: "clock_in"
          },
          {
            name: "miss_reason",
            label: "签卡原因",
            type: "select",
            required: true,
            options: [
              {
                value: "work_need",
                label: "因工作需要"
              },
              {
                value: "other",
                label: "其他原因"
              }
            ],
            defaultValue: ""
          },
          {
            name: "miss_time",
            label: "签卡时间点",
            type: "time",
            required: false,
            placeholder: "例如：09:00 或 17:30",
            description: "如知道具体签卡时间点请填写，便于核实"
          },
          {
            name: "remarks",
            label: "备注",
            type: "textarea",
            required: true,
            placeholder: "请详细说明签卡原因、经过以及其他补充信息",
            rows: 4,
            maxLength: 500,
            defaultValue: ""
          },
          {
            name: "attachments",
            label: "相关证明附件",
            type: "file",
            required: true,
            multiple: true,
            accept: ".pdf,.doc,.docx,.jpg,.png,.jpeg",
            maxSize: 10,
            maxCount: 5,
            description: "支持PDF、Word、图片等格式，单个文件不超过10MB，最多上传5个文件"
          }
        ],
        layout: {
          type: "grid",
          columns: 2,
          groups: [
            {
              title: "签卡信息",
              fields: ["miss_date", "miss_type", "miss_reason", "miss_time"]
            },
            {
              title: "详细说明",
              fields: ["remarks"],
              fullWidth: true
            },
            {
              title: "证明材料",
              fields: ["attachments"],
              fullWidth: true
            }
          ]
        },
        validation: {
          rules: {
            miss_date: {
              maxToday: true,
              message: "签卡日期不能晚于今天"
            },
            remarks: {
              required: true,
              maxLength: 500,
              message: "备注为必填项且不能超过500字"
            },
            attachments: {
              required: true,
              message: "请上传相关证明附件"
            }
          }
        }
      };
      common_vendor.index.__f__("log", "at pages/workflow/miss-punch-apply/index.vue:556", "已使用默认签卡表单配置");
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
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:600", "加载列表数据失败:", error);
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
    getStatusTitle() {
      const status = this.queryForm1.formData.status;
      if (!status)
        return "全部状态";
      const option = this.statusOptions.find((opt) => opt.value === status);
      return option ? option.label : "状态";
    },
    handleStatusChange(status) {
      this.queryForm1.formData.status = status;
      this.loadListData(true);
    },
    getStatusTagType(status) {
      const map = {
        draft: "info",
        pending: "warning",
        rejected: "error",
        withdrawn: "default",
        approved: "success"
      };
      return map[status] || "default";
    },
    getStatusText(status) {
      const map = {
        draft: "草稿",
        pending: "待处理",
        rejected: "已驳回",
        withdrawn: "已撤回",
        approved: "已通过"
      };
      return map[status] || status;
    },
    getMissTypeLabel(value) {
      const map = {
        clock_in: "上班签到卡",
        clock_out: "下班签退卡"
      };
      return map[value] || value;
    },
    getMissReasonLabel(value) {
      const map = {
        work_need: "因工作需要",
        other: "其他原因"
      };
      return map[value] || value;
    },
    canEdit(item) {
      const userInfo = vk.getVuex("$user.userInfo");
      const userId = (userInfo == null ? void 0 : userInfo.username) || (userInfo == null ? void 0 : userInfo.user_id);
      return item.status === "draft" && item.applicant_id === userId;
    },
    canDelete(item) {
      const userInfo = vk.getVuex("$user.userInfo");
      const userId = (userInfo == null ? void 0 : userInfo.username) || (userInfo == null ? void 0 : userInfo.user_id);
      return item.status === "draft" && item.applicant_id === userId;
    },
    handleEdit(item) {
      this.updateBtn({
        item
      });
    },
    handleDelete(item) {
      this.deleteDialog.data = item;
      this.deleteDialog.show = true;
    },
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
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:713", "删除失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      } finally {
        this.deleteDialog.show = false;
      }
    },
    cancelDelete() {
      this.deleteDialog.show = false;
    },
    addBtn() {
      if (!this.formSchema) {
        this.loadFormSchemaAndOpenDialog();
        return;
      }
      this.openFormDialog();
    },
    async loadFormSchemaAndOpenDialog() {
      this.addLoading = true;
      try {
        await this.getFormTypeSchema();
        if (this.formSchema) {
          this.openFormDialog();
        } else {
          common_vendor.index.showToast({
            title: "表单配置加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:745", "加载表单schema失败:", error);
        common_vendor.index.showToast({
          title: "表单配置加载失败",
          icon: "none"
        });
      } finally {
        this.addLoading = false;
      }
    },
    openFormDialog() {
      this.formDialog = {
        show: true,
        title: "新建签卡申请",
        data: {
          form_type_code: this.formTypeCode,
          form_data: {}
        }
      };
    },
    updateBtn({
      item
    }) {
      if (!this.formSchema) {
        common_vendor.index.showToast({
          title: "表单配置加载中",
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
        title: "编辑签卡申请",
        data: formData
      };
    },
    refresh() {
      this.loadListData(true);
    },
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
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:827", "加载审批流程失败:", error);
      }
    },
    async loadStatusHistory(item) {
      try {
        this.statusHistory = [{
          action: "create",
          operation_time: item._add_time,
          operator_name: item.applicant_name,
          comment: "创建签卡申请",
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
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:862", "加载状态历史失败:", error);
      }
    },
    getTaskNameFromHistory(history) {
      var _a;
      if ((_a = history.task_data) == null ? void 0 : _a.node_info)
        return history.task_data.node_info.node_name;
      if (history.task_snapshot)
        return history.task_snapshot.task_name;
      return "任务处理";
    },
    async handleFormSave(formData) {
      formData._id = formData._id ? formData._id : this.formDialog.data._id;
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
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:897", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        this.saveFormLoading = false;
      }
    },
    async handleFormSubmit(formData) {
      var _a, _b, _c;
      formData._id = formData._id ? formData._id : this.formDialog.data._id;
      this.submitFormLoading = true;
      try {
        const userInfo = vk.getVuex("$user.userInfo");
        const calculatedValues = {
          miss_date: (_a = formData.form_data) == null ? void 0 : _a.miss_date,
          miss_reason_label: this.getMissReasonLabel((_b = formData.form_data) == null ? void 0 : _b.miss_reason)
        };
        const title = `${(userInfo == null ? void 0 : userInfo.username) || "用户"}的签卡申请（${((_c = formData.form_data) == null ? void 0 : _c.miss_date) || "未知日期"}）`;
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
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:944", "提交失败:", error);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      } finally {
        this.submitFormLoading = false;
      }
    },
    async handleSimulate(formData) {
      var _a, _b;
      this.simulateFormLoading = true;
      try {
        const userInfo = vk.getVuex("$user.userInfo");
        const calculatedValues = {
          miss_date: (_a = formData.form_data) == null ? void 0 : _a.miss_date,
          miss_reason_label: this.getMissReasonLabel((_b = formData.form_data) == null ? void 0 : _b.miss_reason)
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
          if (res.data && res.data.data)
            simulateResult = res.data.data;
          this.showSimulateResult(simulateResult);
        } else {
          common_vendor.index.showToast({
            title: res.msg || "试算失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:982", "试算失败:", error);
        common_vendor.index.showToast({
          title: "试算失败",
          icon: "none"
        });
      } finally {
        this.simulateFormLoading = false;
      }
    },
    showSimulateResult(result) {
      const normalizedData = this.normalizeSimulateData(result);
      if (!normalizedData.nodes.length) {
        common_vendor.index.showToast({
          title: "试算结果格式异常",
          icon: "none"
        });
      }
      this.simulateDialog.data = normalizedData;
      this.simulateDialog.show = true;
    },
    submitAfterSimulate() {
      this.simulateDialog.show = false;
      this.handleFormSubmit(this.formDialog.data);
    },
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
    formatDate(timestamp, formatStr) {
      if (!timestamp)
        return "-";
      return vk.pubfn.timeFormat(timestamp, formatStr || "yyyy-MM-dd hh:mm:ss");
    },
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
        name: file.name,
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
                  title: `文件已保存`,
                  icon: "success",
                  duration: 3e3
                });
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:1057", "保存文件失败", err);
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
          common_vendor.index.__f__("error", "at pages/workflow/miss-punch-apply/index.vue:1072", "下载失败", err);
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
    d: common_vendor.sr("statusFilter", "d954e150-0"),
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
        a: "d954e150-4-" + i0,
        b: common_vendor.t(((_a = item.form_data) == null ? void 0 : _a.miss_date) || "未填写日期"),
        c: common_vendor.t($options.getStatusText(item.status)),
        d: "d954e150-5-" + i0,
        e: common_vendor.p({
          type: $options.getStatusTagType(item.status),
          size: "mini",
          border: false
        }),
        f: common_vendor.t($options.getMissTypeLabel((_b = item.form_data) == null ? void 0 : _b.miss_type)),
        g: common_vendor.t($options.getMissReasonLabel((_c = item.form_data) == null ? void 0 : _c.miss_reason)),
        h: common_vendor.t(((_d = item.form_data) == null ? void 0 : _d.miss_time) || "未填写"),
        i: common_vendor.t(item.applicant_name || "未知"),
        j: item._add_time
      }, item._add_time ? {
        k: "d954e150-6-" + i0,
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
        p: "d954e150-7-" + i0,
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
        t: "d954e150-8-" + i0,
        v: common_vendor.p({
          type: "error",
          size: "medium",
          plain: true,
          ["custom-style"]: $data.buttonStyle.dangerPlain
        })
      } : {}, {
        w: common_vendor.o(($event) => $options.showDetail(item), index),
        x: "d954e150-9-" + i0,
        y: index
      });
    }),
    r: common_vendor.p({
      name: "calendar-fill",
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
    v: common_vendor.o($options.addBtn, "43"),
    w: common_vendor.p({
      type: "primary",
      shape: "circle",
      customStyle: $data.buttonStyle.primary
    }),
    x: common_vendor.p({
      mode: "data",
      icon: "/static/empty.png",
      text: "暂无签卡申请记录"
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
    B: common_vendor.o((...args) => $options.onPullDownRefresh && $options.onPullDownRefresh(...args), "65"),
    C: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "79")
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
    G: common_vendor.o($options.handleFormSave, "d3"),
    H: common_vendor.o($options.handleFormSubmit, "b2"),
    I: common_vendor.o($options.handleSimulate, "56"),
    J: common_vendor.o($options.previewFile, "06"),
    K: common_vendor.o($options.closeFormDialog, "2d"),
    L: common_vendor.o($options.downloadFile, "eb"),
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
    N: common_vendor.o(($event) => $data.formDialog.show = $event, "2a"),
    O: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      ["close-on-click-overlay"]: true,
      modelValue: $data.formDialog.show
    }),
    P: common_vendor.p({
      ["simulate-data"]: $data.simulateDialog.data
    }),
    Q: common_vendor.o(($event) => $data.simulateDialog.show = $event, "9f"),
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
    U: common_vendor.o($options.previewFile, "16"),
    V: common_vendor.o($options.downloadFile, "59"),
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
    X: common_vendor.o(($event) => $data.detailDialog.show = $event, "16"),
    Y: common_vendor.p({
      mode: $data.popupStyle.mode,
      closeable: true,
      ["border-radius"]: $data.popupStyle.border_radius,
      height: $data.popupStyle.height,
      modelValue: $data.detailDialog.show
    }),
    Z: common_vendor.o($options.confirmDelete, "e9"),
    aa: common_vendor.o($options.cancelDelete, "69"),
    ab: common_vendor.o(($event) => $data.deleteDialog.show = $event, "90"),
    ac: common_vendor.p({
      ["show-cancel-button"]: true,
      ["show-confirm-button"]: true,
      ["async-close"]: true,
      content: $data.deleteDialog.content,
      modelValue: $data.deleteDialog.show
    }),
    ad: common_vendor.o($options.filePreviewClose, "c0"),
    ae: common_vendor.o($options.downloadFile, "ed"),
    af: common_vendor.p({
      value: $data.filePreview.show,
      ["file-data"]: $data.filePreview.data
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d954e150"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/workflow/miss-punch-apply/index.js.map
