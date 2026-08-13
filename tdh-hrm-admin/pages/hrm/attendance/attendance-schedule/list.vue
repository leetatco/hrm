<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-schedule-add')" @click="addBtn">添加</el-button>
				<el-button type="primary" size="small" icon="el-icon-refresh"
					v-if="$hasRole('admin') || $hasPermission('attendance-schedule-batch')"
					@click="openBatchGenerate">批量生成</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="800px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="120px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
		</vk-data-dialog>

		<!-- 批量生成弹窗 -->
		<batchGenerate v-model="formDatas.batchGenerate" @success="batchSuccess"></batchGenerate>
	</view>
</template>

<script>
	let vk = uni.vk;
	let originalForms = {};
	const colWidth = 200;
	import batchGenerate from '@/components/attendance-batchGenerate/index.vue'
	export default {
		components: {
			batchGenerate
		},
		data() {
			return {
				formDatas: {
					batchGenerate: {
						show: false,
						item: {}
					}
				},
				table1: {
					action: "admin/hrm/attendance/sys/schedule/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-schedule-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-schedule-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-schedule-delete')
						}
					],
					columns: [{
							key: "employee_id",
							title: "员工工号",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : ''
						},
						{
							key: "schedule_date",
							title: "排班日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							width: colWidth - 60
						},
						{
							key: "shift_id",
							title: "班次",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => {
								if (!val) return '休息';
								return row.shiftInfo ? row.shiftInfo.shift_name : val;
							}
						},
						{
							key: "attendance_group_id",
							title: "考勤组",
							type: "text",
							width: colWidth,
							formatter: (val, row) => row.groupInfo ? row.groupInfo.group_name : ''
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
				queryForm1: {
					formData: {},
					columns: [{
							key: "attendance_group_id",
							title: "考勤组",
							type: "remote-select",
							placeholder: "请选择考勤组",
							width: colWidth,
							action: "admin/hrm/attendance/sys/group/getList",
							props: {
								list: "rows",
								value: "_id",
								label: "group_name"
							},
							showAll: true,
							actionData: {
								pageSize: 1000,
								status: true
							},
							mode: "="
						},
						{
							key: "employee_id",
							title: "员工",
							type: "table-select",
							placeholder: "请选择员工",
							width: colWidth + 40,
							action: "admin/hrm/employees/sys/getList",
							multiple: false,
							columns: [{
									key: "employee_id",
									title: "工号",
									type: "text",
									idKey: true
								},
								{
									key: "employee_name",
									title: "姓名",
									type: "text",
									nameKey: true
								}
							],
							queryColumns: [{
									key: "employee_id",
									title: "工号",
									type: "text",
									width: 150,
									mode: "%%"
								},
								{
									key: "employee_name",
									title: "姓名",
									type: "text",
									width: 150,
									mode: "%%"
								}
							],
							mode: "="
						},
						{
							key: "schedule_date_range",
							title: "日期范围",
							type: "datetimerange",
							width: colWidth + 100,
							mode: "between",
							startKey: "schedule_date_start",
							endKey: "schedule_date_end"
						}
					]
				},
				form1: {
					data: {
						employee_id: '',
						schedule_date: '',
						shift_id: '',
						attendance_group_id: '',
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "employee_id",
								title: "员工",
								type: "table-select",
								placeholder: "请选择员工",
								width: colWidth,
								required: true,
								action: "admin/hrm/employees/sys/getList",
								multiple: false,
								columns: [{
										key: "employee_id",
										title: "工号",
										type: "text",
										idKey: true
									},
									{
										key: "employee_name",
										title: "姓名",
										type: "text",
										nameKey: true
									}
								],
								queryColumns: [{
										key: "employee_id",
										title: "工号",
										type: "text",
										width: 150,
										mode: "%%"
									},
									{
										key: "employee_name",
										title: "姓名",
										type: "text",
										width: 150,
										mode: "%%"
									}
								]
							},
							{
								key: "schedule_date",
								title: "排班日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM-dd",
								width: colWidth - 60,
								required: true
							},
							{
								key: "shift_id",
								title: "班次",
								type: "remote-select",
								placeholder: "选择班次（留空为休息）",
								width: colWidth - 60,
								action: "admin/hrm/attendance/sys/shift/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "shift_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000,
									status: true
								}
							},
							{
								key: "attendance_group_id",
								title: "考勤组",
								type: "remote-select",
								placeholder: "所属考勤组（可选）",
								width: colWidth,
								action: "admin/hrm/attendance/sys/group/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "group_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000,
									status: true
								}
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
							employee_id: [{
								required: true,
								message: "员工不能为空",
								trigger: "change"
							}],
							schedule_date: [{
								required: true,
								message: "日期不能为空",
								trigger: "blur"
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				}
			};
		},
		onLoad() {
			originalForms = {
				form1: vk.pubfn.copyObject(this.form1)
			};
		},
		methods: {
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/schedule/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加排班';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/schedule/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑排班';
				this.form1.props.show = true;
				this.form1.data = {
					...item
				};
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/schedule/delete",
					data: {
						_id: item._id
					}
				});
			},
			// 批量生成：按考勤组为所有成员在日期范围内生成默认班次
			openBatchGenerate() {
				// 可以传入当前搜索的考勤组 ID 作为默认值，这里简单传空
				this.formDatas.batchGenerate = {
					show: true,
					item: {}
				};
			},
			batchSuccess(data) {				
				vk.alert(`成功生成 ${data.count} 条排班记录`, '提示', () => {
					this.refresh();
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {
		padding: 20rpx;
	}

	.btn-group {
		margin: 20rpx 0;
	}
</style>