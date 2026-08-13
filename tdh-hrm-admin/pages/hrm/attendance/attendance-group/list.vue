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
					v-if="$hasRole('admin') || $hasPermission('attendance-group-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="950px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="140px" :inline="true"
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
					action: "admin/hrm/attendance/sys/group/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-group-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-group-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-group-delete')
						}
					],
					columns: [{
							key: "group_name",
							title: "考勤组名称",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "company_name",
							title: "所属公司",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.companyInfo ? row.companyInfo.company_name : ''
						},
						{
							key: "department_ids",
							title: "包含部门",
							type: "text",
							width: colWidth,
							formatter: (val) => val ? `${val.length}个部门` : ''
						},
						{
							key: "shift_name",
							title: "默认班次",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.shiftInfo ? row.shiftInfo.shift_name : ''
						},
						{
							key: "overtime_rule_name",
							title: "加班规则",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.overtimeRuleInfo ? row.overtimeRuleInfo.rule_name : ''
						},
						{
							key: "punch_rule_name",
							title: "打卡规则",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.punchRuleInfo ? row.punchRuleInfo.rule_name : ''
						},
						{
							key: "calendar_id",
							title: "工作日历",
							type: "text",
							width: colWidth - 60,
							formatter: (val) => val ? `${val}年` : '系统默认'
						},
						{
							key: "total_employees",
							title: "覆盖人数",
							type: "number",
							width: colWidth - 80,
							formatter: (val, row) => {
								if (vk.pubfn.isNotNull(val)) return val;
								return row.employee_ids ? row.employee_ids.length : 0;
							}
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
							key: "group_name",
							title: "考勤组名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "company_id",
							title: "所属公司",
							type: "remote-select",
							placeholder: "请选择公司",
							width: colWidth,
							action: "admin/hrm/company/sys/getList",
							props: {
								list: "rows",
								value: "company_id",
								label: "company_name"
							},
							showAll: true,
							actionData: {
								pageSize: 1000,
								status: true
							},
							mode: "="
						},
						{
							key: "status",
							title: "启用状态",
							type: "select",
							width: colWidth - 100,
							data: [{
									value: true,
									label: "启用"
								},
								{
									value: false,
									label: "停用"
								}
							],
							mode: "="
						}
					]
				},
				form1: {
					data: {
						group_name: '',
						company_id: '',
						department_ids: [],
						shift_id: '',
						overtime_rule_id: '',
						punch_rule_id: '',
						calendar_id: '',
						employee_ids: [],
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "group_name",
								title: "考勤组名称",
								type: "text",
								width: colWidth,
								required: true
							},
							{
								key: "shift_id",
								title: "默认班次",
								type: "remote-select",
								placeholder: "请选择班次",
								width: colWidth,
								required: true,
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
								key: "overtime_rule_id",
								title: "加班规则",
								type: "remote-select",
								placeholder: "请选择加班规则",
								width: colWidth,
								action: "admin/hrm/attendance/sys/overtimeRule/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "rule_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000,
									status: true
								}
							},
							{
								key: "punch_rule_id",
								title: "打卡规则",
								type: "remote-select",
								placeholder: "请选择打卡规则",
								width: colWidth,
								action: "admin/hrm/attendance/sys/sign/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "rule_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000,
									status: true
								}
							},
							{
								key: "calendar_id",
								title: "工作日历",
								type: "remote-select",
								placeholder: "请选择年份",
								width: colWidth,
								action: "admin/hrm/attendance/sys/calendar/getYearList",
								props: {
									list: "rows",
									value: "value",
									label: "label"
								},
								showAll: true,
								actionData: {
									pageSize: 100
								}
							},
							{
								key: "company_id",
								title: "所属公司",
								type: "tree-select",
								placeholder: "请选择所属公司",
								width: colWidth,
								required: true,
								action: "admin/hrm/company/sys/getList",
								props: {
									list: "rows",
									value: "company_id",
									label: "company_name",
									children: "children"
								},
								watch: ({
									value,
									formData,
									column,
									index,
									option,
									$set
								}) => {
									// 切换公司时清空已选部门并更新部门接口参数
									let item = vk.pubfn.getListItem(this.form1.props.columns, "key",
										"department_ids");
									if (item) {
										item.actionData.company_id = value;
									}
									this.$set(this.form1.data, "department_ids", []);
								}
							},
							{
								key: "department_ids",
								title: "包含部门",
								type: "tree-select",
								placeholder: "请选择部门（可多选）",
								width: colWidth,
								multiple: true,
								action: "admin/hrm/department/pub/getList",
								props: {
									list: "rows",
									value: "department_id",
									label: "department_name",
									children: "children"
								},
								actionData: {
									company_id: "" // 根据公司动态加载
								},
								required: true
							},
							{
								key: "employee_ids",
								title: "额外员工",
								type: "table-select",
								placeholder: "部门外另行指定",
								width: colWidth,
								multiple: true,
								action: "admin/hrm/employees/sys/getList",
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
							group_name: [{
								required: true,
								message: "考勤组名称不能为空",
								trigger: "blur"
							}],
							company_id: [{
								required: true,
								message: "所属公司不能为空",
								trigger: "change"
							}],
							department_ids: [{
								required: true,
								message: "至少选择一个部门",
								trigger: "change"
							}],
							shift_id: [{
								required: true,
								message: "默认班次不能为空",
								trigger: "change"
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
				this.form1.props.action = 'admin/hrm/attendance/sys/group/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加考勤组';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				let departmentItem = vk.pubfn.getListItem(this.form1.props.columns, "key", "department_ids");
				departmentItem.actionData.company_id = item.company_id;
				this.form1.props.action = 'admin/hrm/attendance/sys/group/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑考勤组';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/group/delete",
					data: {
						_id: item._id
					}
				});
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