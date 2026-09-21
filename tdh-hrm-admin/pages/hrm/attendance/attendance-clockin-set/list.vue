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
					v-if="$hasRole('admin') || $hasPermission('attendance-wificonfig-add')"
					@click="addBtn">添加打卡点</el-button>
			</el-row>
		</view>

		<!-- 表格区域：树形结构 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="false"
			:tree-props="table1.treeProps" row-key="_id" default-expand-all @update="updateBtn" @delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="950px" mode="form"
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
				departments: [],
				table1: {
					action: "admin/hrm/clockin/sys/setting/getList",
					// 树形表格配置
					treeProps: {
						children: 'children',
						hasChildren: 'hasChildren'
					},
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (row) => row.type === "clockin" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-wificonfig-view'))
						},
						{
							mode: 'update',
							title: '编辑',
							show: (row) => row.type === "clockin" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-wificonfig-edit'))
						},
						{
							mode: 'delete',
							title: '删除',
							show: (row) => row.type === "clockin" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-wificonfig-delete'))
						}
					],
					columns: [{
							key: "company_name", // 用兜底字段，实际显示走 formatter
							title: "公司/部门",
							type: "text",
							fixed: true,
							width: 320,
							formatter: (val, row) => {
								// 公司行 → 显示公司名
								if (row.type === "company") {
									return row.company_name || (row.companys && row.companys.company_name) || "";
								}
								// 打卡点行（部门） → 显示部门名
								if (row.type === "clockin") {
									return row.department_name ||
										(row.departments && row.departments.department_name) || "";
								}
								return val || "";
							}
						},
						{
							key: "address",
							title: "位置",
							type: "text",
							width: colWidth,
							formatter: (val, row) => row.type === "clockin" ? val : ""
						},
						{
							key: "bssid",
							title: "WiFi名称",
							type: "text",
							width: colWidth,
							formatter: (val, row) => row.type === "clockin" ? val : ""
						},
						{
							key: "ssid",
							title: "WiFi Mac",
							type: "text",
							width: colWidth,
							formatter: (val, row) => row.type === "clockin" ? val : ""
						},
						{
							key: "signalStrength",
							title: "信号强度",
							type: "number",
							width: colWidth - 60,
							formatter: (val, row) => row.type === "clockin" ? val : ""
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
							key: "address",
							title: "位置",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "bssid",
							title: "WiFi名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							"key": "company_id",
							"title": "所属公司",
							"type": "text",
							"width": colWidth - 50,
							"mode": "="
						},
						{
							"key": "department_id",
							"title": "所属部门",
							"type": "text",
							"width": colWidth - 50,
							"mode": "="
						}
					]
				},
				form1: {
					data: {
						address: '',
						longitude: 0,
						latitude: 0,
						distance_in: 100,
						bssid: '',
						ssid: '',
						signalStrength: 0
					},
					props: {
						action: "",
						columns: [{
								key: "address",
								title: "位置描述",
								type: "text",
								width: colWidth,
								required: true,
								placeholder: "如：公司一楼大厅"
							},
							{
								key: "bssid",
								title: "WiFi名称 (BSSID)",
								type: "text",
								width: colWidth,
								required: true,
								placeholder: "连接的WiFi名"
							},
							{
								key: "ssid",
								title: "WiFi Mac (SSID)",
								type: "text",
								width: colWidth,
								required: true,
								placeholder: "WiFi路由器MAC地址"
							},
							{
								key: "signalStrength",
								title: "最低信号强度",
								type: "number",
								width: colWidth - 60,
								description: "0～100，低于此值可能无法打卡"
							},
							{
								key: "company_id",
								title: "所属公司",
								type: "tree-select",
								width: colWidth,
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
								action: "admin/hrm/department/pub/getList",
								props: {
									list: "rows",
									value: "department_id",
									label: "department_name",
									children: "children"
								},
								actionData: {
									company_id: "",
								},
								width: colWidth
							}
						],
						rules: {
							department_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							company_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							signalStrength: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							address: [{
								required: true,
								message: "位置描述不能为空",
								trigger: "blur"
							}],
							bssid: [{
								required: true,
								message: "WiFi名称不能为空",
								trigger: "blur"
							}],
							ssid: [{
								required: true,
								message: "WiFi Mac不能为空",
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
				this.$set(this.form1, "department_id", "");				
				vk.pubfn.resetForm(originalForms, this);
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/clockin/sys/setting/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加打卡点';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				// 只有打卡点（叶子节点）允许编辑
				if (item.type !== "clockin") return;

				let departmentItem = vk.pubfn.getListItem(this.form1.props.columns, "key", "department_id");
				departmentItem.actionData.company_id = item.company_id;
				this.form1.props.action = 'admin/hrm/clockin/sys/setting/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑打卡点';
				this.form1.props.show = true;
				this.form1.data = {
					...item
				};
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				if (item.type !== "clockin") return;

				deleteFn({
					action: "admin/hrm/clockin/sys/setting/delete",
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
			async toCompany(e) {
				this.departments = [];
				this.$refs.table1.queryParam.formData.department_id = "";
				this.$set(this.form1.data, "department_id", "");

				if (!e) {
					this.search();
					return;
				}

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

				const treeData = [{
					value: e,
					label: companyLabel || "公司",
					children: deptTree
				}];

				this.departments = treeData;
				this.search();
			},
			toDepartment(e) {				
				console.log(this.form1);
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