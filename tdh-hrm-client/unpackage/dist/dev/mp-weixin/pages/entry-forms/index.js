"use strict";
const common_vendor = require("../../common/vendor.js");
const uInputSelectVue = () => "../../components/u-input-select/u-input-select.js";
const FilePreviewDialog = () => "../../components/file-preview-dialog/file-preview-dialog.js";
const _sfc_main = {
  components: {
    uInputSelectVue,
    FilePreviewDialog
  },
  data() {
    return {
      buttonStyle: {
        primary: {
          height: "64rpx",
          padding: "0 24rpx"
        }
      },
      searchMobile: "",
      list: [],
      loading: false,
      refreshing: false,
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
      avatarDir: "/entry-forms/avatar",
      fileDir: "/entry-forms/file",
      // 弹窗
      formDialog: {
        show: false,
        title: ""
      },
      formData: {
        stay: 1,
        marital_status: 2,
        no_crime: 2,
        employee_name: "",
        card: "",
        mobile: "",
        gender: 1,
        age: "",
        birth_date: "",
        birth_month: "",
        bank_card: "",
        bank_id: "",
        bank_id_label: "",
        location_id: "",
        nation_id: "",
        educational_id: "",
        educational_id_label: "",
        expiration_date: "",
        card_location: "",
        emergency_contact: "",
        emergency_mobile: "",
        comment: "",
        avatar: "",
        file_attachments: []
      },
      formRules: {
        employee_name: {
          required: true,
          message: "请输入员工姓名"
        },
        card: [
          {
            required: true,
            message: "请输入身份证号"
          },
          {
            validator: vk.pubfn.validator("card"),
            message: "身份证格式错误",
            trigger: "blur"
          }
        ],
        mobile: [
          {
            required: true,
            message: "请输入手机号"
          },
          {
            validator: vk.pubfn.validator("mobile"),
            message: "手机号格式错误",
            trigger: "blur"
          }
        ],
        nation_id: {
          required: true,
          message: "请选择民族"
        },
        educational_id: {
          required: true,
          message: "请选择学历"
        },
        stay: {
          required: true,
          message: "请选择住宿"
        },
        expiration_date: {
          required: true,
          message: "请输入身份证有效期"
        },
        card_location: {
          required: true,
          message: "请输入户口所在地"
        },
        emergency_contact: {
          required: true,
          message: "请输入紧急联系人"
        },
        emergency_mobile: [
          {
            required: true,
            message: "请输入紧急联系人电话"
          },
          {
            validator: vk.pubfn.validator("mobile"),
            message: "手机号格式错误",
            trigger: "blur"
          }
        ],
        marital_status: {
          required: true,
          message: "请选择婚姻状况"
        },
        no_crime: {
          required: true,
          message: "请选择无犯罪证明"
        }
      },
      submitting: false,
      avatarFileList: [],
      // 头像文件列表（uni-file-picker 用）
      attachFiles: [],
      // 证明文件列表
      selectVisible: {
        location: false,
        nation: false,
        edu: false
      },
      genderOptions: [{
        value: 1,
        label: "男"
      }, {
        value: 2,
        label: "女"
      }],
      bankOptions: [],
      locationOptions: [],
      nationOptions: [],
      eduOptions: [],
      // 文件预览相关
      filePreview: {
        show: false,
        data: {
          url: "",
          name: "",
          type: "",
          size: 0,
          createTime: null
        }
      }
    };
  },
  async onLoad() {
    await Promise.all([this.loadOptions(), this.loadList(true)]);
  },
  onReady() {
    this.$refs.entryForm.setRules(this.formRules);
  },
  methods: {
    async loadOptions() {
      try {
        const [banks, locations, nations, edus] = await Promise.all([
          vk.callFunction({
            url: "admin/hrm/bank/pub/getList",
            data: { pageSize: 1e3 }
          }),
          vk.callFunction({
            url: "admin/hrm/banklocation/pub/getList",
            data: { pageSize: 1e3 }
          }),
          vk.callFunction({
            url: "admin/hrm/nation/pub/getList",
            data: { pageSize: 1e3 }
          }),
          vk.callFunction({
            url: "admin/hrm/educational/pub/getList",
            data: { pageSize: 1e3 }
          })
        ]);
        if (banks.code === 0)
          this.bankOptions = banks.rows.map((v) => ({
            value: v.bank_id,
            label: v.bank_name
          }));
        if (locations.code === 0)
          this.locationOptions = locations.rows.map((v) => ({
            value: v.location_id,
            label: v.location_name
          }));
        if (nations.code === 0)
          this.nationOptions = nations.rows.map((v) => ({
            value: v._id,
            label: v.name
          }));
        if (edus.code === 0)
          this.eduOptions = edus.rows.map((v) => ({
            value: v.educational_id,
            label: v.educational_name
          }));
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/entry-forms/index.vue:431", "加载选项数据失败：", err);
      }
    },
    onSelectConfirm(e, fieldKey) {
      if (e && e[0]) {
        const selected = e[0];
        this.formData[fieldKey] = selected.value;
        this.formData[fieldKey + "_label"] = selected.label;
      }
      this.selectVisible[fieldKey] = false;
    },
    async loadList(reset = true) {
      if (reset)
        this.pagination.pageIndex = 1;
      if (reset && !this.loading)
        this.loading = true;
      if (vk.pubfn.isNull(this.searchMobile))
        return;
      try {
        let res = await vk.callFunction({
          url: "admin/hrm/entry-forms/pub/getList",
          title: "请求中...",
          data: {
            pageIndex: this.pagination.pageIndex,
            pageSize: this.pagination.pageSize,
            mobile: this.searchMobile || void 0
          }
        });
        this.loading = false;
        this.refreshing = false;
        if (res.code !== 0)
          return common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        const rows = res.rows || [];
        this.list = reset ? rows : [...this.list, ...rows];
        this.pagination.total = res.total || 0;
        this.hasMore = this.list.length < this.pagination.total;
        this.loadMoreStatus = this.hasMore ? "loadmore" : "nomore";
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/entry-forms/index.vue:468", err);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
        this.loading = false;
        this.refreshing = false;
      }
    },
    handleSearch() {
      this.loadList(true);
    },
    loadMore() {
      if (!this.hasMore || this.loadMoreStatus === "loading" || this.loading)
        return;
      this.loadMoreStatus = "loading";
      this.pagination.pageIndex++;
      this.loadList(false);
    },
    onPullDownRefresh() {
      this.refreshing = true;
      this.loadList(true);
    },
    maskIdCard(card) {
      if (!card)
        return "-";
      return card.substring(0, 6) + "********" + card.substring(card.length - 4);
    },
    formatDate(ts, fmt) {
      return vk.pubfn.timeFormat(ts, fmt);
    },
    onCardBlur() {
      const res = vk.myfn.test1(this.formData.card);
      if (res.code === 0) {
        this.formData.gender = res.data.sex;
        this.formData.age = res.data.age;
        this.formData.birth_month = res.data.month;
        this.formData.birth_date = res.data.birthday;
      }
    },
    async validateBankCard() {
      const cardNo = this.formData.bank_card;
      if (!cardNo)
        return;
      const res = await vk.request({
        method: "get",
        url: "https://ccdcapi.alipay.com/validateAndCacheCardInfo.json",
        data: { cardNo, cardBinCheck: true }
      });
      if (res.bank) {
        this.formData.bank_id = res.bank;
        const bank = this.bankOptions.find((b) => b.value == res.bank);
        this.formData.bank_id_label = bank ? bank.label : res.bank;
      } else {
        common_vendor.index.showToast({ title: "银行卡号不正确", icon: "none" });
      }
    },
    addEntry() {
      this.formDialog.title = "新建入职登记";
      this.formData = {
        stay: 1,
        marital_status: 2,
        no_crime: 2,
        employee_name: "",
        card: "",
        mobile: "",
        gender: 1,
        age: "",
        birth_date: "",
        birth_month: "",
        bank_card: "",
        bank_id: "",
        bank_id_label: "",
        location_id: "",
        nation_id: "",
        educational_id: "",
        educational_id_label: "",
        expiration_date: "",
        card_location: "",
        emergency_contact: "",
        emergency_mobile: "",
        comment: "",
        avatar: "",
        file_attachments: []
      };
      this.avatarFileList = [];
      this.attachFiles = [];
      this.formDialog.show = true;
      this.$nextTick(() => {
        this.$refs.entryForm.setRules(this.formRules);
      });
    },
    editEntry(item) {
      this.formDialog.title = "编辑入职登记";
      this.formData = JSON.parse(JSON.stringify(item));
      const bank = this.bankOptions.find((b) => b.value == this.formData.bank_id);
      this.formData.bank_id_label = bank ? bank.label : this.formData.bank_id;
      const edu = this.eduOptions.find((e) => e.value == this.formData.educational_id);
      if (edu)
        this.formData.educational_id_label = edu.label;
      if (item.file_attachments && Array.isArray(item.file_attachments)) {
        this.attachFiles = item.file_attachments.map((url, index) => ({
          url,
          name: this.getFileNameFromUrl(url),
          uuid: index
        }));
      } else {
        this.attachFiles = [];
      }
      if (this.formData.avatar) {
        this.avatarFileList = [{
          url: this.formData.avatar,
          name: this.getFileNameFromUrl(this.formData.avatar)
        }];
      } else {
        this.avatarFileList = [];
      }
      this.formDialog.show = true;
      this.$nextTick(() => {
        this.$refs.entryForm.setRules(this.formRules);
      });
    },
    async submitForm() {
      this.$refs.entryForm.validate(async (valid) => {
        if (!valid)
          return;
        this.submitting = true;
        const action = this.formData._id ? "admin/hrm/entry-forms/pub/update" : "admin/hrm/entry-forms/pub/add";
        const data = { ...this.formData };
        data.file_attachments = this.attachFiles.map((f) => f.url);
        data.avatar = this.avatarFileList.length ? this.avatarFileList[0].url : "";
        delete data.bank_id_label;
        delete data.educational_id_label;
        delete data._add_time;
        delete data._update_time;
        const res = await vk.callFunction({ url: action, data });
        this.submitting = false;
        if (res.code === 0) {
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          this.formDialog.show = false;
          this.loadList(true);
        } else {
          common_vendor.index.showToast({ title: res.message || "保存失败", icon: "none" });
        }
      });
    },
    deleteEntry(item) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除该条记录吗？",
        success: async (modal) => {
          if (modal.confirm) {
            const res = await vk.callFunction({
              url: "admin/hrm/entry-forms/pub/delete",
              data: { _id: item._id }
            });
            if (res.code === 0) {
              common_vendor.index.showToast({ title: "删除成功" });
              this.loadList(true);
            } else {
              common_vendor.index.showToast({ title: res.message, icon: "none" });
            }
          }
        }
      });
    },
    closeFormDialog() {
      this.formDialog.show = false;
      this.$nextTick(() => {
        this.$refs.entryForm.setRules(this.formRules);
      });
    },
    // ========== 头像上传相关（uni-file-picker）==========
    onAvatarSuccess(e) {
      const { tempFiles } = e;
      if (tempFiles && tempFiles.length > 0) {
        const file = tempFiles[0];
        const url = file.url || file.path;
        this.formData.avatar = url;
        this.avatarFileList = [{
          url,
          name: file.name || "avatar.jpg"
        }];
      }
    },
    onAvatarRemove(e) {
      var _a;
      const fileUrl = (_a = e.tempFile) == null ? void 0 : _a.url;
      if (fileUrl) {
        vk.callFunction({
          url: "common/pub/deleteFile/index",
          data: { fileList: [fileUrl] }
        });
      }
      this.formData.avatar = "";
      this.avatarFileList = [];
    },
    // ========== 证明文件上传相关 ==========
    responseFormat(res) {
      if (res && res.url)
        return { url: res.url };
      return res;
    },
    onAttachSuccess(e) {
      const { tempFiles } = e;
      if (tempFiles) {
        tempFiles.forEach((tempFile) => {
          const idx = this.attachFiles.findIndex((f) => f.uuid === tempFile.uuid);
          if (idx !== -1) {
            this.attachFiles[idx].url = tempFile.url || tempFile.path;
            let rawName = tempFile.name || "";
            this.attachFiles[idx].name = this.beautifyFileName(rawName);
          }
        });
      }
    },
    onAttachRemove(e) {
      this.removeFile(e);
    },
    onFileUploadFail(err) {
      common_vendor.index.showToast({ title: "上传失败", icon: "none" });
    },
    removeFile(e) {
      const file = this.attachFiles[e.index];
      vk.myfn.deleteFile(file);
      this.attachFiles.splice(e.index, 1);
    },
    // ========== 文件预览 / 下载 ==========
    previewFile(file) {
      if (!(file == null ? void 0 : file.url)) {
        common_vendor.index.showToast({ title: "文件地址无效", icon: "none" });
        return;
      }
      this.filePreview.data = {
        url: file.url,
        name: file.name || this.getFileNameFromUrl(file.url),
        type: this.getFileType(file),
        size: file.size || 0,
        createTime: null
      };
      this.filePreview.show = true;
    },
    downloadFile(file) {
      if (!(file == null ? void 0 : file.url)) {
        common_vendor.index.showToast({ title: "文件地址无效", icon: "none" });
        return;
      }
      common_vendor.index.downloadFile({
        url: file.url,
        success: (res) => {
          if (res.statusCode === 200) {
            common_vendor.index.saveFile({
              tempFilePath: res.tempFilePath,
              success: () => common_vendor.index.showToast({ title: "下载成功", icon: "success" }),
              fail: () => common_vendor.index.showToast({ title: "保存失败", icon: "none" })
            });
          }
        },
        fail: () => common_vendor.index.showToast({ title: "下载失败", icon: "none" })
      });
    },
    filePreviewClose() {
      this.filePreview.show = false;
    },
    getFileType(file) {
      const name = file.name || "";
      if (/\.(pdf)$/i.test(name))
        return "pdf";
      if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(name))
        return "office";
      if (/\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(name))
        return "image";
      return "other";
    },
    beautifyFileName(fileName) {
      if (!fileName)
        return "未知文件";
      const lastDotIndex = fileName.lastIndexOf(".");
      let nameWithoutExt = fileName;
      let ext = "";
      if (lastDotIndex > 0) {
        nameWithoutExt = fileName.substring(0, lastDotIndex);
        ext = fileName.substring(lastDotIndex);
      }
      if (nameWithoutExt.length > 20) {
        const start = nameWithoutExt.substring(0, 8);
        const end = nameWithoutExt.substring(nameWithoutExt.length - 8);
        nameWithoutExt = `${start}...${end}`;
      }
      return nameWithoutExt + ext;
    },
    getFileNameFromUrl(url) {
      if (!url)
        return "未知文件";
      const clean = url.split(/[?#]/)[0];
      let fileName = clean.split("/").pop() || "未知文件";
      return this.beautifyFileName(fileName);
    }
  }
};
if (!Array) {
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_loadmore2 = common_vendor.resolveComponent("u-loadmore");
  const _easycom_u_input2 = common_vendor.resolveComponent("u-input");
  const _easycom_u_form_item2 = common_vendor.resolveComponent("u-form-item");
  const _easycom_u_radio2 = common_vendor.resolveComponent("u-radio");
  const _easycom_u_radio_group2 = common_vendor.resolveComponent("u-radio-group");
  const _easycom_u_input_select2 = common_vendor.resolveComponent("u-input-select");
  const _easycom_u_select2 = common_vendor.resolveComponent("u-select");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_u_form2 = common_vendor.resolveComponent("u-form");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  const _easycom_file_preview_dialog2 = common_vendor.resolveComponent("file-preview-dialog");
  (_easycom_u_search2 + _easycom_u_icon2 + _easycom_u_button2 + _easycom_u_empty2 + _easycom_u_loadmore2 + _easycom_u_input2 + _easycom_u_form_item2 + _easycom_u_radio2 + _easycom_u_radio_group2 + _easycom_u_input_select2 + _easycom_u_select2 + _easycom_uni_file_picker2 + _easycom_u_form2 + _easycom_u_popup2 + _easycom_file_preview_dialog2)();
}
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loadmore = () => "../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
const _easycom_u_input = () => "../../uni_modules/vk-uview-ui/components/u-input/u-input.js";
const _easycom_u_form_item = () => "../../uni_modules/vk-uview-ui/components/u-form-item/u-form-item.js";
const _easycom_u_radio = () => "../../uni_modules/vk-uview-ui/components/u-radio/u-radio.js";
const _easycom_u_radio_group = () => "../../uni_modules/vk-uview-ui/components/u-radio-group/u-radio-group.js";
const _easycom_u_input_select = () => "../../components/u-input-select/u-input-select.js";
const _easycom_u_select = () => "../../uni_modules/vk-uview-ui/components/u-select/u-select.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_u_form = () => "../../uni_modules/vk-uview-ui/components/u-form/u-form.js";
const _easycom_u_popup = () => "../../uni_modules/vk-uview-ui/components/u-popup/u-popup.js";
const _easycom_file_preview_dialog = () => "../../components/file-preview-dialog/file-preview-dialog.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_icon + _easycom_u_button + _easycom_u_empty + _easycom_u_loadmore + _easycom_u_input + _easycom_u_form_item + _easycom_u_radio + _easycom_u_radio_group + _easycom_u_input_select + _easycom_u_select + _easycom_uni_file_picker + _easycom_u_form + _easycom_u_popup + _easycom_file_preview_dialog)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleSearch, "53"),
    b: common_vendor.o(($event) => $data.searchMobile = $event, "fc"),
    c: common_vendor.p({
      placeholder: "请输入手机号搜索",
      focus: true,
      ["show-action"]: false,
      modelValue: $data.searchMobile
    }),
    d: common_vendor.p({
      name: "plus",
      size: "20",
      color: "#fff"
    }),
    e: common_vendor.o($options.addEntry, "65"),
    f: common_vendor.p({
      type: "primary",
      shape: "circle",
      ["custom-style"]: $data.buttonStyle.primary
    }),
    g: $data.loading && !$data.list.length
  }, $data.loading && !$data.list.length ? {
    h: common_vendor.f(3, (i, k0, i0) => {
      return {
        a: i
      };
    })
  } : common_vendor.e({
    i: common_vendor.f($data.list, (item, k0, i0) => {
      return common_vendor.e({
        a: "c444286b-3-" + i0,
        b: common_vendor.t(item.employee_name),
        c: common_vendor.t(item.mobile || "-"),
        d: common_vendor.t($options.maskIdCard(item.card)),
        e: common_vendor.t(item.gender == 1 ? "男" : "女"),
        f: common_vendor.t(item.age),
        g: item._add_time
      }, item._add_time ? {
        h: "c444286b-4-" + i0,
        i: common_vendor.p({
          name: "clock",
          size: "24",
          color: "#c0c4cc"
        }),
        j: common_vendor.t($options.formatDate(item._add_time, "yyyy-MM-dd hh:mm"))
      } : {}, {
        k: common_vendor.o(($event) => $options.editEntry(item), item._id),
        l: "c444286b-5-" + i0,
        m: item._id
      });
    }),
    j: common_vendor.p({
      name: "account",
      size: "32",
      color: "#2979ff"
    }),
    k: common_vendor.p({
      type: "primary",
      size: "medium",
      plain: true
    }),
    l: !$data.loading && $data.list.length === 0
  }, !$data.loading && $data.list.length === 0 ? {
    m: common_vendor.o($options.addEntry, "12"),
    n: common_vendor.p({
      type: "primary",
      shape: "circle",
      ["custom-style"]: $data.buttonStyle.primary
    }),
    o: common_vendor.p({
      mode: "data",
      text: "暂无入职登记记录"
    })
  } : {}, {
    p: $data.hasMore && $data.list.length > 0
  }, $data.hasMore && $data.list.length > 0 ? {
    q: common_vendor.o($options.loadMore, "41"),
    r: common_vendor.p({
      status: $data.loadMoreStatus,
      ["load-text"]: $data.loadText
    })
  } : {}, {
    s: $data.refreshing,
    t: common_vendor.o((...args) => $options.onPullDownRefresh && $options.onPullDownRefresh(...args), "6b"),
    v: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "c1")
  }), {
    w: common_vendor.t($data.formDialog.title),
    x: common_vendor.o(($event) => $data.formData.employee_name = $event, "29"),
    y: common_vendor.p({
      placeholder: "请输入",
      modelValue: $data.formData.employee_name
    }),
    z: common_vendor.p({
      label: "员工姓名",
      prop: "employee_name",
      required: true
    }),
    A: common_vendor.o($options.onCardBlur, "d4"),
    B: common_vendor.o(($event) => $data.formData.card = $event, "98"),
    C: common_vendor.p({
      placeholder: "请输入",
      modelValue: $data.formData.card
    }),
    D: common_vendor.p({
      label: "身份证号",
      prop: "card",
      required: true
    }),
    E: common_vendor.o(($event) => $data.formData.mobile = $event, "01"),
    F: common_vendor.p({
      placeholder: "请输入",
      modelValue: $data.formData.mobile
    }),
    G: common_vendor.p({
      label: "手机号",
      prop: "mobile",
      required: true
    }),
    H: common_vendor.p({
      name: 1
    }),
    I: common_vendor.p({
      name: 2
    }),
    J: common_vendor.o(($event) => $data.formData.gender = $event, "c1"),
    K: common_vendor.p({
      disabled: true,
      modelValue: $data.formData.gender
    }),
    L: common_vendor.p({
      label: "性别",
      prop: "gender"
    }),
    M: common_vendor.o(($event) => $data.formData.birth_date = $event, "c5"),
    N: common_vendor.p({
      disabled: true,
      placeholder: "自动识别",
      modelValue: $data.formData.birth_date
    }),
    O: common_vendor.p({
      label: "出生日期",
      prop: "birth_date"
    }),
    P: common_vendor.o(($event) => $data.formData.age = $event, "be"),
    Q: common_vendor.p({
      disabled: true,
      placeholder: "自动识别",
      type: "number",
      modelValue: $data.formData.age
    }),
    R: common_vendor.p({
      label: "年龄",
      prop: "age"
    }),
    S: common_vendor.o($options.validateBankCard, "b5"),
    T: common_vendor.o(($event) => $data.formData.bank_card = $event, "9d"),
    U: common_vendor.p({
      placeholder: "请输入",
      modelValue: $data.formData.bank_card
    }),
    V: common_vendor.p({
      label: "银行卡号",
      prop: "bank_card"
    }),
    W: common_vendor.o(($event) => $data.formData.bank_id_label = $event, "3e"),
    X: common_vendor.p({
      disabled: true,
      placeholder: "自动识别",
      modelValue: $data.formData.bank_id_label
    }),
    Y: common_vendor.p({
      label: "银行名称",
      prop: "bank_id"
    }),
    Z: common_vendor.o(($event) => $data.formData.location_id = $event, "85"),
    aa: common_vendor.p({
      options: $data.locationOptions,
      placeholder: "请选择开户地",
      ["panel-title"]: "选择开户地",
      clearable: true,
      modelValue: $data.formData.location_id
    }),
    ab: common_vendor.p({
      label: "开户地",
      prop: "location_id"
    }),
    ac: common_vendor.o(($event) => $data.formData.nation_id = $event, "9a"),
    ad: common_vendor.p({
      options: $data.nationOptions,
      placeholder: "请选择民族",
      ["panel-title"]: "选择民族",
      clearable: true,
      modelValue: $data.formData.nation_id
    }),
    ae: common_vendor.p({
      label: "民族",
      prop: "nation_id",
      required: true
    }),
    af: common_vendor.o((e) => $options.onSelectConfirm(e, "educational_id"), "45"),
    ag: common_vendor.o(($event) => $data.selectVisible.edu = $event, "86"),
    ah: common_vendor.p({
      list: $data.eduOptions,
      modelValue: $data.selectVisible.edu
    }),
    ai: common_vendor.o(($event) => $data.selectVisible.edu = true, "e9"),
    aj: common_vendor.o(($event) => $data.formData.educational_id_label = $event, "25"),
    ak: common_vendor.p({
      type: "select",
      placeholder: "请选择学历",
      modelValue: $data.formData.educational_id_label
    }),
    al: common_vendor.p({
      label: "学历",
      prop: "educational_id",
      required: true
    }),
    am: common_vendor.p({
      name: 1
    }),
    an: common_vendor.p({
      name: 2
    }),
    ao: common_vendor.o(($event) => $data.formData.stay = $event, "ca"),
    ap: common_vendor.p({
      modelValue: $data.formData.stay
    }),
    aq: common_vendor.p({
      label: "住宿",
      prop: "stay",
      required: true
    }),
    ar: common_vendor.o(($event) => $data.formData.expiration_date = $event, "5f"),
    as: common_vendor.p({
      placeholder: "例如 2025-12-31",
      modelValue: $data.formData.expiration_date
    }),
    at: common_vendor.p({
      label: "身份证有效期",
      prop: "expiration_date",
      required: true
    }),
    av: common_vendor.o(($event) => $data.formData.card_location = $event, "d0"),
    aw: common_vendor.p({
      type: "textarea",
      modelValue: $data.formData.card_location
    }),
    ax: common_vendor.p({
      label: "户口所在地",
      prop: "card_location",
      required: true
    }),
    ay: common_vendor.o(($event) => $data.formData.emergency_contact = $event, "e9"),
    az: common_vendor.p({
      modelValue: $data.formData.emergency_contact
    }),
    aA: common_vendor.p({
      label: "紧急联系人",
      prop: "emergency_contact",
      required: true
    }),
    aB: common_vendor.o(($event) => $data.formData.emergency_mobile = $event, "fa"),
    aC: common_vendor.p({
      modelValue: $data.formData.emergency_mobile
    }),
    aD: common_vendor.p({
      label: "联系人电话",
      prop: "emergency_mobile",
      required: true
    }),
    aE: common_vendor.p({
      name: 1
    }),
    aF: common_vendor.p({
      name: 2
    }),
    aG: common_vendor.o(($event) => $data.formData.marital_status = $event, "bb"),
    aH: common_vendor.p({
      modelValue: $data.formData.marital_status
    }),
    aI: common_vendor.p({
      label: "婚姻状况",
      prop: "marital_status",
      required: true
    }),
    aJ: common_vendor.p({
      name: 1
    }),
    aK: common_vendor.p({
      name: 2
    }),
    aL: common_vendor.o(($event) => $data.formData.no_crime = $event, "f0"),
    aM: common_vendor.p({
      modelValue: $data.formData.no_crime
    }),
    aN: common_vendor.p({
      label: "无犯罪证明",
      prop: "no_crime",
      required: true
    }),
    aO: common_vendor.o(($event) => $data.formData.comment = $event, "ae"),
    aP: common_vendor.p({
      type: "textarea",
      modelValue: $data.formData.comment
    }),
    aQ: common_vendor.p({
      label: "备注",
      prop: "comment"
    }),
    aR: common_vendor.p({
      name: "camera",
      size: "28",
      color: "#2979ff"
    }),
    aS: common_vendor.o($options.onAvatarSuccess, "c0"),
    aT: common_vendor.o($options.onAvatarRemove, "0d"),
    aU: common_vendor.o($options.onFileUploadFail, "be"),
    aV: common_vendor.o(($event) => $data.avatarFileList = $event, "3e"),
    aW: common_vendor.p({
      ["auto-upload"]: true,
      limit: 1,
      ["file-mediatype"]: "image",
      ["max-size"]: 1 * 1024 * 1024,
      dir: $data.avatarDir,
      modelValue: $data.avatarFileList
    }),
    aX: common_vendor.p({
      label: "头像",
      prop: "avatar"
    }),
    aY: common_vendor.p({
      name: "plus",
      size: "28",
      color: "#2979ff"
    }),
    aZ: common_vendor.o($options.onAttachSuccess, "3a"),
    ba: common_vendor.o($options.onAttachRemove, "67"),
    bb: common_vendor.o($options.onFileUploadFail, "76"),
    bc: common_vendor.o(($event) => $data.attachFiles = $event, "aa"),
    bd: common_vendor.p({
      ["file-mediatype"]: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png",
      ["auto-upload"]: true,
      limit: 9,
      ["response-format"]: $options.responseFormat,
      dir: $data.fileDir,
      modelValue: $data.attachFiles
    }),
    be: $data.attachFiles.length
  }, $data.attachFiles.length ? {
    bf: common_vendor.f($data.attachFiles, (file, index, i0) => {
      return {
        a: "c444286b-64-" + i0 + ",c444286b-61",
        b: common_vendor.t(file.name || $options.getFileNameFromUrl(file.url)),
        c: common_vendor.o(($event) => $options.previewFile(file), file.uuid || index),
        d: file.uuid || index
      };
    }),
    bg: common_vendor.p({
      name: "file-text",
      size: "30",
      color: "#2979ff"
    })
  } : {}, {
    bh: common_vendor.p({
      label: "证明文件",
      prop: "file_attachments"
    }),
    bi: common_vendor.sr("entryForm", "c444286b-10,c444286b-9"),
    bj: common_vendor.p({
      model: $data.formData,
      ["label-position"]: "left",
      ["label-width"]: "180rpx"
    }),
    bk: common_vendor.o($options.closeFormDialog, "f7"),
    bl: common_vendor.o($options.submitForm, "29"),
    bm: common_vendor.p({
      type: "primary",
      loading: $data.submitting
    }),
    bn: common_vendor.o($options.closeFormDialog, "37"),
    bo: common_vendor.o(($event) => $data.formDialog.show = $event, "6f"),
    bp: common_vendor.p({
      mode: "bottom",
      ["border-radius"]: "20",
      height: "90%",
      closeable: true,
      modelValue: $data.formDialog.show
    }),
    bq: common_vendor.o($options.filePreviewClose, "da"),
    br: common_vendor.o($options.downloadFile, "b4"),
    bs: common_vendor.p({
      value: $data.filePreview.show,
      ["file-data"]: $data.filePreview.data
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c444286b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/entry-forms/index.js.map
