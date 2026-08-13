"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "DynamicFormDialog",
  props: {
    // 控制显示隐藏
    value: {
      type: Boolean,
      default: false
    },
    // 控制button显示隐藏
    butVisible: {
      type: Boolean,
      default: false
    },
    // 弹窗标题
    title: {
      type: String,
      default: "表单"
    },
    // 表单配置
    formSchema: {
      type: Object,
      default: null
    },
    // 表单类型代码
    formTypeCode: {
      type: String,
      required: true
    },
    // 初始表单数据
    initialData: {
      type: Object,
      default: () => ({})
    },
    // 表单动作 (add/update)
    formAction: {
      type: String,
      default: "add"
    },
    // 表单提交地址
    actionUrl: {
      type: String,
      default: ""
    },
    // 新增 loading 状态 props
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
      // 表单数据
      formData: {},
      // 表单验证规则
      formRules: {},
      // 表单布局分组
      formLayoutGroups: [],
      // 所有字段配置
      formFields: [],
      // 选择器显示控制
      selectShow: {},
      subSelectShow: {},
      // 日期选择器
      datePickerShow: false,
      datePickerParams: {
        year: true,
        month: true,
        day: true
      },
      currentDateField: null,
      // 远程选择
      remoteSelectShow: false,
      currentRemoteField: null,
      // 级联选择
      cascaderShow: false,
      currentCascaderField: null,
      // 文件上传配置
      fileUploadConfig: {
        imageStyles: {
          width: 120,
          height: 120,
          border: {
            radius: "4px"
          }
        },
        listStyles: {
          border: true,
          dividline: true,
          borderStyle: {
            width: 1,
            color: "#dcdfe6",
            style: "solid",
            radius: "4px"
          }
        }
      },
      // 本地loading状态
      saveLoadingLocal: false,
      submitLoadingLocal: false,
      simulateLoadingLocal: false
    };
  },
  watch: {
    formSchema: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal) {
          this.initForm();
        }
      }
    },
    initialData: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal) {
          this.handleInitialData(newVal);
        }
      }
    },
    saveLoading(newVal) {
      this.saveLoadingLocal = newVal;
    },
    submitLoading(newVal) {
      this.submitLoadingLocal = newVal;
    },
    simulateLoading(newVal) {
      this.simulateLoadingLocal = newVal;
    },
    value(newVal) {
      if (newVal && this.formSchema) {
        this.$nextTick(() => {
          this.initForm();
        });
      }
    }
  },
  methods: {
    // 初始化表单
    initForm() {
      if (!this.formSchema || !this.formSchema.fields) {
        common_vendor.index.__f__("warn", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:401", "表单配置为空");
        return;
      }
      this.initFormData();
      this.initFormRules();
      this.initFormLayout();
      this.formFields = this.formSchema.fields || [];
    },
    // 初始化表单数据
    initFormData() {
      if (!this.formSchema || !this.formSchema.fields)
        return;
      const formData = {};
      this.formSchema.fields.forEach((field) => {
        if (field.type === "file" || field.type === "array<object>") {
          formData[field.name] = [];
        } else if (field.type === "table") {
          formData[field.name] = field.defaultValue || [];
        } else {
          formData[field.name] = field.defaultValue || "";
        }
        if (field.type === "select" || field.type === "remote-select" || field.type === "cascader") {
          formData[field.name + "_label"] = "";
        }
      });
      if (this.initialData && this.initialData.form_data) {
        Object.assign(formData, this.initialData.form_data);
      }
      this.formData = formData;
      this.initSelectShow();
    },
    // 初始化选择器显示状态
    initSelectShow() {
      const selectShow = {};
      this.formSchema.fields.forEach((field) => {
        if (field.type === "select") {
          selectShow[field.name] = false;
        }
        if (field.type === "array<object>" && field.columns) {
          field.columns.forEach((subField) => {
            if (subField.type === "select") {
              const formData = this.formData[field.name] || [];
              formData.forEach((item, index) => {
                selectShow[`${field.name}_${subField.key}_${index}`] = false;
              });
            }
          });
        }
      });
      this.selectShow = selectShow;
    },
    // 初始化验证规则
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
          } else {
            fieldRules.push({
              required: true,
              message: `${field.label}是必填项`,
              trigger: ["blur", "change"]
            });
          }
        }
        if (field.type === "number") {
          if (field.min !== void 0) {
            fieldRules.push({
              type: "number",
              min: field.min,
              message: `${field.label}不能小于${field.min}`,
              trigger: ["blur", "change"]
            });
          }
          if (field.max !== void 0) {
            fieldRules.push({
              type: "number",
              max: field.max,
              message: `${field.label}不能大于${field.max}`,
              trigger: ["blur", "change"]
            });
          }
        }
        if ((field.type === "text" || field.type === "textarea") && field.maxLength) {
          fieldRules.push({
            max: field.maxLength,
            message: `${field.label}不能超过${field.maxLength}个字符`,
            trigger: ["blur", "change"]
          });
        }
        if (field.type === "file" && field.maxSize) {
          fieldRules.push({
            validator: (rule, value, callback) => {
              if (value && value.length > 0) {
                const oversizedFiles = value.filter(
                  (file) => file.size > field.maxSize * 1024 * 1024
                );
                if (oversizedFiles.length > 0) {
                  return new Error(`文件大小不能超过${field.maxSize}MB`);
                }
              }
              return true;
            },
            trigger: ["change"]
          });
        }
        if (field.type === "file" && field.maxCount) {
          fieldRules.push({
            validator: (rule, value, callback) => {
              if (value && value.length > field.maxCount) {
                return new Error(`最多只能上传${field.maxCount}个文件`);
              }
              return true;
            },
            trigger: ["change"]
          });
        }
        if (field.type === "array<object>" && field.minRows) {
          fieldRules.push({
            validator: (rule, value, callback) => {
              if (!value || value.length < field.minRows) {
                return new Error(`至少需要${field.minRows}条记录`);
              }
              return true;
            },
            trigger: ["change"]
          });
        }
        if (fieldRules.length > 0) {
          rules[field.name] = fieldRules;
        }
      });
      this.formRules = rules;
    },
    getFileName(file) {
      if (file.name)
        return file.name;
      if (file.url) {
        const cleanUrl = file.url.split(/[?#]/)[0];
        return cleanUrl.split("/").pop() || "未命名文件";
      }
      return "未命名文件";
    },
    // 初始化表单布局
    initFormLayout() {
      if (!this.formSchema || !this.formSchema.layout) {
        this.formLayoutGroups = [{
          title: "",
          fields: this.formSchema.fields.map((f) => f.name)
        }];
      } else {
        this.formLayoutGroups = this.formSchema.layout.groups || [];
      }
    },
    // 获取分组字段
    getGroupFields(group) {
      if (!group.fields || !this.formSchema.fields)
        return [];
      return this.formSchema.fields.filter(
        (field) => group.fields.includes(field.name)
      );
    },
    // 处理初始数据
    handleInitialData(initialData) {
      if (!initialData)
        return;
      if (initialData.form_data) {
        Object.assign(this.formData, initialData.form_data);
      }
    },
    // 选择确认
    onSelectConfirm(e, fieldName) {
      if (e && e.length > 0) {
        this.formData[fieldName] = e[0].value;
        this.formData[fieldName + "_label"] = e[0].label;
      }
    },
    // 子选择确认
    onSubSelectConfirm(e, arrayFieldName, subFieldKey, index) {
      if (e && e.length > 0) {
        if (!this.formData[arrayFieldName]) {
          this.formData[arrayFieldName] = [];
        }
        if (!this.formData[arrayFieldName][index]) {
          this.formData[arrayFieldName][index] = {};
        }
        this.formData[arrayFieldName][index][subFieldKey] = e[0].value;
        if (this.formData[arrayFieldName][index][subFieldKey + "_label"] !== void 0) {
          this.formData[arrayFieldName][index][subFieldKey + "_label"] = e[0].label;
        }
      }
    },
    // 显示日期选择器
    showDatePicker(fieldName) {
      this.currentDateField = fieldName;
      this.datePickerShow = true;
    },
    // 日期确认
    onDateConfirm(e) {
      if (this.currentDateField && e) {
        const dateStr = `${e.year}-${e.month}-${e.day}`;
        this.formData[this.currentDateField] = dateStr;
      }
    },
    // 显示远程选择
    showRemoteSelect(field) {
      this.currentRemoteField = field;
      this.remoteSelectShow = true;
    },
    // 显示级联选择
    showCascader(field) {
      this.currentCascaderField = field;
      this.cascaderShow = true;
    },
    // 文件上传进度
    onFileProgress(e) {
      common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:679", "上传进度:", e);
    },
    // 文件上传失败
    onFileUploadFail(e) {
      common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:685", "文件上传失败:", e);
      common_vendor.index.showToast({
        title: "文件上传失败",
        icon: "none"
      });
    },
    // 文件上传相关方法
    getFileMediaType(accept) {
      if (!accept)
        return "all";
      if (accept.includes("image"))
        return "image";
      if (accept.includes("video"))
        return "video";
      return "all";
    },
    onFileSelect(e, fieldName) {
      common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:702", "文件选择:", e, fieldName);
    },
    onFileUploadSuccess(e, fieldName) {
      common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:706", "上传成功:", e);
      if (e.tempFiles && e.tempFiles.length > 0) {
        e.tempFiles.forEach((file) => {
          if (file.response && file.response.data) {
            file.url = file.response.data.url || file.response.data.fileUrl;
            file.name = file.response.data.name || this.getFileNameFromUrl(file.url);
          }
        });
      }
      common_vendor.index.showToast({
        title: "文件上传成功",
        icon: "success"
      });
    },
    getFileNameFromUrl(url) {
      if (!url)
        return "未命名文件";
      const cleanUrl = url.split(/[?#]/)[0];
      return cleanUrl.split("/").pop() || "未命名文件";
    },
    onFileDelete(e, fieldName) {
      common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:729", "删除文件:", e, fieldName);
      common_vendor.index.showToast({
        title: "文件已删除",
        icon: "success"
      });
    },
    removeFile(fieldName, index) {
      if (this.formData[fieldName] && this.formData[fieldName][index]) {
        this.formData[fieldName].splice(index, 1);
        common_vendor.index.showToast({
          title: "文件删除成功",
          icon: "success"
        });
      }
    },
    // 数组操作
    addArrayItem(field) {
      if (!this.formData[field.name]) {
        this.$set(this.formData, field.name, []);
      }
      const newItem = {};
      if (field.columns) {
        field.columns.forEach((subField) => {
          if (subField.defaultValue !== void 0) {
            newItem[subField.key] = subField.defaultValue;
          } else {
            newItem[subField.key] = "";
          }
          if (subField.type === "select") {
            newItem[subField.key + "_label"] = "";
          }
        });
      }
      this.formData[field.name].push(newItem);
    },
    removeArrayItem(fieldName, index) {
      if (this.formData[fieldName] && this.formData[fieldName][index]) {
        this.formData[fieldName].splice(index, 1);
      }
    },
    moveArrayItem(fieldName, index, direction) {
      const array = this.formData[fieldName];
      if (!array || array.length <= 1)
        return;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= array.length)
        return;
      const temp = array[index];
      array[index] = array[newIndex];
      array[newIndex] = temp;
      this.formData[fieldName] = [...array];
    },
    clearArray(fieldName) {
      this.formData[fieldName] = [];
    },
    // 表单提交
    async handleSave(status) {
      try {
        await this.$refs.uForm.validate();
        this.saveLoadingLocal = true;
        const formData = this.processFormData();
        if (status) {
          formData.status = status;
        }
        common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:812", "保存的数据:", formData);
        this.$emit("save", formData);
      } catch (error) {
        common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:816", "表单验证失败:", error);
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
        await this.$refs.uForm.validate();
        this.submitLoadingLocal = true;
        const formData = this.processFormData();
        formData.status = "pending";
        common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:835", "提交的数据:", formData);
        this.$emit("submit", formData);
      } catch (error) {
        common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:839", "表单验证失败:", error);
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
        await this.$refs.uForm.validate();
        this.simulateLoadingLocal = true;
        const formData = this.processFormData();
        common_vendor.index.__f__("log", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:856", "试算的数据:", formData);
        this.$emit("simulate", formData);
      } catch (error) {
        common_vendor.index.__f__("error", "at components/dynamic-form-dialog/dynamic-form-dialog.vue:860", "表单验证失败:", error);
        common_vendor.index.showToast({
          title: "请完善表单信息",
          icon: "none"
        });
      } finally {
        this.simulateLoadingLocal = false;
      }
    },
    // 处理表单数据
    processFormData() {
      const result = {
        form_type_code: this.formTypeCode,
        form_data: {}
      };
      Object.assign(result.form_data, this.formData);
      return result;
    },
    // 取消操作
    handleCancel() {
      this.$emit("cancel");
      this.$emit("input", false);
    },
    getFileName(file) {
      if (file.name)
        return file.name;
      if (file.url) {
        const cleanUrl = file.url.split(/[?#]/)[0];
        return cleanUrl.split("/").pop() || "未命名文件";
      }
      return "未命名文件";
    },
    // 文件预览
    handleFilePreview(file, fieldName) {
      const previewFile = {
        url: file.url || file.fileUrl,
        name: this.getFileName(file),
        size: file.size,
        type: file.mimetype || this.getFileTypeFromName(file)
      };
      this.$emit("preview-file", previewFile);
    },
    getFileTypeFromName(file) {
      const name = this.getFileName(file);
      const ext = name.split(".").pop().toLowerCase();
      const types = {
        "jpg": "image",
        "jpeg": "image",
        "png": "image",
        "gif": "image",
        "bmp": "image",
        "pdf": "pdf",
        "doc": "office",
        "docx": "office",
        "xls": "office",
        "xlsx": "office",
        "ppt": "office",
        "pptx": "office"
      };
      return types[ext] || "unknown";
    },
    // 文件下载
    downloadFile(file) {
      this.$emit("download-file", file);
    },
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes)
        return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
  }
};
if (!Array) {
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_u_select2 = common_vendor.resolveComponent("u-select");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _easycom_u_picker2 = common_vendor.resolveComponent("u-picker");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  (_easycom_u_input2 + _easycom_u_form_item2 + _easycom_u_select2 + _easycom_uni_file_picker2 + _easycom_u_icon2 + _easycom_u_button2 + _easycom_u_form2 + _easycom_u_picker2 + _easycom_u_empty2 + _easycom_u_popup2)();
}
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_select = () => "../../uni_modules/vk-uview-ui/components/u-select/u-select.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_u_picker = () => "../../uni_modules/vk-uview-ui/components/u-picker/u-picker.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
if (!Math) {
  (_easycom_u_input + _easycom_u_form_item + _easycom_u_select + _easycom_uni_file_picker + _easycom_u_icon + _easycom_u_button + _easycom_u_form + _easycom_u_picker + _easycom_u_empty + _easycom_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
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
            h: "2b16f33b-4-" + i0 + "-" + i1 + "," + ("2b16f33b-3-" + i0 + "-" + i1),
            i: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            j: common_vendor.p({
              placeholder: field.placeholder || "请输入数字",
              disabled: field.disabled,
              type: "number",
              clearable: true,
              modelValue: $data.formData[field.name]
            }),
            k: "2b16f33b-3-" + i0 + "-" + i1 + ",2b16f33b-0",
            l: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "select" ? {
            n: common_vendor.o((e) => $options.onSelectConfirm(e, field.name), field.name),
            o: "2b16f33b-6-" + i0 + "-" + i1 + "," + ("2b16f33b-5-" + i0 + "-" + i1),
            p: common_vendor.o(($event) => $data.selectShow[field.name] = $event, field.name),
            q: common_vendor.p({
              list: field.options || [],
              ["value-name"]: field.valueName || "value",
              ["label-name"]: field.labelName || "label",
              modelValue: $data.selectShow[field.name]
            }),
            r: common_vendor.o(($event) => $data.selectShow[field.name] = true, field.name),
            s: "2b16f33b-7-" + i0 + "-" + i1 + "," + ("2b16f33b-5-" + i0 + "-" + i1),
            t: common_vendor.o(($event) => $data.formData[field.name + "_label"] = $event, field.name),
            v: common_vendor.p({
              placeholder: field.placeholder || "请选择",
              disabled: field.disabled,
              clearable: true,
              readonly: true,
              modelValue: $data.formData[field.name + "_label"]
            }),
            w: "2b16f33b-8-" + i0 + "-" + i1 + "," + ("2b16f33b-5-" + i0 + "-" + i1),
            x: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            y: common_vendor.p({
              type: "text",
              modelValue: $data.formData[field.name]
            }),
            z: "2b16f33b-5-" + i0 + "-" + i1 + ",2b16f33b-0",
            A: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "textarea" ? {
            C: "2b16f33b-10-" + i0 + "-" + i1 + "," + ("2b16f33b-9-" + i0 + "-" + i1),
            D: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            E: common_vendor.p({
              placeholder: field.placeholder || "请输入",
              disabled: field.disabled,
              type: "textarea",
              height: field.rows ? field.rows * 40 : 120,
              maxlength: field.maxLength,
              modelValue: $data.formData[field.name]
            }),
            F: "2b16f33b-9-" + i0 + "-" + i1 + ",2b16f33b-0",
            G: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "date" ? {
            I: common_vendor.o(($event) => $options.showDatePicker(field.name), field.name),
            J: "2b16f33b-12-" + i0 + "-" + i1 + "," + ("2b16f33b-11-" + i0 + "-" + i1),
            K: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            L: common_vendor.p({
              placeholder: field.placeholder || "请选择日期",
              disabled: field.disabled,
              clearable: true,
              readonly: true,
              modelValue: $data.formData[field.name]
            }),
            M: "2b16f33b-11-" + i0 + "-" + i1 + ",2b16f33b-0",
            N: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "file" ? {
            P: common_vendor.sr("fileUploadRef", "2b16f33b-14-" + i0 + "-" + i1 + "," + ("2b16f33b-13-" + i0 + "-" + i1), {
              "f": 1
            }),
            Q: common_vendor.o((e) => $options.onFileSelect(e, field.name), field.name),
            R: common_vendor.o((e) => $options.onFileUploadSuccess(e, field.name), field.name),
            S: common_vendor.o($options.onFileUploadFail, field.name),
            T: common_vendor.o((e) => $options.onFileDelete(e, field.name), field.name),
            U: "2b16f33b-14-" + i0 + "-" + i1 + "," + ("2b16f33b-13-" + i0 + "-" + i1),
            V: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            W: common_vendor.p({
              disabled: field.disabled,
              limit: field.maxCount || 10,
              ["del-icon"]: true,
              ["auto-upload"]: true,
              ["disable-preview"]: true,
              ["file-mediatype"]: $options.getFileMediaType(field.accept),
              modelValue: $data.formData[field.name]
            }),
            X: common_vendor.f($data.formData[field.name], (file, index, i2) => {
              return common_vendor.e({
                a: "2b16f33b-15-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-13-" + i0 + "-" + i1),
                b: common_vendor.t($options.getFileName(file)),
                c: common_vendor.o(($event) => $options.handleFilePreview(file, field.name), index),
                d: file.size
              }, file.size ? {
                e: common_vendor.t($options.formatFileSize(file.size))
              } : {}, {
                f: common_vendor.o(($event) => $options.handleFilePreview(file, field.name), index),
                g: "2b16f33b-16-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-13-" + i0 + "-" + i1),
                h: common_vendor.o(($event) => $options.downloadFile(file), index),
                i: "2b16f33b-17-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-13-" + i0 + "-" + i1),
                j: common_vendor.o(($event) => $options.removeFile(field.name, index), index),
                k: "2b16f33b-18-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-13-" + i0 + "-" + i1),
                l: index
              });
            }),
            Y: common_vendor.p({
              name: "file-text"
            }),
            Z: common_vendor.p({
              type: "text",
              size: "mini"
            }),
            aa: common_vendor.p({
              type: "text",
              size: "mini"
            }),
            ab: common_vendor.p({
              type: "text",
              size: "mini"
            }),
            ac: "2b16f33b-13-" + i0 + "-" + i1 + ",2b16f33b-0",
            ad: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "remote-select" ? {
            af: "2b16f33b-20-" + i0 + "-" + i1 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
            ag: common_vendor.o(($event) => $data.formData[field.name + "_label"] = $event, field.name),
            ah: common_vendor.p({
              placeholder: field.placeholder || "请选择",
              disabled: field.disabled,
              clearable: true,
              readonly: true,
              modelValue: $data.formData[field.name + "_label"]
            }),
            ai: "2b16f33b-21-" + i0 + "-" + i1 + "," + ("2b16f33b-19-" + i0 + "-" + i1),
            aj: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            ak: common_vendor.p({
              type: "text",
              modelValue: $data.formData[field.name]
            }),
            al: common_vendor.o(($event) => $options.showRemoteSelect(field), field.name),
            am: "2b16f33b-19-" + i0 + "-" + i1 + ",2b16f33b-0",
            an: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "cascader" ? {
            ap: "2b16f33b-23-" + i0 + "-" + i1 + "," + ("2b16f33b-22-" + i0 + "-" + i1),
            aq: common_vendor.o(($event) => $data.formData[field.name + "_label"] = $event, field.name),
            ar: common_vendor.p({
              placeholder: field.placeholder || "请选择",
              disabled: field.disabled,
              clearable: true,
              readonly: true,
              modelValue: $data.formData[field.name + "_label"]
            }),
            as: "2b16f33b-24-" + i0 + "-" + i1 + "," + ("2b16f33b-22-" + i0 + "-" + i1),
            at: common_vendor.o(($event) => $data.formData[field.name] = $event, field.name),
            av: common_vendor.p({
              type: "text",
              modelValue: $data.formData[field.name]
            }),
            aw: common_vendor.o(($event) => $options.showCascader(field), field.name),
            ax: "2b16f33b-22-" + i0 + "-" + i1 + ",2b16f33b-0",
            ay: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          } : field.type === "array<object>" ? common_vendor.e({
            aA: common_vendor.o(($event) => $options.addArrayItem(field), field.name),
            aB: "2b16f33b-26-" + i0 + "-" + i1 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
            aC: common_vendor.p({
              type: "primary",
              size: "mini"
            }),
            aD: field.showClear !== false
          }, field.showClear !== false ? {
            aE: common_vendor.o(($event) => $options.clearArray(field.name), field.name),
            aF: "2b16f33b-27-" + i0 + "-" + i1 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
            aG: common_vendor.p({
              type: "error",
              size: "mini"
            })
          } : {}, {
            aH: $data.formData[field.name] && $data.formData[field.name].length > 0
          }, $data.formData[field.name] && $data.formData[field.name].length > 0 ? {
            aI: common_vendor.f($data.formData[field.name], (item, index, i2) => {
              return common_vendor.e({
                a: common_vendor.t(index + 1),
                b: common_vendor.o(($event) => $options.removeArrayItem(field.name, index), index),
                c: "2b16f33b-28-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
                d: field.showSort !== false && index > 0
              }, field.showSort !== false && index > 0 ? {
                e: common_vendor.o(($event) => $options.moveArrayItem(field.name, index, -1), index),
                f: "2b16f33b-29-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
                g: common_vendor.p({
                  type: "text",
                  size: "mini"
                })
              } : {}, {
                h: field.showSort !== false && index < $data.formData[field.name].length - 1
              }, field.showSort !== false && index < $data.formData[field.name].length - 1 ? {
                i: common_vendor.o(($event) => $options.moveArrayItem(field.name, index, 1), index),
                j: "2b16f33b-30-" + i0 + "-" + i1 + "-" + i2 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
                k: common_vendor.p({
                  type: "text",
                  size: "mini"
                })
              } : {}, {
                l: common_vendor.f(field.columns, (subField, k3, i3) => {
                  return common_vendor.e({
                    a: common_vendor.t(subField.title),
                    b: subField.type === "text"
                  }, subField.type === "text" ? {
                    c: "2b16f33b-31-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
                    d: common_vendor.o(($event) => item[subField.key] = $event, subField.key),
                    e: common_vendor.p({
                      placeholder: subField.placeholder || "请输入",
                      disabled: subField.disabled,
                      size: "mini",
                      modelValue: item[subField.key]
                    })
                  } : subField.type === "number" ? {
                    g: "2b16f33b-32-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
                    h: common_vendor.o(($event) => item[subField.key] = $event, subField.key),
                    i: common_vendor.p({
                      placeholder: subField.placeholder || "请输入数字",
                      disabled: subField.disabled,
                      type: "number",
                      size: "mini",
                      modelValue: item[subField.key]
                    })
                  } : subField.type === "select" ? {
                    k: common_vendor.o((e) => $options.onSubSelectConfirm(e, field.name, subField.key, index), subField.key),
                    l: "2b16f33b-33-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
                    m: common_vendor.o(($event) => $data.subSelectShow[field.name + "_" + subField.key + "_" + index] = $event, subField.key),
                    n: common_vendor.p({
                      list: subField.data || [],
                      size: "mini",
                      modelValue: $data.subSelectShow[field.name + "_" + subField.key + "_" + index]
                    }),
                    o: common_vendor.o(($event) => $data.subSelectShow[field.name + "_" + subField.key + "_" + index] = true, subField.key),
                    p: "2b16f33b-34-" + i0 + "-" + i1 + "-" + i2 + "-" + i3 + "," + ("2b16f33b-25-" + i0 + "-" + i1),
                    q: common_vendor.o(($event) => item[subField.key + "_label"] = $event, subField.key),
                    r: common_vendor.p({
                      placeholder: subField.placeholder || "请选择",
                      disabled: subField.disabled,
                      size: "mini",
                      clearable: true,
                      readonly: true,
                      modelValue: item[subField.key + "_label"]
                    })
                  } : {}, {
                    f: subField.type === "number",
                    j: subField.type === "select",
                    s: subField.width ? subField.width + "rpx" : "auto",
                    t: subField.key
                  });
                }),
                m: index
              });
            }),
            aJ: common_vendor.p({
              type: "text",
              size: "mini"
            })
          } : {}, {
            aK: "2b16f33b-25-" + i0 + "-" + i1 + ",2b16f33b-0",
            aL: common_vendor.p({
              label: field.label,
              prop: field.name,
              required: field.required
            })
          }) : {}, {
            g: field.type === "number",
            m: field.type === "select",
            B: field.type === "textarea",
            H: field.type === "date",
            O: field.type === "file",
            ae: field.type === "remote-select",
            ao: field.type === "cascader",
            az: field.type === "array<object>",
            aM: field.name
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
    d: common_vendor.o($options.handleCancel, "9f"),
    e: !$props.butVisible
  }, !$props.butVisible ? {
    f: common_vendor.o(($event) => $options.handleSave(), "1b"),
    g: common_vendor.p({
      type: "primary",
      loading: $data.saveLoadingLocal
    })
  } : {}, {
    h: $props.butVisible
  }, $props.butVisible ? {
    i: common_vendor.o($options.handleSimulate, "e7"),
    j: common_vendor.p({
      type: "info",
      loading: $data.simulateLoadingLocal
    })
  } : {}, {
    k: $props.butVisible
  }, $props.butVisible ? {
    l: common_vendor.o(($event) => $options.handleSave("draft"), "4f"),
    m: common_vendor.p({
      type: "primary",
      loading: $data.saveLoadingLocal
    })
  } : {}, {
    n: $props.butVisible
  }, $props.butVisible ? {
    o: common_vendor.o($options.handleSubmit, "aa"),
    p: common_vendor.p({
      type: "success",
      loading: $data.submitLoadingLocal
    })
  } : {}, {
    q: common_vendor.o($options.onDateConfirm, "b0"),
    r: common_vendor.o(($event) => $data.datePickerShow = $event, "15"),
    s: common_vendor.p({
      mode: "time",
      params: $data.datePickerParams,
      modelValue: $data.datePickerShow
    }),
    t: common_vendor.t(((_a = $data.currentRemoteField) == null ? void 0 : _a.label) || "请选择"),
    v: common_vendor.o(($event) => $data.remoteSelectShow = false, "f1"),
    w: common_vendor.p({
      type: "text"
    })
  }, {
    x: common_vendor.p({
      mode: "list"
    })
  }, {
    y: common_vendor.o(($event) => $data.remoteSelectShow = $event, "04"),
    z: common_vendor.p({
      mode: "bottom",
      height: "70%",
      modelValue: $data.remoteSelectShow
    }),
    A: common_vendor.t(((_b = $data.currentCascaderField) == null ? void 0 : _b.label) || "请选择"),
    B: common_vendor.o(($event) => $data.cascaderShow = false, "b4"),
    C: common_vendor.p({
      type: "text"
    })
  }, {
    D: common_vendor.p({
      mode: "list"
    })
  }, {
    E: common_vendor.o(($event) => $data.cascaderShow = $event, "56"),
    F: common_vendor.p({
      mode: "bottom",
      height: "70%",
      modelValue: $data.cascaderShow
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2b16f33b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/dynamic-form-dialog/dynamic-form-dialog.js.map
