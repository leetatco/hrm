"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "DynamicFormDialog",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    butVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "表单"
    },
    formSchema: {
      type: Object,
      default: null
    },
    formTypeCode: {
      type: String,
      required: true
    },
    initialData: {
      type: Object,
      default: () => ({})
    },
    formAction: {
      type: String,
      default: "add"
    },
    actionUrl: {
      type: String,
      default: ""
    },
    saveLoading: {
      type: Boolean,
      default: false
    },
    submitLoading: {
      type: Boolean,
      default: false
    },
    simulateLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 批量生成日期相关
      showBatchDatePicker: false,
      batchStartDate: "",
      batchEndDate: "",
      batchPickerShow: false,
      batchPickerType: "start",
      // 'start' 或 'end'
      batchDatePickerParams: {
        year: true,
        month: true,
        day: true
      },
      formData: {},
      formRules: {},
      formLayoutGroups: [],
      formFields: [],
      selectShow: {},
      // 子字段远程选择（同时用于顶层）
      subRemoteSelectVisible: false,
      subRemote: {
        keyword: "",
        currentField: null,
        arrayFieldName: "",
        itemIndex: -1,
        options: [],
        loading: false,
        selectedValue: "",
        pageIndex: 1,
        pageSize: 20,
        total: 0,
        mode: "single",
        isTopLevel: false,
        // 标识是否为顶层字段
        cascaderData: {
          companies: [],
          selectedCompany: null,
          selectedDept: null
        }
      },
      // 顶层日期/时间
      datePickerShow: false,
      datePickerParams: {
        year: true,
        month: true,
        day: true
      },
      dateRange: 0,
      currentDateField: null,
      timePickerShow: false,
      timePickerParams: {
        hour: true,
        minute: true,
        second: false
      },
      currentTimeField: null,
      // 子字段日期选择
      subDatePickerShow: {},
      subDatePickerParams: {
        year: true,
        month: true,
        day: true
      },
      currentSubDateInfo: {
        fieldName: "",
        itemIndex: -1,
        subField: null
      },
      //子字段日期和时间选择
      subDateTimePickerShow: {},
      subDateTimePickerParams: {
        year: true,
        month: true,
        day: true,
        hour: true,
        minute: true,
        second: false
      },
      currentSubDateTimeInfo: {
        fieldName: "",
        itemIndex: -1,
        subField: null
      },
      // 子字段时间选择
      subTimePickerShow: {},
      subTimePickerParams: {
        hour: true,
        minute: true,
        second: false
      },
      currentSubTimeInfo: {
        fieldName: "",
        itemIndex: -1,
        subField: null,
        range: ""
      },
      // 按钮加载状态
      saveLoadingLocal: false,
      submitLoadingLocal: false,
      simulateLoadingLocal: false,
      // 附件目录
      fileDir: "oa"
    };
  },
  computed: {
    watchHandlerMap() {
      return {
        watchEmployeeChange: (arrayItem, empData) => {
          const emp = empData.raw || empData;
          this.$set(arrayItem, "employee_name", emp.employee_name || "");
          this.$set(arrayItem, "current_company_id", emp.companys && emp.companys.company_id || "");
          this.$set(arrayItem, "current_company_name", emp.companys && emp.companys.company_name || "");
          this.$set(arrayItem, "current_department_id", emp.departments && emp.departments.department_id || "");
          this.$set(arrayItem, "current_department_name", emp.departments && emp.departments.department_name || "");
          this.$set(arrayItem, "current_position_id", emp.positions && emp.positions.position_id || "");
          this.$set(arrayItem, "current_position_name", emp.positions && emp.positions.position_name || "");
        },
        //交接人姓名
        watchHandoverEmployeeChange: (arrayItem, empData) => {
          const emp = empData.raw || empData;
          this.$set(arrayItem, "handover_person_name", emp.employee_name || "");
        },
        onOvertimeSelected: (arrayItem, overtimeData) => {
          const over = overtimeData.raw || overtimeData;
          this.$set(arrayItem, "remaining_hours", over && over.remaining_hours || "");
        }
      };
    }
  },
  watch: {
    formSchema: {
      immediate: true,
      deep: true,
      handler: "initForm"
    },
    initialData: {
      immediate: true,
      deep: true,
      handler: "handleInitialData"
    },
    saveLoading(val) {
      this.saveLoadingLocal = val;
    },
    submitLoading(val) {
      this.submitLoadingLocal = val;
    },
    simulateLoading(val) {
      this.simulateLoadingLocal = val;
    },
    value(newVal) {
      if (newVal && this.formSchema)
        this.$nextTick(() => this.initForm());
    }
  },
  methods: {
    async loadRemoteDefaultLabels() {
      const remoteFields = this.formSchema.fields.filter(
        (f) => this.isSelectField(f) && f.action && this.formData[f.name] && this.formData[f.name] !== ""
      );
      for (const field of remoteFields) {
        const value = this.formData[field.name];
        try {
          const res = await vk.callFunction({
            url: field.action,
            data: {
              pageSize: 200,
              ...field.actionData || {}
            }
          });
          if (res.code === 0) {
            const rows = res.rows || res.data || [];
            const valueKey = field.props && field.props.value || "value";
            const labelKey = field.props && field.props.label || "label";
            const matched = rows.find((item) => item[valueKey] == value);
            if (matched) {
              const displayKey = this.getDisplayKeyForField(field);
              const label = matched[labelKey] || matched.name || matched.title || "";
              this.$set(this.formData, displayKey, label);
            }
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:617", `加载字段 ${field.name} 默认标签失败`, e);
        }
      }
    },
    // ========== 字段类型判断（顶层/子级通用） ==========
    isSelectField(field) {
      const types = ["select", "remote-select", "table-select", "cascader"];
      return types.includes(field.type) || !!field.displayNameKey;
    },
    isSubSelectField(subField) {
      const types = ["select", "remote-select", "table-select", "cascader"];
      return types.includes(subField.type) || !!subField.displayNameKey;
    },
    // ========== 顶层选择弹窗显示 ==========
    showTopSelectPicker(field) {
      const currentValue = this.formData[field.name] || "";
      this.getDisplayKeyForField(field);
      this.subRemote = {
        keyword: "",
        currentField: field,
        selectedValue: currentValue,
        arrayFieldName: "",
        itemIndex: -1,
        options: [],
        loading: false,
        selectedValue: this.formData[field.name] || "",
        pageIndex: 1,
        pageSize: 20,
        total: 0,
        mode: field.type === "cascader" ? "cascader" : "single",
        isTopLevel: true,
        cascaderData: {
          companies: [],
          selectedCompany: null,
          selectedDept: null
        }
      };
      if (field.options && Array.isArray(field.options)) {
        const valueKey = field.valueName || "value";
        const labelKey = field.labelName || "label";
        this.subRemote.options = field.options.map((opt) => ({
          value: opt[valueKey] !== void 0 && opt[valueKey] !== null ? opt[valueKey] : opt.value,
          label: opt[labelKey] !== void 0 && opt[labelKey] !== null ? opt[labelKey] : opt.label,
          raw: opt
        }));
        this.subRemote.total = this.subRemote.options.length;
        this.subRemoteSelectVisible = true;
        return;
      }
      if (field.action) {
        this.fetchSubRemoteOptions();
        this.subRemoteSelectVisible = true;
      } else {
        common_vendor.index.showToast({
          title: "无数据源",
          icon: "none"
        });
      }
    },
    // ========== 子级选择弹窗（原有） ==========
    showSubRemoteSelect(subField, arrayFieldName, itemIndex) {
      const isCascader = subField.type === "cascader";
      const arrayItem = this.formData[arrayFieldName][itemIndex];
      this.subRemote = {
        keyword: "",
        currentField: subField,
        arrayFieldName,
        itemIndex,
        options: [],
        loading: false,
        selectedValue: isCascader ? null : arrayItem[subField.key] || "",
        pageIndex: 1,
        pageSize: 20,
        total: 0,
        mode: isCascader ? "cascader" : "single",
        isTopLevel: false,
        cascaderData: {
          companies: [],
          selectedCompany: null,
          selectedDept: null
        }
      };
      this.subRemoteSelectVisible = true;
      if (isCascader) {
        this.fetchCascaderData();
      } else {
        this.fetchSubRemoteOptions();
      }
    },
    // ========== 远程加载选项（顶层/子级共用） ==========
    async fetchSubRemoteOptions() {
      const {
        currentField
      } = this.subRemote;
      if (!currentField || !currentField.action)
        return;
      this.subRemote.loading = true;
      try {
        const params = {
          pageIndex: this.subRemote.pageIndex,
          pageSize: this.subRemote.pageSize
        };
        if (this.subRemote.keyword)
          params.keyword = this.subRemote.keyword;
        if (currentField.actionData) {
          Object.assign(params, currentField.actionData);
        }
        const res = await vk.callFunction({
          url: currentField.action,
          data: params
        });
        if (res.code === 0) {
          const rows = res.rows || res.data || [];
          const valueKey = currentField.props && currentField.props.value || "value";
          const labelKey = currentField.props && currentField.props.label || "label";
          this.subRemote.options = rows.map((item) => ({
            value: item[valueKey] !== void 0 && item[valueKey] !== null ? item[valueKey] : item.employee_id !== void 0 && item.employee_id !== null ? item.employee_id : item.department_id !== void 0 && item.department_id !== null ? item.department_id : item.position_id !== void 0 && item.position_id !== null ? item.position_id : item._id !== void 0 && item._id !== null ? item._id : item.value,
            label: item[labelKey] !== void 0 && item[labelKey] !== null ? item[labelKey] : item.name !== void 0 && item.name !== null ? item.name : item.employee_name !== void 0 && item.employee_name !== null ? item.employee_name : item.department_name !== void 0 && item.department_name !== null ? item.department_name : item.position_name !== void 0 && item.position_name !== null ? item.position_name : item.title !== void 0 && item.title !== null ? item.title : item.label,
            raw: item
          }));
          this.subRemote.total = res.total || 0;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:758", "获取远程选项失败", e);
      } finally {
        this.subRemote.loading = false;
      }
    },
    async fetchCascaderData() {
      this.subRemote.loading = true;
      try {
        const action = this.subRemote.currentField.action;
        const res = await vk.callFunction({
          url: action,
          data: {
            pageSize: 500
          }
        });
        if (res.code === 0) {
          const companies = (res.rows || []).map((company) => ({
            value: company.department_id || company.company_id,
            label: company.department_name || company.company_name,
            children: (company.children || []).map((dept) => ({
              value: dept.department_id,
              label: dept.department_name
            }))
          }));
          this.subRemote.cascaderData.companies = companies;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:785", "获取级联数据失败", e);
      } finally {
        this.subRemote.loading = false;
      }
    },
    selectCascaderCompany(company) {
      this.subRemote.cascaderData.selectedCompany = company;
      this.subRemote.cascaderData.selectedDept = null;
    },
    selectCascaderDept(dept) {
      this.subRemote.cascaderData.selectedDept = dept;
      const {
        arrayFieldName,
        itemIndex,
        currentField,
        isTopLevel
      } = this.subRemote;
      if (isTopLevel) {
        const company = this.subRemote.cascaderData.selectedCompany;
        this.$set(this.formData, currentField.name, [company.value, dept.value]);
        const displayKey = this.getDisplayKeyForField(currentField);
        this.$set(this.formData, displayKey, company.label + " / " + dept.label);
      } else {
        const arrayItem = this.formData[arrayFieldName][itemIndex];
        const company = this.subRemote.cascaderData.selectedCompany;
        this.$set(arrayItem, currentField.key, [company.value, dept.value]);
        if (currentField.displayNameKey) {
          this.$set(arrayItem, currentField.displayNameKey, company.label + " / " + dept.label);
        }
        this.$set(arrayItem, "new_company_id", company.value);
        this.$set(arrayItem, "new_company_name", company.label);
        this.$set(arrayItem, "new_department_id", dept.value);
        this.$set(arrayItem, "new_department_name", dept.label);
      }
      this.subRemoteSelectVisible = false;
    },
    onSubRemoteSearch() {
      this.subRemote.pageIndex = 1;
      this.fetchSubRemoteOptions();
    },
    // ========== 选择确认（顶层/子级共用） ==========
    selectSubRemoteItem(item) {
      const {
        arrayFieldName,
        itemIndex,
        currentField,
        isTopLevel
      } = this.subRemote;
      const raw = item.raw || item;
      if (isTopLevel) {
        this.$set(this.formData, currentField.name, item.value);
        const displayKey = this.getDisplayKeyForField(currentField);
        this.$set(this.formData, displayKey, item.label || raw[currentField.displayNameKey] || "");
      } else {
        const arrayItem = this.formData[arrayFieldName][itemIndex];
        this.$set(arrayItem, currentField.key, item.value);
        if (currentField.displayNameKey) {
          this.$set(arrayItem, currentField.displayNameKey, item.label || raw[currentField.displayNameKey] || "");
        } else {
          this.$set(arrayItem, currentField.key + "_label", item.label);
        }
        if (currentField.watch && this.watchHandlerMap[currentField.watch]) {
          this.watchHandlerMap[currentField.watch](arrayItem, item);
        }
      }
      this.subRemoteSelectVisible = false;
    },
    // ========== 工具方法 ==========
    isItemBatchDisabled(item, subFieldKey) {
      return this.formTypeCode === "LEAVE_APPLICATION" && item.batchGenerated === true;
    },
    // 顶级显示
    getDisplayKeyForField(field) {
      return field.displayNameKey || field.name + "_label";
    },
    //子级显示
    getDisplayKey(field) {
      return field.displayNameKey || field.key + "_label";
    },
    openBatchDatePicker(field) {
      this.currentBatchField = field;
      this.showBatchDatePicker = true;
    },
    onBatchDatePickerShow(type) {
      this.batchPickerType = type;
      this.batchPickerShow = true;
    },
    onBatchDateConfirm(e) {
      const dateStr = `${e.year}-${e.month}-${e.day}`;
      if (this.batchPickerType === "start") {
        this.batchStartDate = dateStr;
      } else {
        this.batchEndDate = dateStr;
      }
      this.batchPickerShow = false;
    },
    generateBatchDates() {
      if (!this.batchStartDate || !this.batchEndDate) {
        common_vendor.index.showToast({
          title: "请选择起止日期",
          icon: "none"
        });
        return;
      }
      const start = new Date(this.batchStartDate.replace(/-/g, "/"));
      const end = new Date(this.batchEndDate.replace(/-/g, "/"));
      if (end < start) {
        common_vendor.index.showToast({
          title: "结束日期不能早于开始日期",
          icon: "none"
        });
        return;
      }
      this.clearArray("items");
      const startItem = {
        leave_date: this.batchStartDate,
        morning_range: ["08:30", "12:00"],
        afternoon_range: ["13:30", "18:00"],
        batchGenerated: true
      };
      const endItem = {
        leave_date: this.batchEndDate,
        morning_range: ["08:30", "12:00"],
        afternoon_range: ["13:30", "18:00"],
        batchGenerated: true
      };
      if (!this.formData.items)
        this.$set(this.formData, "items", []);
      this.formData.items.push(startItem, endItem);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24)) + 1;
      const totalHours = diffDays * 8;
      this.$set(this.formData, "total_hours", String(totalHours));
      this.showBatchDatePicker = false;
      common_vendor.index.showToast({
        title: `已生成首尾明细，共 ${totalHours} 小时`,
        icon: "success"
      });
    },
    filterNumberInput(rawValue) {
      let value = rawValue;
      let filtered = value.replace(/[^\d.]/g, "");
      const dotIndex = filtered.indexOf(".");
      if (dotIndex !== -1) {
        filtered = filtered.substring(0, dotIndex + 1) + filtered.substring(dotIndex + 1).replace(/\./g, "");
      }
      if (filtered.startsWith("."))
        filtered = "0" + filtered;
      if (filtered.length > 1 && filtered[0] === "0" && filtered[1] !== ".") {
        filtered = filtered.replace(/^0+/, "") || "0";
      }
      if (filtered === ".")
        filtered = "0.";
      return filtered;
    },
    onNumberInput(fieldName, e) {
      let value = "";
      if (typeof e === "string") {
        value = e;
      } else if (e && e.detail && e.detail.value !== void 0) {
        value = e.detail.value;
      } else if (e && e.target && e.target.value !== void 0) {
        value = e.target.value;
      }
      const filtered = this.filterNumberInput(value);
      this.$forceUpdate();
      this.$nextTick(() => {
        this.$set(this.formData, fieldName, filtered);
        this.calcAutoTotal();
      });
    },
    onArrayNumberInput(fieldName, itemIndex, subFieldKey, e) {
      let value = "";
      if (typeof e === "string") {
        value = e;
      } else if (e && e.detail && e.detail.value !== void 0) {
        value = e.detail.value;
      } else if (e && e.target && e.target.value !== void 0) {
        value = e.target.value;
      }
      const filtered = this.filterNumberInput(value);
      this.$forceUpdate();
      this.$nextTick(() => {
        this.$set(this.formData[fieldName][itemIndex], subFieldKey, filtered);
        this.calcAutoTotal();
      });
    },
    timeToMinutes(timeStr) {
      if (!timeStr)
        return null;
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    },
    checkArrayUniqueness(arr, columns, newItem) {
      for (const col of columns) {
        if (col.isUnique) {
          const key = col.key;
          const newValue = newItem[key];
          if (newValue === void 0 || newValue === "" || newValue === null)
            continue;
          const exists = arr.some(
            (item, idx) => item !== newItem && String(item[key]) === String(newValue)
          );
          if (exists) {
            return col.title || col.key;
          }
        }
      }
      return false;
    },
    validateArrayUniqueness() {
      const arrayFields = this.formSchema.fields.filter((f) => f.type === "array<object>");
      for (const field of arrayFields) {
        const arr = this.formData[field.name] || [];
        const cols = field.columns || [];
        for (let i = 0; i < arr.length; i++) {
          const conflict = this.checkArrayUniqueness(
            arr.filter((_, idx) => idx !== i),
            cols,
            arr[i]
          );
          if (conflict) {
            common_vendor.index.showToast({
              title: `"${conflict}"存在重复`,
              icon: "none"
            });
            return false;
          }
        }
      }
      return true;
    },
    validateTimeRanges() {
      const arrayFields = this.formSchema.fields.filter((f) => f.type === "array<object>");
      for (const field of arrayFields) {
        const arr = this.formData[field.name] || [];
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          for (const col of field.columns) {
            if (col.type === "time" && col.isRange) {
              const range = item[col.key];
              if (!Array.isArray(range))
                continue;
              const [start, end] = range;
              if (!start || !end)
                continue;
              if (start >= end) {
                common_vendor.index.showToast({
                  title: `第${i + 1}项"${col.title}"开始时间必须早于结束时间`,
                  icon: "none"
                });
                return false;
              }
              if (col.allowedRangeStart && col.allowedRangeEnd) {
                const startMins = this.timeToMinutes(start);
                const endMins = this.timeToMinutes(end);
                const minStart = this.timeToMinutes(col.allowedRangeStart);
                const maxEnd = this.timeToMinutes(col.allowedRangeEnd);
                if (startMins < minStart || endMins > maxEnd) {
                  common_vendor.index.showToast({
                    title: `第${i + 1}项"${col.title}"时间必须在 ${col.allowedRangeStart}-${col.allowedRangeEnd} 之间`,
                    icon: "none"
                  });
                  return false;
                }
              }
            }
          }
        }
      }
      return true;
    },
    validateArrayItemsRequired() {
      const arrayFields = this.formSchema.fields.filter((f) => f.type === "array<object>");
      for (const field of arrayFields) {
        const arr = this.formData[field.name] || [];
        if (field.required && arr.length === 0) {
          common_vendor.index.showToast({
            title: `${field.label}至少需要一条明细`,
            icon: "none"
          });
          return false;
        }
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          if (!field.columns)
            continue;
          for (const col of field.columns) {
            if (col.required) {
              const value = item[col.key];
              if (col.type === "time" && col.isRange) {
                if (!Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
                  common_vendor.index.showToast({
                    title: `第${i + 1}项"${col.title}"为必填，请完善`,
                    icon: "none"
                  });
                  return false;
                }
              } else {
                if (value === void 0 || value === null || value === "") {
                  common_vendor.index.showToast({
                    title: `第${i + 1}项"${col.title}"为必填`,
                    icon: "none"
                  });
                  return false;
                }
              }
            }
          }
        }
      }
      return true;
    },
    validateNumberLimits() {
      const topFields = this.formSchema.fields.filter((f) => f.type === "number");
      for (const field of topFields) {
        const val = parseFloat(this.formData[field.name]);
        if (isNaN(val))
          continue;
        if (field.min !== void 0 && val < field.min) {
          common_vendor.index.showToast({
            title: `"${field.label}"不能小于${field.min}`,
            icon: "none"
          });
          return false;
        }
        if (field.max !== void 0 && val > field.max) {
          common_vendor.index.showToast({
            title: `"${field.label}"不能大于${field.max}`,
            icon: "none"
          });
          return false;
        }
      }
      const arrayFields = this.formSchema.fields.filter((f) => f.type === "array<object>");
      for (const field of arrayFields) {
        const arr = this.formData[field.name] || [];
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          if (!field.columns)
            continue;
          for (const col of field.columns) {
            if (col.type === "number") {
              const val = parseFloat(item[col.key]);
              if (isNaN(val))
                continue;
              if (col.min !== void 0 && val < col.min) {
                common_vendor.index.showToast({
                  title: `第${i + 1}项"${col.title}"不能小于${col.min}`,
                  icon: "none"
                });
                return false;
              }
              if (col.maxFromField) {
                const maxVal = parseFloat(item[col.maxFromField]);
                if (!isNaN(maxVal) && val > maxVal) {
                  common_vendor.index.showToast({
                    title: `第${i + 1}项"${col.title}"不能超过${maxVal}`,
                    icon: "none"
                  });
                  return false;
                }
              }
            }
          }
        }
      }
      return true;
    },
    // ========== 初始化 ==========
    initForm() {
      if (!this.formSchema || !this.formSchema.fields)
        return;
      this.initFormData();
      this.initFormRules();
      this.initFormLayout();
      this.formFields = this.formSchema.fields;
      this.$nextTick(() => {
        this.loadRemoteDefaultLabels();
      });
    },
    initFormData() {
      if (!this.formSchema || !this.formSchema.fields)
        return;
      const formData = {};
      this.formSchema.fields.forEach((field) => {
        if (field.type === "file" || field.type === "array<object>") {
          formData[field.name] = [];
        } else if (field.type === "time" && field.isRange) {
          formData[field.name] = ["", ""];
        } else {
          formData[field.name] = field.defaultValue !== void 0 && field.defaultValue !== null ? field.defaultValue : "";
        }
        if (this.isSelectField(field)) {
          const displayKey = this.getDisplayKeyForField(field);
          if (!(displayKey in formData)) {
            formData[displayKey] = "";
          }
        }
      });
      if (this.initialData && this.initialData.form_data) {
        Object.assign(formData, this.initialData.form_data);
      }
      this.formData = formData;
      this.initSelectShow();
      this.syncSelectLabels();
      this.$nextTick(() => this.calcAutoTotal());
    },
    initSelectShow() {
      const show = {};
      this.formSchema.fields.forEach((field) => {
        if (field.type === "select")
          show[field.name] = false;
      });
      this.selectShow = show;
    },
    initFormRules() {
      if (!this.formSchema || !this.formSchema.fields)
        return;
      const rules = {};
      this.formSchema.fields.forEach((field) => {
        const fieldRules = [];
        if (field.required) {
          if (field.type === "file" || field.type === "array<object>") {
            fieldRules.push({
              validator: (rule, value, callback) => {
                if (!value || Array.isArray(value) && value.length === 0) {
                  return new Error(`${field.label}是必填项`);
                }
                return true;
              },
              trigger: ["change", "blur"]
            });
          } else if (field.type === "number") {
            fieldRules.push({
              validator: (rule, value, callback) => {
                if (value === void 0 || value === null || value === "") {
                  return new Error(`${field.label}是必填项`);
                }
                return true;
              },
              trigger: ["blur", "change"]
            });
          } else {
            fieldRules.push({
              required: true,
              message: `${field.label}是必填项`,
              trigger: ["blur", "change"]
            });
          }
        }
        if (fieldRules.length > 0)
          rules[field.name] = fieldRules;
      });
      this.formRules = rules;
      this.$nextTick(() => {
        if (this.$refs.uForm)
          this.$refs.uForm.setRules(this.formRules);
      });
    },
    initFormLayout() {
      if (this.formSchema && this.formSchema.layout && this.formSchema.layout.groups) {
        this.formLayoutGroups = this.formSchema.layout.groups;
      } else {
        this.formLayoutGroups = [{
          title: "",
          fields: this.formSchema && this.formSchema.fields ? this.formSchema.fields.map((f) => f.name) : []
        }];
      }
    },
    getGroupFields(group) {
      if (!group.fields || !this.formSchema || !this.formSchema.fields)
        return [];
      return this.formSchema.fields.filter((f) => group.fields.includes(f.name));
    },
    syncSelectLabels() {
      if (!this.formSchema || !this.formSchema.fields)
        return;
      this.formSchema.fields.forEach((field) => {
        if (this.isSelectField(field) && field.options) {
          const value = this.formData[field.name];
          const displayKey = this.getDisplayKeyForField(field);
          if (value != null && value !== "" && !this.formData[displayKey]) {
            const option = field.options.find((o) => o.value == value);
            if (option) {
              this.$set(this.formData, displayKey, option.label);
            }
          }
        }
      });
    },
    normalizeArrayFields() {
      if (!this.formSchema)
        return;
      const arrayFields = this.formSchema.fields.filter((f) => f.type === "array<object>");
      arrayFields.forEach((field) => {
        const arr = this.formData[field.name];
        if (!Array.isArray(arr))
          return;
        const columns = field.columns || [];
        arr.forEach((item) => {
          columns.forEach((col) => {
            if (col.type === "time" && col.isRange) {
              if (!Array.isArray(item[col.key]) || item[col.key].length !== 2) {
                this.$set(item, col.key, ["", ""]);
              }
            }
          });
        });
      });
    },
    handleInitialData(initialData) {
      if (initialData && initialData.form_data) {
        Object.assign(this.formData, initialData.form_data);
        this.syncSelectLabels();
        this.normalizeArrayFields();
        this.$nextTick(() => this.calcAutoTotal());
      }
    },
    // ========== 顶层日期/时间 ==========
    showDatePicker(field) {
      this.currentDateField = field.name;
      this.dateRange = field.day || 0;
      this.datePickerShow = true;
    },
    onDateConfirm(e) {
      if (this.currentDateField && e) {
        const {
          year,
          month,
          day
        } = e;
        const dateStr = `${year}-${month}-${day}`;
        if (this.dateRange > 0) {
          const selected = new Date(year, month - 1, day);
          const now = /* @__PURE__ */ new Date();
          const before = new Date(now.getTime() - this.dateRange * 24 * 3600 * 1e3);
          if (selected < before || selected > now) {
            common_vendor.index.showToast({
              title: `只能选择最近${this.dateRange}天的日期`,
              icon: "none"
            });
            return;
          }
        }
        this.formData[this.currentDateField] = dateStr;
      }
    },
    showTimePicker(fieldName) {
      this.currentTimeField = fieldName;
      this.timePickerShow = true;
    },
    onTimeConfirm(e) {
      if (this.currentTimeField && e) {
        const h = e.hour.toString().padStart(2, "0");
        const m = e.minute.toString().padStart(2, "0");
        this.formData[this.currentTimeField] = `${h}:${m}`;
        this.calcAutoTotal();
      }
      this.timePickerShow = false;
    },
    // ========== 子字段日期/时间 ==========
    showSubDatePicker(fieldName, itemIndex, subField) {
      this.currentSubDateInfo = {
        fieldName,
        itemIndex,
        subField
      };
      const key = `${fieldName}_${itemIndex}_${subField.key}`;
      this.$set(this.subDatePickerShow, key, true);
    },
    onSubDateConfirm(e) {
      const {
        fieldName,
        itemIndex,
        subField
      } = this.currentSubDateInfo;
      if (!fieldName)
        return;
      const item = this.formData[fieldName][itemIndex];
      const dateStr = `${e.year}-${e.month}-${e.day}`;
      this.$set(item, subField.key, dateStr);
      this.subDatePickerShow[`${fieldName}_${itemIndex}_${subField.key}`] = false;
      this.calcAutoTotal();
    },
    showSubDateTimePicker(fieldName, itemIndex, subField) {
      this.currentSubDateTimeInfo = {
        fieldName,
        itemIndex,
        subField
      };
      const key = `${fieldName}_${itemIndex}_${subField.key}`;
      this.$set(this.subDateTimePickerShow, key, true);
    },
    onSubDateTimeConfirm(e) {
      const {
        fieldName,
        itemIndex,
        subField
      } = this.currentSubDateTimeInfo;
      if (!fieldName)
        return;
      const item = this.formData[fieldName][itemIndex];
      const dateStr = `${e.year}-${e.month}-${e.day} ${e.hour}:${e.minute}`;
      this.$set(item, subField.key, dateStr);
      this.subDateTimePickerShow[`${fieldName}_${itemIndex}_${subField.key}`] = false;
    },
    showSubTimePicker(fieldName, itemIndex, subField, range) {
      this.currentSubTimeInfo = {
        fieldName,
        itemIndex,
        subField,
        range
      };
      const key = `${fieldName}_${itemIndex}_${subField.key}_${range}`;
      this.$set(this.subTimePickerShow, key, true);
    },
    onSubTimeConfirm(e) {
      const {
        fieldName,
        itemIndex,
        subField,
        range
      } = this.currentSubTimeInfo;
      if (!fieldName)
        return;
      const item = this.formData[fieldName][itemIndex];
      const timeStr = `${e.hour}:${e.minute}`;
      const idx = range === "start" ? 0 : 1;
      if (!Array.isArray(item[subField.key])) {
        this.$set(item, subField.key, ["", ""]);
      }
      this.$set(item[subField.key], idx, timeStr);
      this.subTimePickerShow[`${fieldName}_${itemIndex}_${subField.key}_${range}`] = false;
      this.calcAutoTotal();
    },
    // ========== 自动计算数 ==========
    calcAutoTotal() {
      const type = this.formTypeCode;
      const formData = this.formData;
      let itemsField, totalField;
      itemsField = "items";
      if (type === "LEAVE_APPLICATION") {
        totalField = "total_hours";
        const items = formData[itemsField];
        if (!Array.isArray(items) || items.length === 0)
          return;
        const hasBatchItems = items.some((item) => item.batchGenerated === true);
        if (hasBatchItems) {
          const batchItems = items.filter((item) => item.batchGenerated === true);
          const dates = batchItems.map((item) => new Date(item.leave_date.replace(/-/g, "/")));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          const diffDays = Math.round((maxDate - minDate) / (1e3 * 60 * 60 * 24)) + 1;
          const baseHours = diffDays * 8;
          let extraHours = 0;
          items.forEach((item) => {
            if (!item.batchGenerated) {
              const calc = (range) => {
                if (Array.isArray(range) && range[0] && range[1]) {
                  const [s, e] = range;
                  const [sh, sm] = s.split(":").map(Number);
                  const [eh, em] = e.split(":").map(Number);
                  return (eh * 60 + em - (sh * 60 + sm)) / 60;
                }
                return 0;
              };
              extraHours += calc(item.morning_range);
              extraHours += calc(item.afternoon_range);
            }
          });
          const total2 = baseHours + extraHours;
          this.$set(formData, totalField, (Math.round(total2 * 10) / 10).toString());
          return;
        }
        let total = 0;
        items.forEach((item) => {
          const calc = (range) => {
            if (Array.isArray(range) && range[0] && range[1]) {
              const [s, e] = range;
              const [sh, sm] = s.split(":").map(Number);
              const [eh, em] = e.split(":").map(Number);
              return (eh * 60 + em - (sh * 60 + sm)) / 60;
            }
            return 0;
          };
          total += calc(item.morning_range);
          total += calc(item.afternoon_range);
        });
        this.$set(formData, totalField, (Math.round(total * 10) / 10).toString());
        return;
      } else if (type === "OVERTIME_APPLICATION") {
        totalField = "overtime_total_hours";
        const items = formData[itemsField];
        if (!Array.isArray(items))
          return;
        let total = 0;
        items.forEach((item) => {
          const calc = (range) => {
            if (Array.isArray(range) && range[0] && range[1]) {
              const [s, e] = range;
              const [sh, sm] = s.split(":").map(Number);
              const [eh, em] = e.split(":").map(Number);
              return (eh * 60 + em - (sh * 60 + sm)) / 60;
            }
            return 0;
          };
          total += calc(item.morning_range);
          total += calc(item.afternoon_range);
        });
        this.$set(formData, totalField, (Math.round(total * 10) / 10).toString());
        return;
      } else if (type === "COMPENSATORY_APPLICATION") {
        totalField = "total_compensatory_hours";
        const items = formData[itemsField];
        if (!Array.isArray(items))
          return;
        let total = 0;
        items.forEach((item) => {
          const hours = parseFloat(item.deduct_hours) || 0;
          total += hours;
        });
        this.$set(formData, totalField, (Math.round(total * 10) / 10).toString());
        return;
      } else if (type === "BUSINESS_TRIP_APPLICATION") {
        totalField = "total_trip_hours";
        const items = formData[itemsField];
        if (!Array.isArray(items))
          return;
        let total = 0;
        items.forEach((item) => {
          const start = item.start_time;
          const end = item.end_time;
          if (start && end) {
            const startDate = new Date(start.replace(/-/g, "/"));
            const endDate = new Date(end.replace(/-/g, "/"));
            if (!isNaN(startDate) && !isNaN(endDate)) {
              const hours = (endDate - startDate) / 36e5;
              total += Math.max(0, hours);
            }
          }
        });
        this.$set(formData, totalField, (Math.round(total * 10) / 10).toString());
        return;
      } else if (type === "REIMBURSEMENT_APPLICATION") {
        totalField = "total_detail_amount";
        const items = formData[itemsField];
        if (!Array.isArray(items))
          return;
        let total = 0;
        items.forEach((item) => {
          const val = parseFloat(item.expense_amount);
          if (!isNaN(val))
            total += val;
        });
        this.$set(formData, totalField, (Math.round(total * 100) / 100).toString());
        return;
      } else if (type === "WORK_CLOTHES_APPLICATION") {
        totalField = "total_quantity";
        const items = formData[itemsField];
        if (!Array.isArray(items))
          return;
        let total = 0;
        items.forEach((item) => {
          const qty = parseInt(item.quantity) || 0;
          total += qty;
        });
        this.$set(formData, totalField, total.toString());
        return;
      } else if (type === "RECRUITMENT_APPLICATION") {
        totalField = "total_quantity";
        const items = formData[itemsField];
        if (!Array.isArray(items))
          return;
        let total = 0;
        items.forEach((item) => {
          const qty = parseInt(item.quantity) || 0;
          total += qty;
        });
        this.$set(formData, totalField, total.toString());
        return;
      } else if (type === "OUTING_APPLICATION") {
        totalField = "total_duration";
        const start = formData.start_time;
        const end = formData.end_time;
        let total = 0;
        if (start && end) {
          const [sh, sm] = start.split(":").map(Number);
          const [eh, em] = end.split(":").map(Number);
          total = (eh * 60 + em - (sh * 60 + sm)) / 60;
        }
        const result = total.toFixed(1);
        this.$set(formData, totalField, result.endsWith(".0") ? result.slice(0, -2) : result);
        return;
      }
    },
    // ========== 文件处理 ==========
    getFileMediaType(accept) {
      if (!accept)
        return "all";
      if (accept.includes("image"))
        return "image";
      if (accept.includes("video"))
        return "video";
      return "all";
    },
    async onFileSelect(e, fieldName) {
      common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:1566", "文件选择事件:", e);
      if (!e.tempFilePaths || e.tempFilePaths.length === 0) {
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "上传中...",
          mask: true
        });
        for (let i = 0; i < e.tempFilePaths.length; i++) {
          const tempFilePath = e.tempFilePaths[i];
          const fileInfo = e.tempFiles[i] || {};
          const fileName = fileInfo.name || this.getFileNameFromPath(tempFilePath);
          const fileSize = fileInfo.size || 0;
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1e4);
          const ext = fileName.split(".").pop() || "file";
          const cloudPath = `public/${this.fileDir}/${timestamp}_${random}.${ext}`;
          const uploadOptionsRes = await vk.callFunction({
            url: "common/pub/getUploadFileOptions/index",
            data: {
              cloudPath
            }
          });
          if (uploadOptionsRes.code !== 0) {
            throw new Error(uploadOptionsRes.msg || "获取上传参数失败");
          }
          const uploadOptions = uploadOptionsRes.rows;
          const uploadResult = await new Promise((resolve, reject) => {
            common_vendor.index.uploadFile({
              ...uploadOptions.uploadFileOptions,
              filePath: tempFilePath,
              name: "file",
              success: (res) => {
                if (res.statusCode === 200) {
                  resolve(res);
                } else {
                  reject(new Error(`上传失败: ${res.statusCode}`));
                }
              },
              fail: reject
            });
          });
          const fileUrl = `https://tdhstorage.cntdh.net/${cloudPath}`;
          if (!this.formData[fieldName]) {
            this.$set(this.formData, fieldName, []);
          }
          const fileItem = {
            name: fileName,
            size: fileSize,
            url: fileUrl,
            fileID: cloudPath,
            path: fileUrl,
            cloudPath,
            ext
          };
          this.formData[fieldName].push(fileItem);
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "上传成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:1653", "文件上传失败:", error);
        common_vendor.index.showToast({
          title: "上传失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      }
    },
    getFileNameFromPath(filePath) {
      if (!filePath)
        return "未命名文件";
      const parts = filePath.split("/");
      return parts[parts.length - 1];
    },
    onFileUploadSuccess(e, fieldName) {
      common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:1669", "文件上传成功回调:", e);
    },
    onFileUploadFail(err) {
      common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:1673", "文件上传失败:", err);
      common_vendor.index.showToast({
        title: "上传失败",
        icon: "none"
      });
    },
    onFilePickerInput(val, fieldName) {
      if (Array.isArray(val) && val.length > 0) {
        const hasTempPath = val.some(
          (file) => file.url && file.url.startsWith("http://tmp/")
        );
        if (hasTempPath) {
          common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:1687", "忽略临时路径更新");
          return;
        }
      }
      this.$set(this.formData, fieldName, val);
    },
    async onFileDelete(e, fieldName) {
      try {
        const fileInfo = this.formData[fieldName][e.index];
        if (fileInfo.cloudPath || fileInfo.fileID) {
          const cloudPath = fileInfo.cloudPath || fileInfo.fileID;
          await vk.myfn.deleteFile(fileInfo);
          common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:1704", "删除云文件:", cloudPath);
        }
        this.formData[fieldName].splice(e.index, 1);
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:1714", "删除文件失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    },
    handleFilePreview(file, fieldName) {
      this.$emit("preview-file", {
        url: file.url,
        name: this.getFileName(file),
        size: file.size,
        type: file.mimetype || this.getFileTypeFromName(file)
      });
    },
    downloadFile(file) {
      this.$emit("download-file", file);
    },
    getFileName(file) {
      if (file.name)
        return file.name;
      if (file.url) {
        const clean = file.url.split(/[?#]/)[0];
        return clean.split("/").pop() || "未命名文件";
      }
      return "未命名文件";
    },
    getFileTypeFromName(file) {
      const name = this.getFileName(file);
      const ext = name.split(".").pop().toLowerCase();
      const map = {
        jpg: "image",
        jpeg: "image",
        png: "image",
        gif: "image",
        bmp: "image",
        pdf: "pdf"
      };
      return map[ext] || "unknown";
    },
    formatFileSize(bytes) {
      if (!bytes)
        return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
    // ========== array<object> 操作 ==========
    addArrayItem(field) {
      if (!this.formData[field.name])
        this.$set(this.formData, field.name, []);
      const item = {};
      if (field.columns) {
        field.columns.forEach((sub) => {
          if (sub.type === "time" && sub.isRange) {
            item[sub.key] = ["", ""];
          } else {
            item[sub.key] = sub.defaultValue !== void 0 ? sub.defaultValue : "";
          }
          if (sub.displayNameKey)
            item[sub.displayNameKey] = "";
        });
      }
      const conflict = this.checkArrayUniqueness(
        this.formData[field.name],
        field.columns,
        item
      );
      if (conflict) {
        common_vendor.index.showToast({
          title: `"${conflict}"不能重复添加`,
          icon: "none"
        });
        return;
      }
      this.formData[field.name].push(item);
      this.calcAutoTotal();
    },
    removeArrayItem(fieldName, index) {
      if (this.formData[fieldName]) {
        this.formData[fieldName].splice(index, 1);
      }
      this.calcAutoTotal();
    },
    moveArrayItem(fieldName, index, direction) {
      const arr = this.formData[fieldName];
      if (!arr || arr.length <= 1)
        return;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= arr.length)
        return;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
    },
    clearArray(fieldName) {
      this.formData[fieldName] = [];
      this.calcAutoTotal();
    },
    // ========== 提交相关 ==========
    async handleSave(status) {
      try {
        this.saveLoadingLocal = true;
        const valid = await this.$refs.uForm.validate();
        if (!valid)
          return;
        if (!this.validateArrayUniqueness())
          return;
        if (!this.validateTimeRanges())
          return;
        if (!this.validateArrayItemsRequired())
          return;
        if (!this.validateNumberLimits())
          return;
        const data = this.processFormData();
        if (status)
          data.status = status;
        this.$emit("save", data);
      } catch (e) {
        common_vendor.index.showToast({
          title: "请完善表单信息",
          icon: "none"
        });
      } finally {
        this.saveLoadingLocal = false;
      }
    },
    async handleSubmit() {
      try {
        const valid = await this.$refs.uForm.validate();
        if (!valid)
          return;
        if (!this.validateArrayUniqueness())
          return;
        if (!this.validateTimeRanges())
          return;
        if (!this.validateArrayItemsRequired())
          return;
        if (!this.validateNumberLimits())
          return;
        this.submitLoadingLocal = true;
        const data = this.processFormData();
        data.status = "pending";
        this.$emit("submit", data);
      } catch (e) {
        common_vendor.index.showToast({
          title: "请完善表单信息",
          icon: "none"
        });
      } finally {
        this.submitLoadingLocal = false;
      }
    },
    async handleSimulate() {
      try {
        const valid = await this.$refs.uForm.validate();
        if (!valid)
          return;
        if (!this.validateArrayUniqueness())
          return;
        if (!this.validateTimeRanges())
          return;
        if (!this.validateArrayItemsRequired())
          return;
        if (!this.validateNumberLimits())
          return;
        this.simulateLoadingLocal = true;
        const data = this.processFormData();
        this.$emit("simulate", data);
      } catch (e) {
        common_vendor.index.showToast({
          title: "请完善表单信息",
          icon: "none"
        });
      } finally {
        this.simulateLoadingLocal = false;
      }
    },
    handleCancel() {
      this.$emit("cancel");
      this.$emit("input", false);
    },
    processFormData() {
      const clonedData = JSON.parse(JSON.stringify(this.formData));
      this.formSchema.fields.forEach((field) => {
        if (field.type === "number") {
          const val = clonedData[field.name];
          if (val !== void 0 && val !== null && val !== "") {
            clonedData[field.name] = Number(val);
          }
        }
      });
      const arrayFields = this.formSchema.fields.filter((f) => f.type === "array<object>");
      arrayFields.forEach((field) => {
        const arr = clonedData[field.name];
        if (Array.isArray(arr)) {
          arr.forEach((item) => {
            (field.columns || []).forEach((col) => {
              if (col.type === "number") {
                const val = item[col.key];
                if (val !== void 0 && val !== null && val !== "") {
                  item[col.key] = Number(val);
                }
              }
            });
          });
        }
      });
      if (clonedData.items && Array.isArray(clonedData.items) && this.formTypeCode == "TRANSFER_APPLY") {
        const allowedKeys = [
          "employee_id",
          "employee_name",
          "current_company_id",
          "current_company_name",
          "current_department_id",
          "current_department_name",
          "current_position_id",
          "current_position_name",
          "new_company_department",
          "new_company_id",
          "new_company_name",
          "new_department_id",
          "new_department_name",
          "new_position_id",
          "new_position_name",
          "remarks"
        ];
        clonedData.items = clonedData.items.map((item) => {
          const clean = {};
          allowedKeys.forEach((key) => {
            if (item.hasOwnProperty(key))
              clean[key] = item[key];
          });
          return clean;
        });
      }
      return {
        form_type_code: this.formTypeCode,
        form_data: clonedData
      };
    }
  }
};
if (!Array) {
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _easycom_u_picker2 = common_vendor.resolveComponent("u-picker");
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_loading2 = common_vendor.resolveComponent("u-loading");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_easycom_u_input2 + _easycom_u_form_item2 + _easycom_uni_file_picker2 + _easycom_u_icon2 + _easycom_u_button2 + _easycom_u_empty2 + _easycom_u_form2 + _easycom_u_picker2 + _easycom_u_search2 + _easycom_u_loading2 + _easycom_u_popup2)();
}
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_u_picker = () => "../../uni_modules/vk-uview-ui/components/u-picker/u-picker.js";
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_loading = () => "../../uni_modules/vk-uview-ui/components/u-loading/u-loading.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
if (!Math) {
  (_easycom_u_input + _easycom_u_form_item + _easycom_uni_file_picker + _easycom_u_icon + _easycom_u_button + _easycom_u_empty + _easycom_u_form + _easycom_u_picker + _easycom_u_search + _easycom_u_loading + _easycom_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.formLayoutGroups, (group, groupIndex, i0) => {
      return common_vendor.e({
        a: group.title
      }, group.title ? {
        b: common_vendor.t(group.title)
      } : {}, {
        c: common_vendor.f($options.getGroupFields(group), (field, k1, i1) => {
          return common_vendor.e({
            a: field.type === "text"
          }, field.type === "text" ? {
            b: "2b16f33b-2-" + i0 + "-" + i1 + "," + ("2b16f33b-1-" + i0 + "-" + i1),
            c: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            d: common_vendor.p({
              placeholder: field.placeholder || "请输入",
              disabled: field.disabled,
              type: field.inputType || "text",
              maxlength: field.maxLength,
              clearable: true,
              modelValue: $data.formData[field.name]
            }),
            e: "2b16f33b-1-" + i0 + "-" + i1 + ",2b16f33b-0",
            f: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "number" ? {
            h: common_vendor.o((e) => $options.onNumberInput(field.name, e), field.name),
            i: "2b16f33b-4-" + i0 + "-" + i1 + "," + ("2b16f33b-3-" + i0 + "-" + i1),
            j: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            k: common_vendor.p({
              placeholder: field.placeholder || "请输入数字",
              disabled: field.disabled,
              type: "number",
              clearable: true,
              modelValue: $data.formData[field.name]
            }),
            l: "2b16f33b-3-" + i0 + "-" + i1 + ",2b16f33b-0",
            m: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : $options.isSelectField(field) ? {
            o: common_vendor.o(($event) => $options.showTopSelectPicker(field), field.name),
            p: "2b16f33b-6-" + i0 + "-" + i1 + "," + ("2b16f33b-5-" + i0 + "-" + i1),
            q: common_vendor.o(($event) => $data.formData[$options.getDisplayKeyForField(field)] = $event, field.name),
            r: common_vendor.p({
              type: "select",
              placeholder: field.placeholder || "请选择",
              disabled: field.disabled,
              clearable: true,
              modelValue: $data.formData[$options.getDisplayKeyForField(field)]
            }),
            s: "2b16f33b-7-" + i0 + "-" + i1 + "," + ("2b16f33b-5-" + i0 + "-" + i1),
            t: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            v: common_vendor.p({
              type: "text",
              modelValue: $data.formData[field.name]
            }),
            w: "2b16f33b-5-" + i0 + "-" + i1 + ",2b16f33b-0",
            x: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "textarea" ? {
            z: "2b16f33b-9-" + i0 + "-" + i1 + "," + ("2b16f33b-8-" + i0 + "-" + i1),
            A: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            B: common_vendor.p({
              placeholder: field.placeholder || "请输入",
              disabled: field.disabled,
              type: field.type,
              height: field.rows ? field.rows * 40 : 120,
              maxlength: field.maxLength,
              modelValue: $data.formData[field.name]
            }),
            C: "2b16f33b-8-" + i0 + "-" + i1 + ",2b16f33b-0",
            D: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "date" ? {
            F: common_vendor.o(($event) => $options.showDatePicker(field), field.name),
            G: "2b16f33b-11-" + i0 + "-" + i1 + "," + ("2b16f33b-10-" + i0 + "-" + i1),
            H: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            I: common_vendor.p({
              type: "select",
              placeholder: field.placeholder || "请选择日期",
              disabled: field.disabled,
              clearable: true,
              modelValue: $data.formData[field.name]
            }),
            J: "2b16f33b-10-" + i0 + "-" + i1 + ",2b16f33b-0",
            K: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "time" ? {
            M: common_vendor.o(($event) => $options.showTimePicker(field.name), field.name),
            N: "2b16f33b-13-" + i0 + "-" + i1 + "," + ("2b16f33b-12-" + i0 + "-" + i1),
            O: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            P: common_vendor.p({
              type: "select",
              placeholder: field.placeholder || "请选择时间",
              disabled: field.disabled,
              clearable: true,
              modelValue: $data.formData[field.name]
            }),
            Q: "2b16f33b-12-" + i0 + "-" + i1 + ",2b16f33b-0",
            R: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "file" ? {
            T: common_vendor.sr("fileUploadRef", "2b16f33b-15-" + i0 + "-" + i1 + "," + ("2b16f33b-14-" + i0 + "-" + i1), {
              "f": 1
            }),
            U: common_vendor.o((val) => $options.onFilePickerInput(val, field.name), field.name),
            V: common_vendor.o((e) => $options.onFileSelect(e, field.name), field.name),
            W: common_vendor.o((e) => $options.onFileUploadSuccess(e, field.name), field.name),
            X: common_vendor.o($options.onFileUploadFail, field.name),
            Y: common_vendor.o((e) => $options.onFileDelete(e, field.name), field.name),
            Z: "2b16f33b-15-" + i0 + "-" + i1 + "," + ("2b16f33b-14-" + i0 + "-" + i1),
            aa: common_vendor.p({
              disabled: field.disabled,
              value: $data.formData[field.name],
              limit: field.maxCount || 10,
              ["del-icon"]: true,
              ["auto-upload"]: false,
              ["disable-preview"]: true,
              dir: $data.fileDir,
              ["file-mediatype"]: $options.getFileMediaType(field.accept)
            }),
            ab: common_vendor.f($data.formData[field.name], (file, index, i2) => {
              return common_vendor.e({
                a: "2b16f33b-16-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-14-" + i0 + "-" + i1),
                b: common_vendor.t($options.getFileName(file)),
                c: file.size
              }, file.size ? {
                d: common_vendor.t($options.formatFileSize(file.size))
              } : {}, {
                e: common_vendor.o(($event) => $options.handleFilePreview(file, field.name), index),
                f: common_vendor.o(($event) => $options.downloadFile(file), index),
                g: "2b16f33b-17-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-14-" + i0 + "-" + i1),
                h: common_vendor.o(($event) => $options.handleFilePreview(file, field.name), index),
                i: "2b16f33b-18-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-14-" + i0 + "-" + i1),
                j: index
              });
            }),
            ac: common_vendor.p({
              name: "file-text"
            }),
            ad: common_vendor.p({
              type: "primary",
              size: "mini"
            }),
            ae: common_vendor.p({
              type: "text",
              size: "mini",
              plain: true
            }),
            af: "2b16f33b-14-" + i0 + "-" + i1 + ",2b16f33b-0",
            ag: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "array<object>" ? common_vendor.e({
            ai: common_vendor.o(($event) => $options.addArrayItem(field), field.name),
            aj: "2b16f33b-20-" + i0 + "-" + i1 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
            ak: common_vendor.p({
              type: "primary",
              size: "mini"
            }),
            al: $props.formTypeCode === "LEAVE_APPLICATION" && field.name === "items"
          }, $props.formTypeCode === "LEAVE_APPLICATION" && field.name === "items" ? {
            am: "2b16f33b-22-" + i0 + "-" + i1 + "," + ("2b16f33b-21-" + i0 + "-" + i1),
            an: common_vendor.p({
              name: "calendar",
              size: "25"
            }),
            ao: common_vendor.o(($event) => $options.openBatchDatePicker(field), field.name),
            ap: "2b16f33b-21-" + i0 + "-" + i1 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
            aq: common_vendor.p({
              type: "primary",
              size: "mini"
            })
          } : {}, {
            ar: field.showClear !== false
          }, field.showClear !== false ? {
            as: common_vendor.o(($event) => $options.clearArray(field.name), field.name),
            at: "2b16f33b-23-" + i0 + "-" + i1 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
            av: common_vendor.p({
              type: "error",
              size: "mini"
            })
          } : {}, {
            aw: common_vendor.f($data.formData[field.name], (item, index, i2) => {
              return common_vendor.e({
                a: common_vendor.t(index + 1),
                b: field.showSort !== false && index > 0 && !item.batchGenerated && !$data.formData[field.name][index - 1].batchGenerated
              }, field.showSort !== false && index > 0 && !item.batchGenerated && !$data.formData[field.name][index - 1].batchGenerated ? {
                c: common_vendor.o(($event) => $options.moveArrayItem(field.name, index, -1), index),
                d: "2b16f33b-24-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                e: common_vendor.p({
                  type: "text",
                  size: "mini"
                })
              } : {}, {
                f: field.showSort !== false && index < $data.formData[field.name].length - 1 && !item.batchGenerated && !$data.formData[field.name][index + 1].batchGenerated
              }, field.showSort !== false && index < $data.formData[field.name].length - 1 && !item.batchGenerated && !$data.formData[field.name][index + 1].batchGenerated ? {
                g: common_vendor.o(($event) => $options.moveArrayItem(field.name, index, 1), index),
                h: "2b16f33b-25-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                i: common_vendor.p({
                  type: "text",
                  size: "mini"
                })
              } : {}, {
                j: !item.batchGenerated
              }, !item.batchGenerated ? {
                k: common_vendor.o(($event) => $options.removeArrayItem(field.name, index), index),
                l: "2b16f33b-26-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                m: common_vendor.p({
                  type: "text",
                  size: "mini"
                })
              } : {}, {
                n: item.batchGenerated
              }, item.batchGenerated ? {
                o: common_vendor.t(index == 0 ? "开始日期" : "结束日期")
              } : {}, {
                p: common_vendor.f(field.columns, (subField, k3, i3) => {
                  return common_vendor.e({
                    a: subField.show === false
                  }, subField.show === false ? {} : $options.isSubSelectField(subField) ? common_vendor.e({
                    c: subField.required
                  }, subField.required ? {} : {}, {
                    d: common_vendor.t(subField.title),
                    e: common_vendor.o(($event) => $options.showSubRemoteSelect(subField, field.name, index), subField.key),
                    f: "2b16f33b-27-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                    g: common_vendor.o(($event) => item[$options.getDisplayKey(subField)] = $event, subField.key),
                    h: common_vendor.p({
                      type: "select",
                      placeholder: subField.placeholder || "请选择",
                      disabled: subField.disabled,
                      size: "mini",
                      clearable: true,
                      modelValue: item[$options.getDisplayKey(subField)]
                    })
                  }) : subField.type === "date" && subField.dateType === "datetime" ? common_vendor.e({
                    j: subField.required
                  }, subField.required ? {} : {}, {
                    k: common_vendor.t(subField.title),
                    l: common_vendor.o(($event) => $options.showSubDateTimePicker(field.name, index, subField), subField.key),
                    m: "2b16f33b-28-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                    n: common_vendor.o(($event) => item[subField.key] = $event, subField.key),
                    o: common_vendor.p({
                      type: "select",
                      placeholder: subField.placeholder || "请选择日期",
                      disabled: subField.disabled,
                      clearable: true,
                      modelValue: item[subField.key]
                    })
                  }) : subField.type === "date" ? common_vendor.e({
                    q: subField.required
                  }, subField.required ? {} : {}, {
                    r: common_vendor.t(subField.title),
                    s: common_vendor.o(($event) => !$options.isItemBatchDisabled(item, subField.key) && $options.showSubDatePicker(field.name, index, subField), subField.key),
                    t: "2b16f33b-29-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                    v: common_vendor.o(($event) => item[subField.key] = $event, subField.key),
                    w: common_vendor.p({
                      type: "select",
                      placeholder: subField.placeholder || "请选择日期",
                      disabled: subField.disabled,
                      clearable: true,
                      modelValue: item[subField.key]
                    })
                  }) : subField.type === "time" && subField.isRange ? common_vendor.e({
                    y: subField.required
                  }, subField.required ? {} : {}, {
                    z: common_vendor.t(subField.title),
                    A: common_vendor.o(($event) => !$options.isItemBatchDisabled(item, subField.key) && $options.showSubTimePicker(field.name, index, subField, "start"), subField.key),
                    B: "2b16f33b-30-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                    C: common_vendor.o(($event) => item[subField.key][0] = $event, subField.key),
                    D: common_vendor.p({
                      type: "select",
                      placeholder: subField.startPlaceholder || "开始",
                      clearable: true,
                      modelValue: item[subField.key][0]
                    }),
                    E: common_vendor.o(($event) => !$options.isItemBatchDisabled(item, subField.key) && $options.showSubTimePicker(field.name, index, subField, "end"), subField.key),
                    F: "2b16f33b-31-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                    G: common_vendor.o(($event) => item[subField.key][1] = $event, subField.key),
                    H: common_vendor.p({
                      type: "select",
                      placeholder: subField.endPlaceholder || "结束",
                      clearable: true,
                      modelValue: item[subField.key][1]
                    })
                  }) : subField.type === "text" ? common_vendor.e({
                    J: subField.required
                  }, subField.required ? {} : {}, {
                    K: common_vendor.t(subField.title),
                    L: "2b16f33b-32-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                    M: common_vendor.o(($event) => item[subField.key] = $event, subField.key),
                    N: common_vendor.p({
                      placeholder: subField.placeholder || "请输入",
                      disabled: subField.disabled,
                      type: subField.type,
                      size: "mini",
                      clearable: true,
                      modelValue: item[subField.key]
                    })
                  }) : subField.type === "number" ? common_vendor.e({
                    P: subField.required
                  }, subField.required ? {} : {}, {
                    Q: common_vendor.t(subField.title),
                    R: common_vendor.o((e) => $options.onArrayNumberInput(field.name, index, subField.key, e), subField.key),
                    S: "2b16f33b-33-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                    T: common_vendor.o(($event) => item[subField.key] = $event, subField.key),
                    U: common_vendor.p({
                      placeholder: subField.placeholder || "请输入",
                      disabled: subField.disabled,
                      type: subField.type,
                      size: "mini",
                      clearable: true,
                      modelValue: item[subField.key]
                    })
                  }) : subField.type === "textarea" ? common_vendor.e({
                    W: subField.required
                  }, subField.required ? {} : {}, {
                    X: common_vendor.t(subField.title),
                    Y: "2b16f33b-34-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
                    Z: common_vendor.o(($event) => item[subField.key] = $event, subField.key),
                    aa: common_vendor.p({
                      placeholder: subField.placeholder || "请输入",
                      disabled: subField.disabled,
                      type: "text",
                      maxlength: subField.maxLength,
                      clearable: true,
                      modelValue: item[subField.key]
                    })
                  }) : {}, {
                    b: $options.isSubSelectField(subField),
                    i: subField.type === "date" && subField.dateType === "datetime",
                    p: subField.type === "date",
                    x: subField.type === "time" && subField.isRange,
                    I: subField.type === "text",
                    O: subField.type === "number",
                    V: subField.type === "textarea",
                    ab: subField.key
                  });
                }),
                q: index
              });
            }),
            ax: !$data.formData[field.name] || $data.formData[field.name].length === 0
          }, !$data.formData[field.name] || $data.formData[field.name].length === 0 ? {
            ay: "2b16f33b-35-" + i0 + "-" + i1 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
            az: common_vendor.p({
              text: "暂无数据",
              mode: "list"
            })
          } : {}, {
            aA: "2b16f33b-19-" + i0 + "-" + i1 + ",2b16f33b-0",
            aB: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          }) : {}, {
            g: field.type === "number",
            n: $options.isSelectField(field),
            y: field.type === "textarea",
            E: field.type === "date",
            L: field.type === "time",
            S: field.type === "file",
            ah: field.type === "array<object>",
            aC: field.name
          });
        }),
        d: groupIndex
      });
    }),
    b: common_vendor.sr("uForm", "2b16f33b-0"),
    c: common_vendor.p({
      model: $data.formData,
      rules: $data.formRules,
      ["label-position"]: "top",
      ["label-width"]: "150",
      ["label-style"]: {
        fontSize: "28rpx"
      },
      ["error-type"]: ["toast"]
    }),
    d: common_vendor.o($options.handleCancel, "e5"),
    e: !$props.butVisible
  }, !$props.butVisible ? {
    f: common_vendor.o(($event) => $options.handleSave(), "e0"),
    g: common_vendor.p({
      type: "primary",
      loading: $data.saveLoadingLocal
    })
  } : {}, {
    h: $props.butVisible
  }, $props.butVisible ? {
    i: common_vendor.o($options.handleSimulate, "0a"),
    j: common_vendor.p({
      type: "info",
      loading: $data.simulateLoadingLocal
    })
  } : {}, {
    k: $props.butVisible
  }, $props.butVisible ? {
    l: common_vendor.o(($event) => $options.handleSave("draft"), "bd"),
    m: common_vendor.p({
      type: "primary",
      loading: $data.saveLoadingLocal
    })
  } : {}, {
    n: $props.butVisible
  }, $props.butVisible ? {
    o: common_vendor.o($options.handleSubmit, "8a"),
    p: common_vendor.p({
      type: "success",
      loading: $data.submitLoadingLocal
    })
  } : {}, {
    q: common_vendor.o($options.onDateConfirm, "67"),
    r: common_vendor.o(($event) => $data.datePickerShow = $event, "df"),
    s: common_vendor.p({
      mode: "time",
      params: $data.datePickerParams,
      modelValue: $data.datePickerShow
    }),
    t: common_vendor.o($options.onTimeConfirm, "44"),
    v: common_vendor.o(($event) => $data.timePickerShow = $event, "be"),
    w: common_vendor.p({
      mode: "time",
      params: $data.timePickerParams,
      modelValue: $data.timePickerShow
    }),
    x: common_vendor.t($data.subRemote.currentField && $data.subRemote.currentField.label || "请选择"),
    y: common_vendor.o(($event) => $data.subRemoteSelectVisible = false, "e8"),
    z: common_vendor.p({
      type: "text"
    }),
    A: $data.subRemote.mode === "single"
  }, $data.subRemote.mode === "single" ? common_vendor.e({
    B: common_vendor.o($options.onSubRemoteSearch, "ff"),
    C: common_vendor.o(($event) => $data.subRemote.keyword = $event, "c4"),
    D: common_vendor.p({
      placeholder: "输入关键词搜索",
      ["show-action"]: false,
      modelValue: $data.subRemote.keyword
    }),
    E: common_vendor.f($data.subRemote.options, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.label),
        b: item.value === $data.subRemote.selectedValue
      }, item.value === $data.subRemote.selectedValue ? {
        c: "2b16f33b-46-" + i0 + ",2b16f33b-43",
        d: common_vendor.p({
          name: "checkmark-circle",
          color: "#2979ff",
          size: "28"
        })
      } : {}, {
        e: item.value,
        f: common_vendor.o(($event) => $options.selectSubRemoteItem(item), item.value)
      });
    }),
    F: $data.subRemote.loading
  }, $data.subRemote.loading ? {
    G: common_vendor.p({
      mode: "circle",
      size: "30"
    })
  } : {}, {
    H: !$data.subRemote.loading && $data.subRemote.options.length === 0
  }, !$data.subRemote.loading && $data.subRemote.options.length === 0 ? {} : {}) : $data.subRemote.mode === "cascader" ? common_vendor.e({
    J: $data.subRemote.loading
  }, $data.subRemote.loading ? {
    K: common_vendor.p({
      mode: "circle",
      size: "30"
    })
  } : {}, {
    L: common_vendor.f($data.subRemote.cascaderData.companies, (company, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(company.label),
        b: company.children && company.children.length
      }, company.children && company.children.length ? {
        c: "2b16f33b-49-" + i0 + ",2b16f33b-43",
        d: common_vendor.p({
          name: "arrow-right",
          size: "24",
          color: "#c0c4cc"
        })
      } : {}, {
        e: company.value,
        f: ($data.subRemote.cascaderData.selectedCompany && $data.subRemote.cascaderData.selectedCompany.value) === company.value ? 1 : "",
        g: common_vendor.o(($event) => $options.selectCascaderCompany(company), company.value)
      });
    }),
    M: common_vendor.t($data.subRemote.cascaderData.selectedCompany ? $data.subRemote.cascaderData.selectedCompany.label : "选择部门"),
    N: $data.subRemote.cascaderData.selectedCompany
  }, $data.subRemote.cascaderData.selectedCompany ? {
    O: common_vendor.f($data.subRemote.cascaderData.selectedCompany.children, (dept, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(dept.label),
        b: ($data.subRemote.cascaderData.selectedDept && $data.subRemote.cascaderData.selectedDept.value) === dept.value
      }, ($data.subRemote.cascaderData.selectedDept && $data.subRemote.cascaderData.selectedDept.value) === dept.value ? {
        c: "2b16f33b-50-" + i0 + ",2b16f33b-43",
        d: common_vendor.p({
          name: "checkmark-circle",
          size: "28",
          color: "#2979ff"
        })
      } : {}, {
        e: dept.value,
        f: ($data.subRemote.cascaderData.selectedDept && $data.subRemote.cascaderData.selectedDept.value) === dept.value ? 1 : "",
        g: common_vendor.o(($event) => $options.selectCascaderDept(dept), dept.value)
      });
    })
  } : {}) : {}, {
    I: $data.subRemote.mode === "cascader",
    P: common_vendor.o(($event) => $data.subRemoteSelectVisible = $event, "79"),
    Q: common_vendor.p({
      mode: "bottom",
      height: "70%",
      ["border-radius"]: "20",
      modelValue: $data.subRemoteSelectVisible
    }),
    R: common_vendor.o($options.onSubDateConfirm, "7d"),
    S: common_vendor.o(($event) => $data.subDatePickerShow[$data.currentSubDateInfo.fieldName + "_" + $data.currentSubDateInfo.itemIndex + "_" + ($data.currentSubDateInfo.subField ? $data.currentSubDateInfo.subField.key : "")] = $event, "af"),
    T: common_vendor.p({
      mode: "time",
      params: $data.subDatePickerParams,
      modelValue: $data.subDatePickerShow[$data.currentSubDateInfo.fieldName + "_" + $data.currentSubDateInfo.itemIndex + "_" + ($data.currentSubDateInfo.subField ? $data.currentSubDateInfo.subField.key : "")]
    }),
    U: common_vendor.o($options.onSubDateTimeConfirm, "25"),
    V: common_vendor.o(($event) => $data.subDateTimePickerShow[$data.currentSubDateTimeInfo.fieldName + "_" + $data.currentSubDateTimeInfo.itemIndex + "_" + ($data.currentSubDateTimeInfo.subField ? $data.currentSubDateTimeInfo.subField.key : "")] = $event, "1a"),
    W: common_vendor.p({
      mode: "time",
      params: $data.subDateTimePickerParams,
      modelValue: $data.subDateTimePickerShow[$data.currentSubDateTimeInfo.fieldName + "_" + $data.currentSubDateTimeInfo.itemIndex + "_" + ($data.currentSubDateTimeInfo.subField ? $data.currentSubDateTimeInfo.subField.key : "")]
    }),
    X: common_vendor.o($options.onSubTimeConfirm, "11"),
    Y: common_vendor.o(($event) => $data.subTimePickerShow[$data.currentSubTimeInfo.fieldName + "_" + $data.currentSubTimeInfo.itemIndex + "_" + ($data.currentSubTimeInfo.subField ? $data.currentSubTimeInfo.subField.key : "") + "_" + $data.currentSubTimeInfo.range] = $event, "2d"),
    Z: common_vendor.p({
      mode: "time",
      params: $data.subTimePickerParams,
      modelValue: $data.subTimePickerShow[$data.currentSubTimeInfo.fieldName + "_" + $data.currentSubTimeInfo.itemIndex + "_" + ($data.currentSubTimeInfo.subField ? $data.currentSubTimeInfo.subField.key : "") + "_" + $data.currentSubTimeInfo.range]
    }),
    aa: common_vendor.o(($event) => $options.onBatchDatePickerShow("start"), "20"),
    ab: common_vendor.o(($event) => $data.batchStartDate = $event, "00"),
    ac: common_vendor.p({
      type: "select",
      placeholder: "请选择",
      modelValue: $data.batchStartDate
    }),
    ad: common_vendor.o(($event) => $options.onBatchDatePickerShow("end"), "ce"),
    ae: common_vendor.o(($event) => $data.batchEndDate = $event, "ed"),
    af: common_vendor.p({
      type: "select",
      placeholder: "请选择",
      modelValue: $data.batchEndDate
    }),
    ag: common_vendor.o(($event) => $data.showBatchDatePicker = false, "f6"),
    ah: common_vendor.o($options.generateBatchDates, "ed"),
    ai: common_vendor.p({
      type: "primary"
    }),
    aj: common_vendor.o(($event) => $data.showBatchDatePicker = $event, "56"),
    ak: common_vendor.p({
      mode: "bottom",
      ["border-radius"]: "20",
      closeable: true,
      modelValue: $data.showBatchDatePicker
    }),
    al: common_vendor.o($options.onBatchDateConfirm, "ef"),
    am: common_vendor.o(($event) => $data.batchPickerShow = $event, "46"),
    an: common_vendor.p({
      mode: "time",
      params: $data.batchDatePickerParams,
      modelValue: $data.batchPickerShow
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2b16f33b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/dynamic-form-dialog/dynamic-form-dialog.js.map
