<template>
  <view class="page-body">
    <view class="btn-group">
      <el-row>
        <el-button type="success" size="small" icon="el-icon-circle-plus-outline"
          v-if="$hasRole('admin') || $hasPermission('attendance-outrule-add')" @click="addBtn">添加规则</el-button>
        <el-button type="warning" size="small" icon="el-icon-refresh-left"
          v-if="$hasRole('admin') || $hasPermission('attendance-outrule-edit')" @click="resetDefault">恢复默认</el-button>
      </el-row>
    </view>

    <vk-data-table ref="table1" :action="table1.action" :columns="table1.columns"
      :right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="false"
      @update="updateBtn" @delete="deleteBtn">
    </vk-data-table>

    <vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="800px" mode="form"
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
        action: "admin/hrm/attendance/sys/outRule/getList",
        rightBtns: [
          {
            mode: 'detail_auto',
            title: '详细',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-outrule-view')
          },
          {
            mode: 'update',
            title: '编辑',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-outrule-edit')
          },
          {
            mode: 'delete',
            title: '删除',
            show: () => this.$hasRole('admin') || this.$hasPermission('attendance-outrule-delete')
          }
        ],
        columns: [
          {
            key: "out_office_cancel_absence",
            title: "外勤抵消缺勤",
            type: "switch",
            width: colWidth - 60,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "out_office_cancel_late",
            title: "外勤抵消迟到",
            type: "switch",
            width: colWidth - 60,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "out_office_cancel_early",
            title: "外勤抵消早退",
            type: "switch",
            width: colWidth - 60,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "business_trip_cancel_absence",
            title: "出差抵消缺勤",
            type: "switch",
            width: colWidth - 60,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "business_trip_cancel_late",
            title: "出差抵消迟到",
            type: "switch",
            width: colWidth - 60,
            formatter: (val) => val ? '是' : '否'
          },
          {
            key: "business_trip_cancel_early",
            title: "出差抵消早退",
            type: "switch",
            width: colWidth - 60,
            formatter: (val) => val ? '是' : '否'
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
          out_office_cancel_absence: true,
          out_office_cancel_late: false,
          out_office_cancel_early: false,
          business_trip_cancel_absence: true,
          business_trip_cancel_late: true,
          business_trip_cancel_early: true,
          status: true,
          remark: ''
        },
        props: {
          action: "",
          columns: [
            {
              key: "out_office_cancel_absence",
              title: "外勤抵消缺勤",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "out_office_cancel_late",
              title: "外勤抵消迟到",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "out_office_cancel_early",
              title: "外勤抵消早退",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "business_trip_cancel_absence",
              title: "出差抵消缺勤",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "business_trip_cancel_late",
              title: "出差抵消迟到",
              type: "switch",
              width: colWidth - 80
            },
            {
              key: "business_trip_cancel_early",
              title: "出差抵消早退",
              type: "switch",
              width: colWidth - 80
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
              width: colWidth * 2
            }
          ],
          rules: {},
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
      this.form1.props.action = 'admin/hrm/attendance/sys/outRule/add';
      this.form1.props.formType = 'add';
      this.form1.props.title = '添加外勤/出差规则';
      this.form1.props.show = true;
    },
    updateBtn({ item }) {
      this.form1.props.action = 'admin/hrm/attendance/sys/outRule/update';
      this.form1.props.formType = 'update';
      this.form1.props.title = '编辑外勤/出差规则';
      this.form1.props.show = true;
      this.form1.data = { ...item };
    },
    deleteBtn({ item, deleteFn }) {
      deleteFn({
        action: "admin/hrm/attendance/sys/outRule/delete",
        data: { _id: item._id }
      });
    },
    async resetDefault() {
      vk.confirm('确定要恢复为默认规则吗？', async (res) => {
        if (res.confirm) {
          const defaultData = {
            out_office_cancel_absence: true,
            out_office_cancel_late: false,
            out_office_cancel_early: false,
            business_trip_cancel_absence: true,
            business_trip_cancel_late: true,
            business_trip_cancel_early: true,
            status: true,
            remark: ''
          };
          try {
            const listRes = await vk.callFunction({
              url: 'admin/hrm/attendance/sys/outRule/getList',
              data: { pageSize: 1 }
            });
            const existing = listRes.rows ? listRes.rows[0] : null;
            if (existing) {
              await vk.callFunction({
                url: 'admin/hrm/attendance/sys/outRule/update',
                data: { _id: existing._id, ...defaultData }
              });
            } else {
              await vk.callFunction({
                url: 'admin/hrm/attendance/sys/outRule/add',
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