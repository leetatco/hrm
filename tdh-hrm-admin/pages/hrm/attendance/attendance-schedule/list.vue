<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:company_id="{form}">
				<vk-data-input-tree-select v-model="form.company_id" action="admin/hrm/company/sys/getList"
					:props="{ list:'rows', value:'company_id', label:'company_name', children:'children' }"
					@change="toCompany" placeholder="请选择"></vk-data-input-tree-select>
			</template>
			<template v-slot:department_id="{form}">
				<vk-data-input-tree-select v-model="form.department_id" :localdata="departments" placeholder="请选择"
					@change="toDepartment"></vk-data-input-tree-select>
			</template>
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<el-row>
			<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
				v-if="$hasRole('admin') || $hasPermission('attendance-schedule-add')" @click="addBtn">添加</el-button>
			<el-button type="primary" size="small" icon="el-icon-refresh"
				v-if="$hasRole('admin') || $hasPermission('attendance-schedule-batch')"
				@click="openBatchGenerate">批量生成</el-button>
			<!-- 批量操作 -->
			<el-dropdown
				v-if="table1.multipleSelection && ($hasRole('admin') || $hasPermission('attendance-schedule-add'))"
				:split-button="false" trigger="click" @command="batchBtn">
				<el-button type="danger" size="small" style="margin-left: 20rpx;"
					:disabled="table1.multipleSelection.length === 0">
					批量处理<i class="el-icon-arrow-down el-icon--right"></i>
				</el-button>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item :command="1">删除</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</el-row>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" @selection-change="selectionChange" :selection="true" :row-no="false"
			:pagination="true" @update="updateBtn" @delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="600px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="120px" :inline="true"
				:columnsNumber="1" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
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
				departments: [], // 部门下拉数据（随公司联动）
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
							key: "employeeInfo.companys.company_name",
							title: "所属公司",
							type: "text",
							fixed: true,
							width: colWidth - 50
						}, {
							key: "employeeInfo.departments.department_name",
							title: "所属部门",
							type: "text",
							fixed: true,
							width: colWidth
						}, {
							key: "employee_id",
							title: "员工工号",
							type: "text",
							width: colWidth - 100,
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
							width: colWidth - 100
						},
						{
							key: "attendance_group_id",
							title: "考勤组",
							type: "text",
							width: colWidth,
							formatter: (val, row) => row.groupInfo ? row.groupInfo.group_name : ''
						},
						{
							key: "shift_name",
							title: "班次",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => {
								// 班次来自考勤组，若考勤组存在班次则展示，否则显示休息
								if (row.groupInfo && row.groupInfo.shiftInfo && row.groupInfo.shiftInfo
									.shift_name) {
									return row.groupInfo.shiftInfo.shift_name;
								}
								return row.shift_id ? '已配置' : '休息';
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
					],
					multipleSelection: [],
					selectItem: ""
				},
				queryForm1: {
					formData: {},
					columns: [{
							key: "attendance_group_id",
							title: "考勤组",
							type: "cascader",
							placeholder: "请选择考勤组",
							width: colWidth + 100,
							action: "admin/hrm/attendance/sys/schedule/getCascader",
							props: {
								list: "rows",
								value: "_id",
								label: "label",
								children: "children",
								emitPath: false
							},
							mode: "="
						},
						{
							key: "company_id",
							title: "所属公司",
							type: "text", // 用 slot 自定义渲染，这里占位
							width: colWidth,
							mode: "="
						},
						{
							key: "department_id",
							title: "所属部门",
							type: "text", // 用 slot 自定义渲染，这里占位
							width: colWidth,
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
								key: "attendance_group_id",
								title: "考勤组",
								type: "cascader",
								placeholder: "请选择考勤组（含班次）",
								width: colWidth + 100,
								required: true,
								action: "admin/hrm/attendance/sys/schedule/getCascader",
								props: {
									list: "rows",
									value: "_id",
									label: "label",
									children: "children",
									emitPath: false
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
								width: colWidth + 100
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
							}],
							attendance_group_id: [{
								required: true,
								message: "考勤组不能为空",
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
			refresh() {
				this.$refs.table1.refresh();
			},
			getCurrentRow() {
				return this.$refs.table1.getCurrentRow();
			},
			currentChange(val) {
				this.table1.selectItem = val;
			},
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},
			resetForm() {
				this.departments = [];
				vk.pubfn.resetForm(originalForms, this);
			},
			async search() {
				this.$refs.table1.search();
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
			openBatchGenerate() {
				this.formDatas.batchGenerate = {
					show: true,
					item: {}
				};
			},
			async batchDels() {
				try {
					const ids = this.table1.multipleSelection.map(item => item._id);
					let res = await vk.callFunction({
						url: 'admin/hrm/attendance/sys/schedule/deleteAll',
						title: '请求中...',
						data: {
							ids: ids
						}
					})
					vk.alert('批量删除成功', '确定', () => {
						this.refresh();
					});
				} catch (error) {
					vk.alert('操作异常：' + error.message);
				}
			},
			batchBtn(index) {
				switch (index) {
					case 1:
						this.batchDels();
						break;
					default:
						break;
				}
			},
			batchSuccess(data) {
				vk.alert(data.msg, '提示', () => {
					this.refresh();
				})
			},
			// 递归转换成 tree-select 需要的结构
			toTreeData(originalData) {
				if (!originalData || !Array.isArray(originalData)) return [];
				const convertNode = (node) => {
					return {
						value: node.department_id,
						label: node.department_name,
						manager: node.department_manager_id,
						children: node.children && node.children.length > 0 ?
							node.children.map(child => convertNode(child)) : []
					};
				};
				return originalData
					.filter(item => vk.pubfn.isNull(item.parent_department_id))
					.map(root => convertNode(root));
			},
			// 选择公司 → 联动加载部门下拉
			async toCompany(e) {
				this.departments = [];
				this.$set(this.queryForm1.formData, "department_id", "");

				if (!e) {
					this.search();
					return;
				}

				// 拿公司名（用于 tree-select 根节点 label）
				let companyLabel = "";
				let companyList = this.$refs.queryForm1 && this.$refs.queryForm1.options ?
					this.$refs.queryForm1.options.company_id : null;
				if (Array.isArray(companyList)) {
					const found = companyList.find(o => o.value === e);
					if (found) companyLabel = found.label;
				}

				let res = await vk.callFunction({
					url: 'admin/hrm/department/pub/getList',
					title: '请求中...',
					data: {
						company_id: e
					},
				});

				const deptTree = this.toTreeData(res.rows || []);

				// 把"公司"作为根节点包裹，形成"公司 → 部门"层级
				const treeData = [{
					value: e,
					label: companyLabel || "公司",
					children: deptTree
				}];

				this.departments = treeData;
				this.search();
			},
			toDepartment(e) {
				this.$set(this.queryForm1.formData, "department_id", e);
				this.search();
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