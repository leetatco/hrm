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
				<vk-data-input-tree-select v-model="form1.department_id" :localdata="departments" placeholder="请选择"
					@change="toDepartment"></vk-data-input-tree-select>
			</template>
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-shift-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>

		<!-- 表格区域：三级树形结构 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="false"
			:tree-props="table1.treeProps" row-key="_id" default-expand-all @update="updateBtn" @delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="850px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="90px" :inline="true"
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
				departments: [], // 部门下拉数据（随公司联动）
				table1: {
					action: "admin/hrm/attendance/sys/shift/getList",
					// 树形表格配置
					treeProps: {
						children: 'children',
						hasChildren: 'hasChildren'
					},
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							// 只有班次（叶子节点）显示按钮
							show: (row) => row.type === "shift" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-shift-view'))
						},
						{
							mode: 'update',
							title: '编辑',
							show: (row) => row.type === "shift" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-shift-edit'))
						},
						{
							mode: 'delete',
							title: '删除',
							show: (row) => row.type === "shift" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-shift-delete'))
						}
					],
					columns: [{
							key: "company_name", // 兜底字段，实际显示走 formatter
							title: "公司/部门/班次",
							type: "text",
							fixed: true,
							width: 320,
							formatter: (val, row) => {
								// 公司行 → 显示公司名
								if (row.type === "company") {
									return row.company_name ||
										(row.companys && row.companys.company_name) || "";
								}
								// 部门行 → 显示部门名
								if (row.type === "department") {
									return row.department_name ||
										(row.departments && row.departments.department_name) || "";
								}
								// 班次行 → 显示班次名
								if (row.type === "shift") {
									return row.shift_name || "";
								}
								return val || "";
							}
						},
						// {
						// 	key: "shift_name",
						// 	title: "班次名称",
						// 	type: "text",
						// 	width: colWidth - 40,
						// 	formatter: (val, row) => row.type === "shift" ? val : ""
						// },
						{
							key: "shift_type",
							title: "班次类型",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => {
								if (row.type !== "shift") return "";
								return val == 1 ? '固定班次' : '弹性班次';
							}
						},
						{
							key: "segments",
							title: "班次时段",
							type: "text",
							width: colWidth * 2,
							formatter: (val, row) => {
								if (row.type !== "shift") return "";
								if (!val || !Array.isArray(val) || val.length === 0) return '-';
								return val.map(seg =>
									`${seg.name} ${seg.start_time}~${seg.end_time}`).join('，');
							}
						},
						{
							key: "status",
							title: "状态",
							type: "text",
							width: colWidth - 80,
							formatter: (val, row) => {
								if (row.type !== "shift") return "";
								return val ? '启用' : '停用';
							}
						},
						{
							key: "remark",
							title: "备注",
							type: "text",
							width: colWidth,
							formatter: (val, row) => row.type === "shift" ? val : ""
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
							key: "shift_name",
							title: "班次名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "shift_type",
							title: "班次类型",
							type: "select",
							width: colWidth - 40,
							data: [{
									value: 1,
									label: "固定班次"
								},
								{
									value: 2,
									label: "弹性班次"
								}
							],
							mode: "="
						},
						{
							key: "status",
							title: "状态",
							type: "select",
							width: colWidth - 80,
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
							key: "company_id",
							title: "所属公司",
							type: "text",
							width: colWidth - 50,
							mode: "="
						},
						{
							key: "department_id",
							title: "所属部门",
							type: "text",
							width: colWidth - 50,
							mode: "="
						}
					]
				},
				form1: {
					data: {
						shift_name: '',
						shift_type: 1,
						company_id: "",
						department_id: "",
						segments: [{
								name: '上午',
								start_time: '08:30',
								end_time: '12:00'
							},
							{
								name: '下午',
								start_time: '13:30',
								end_time: '18:00'
							}
						],
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "shift_name",
								title: "班次名称",
								type: "text",
								width: colWidth,
								required: true
							},
							{
								key: "shift_type",
								title: "班次类型",
								type: "radio",
								width: colWidth,
								required: true,
								data: [{
										value: 1,
										label: "固定班次"
									},
									{
										value: 2,
										label: "弹性班次"
									}
								]
							},
							{
								key: "company_id",
								title: "所属公司",
								type: "tree-select",
								width: colWidth,
								required: true,
								action: "admin/hrm/company/sys/getList",
								props: {
									list: "rows",
									value: "company_id",
									label: "company_name",
									children: "children"
								},
								watch: async ({
									value,
									formData,
									column,
									index,
									option,
									$set
								}) => {
									// 选择公司后，动态给部门 tree-select 传 company_id 并清空已选部门
									let item = vk.pubfn.getListItem(this.form1.props.columns, "key",
										"department_id");
									item.actionData.company_id = value;
									this.$set(this.form1.data, item.key, "");
								}
							},
							{
								key: "department_id",
								title: "所属部门",
								type: "tree-select",
								width: colWidth,
								required: true,
								action: "admin/hrm/department/pub/getList",
								props: {
									list: "rows",
									value: "department_id",
									label: "department_name",
									children: "children"
								},
								actionData: {
									company_id: "", // 关联 company_id 的值
								}
							},
							{
								key: "status",
								title: "状态",
								type: "switch",
								width: colWidth - 80,
								defaultValue: true
							},
							{
								key: "remark",
								title: "备注",
								type: "text",
								width: colWidth
							},
							{
								key: "segments",
								title: "班次时段",
								type: "array<object>",
								itemWidth: 300,
								showAdd: true,
								showClear: true,
								columnIndexWidth: 50,
								defaultValue: {
									name: "",
									start_time: "",
									end_time: ""
								},
								rightBtns: ['copy', 'delete'],
								columns: [{
										key: "name",
										title: "时段名称",
										type: "text",
										width: 150,
										isUnique: true,
										rules: [{
											required: true,
											message: "名称不能为空",
											trigger: ["change", "blur"]
										}]
									},
									{
										key: "start_time",
										title: "上班时间",
										type: "time",
										width: 180,
										valueFormat: "HH:mm",
										pickerOptions: {
											format: "HH:mm"
										},
										rules: [{
											required: true,
											message: "上班时间不能为空",
											trigger: ["change", "blur"]
										}]
									},
									{
										key: "end_time",
										title: "下班时间",
										type: "time",
										width: 180,
										valueFormat: "HH:mm",
										pickerOptions: {
											format: "HH:mm"
										},
										rules: [{
											required: true,
											message: "下班时间不能为空",
											trigger: ["change", "blur"]
										}]
									}
								]
							}
						],
						rules: {
							shift_name: [{
								required: true,
								message: "班次名称不能为空",
								trigger: "blur"
							}],
							shift_type: [{
								required: true,
								message: "班次类型不能为空",
								trigger: "change"
							}],
							company_id: [{
								required: true,
								message: "所属公司不能为空",
								trigger: ['blur', 'change']
							}],
							department_id: [{
								required: true,
								message: "所属部门不能为空",
								trigger: ['blur', 'change']
							}],
							segments: [{
								validator: (rule, value, callback) => {
									if (!value || value.length === 0) {
										callback(new Error('至少需要一个时段'));
									} else if (value.some(seg => !seg.name || !seg.start_time ||
											!seg.end_time)) {
										callback(new Error('时段信息不完整'));
									} else {
										callback();
									}
								},
								trigger: 'change'
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				}
			};
		},
		watch: {
			'form1.data.shift_type'(newVal) {
				// 弹性班次逻辑后续扩展
			}
		},
		onLoad(options = {}) {
			this.options = options;
			this.init(options);
		},
		methods: {
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			// 表单重置
			resetForm() {
				this.departments = [];
				this.$set(this.form1, "department_id", "");
				vk.pubfn.resetForm(originalForms, this);
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/shift/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加班次';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				// 只有班次（叶子节点）允许编辑
				if (item.type !== "shift") return;

				// 编辑时，让部门 tree-select 按当前行公司联动
				let departmentItem = vk.pubfn.getListItem(this.form1.props.columns, "key", "department_id");
				departmentItem.actionData.company_id = item.company_id;

				this.form1.props.action = 'admin/hrm/attendance/sys/shift/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑班次';
				this.form1.props.show = true;
				this.form1.data = {
					...item,
					segments: item.segments || []
				};
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				// 只有班次（叶子节点）允许删除
				if (item.type !== "shift") return;

				deleteFn({
					action: "admin/hrm/attendance/sys/shift/delete",
					data: {
						_id: item._id
					}
				});
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
				this.$refs.table1.queryParam.formData.department_id = "";
				this.$set(this.form1.data, "department_id", "");

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