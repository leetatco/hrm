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
					v-if="$hasRole('admin') || $hasPermission('attendance-exemption-add')"
					@click="addBtn">添加</el-button>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('attendance-exemption-export')"
					@click="exportExcel">导出全部</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="700px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="120px"
				:columnsNumber="1" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
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
					action: "admin/hrm/attendance/sys/exemption/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-exemption-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-exemption-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-exemption-delete')
						}
					],
					columns: [{
							key: "exemption_type",
							title: "豁免类型",
							type: "tag",
							width: colWidth - 80,
							fixed: true,
							data: [{
									value: 1,
									label: "按员工",
									tagType: ""
								},
								{
									value: 2,
									label: "按部门",
									tagType: "success"
								},
								{
									value: 3,
									label: "按考勤组",
									tagType: "warning"
								}
							]
						},
						{
							key: "exemption_target",
							title: "豁免对象",
							type: "text",
							width: colWidth * 2,
							formatter: (val, row) => {
								if (row.exemption_type === 1) {
									// 按员工
									const names = (row.employeeInfo || []).map(e => e.employee_name)
										.filter(Boolean);
									return names.length > 0 ? names.join('、') :
										`${(row.employee_ids || []).length}名员工`;
								}
								if (row.exemption_type === 2) {
									// 按部门
									const names = (row.departmentInfo || []).map(d => d.department_name)
										.filter(Boolean);
									return names.length > 0 ? names.join('、') :
										`${(row.department_ids || []).length}个部门`;
								}
								if (row.exemption_type === 3) {
									// 按考勤组
									const names = (row.groupInfo || []).map(g => g.group_name)
										.filter(Boolean);
									return names.length > 0 ? names.join('、') :
										`${(row.attendance_group_ids || []).length}个考勤组`;
								}
								return '-';
							}
						},
						{
							key: "start_date",
							title: "生效开始",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "end_date",
							title: "生效结束",
							type: "text",
							width: colWidth - 60,
							formatter: (val) => val || '长期有效'
						},
						{
							key: "reason",
							title: "豁免原因",
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
							width: colWidth,
							show: ["detail"]
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
							key: "exemption_type",
							title: "豁免类型",
							type: "select",
							width: colWidth - 80,
							data: [{
									value: 1,
									label: "按员工"
								},
								{
									value: 2,
									label: "按部门"
								},
								{
									value: 3,
									label: "按考勤组"
								}
							],
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
						},
						{
							key: "reason",
							title: "豁免原因",
							type: "text",
							width: colWidth,
							mode: "%%"
						}
					]
				},
				form1: {
					data: {
						exemption_type: 1,
						employee_ids: [],
						department_ids: [],
						attendance_group_ids: [],
						start_date: '',
						end_date: '',
						reason: '',
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "exemption_type",
								title: "豁免类型",
								type: "radio",
								width: colWidth,
								required: true,
								data: [{
										value: 1,
										label: "按员工"
									},
									{
										value: 2,
										label: "按部门"
									},
									{
										value: 3,
										label: "按考勤组"
									}
								],
								watch: ({
									value,
									formData,
									$set
								}) => {
									// 切换类型时清空其他类型的值
									if (value === 1) {
										$set(formData, 'department_ids', []);
										$set(formData, 'attendance_group_ids', []);
									} else if (value === 2) {
										$set(formData, 'employee_ids', []);
										$set(formData, 'attendance_group_ids', []);
									} else if (value === 3) {
										$set(formData, 'employee_ids', []);
										$set(formData, 'department_ids', []);
									}
								}
							},
							{
								key: "employee_ids",
								title: "豁免员工",
								type: "table-select",
								placeholder: "请选择员工（可多选）",
								width: colWidth * 2,
								multiple: true,
								action: "admin/hrm/employees/sys/getList",
								columns: [{
										key: "employee_id",
										title: "员工工号",
										type: "text",
										idKey: true
									},
									{
										key: "employee_name",
										title: "员工姓名",
										type: "text",
										nameKey: true
									}
								],
								queryColumns: [{
										key: "employee_id",
										title: "员工工号",
										type: "text",
										width: 150,
										mode: "%%"
									},
									{
										key: "employee_name",
										title: "员工姓名",
										type: "text",
										width: 150,
										mode: "%%"
									}
								],
								show: ({
									formData
								}) => formData.exemption_type === 1,
								rules: [{
									validator: (rule, value, callback) => {
										if (this.form1.data.exemption_type === 1 && (!value ||
												value.length === 0)) {
											callback(new Error('请至少选择一个员工'));
										} else {
											callback();
										}
									},
									trigger: 'change'
								}]
							},
							{
								key: "department_ids",
								title: "豁免部门",
								type: "tree-select",
								placeholder: "请选择部门（可多选）",
								width: colWidth * 2,
								multiple: true,
								action: "admin/hrm/department/pub/getList",
								props: {
									list: "rows",
									value: "department_id",
									label: "department_name",
									children: "children"
								},
								show: ({
									formData
								}) => formData.exemption_type === 2,
								rules: [{
									validator: (rule, value, callback) => {
										if (this.form1.data.exemption_type === 2 && (!value ||
												value.length === 0)) {
											callback(new Error('请至少选择一个部门'));
										} else {
											callback();
										}
									},
									trigger: 'change'
								}]
							},
							{
								key: "attendance_group_ids",
								title: "豁免考勤组",
								type: "remote-select",
								placeholder: "请选择考勤组（可多选）",
								width: colWidth * 2,
								multiple: true,
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
								show: ({
									formData
								}) => formData.exemption_type === 3,
								rules: [{
									validator: (rule, value, callback) => {
										if (this.form1.data.exemption_type === 3 && (!value ||
												value.length === 0)) {
											callback(new Error('请至少选择一个考勤组'));
										} else {
											callback();
										}
									},
									trigger: 'change'
								}]
							},
							{
								key: "start_date",
								title: "生效开始日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM-dd",
								width: colWidth,
								required: true
							},
							{
								key: "end_date",
								title: "生效结束日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM-dd",
								width: colWidth,
								tips: "留空表示长期有效"
							},
							{
								key: "reason",
								title: "豁免原因",
								type: "text",
								width: colWidth * 2,
								required: true,
								placeholder: "如：高管、外派、试用期不打卡等"
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
							exemption_type: [{
								required: true,
								message: "豁免类型不能为空",
								trigger: "change"
							}],
							start_date: [{
								required: true,
								message: "生效开始日期不能为空",
								trigger: "blur"
							}],
							reason: [{
								required: true,
								message: "豁免原因不能为空",
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
				this.form1.props.action = 'admin/hrm/attendance/sys/exemption/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加考勤豁免';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/exemption/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑考勤豁免';
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
					action: "admin/hrm/attendance/sys/exemption/delete",
					data: {
						_id: item._id
					}
				});
			},
			async exportExcel() {
				this.$refs.table1.exportExcel({
					fileName: '考勤豁免',
					title: "正在导出数据...",
					columns: [{
							key: "exemption_type",
							title: "豁免类型",
							type: "text",
							formatter: (val) => {
								const map = {
									1: '按员工',
									2: '按部门',
									3: '按考勤组'
								};
								return map[val] || val;
							}
						},
						{
							key: "exemption_target",
							title: "豁免对象",
							type: "text",
							formatter: (val, row) => {
								if (row.exemption_type === 1) {
									const names = (row.employeeInfo || []).map(e => e.employee_name).filter(
										Boolean);
									return names.length > 0 ? names.join('、') :
										`${(row.employee_ids || []).length}名员工`;
								}
								if (row.exemption_type === 2) {
									const names = (row.departmentInfo || []).map(d => d.department_name)
										.filter(Boolean);
									return names.length > 0 ? names.join('、') :
										`${(row.department_ids || []).length}个部门`;
								}
								if (row.exemption_type === 3) {
									const names = (row.groupInfo || []).map(g => g.group_name).filter(Boolean);
									return names.length > 0 ? names.join('、') :
										`${(row.attendance_group_ids || []).length}个考勤组`;
								}
								return '-';
							}
						},
						{
							key: "start_date",
							title: "生效开始",
							type: "text"
						},
						{
							key: "end_date",
							title: "生效结束",
							type: "text",
							formatter: (val) => val || '长期有效'
						},
						{
							key: "reason",
							title: "豁免原因",
							type: "text"
						},
						{
							key: "status",
							title: "启用",
							type: "text",
							formatter: (val) => val ? '启用' : '停用'
						},
						{
							key: "remark",
							title: "备注",
							type: "text"
						},
						{
							key: "update_date",
							title: "更新时间",
							type: "time",
							valueFormat: "yyyy-MM-dd hh:mm:ss"
						},
						{
							key: "users.nickname",
							title: "更新人",
							type: "text"
						}
					],
					pageIndex: 1,
					pageSize: -1
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