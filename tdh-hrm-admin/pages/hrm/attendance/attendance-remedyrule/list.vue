<template>
  <view class="page-body">
    <!-- 操作按钮 -->
    <view class="btn-group">
      <el-row>
        <el-button type="success" size="small" icon="el-icon-circle-plus-outline"
          v-if="$hasRole('admin') || $hasPermission('attendance-remedyrule-add')" @click="addBtn">添加规则</el-button>
        <el-button type="warning" size="small" icon="el-icon-refresh-left"
          v-if="$hasRole('admin') || $hasPermission('attendance-remedyrule-edit')" @click="resetDefault">恢复默认</el-button>
      </el-row>
    </view>

    <!-- 表格区域 -->
    <vk-data-table ref="table1" :action="table1.action" :columns="table1.columns"
      :right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="false"
      @update="updateBtn" @delete="deleteBtn">
    </vk-data-table>

    <!-- 添加/编辑弹窗 -->
    <vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="850px" mode="form"
      :close-on-click-modal="false">
      <vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
        :form-type="form1.props.formType" :columns='form1.props.columns' label-width="160px" :inline="true"
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
        action: "admin/hrm/attendance/sys/remedyrule/getList",
        rightBtns: [
          {
            mode: 'detail_auto',
            title: '详细',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-remedyrule-view')
          },
          {
            mode: 'update',
            title: '编辑',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-remedyrule-edit')
          },
          {
            mode: 'delete',
            title: '删除',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-remedyrule-delete')
          }
        ],
        columns: [
          {
            key: "remedy_enabled",
            title: "启用补卡",
            type: "switch",
            width: colWidth - 100,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "remedy_days_limit",
            title: "申请时限(天)",
            type: "number",
            width: colWidth - 60
          },
          {
            key: "remedy_max_per_month",
            title: "月上限次数",
            type: "number",
            width: colWidth - 60
          },
          {
            key: "require_attachment",
            title: "需上传证明",
            type: "switch",
            width: colWidth - 80,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "templates.name",
            title: "OA审批模板",
            type: "text",
            width: colWidth
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
          remedy_enabled: true,
          remedy_days_limit: 3,
          remedy_max_per_month: 3,
          require_attachment: false,
          oa_approval_template_code: '',
          status: true,
          remark: ''
        },
        props: {
          action: "",
          columns: [
            {
              key: "remedy_enabled",
              title: "启用补卡功能",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "remedy_days_limit",
              title: "补卡申请时限(天)",
              type: "number",
              width: colWidth - 60,
              required: true
            },
            {
              key: "remedy_max_per_month",
              title: "每月补卡次数上限",
              type: "number",
              width: colWidth - 60,
              required: true
            },
            {
              key: "require_attachment",
              title: "需上传证明文件",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "oa_approval_template_code",
              title: "OA审批模板",
              type: "remote-select",
              placeholder: "请选择OA审批模板（留空使用默认）",
              width: colWidth,
              action: "admin/bpmn/form-type/sys/getList",
              props: {
                list: "rows",
                value: "code",
                label: "name"
              },
              showAll: true,
              actionData: { pageSize: 100 }
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
            remedy_days_limit: [{ required: true, message: "请填写时限", trigger: "blur" }],
            remedy_max_per_month: [{ required: true, message: "请填写次数上限", trigger: "blur" }]
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
      this.form1.props.action = 'admin/hrm/attendance/sys/remedyrule/add';
      this.form1.props.formType = 'add';
      this.form1.props.title = '添加补卡规则';
      this.form1.props.show = true;
    },
    updateBtn({ item }) {
      this.form1.props.action = 'admin/hrm/attendance/sys/remedyrule/update';
      this.form1.props.formType = 'update';
      this.form1.props.title = '编辑补卡规则';
      this.form1.props.show = true;
      this.form1.data = { ...item };
    },
    deleteBtn({ item, deleteFn }) {
      deleteFn({
        action: "admin/hrm/attendance/sys/remedyrule/delete",
        data: { _id: item._id }
      });
    },
    async resetDefault() {
      vk.confirm('确定要恢复为默认补卡规则吗？', async (res) => {
        if (res.confirm) {
          try {
            const listRes = await vk.callFunction({
              url: 'admin/hrm/attendance/sys/remedyrule/getList',
              data: { pageSize: 1 }
            });
            const existing = listRes.rows ? listRes.rows[0] : null;
            const defaultData = {
              remedy_enabled: true,
              remedy_days_limit: 3,
              remedy_max_per_month: 3,
              require_attachment: false,
              oa_approval_template_code: '',
              status: true,
              remark: ''
            };
            if (existing) {
              await vk.callFunction({
                url: 'admin/hrm/attendance/sys/remedyrule/update',
                data: { _id: existing._id, ...defaultData }
              });
              vk.toast('已恢复默认');
            } else {
              await vk.callFunction({
                url: 'admin/hrm/attendance/sys/remedyrule/add',
                data: defaultData
              });
              vk.toast('已创建默认规则');
            }
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