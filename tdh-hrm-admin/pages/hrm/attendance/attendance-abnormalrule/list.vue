<template>
  <view class="page-body">
    <view class="btn-group">
      <el-row>
        <el-button type="success" size="small" icon="el-icon-circle-plus-outline"
          v-if="$hasRole('admin') || $hasPermission('attendance-abnormalrule-add')" @click="addBtn">添加规则</el-button>
        <el-button type="warning" size="small" icon="el-icon-refresh-left"
          v-if="$hasRole('admin') || $hasPermission('attendance-abnormalrule-edit')" @click="resetDefault">恢复默认</el-button>
      </el-row>
    </view>

    <vk-data-table ref="table1" :action="table1.action" :columns="table1.columns"
      :right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="false"
      @update="updateBtn" @delete="deleteBtn">
    </vk-data-table>

    <vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="850px" mode="form"
      :close-on-click-modal="false">
      <vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
        :form-type="form1.props.formType" :columns='form1.props.columns' label-width="180px" :inline="true"
        :columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
    </vk-data-dialog>
  </view>
</template>

<script>
let vk = uni.vk;
let originalForms = {};
const colWidth = 200;
export default {
  data() {
    return {
      table1: {
        action: "admin/hrm/attendance/sys/abnormalRule/getList",
        rightBtns: [
          {
            mode: 'detail_auto',
            title: '详细',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-abnormalrule-view')
          },
          {
            mode: 'update',
            title: '编辑',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-abnormalrule-edit')
          },
          {
            mode: 'delete',
            title: '删除',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-abnormalrule-delete')
          }
        ],
        columns: [
          {
            key: "single_punch_rule",
            title: "单次打卡",
            type: "select",
            width: colWidth,
            data: [
              { value: 1, label: "有请假则不计" },
              { value: 2, label: "一律旷工" },
              { value: 3, label: "一律早退/迟到" },
              { value: 4, label: "不处理" }
            ],
            formatter: (val) => {
              const map = { 1:'有请假则不计', 2:'一律旷工', 3:'一律早退/迟到', 4:'不处理' };
              return map[val] || val;
            }
          },
          {
            key: "late_early_coexist_rule",
            title: "迟到+早退",
            type: "select",
            width: colWidth,
            data: [
              { value: 1, label: "分别记录" },
              { value: 2, label: "合并记录" },
              { value: 3, label: "只记迟到" },
              { value: 4, label: "只记早退" }
            ],
            formatter: (val) => {
              const map = { 1:'分别记录', 2:'合并记录', 3:'只记迟到', 4:'只记早退' };
              return map[val] || val;
            }
          },
          {
            key: "out_office_cancel_absence",
            title: "出差/外勤抵消",
            type: "switch",
            width: colWidth - 80,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "overtime_cancel_early",
            title: "加班抵消早退",
            type: "switch",
            width: colWidth - 80,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "late_forgive_minutes",
            title: "迟到宽限(分)",
            type: "number",
            width: colWidth - 60
          },
          {
            key: "early_forgive_minutes",
            title: "早退宽限(分)",
            type: "number",
            width: colWidth - 60
          },
          {
            key: "status",
            title: "启用",
            type: "switch",
            width: colWidth - 100,
            formatter: (val) => val ? '启用' : '停用'
          },
          {
            key: "remark",
            title: "备注",
            type: "text",
            width: colWidth
          },
          {
            key: "update_date",
            title: "更新时间",
            type: "time",
            width: colWidth,
            show: ["detail"]
          },
          {
            key: "users.nickname",
            title: "更新人",
            type: "text",
            width: colWidth,
            show: ["detail"]
          }
        ]
      },
      queryForm1: { formData: {}, columns: [] },
      form1: {
        data: {
          single_punch_rule: 1,
          late_early_coexist_rule: 1,
          out_office_cancel_absence: true,
          overtime_cancel_early: false,
          late_forgive_minutes: 0,
          early_forgive_minutes: 0,
          status: true,
          remark: ''
        },
        props: {
          action: "",
          columns: [
            {
              key: "single_punch_rule",
              title: "只打一次卡处理",
              type: "select",
              width: colWidth,
              required: true,
              data: [
                { value: 1, label: "有请假/出差则不计异常" },
                { value: 2, label: "一律记旷工" },
                { value: 3, label: "一律记早退或迟到" },
                { value: 4, label: "不处理" }
              ]
            },
            {
              key: "late_early_coexist_rule",
              title: "迟到与早退同时存在",
              type: "select",
              width: colWidth,
              required: true,
              data: [
                { value: 1, label: "分别记录" },
                { value: 2, label: "合并记录一次" },
                { value: 3, label: "只记迟到" },
                { value: 4, label: "只记早退" }
              ]
            },
            {
              key: "out_office_cancel_absence",
              title: "外勤/出差抵消缺勤",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "overtime_cancel_early",
              title: "加班抵消早退",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "late_forgive_minutes",
              title: "迟到宽限(分钟)",
              type: "number",
              width: colWidth - 60
            },
            {
              key: "early_forgive_minutes",
              title: "早退宽限(分钟)",
              type: "number",
              width: colWidth - 60
            },
            {
              key: "status",
              title: "启用状态",
              type: "switch",
              width: colWidth - 100,
              defaultValue: true
            },
            {
              key: "remark",
              title: "备注",
              type: "textarea",
              maxlength: 500,
              width: colWidth * 3
            }
          ],
          rules: {
            single_punch_rule: [{ required: true, message: "请选择规则", trigger: "change" }],
            late_early_coexist_rule: [{ required: true, message: "请选择规则", trigger: "change" }]
          },
          formType: "",
          title: "",
          show: false
        }
      }
    };
  },
  onLoad() {
    originalForms = { form1: vk.pubfn.copyObject(this.form1) };
  },
  methods: {
    search() { this.$refs.table1.search(); },
    refresh() { this.$refs.table1.refresh(); },
    resetForm() { vk.pubfn.resetForm(originalForms, this); },
    addBtn() {
      this.resetForm();
      this.form1.props.action = 'admin/hrm/attendance/sys/abnormalRule/add';
      this.form1.props.formType = 'add';
      this.form1.props.title = '添加异常规则';
      this.form1.props.show = true;
    },
    updateBtn({ item }) {
      this.form1.props.action = 'admin/hrm/attendance/sys/abnormalRule/update';
      this.form1.props.formType = 'update';
      this.form1.props.title = '编辑异常规则';
      this.form1.props.show = true;
      this.form1.data = { ...item };
    },
    deleteBtn({ item, deleteFn }) {
      deleteFn({
        action: "admin/hrm/attendance/sys/abnormalRule/delete",
        data: { _id: item._id }
      });
    },
    async resetDefault() {
      vk.confirm('确定要恢复为默认异常规则吗？', async (res) => {
        if (res.confirm) {
          const defaultData = {
            single_punch_rule: 1,
            late_early_coexist_rule: 1,
            out_office_cancel_absence: true,
            overtime_cancel_early: false,
            late_forgive_minutes: 0,
            early_forgive_minutes: 0,
            status: true,
            remark: ''
          };
          try {
            const listRes = await vk.callFunction({
              url: 'admin/hrm/attendance/sys/abnormalRule/getList',
              data: { pageSize: 1 }
            });
            const existing = listRes.rows ? listRes.rows[0] : null;
            if (existing) {
              await vk.callFunction({
                url: 'admin/hrm/attendance/sys/abnormalRule/update',
                data: { _id: existing._id, ...defaultData }
              });
            } else {
              await vk.callFunction({
                url: 'admin/hrm/attendance/sys/abnormalRule/add',
                data: defaultData
              });
            }
            vk.toast('已恢复默认');
            this.refresh();
          } catch (e) {
            vk.toast('操作失败');
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-body { padding: 20rpx; }
.btn-group { margin: 20rpx 0; }
</style>