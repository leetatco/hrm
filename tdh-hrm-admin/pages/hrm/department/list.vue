<template>
	<view class="page-body">
		<!-- 页面内容开始 -->
		<!-- 表格搜索组件开始 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:company_id="{form}">
				<vk-data-input-tree-select v-model="form.company_id" action="admin/hrm/company/sys/getList"
					:props="{ list:'rows', value:'company_id', label:'company_name',children:'children' }"
					@change="toCompany" placeholder="请选择"></vk-data-input-tree-select>
			</template>
			<!-- 显示department_id的值，必须用form1.department_id -->
			<template v-slot:department_id="{form}">
				<vk-data-input-tree-select v-model="form1.department_id" :localdata="departments" placeholder="请选择"
					@change="toDepartment"></vk-data-input-tree-select>
			</template>
		</vk-data-table-query>
		<!-- 表格搜索组件结束 -->
		<!-- 自定义按钮区域开始 -->
		<view class="vk-table-button-box">
			<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
				v-if="$hasRole('admin') || $hasPermission('hrm-employee-config-add')" @click="addBtn">添加</el-button>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :default-expand-all="false" @update="updateBtn" @delete="deleteBtn"
			@current-change="currentChange" @selection-change="selectionChange" @success="tableSuccess"
			:tree-props="table1.treeProps">
			<!-- 排序值 -->
			<template v-slot:sort="{ row, column, index }"
				v-if="$hasRole('admin') || $hasPermission('hrm-employee-config-add')">
				<el-input-number v-model="row.sort" size="mini" :precision="0" :min="0" v-if="row.type!=='company'"
					@change="sortChange($event, row)" />
			</template>
		</vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="700px" mode="form">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="80px"
				@success="formSuccess"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	import getPluginMenu from './libs/pluginMenu.js'
	const pluginMenuJsons = getPluginMenu();
	let that; // 当前页面对象
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据	
	const colWidth = 200;
	export default {
		data() {
			// 页面数据变量
			return {
				departments: [],
				pluginMenus: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 新增树形配置
					treeProps: {
						children: 'children',
						hasChildren: 'hasChildren'
					},
					// 表格数据请求地址
					action: "admin/hrm/department/sys/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							key: "department_name",
							title: "部门/公司名称",
							type: "html",
							width: colWidth,
							align: "left",
							formatter: function(val, row, column, index) {
								// 区分公司和部门图标
								let icon = row.type === "company" ?
									"el-icon-office-building" :
									"el-icon-tickets";
								return `<i class="${icon}" style="margin-right: 10px;"></i><text>${row.department_name}</text>`;
							}
						},
						{
							key: "department_id",
							title: "部门代码",
							type: "text",
							width: colWidth,
							align: "left"
						},
						{
							key: "managers.employee_name",
							title: "部门主管",
							type: "text",
							width: colWidth - 50,
							align: "left"
						},
						{
							key: "managers.mobile",
							title: "手机号码",
							type: "text",
							width: colWidth - 50,
							align: "left"
						},
						{
							key: "parentDepartments.department_name",
							title: "上级部门",
							type: "text",
							width: colWidth,
							align: "left"
						},
						{
							key: "companys.company_name",
							title: "所属公司",
							type: "text",
							width: colWidth,
							align: "left"
						},
						{
							key: "sort",
							title: "排序值",
							type: "number",
							width: 150
						},
						{
							key: "type",
							title: "节点类型",
							type: "text",
							width: colWidth,
							align: "left",
							show: ["none"]
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
					// 多选框选中的值
					multipleSelection: [],
					// 当前高亮的记录
					selectItem: "",
				},
				formDatas: {},
				// 表格相关结束 -----------------------------------------------------------
				// 表单相关开始-----------------------------------------------------------
				// 查询表单请求数据
				queryForm1: {
					// 查询表单数据源，可在此设置默认值
					formData: {

					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
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
					// 表单请求数据，此处可以设置默认值
					data: {
						sort: 0,
						enable: true,
						url: ""
					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								key: "department_id",
								title: "部门代码",
								type: "text",
								show: ["add"]
							},
							{
								key: "department_name",
								title: "部门名称",
								type: "text",
							},
							{
								key: "department_manager_id",
								title: "部门主管",
								type: "table-select",
								placeholder: "选择部门主管",
								width: colWidth,
								action: "admin/hrm/employees/sys/getList",
								multiple: false,
								columns: [{
										key: "employee_id",
										title: "员工工号",
										type: "text",
										idKey: true
									}, // idKey:true 代表此字段为主键字段，若设置show:["none"],则可以在表格中隐藏该字段的显示
									{
										key: "employee_name",
										title: "员工姓名",
										type: "text",
										nameKey: true
									},
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

								]
							},
							{
								key: "company_id",
								title: "所属公司",
								type: "tree-select",
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
									// 此处根据选择的值动态改变parent_department_id的actionData的值									
									let item = vk.pubfn.getListItem(this.form1.props.columns, "key",
										"parent_department_id");
									item.actionData.company_id = value;
								}
							},
							{
								key: "parent_department_id",
								title: "上级部门",
								type: "tree-select",
								action: "admin/hrm/department/pub/getList",
								props: {
									list: "rows",
									value: "department_id",
									label: "department_name",
									children: "children"
								},
								actionData: {
									company_id: "", // 关联select1选择的值
								}
							},
							{
								key: "location",
								title: "办公地点",
								type: "text",
								width: this.colWidth
							},
							{
								key: "sort",
								title: "排序值",
								type: "number",
								tips: "越小越显示在前面"
							}
						],
						// 表单对应的验证规则
						rules: {
							department_id: [{
								required: true,
								message: '部门代码不能为空',
								trigger: 'blur'
							}],
							department_name: [{
								required: true,
								message: '部门名称不能为空',
								trigger: 'blur'
							}],
							department_manager_id: [{
								required: false,
								message: '部门主管不能为空',
								trigger: 'blur'
							}],
							company_id: [{
								required: true,
								message: '所属公司不能为空',
								trigger: 'blur'
							}],
							location: [{
								required: true,
								message: '办公地点',
								trigger: 'blur'
							}],
							sort: [{
								type: 'number',
								message: '排序值必须为数字'
							}]
						},
						// add 代表添加 update 代表修改
						formType: '',
						// 是否显示表单1 的弹窗
						show: false,
					}
				},
				// 表单相关结束-----------------------------------------------------------
			};
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {
			that = this;
			vk = that.vk;
			that.options = options;
			that.init(options);
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady() {},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {},
		// 函数
		methods: {
			toTreeData(originalData) {
				// 递归转换函数
				const convertNode = (node) => {
					return {
						value: node.department_id,
						label: node.department_name,
						manager: node.department_manager_id,
						children: node.children && node.children.length > 0 ?
							node.children.map(child => convertNode(child)) : []
					};
				};
				// 只处理顶级节点（parent_department_id 为 null）
				return originalData
					.filter(item => vk.pubfn.isNull(item.parent_department_id))
					.map(root => convertNode(root));
			},
			async toCompany(e) {
				this.departments = []
				let res = await vk.callFunction({
					url: 'admin/hrm/department/pub/getList',
					title: '请求中...',
					data: {
						company_id: e
					},
				});
				const treeData = this.toTreeData(res.rows);
				this.departments = treeData;
				this.$refs.table1.queryParam.formData.department_id = "";
				this.$set(this.form1, "department_id", "");
				this.search();
			},
			toDepartment(e) {
				this.$set(this.queryForm1.formData, "department_id", e);
				this.search();
			},
			// 页面数据初始化函数
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(that.form1);
			},
			tableSuccess() {
				this.pluginMenus = this.getPluginMenus();
			},
			// 页面跳转
			pageTo(path) {
				vk.navigateTo(path);
			},
			// 表单重置
			resetForm() {
				vk.pubfn.resetForm(originalForms, that);
			},
			// 搜索
			search() {
				that.$refs.table1.search();
			},
			// 刷新
			refresh() {
				that.$refs.table1.refresh();
			},
			// 获取当前选中的行的数据
			getCurrentRow(key) {
				return that.$refs.table1.getCurrentRow(key);
			},
			// 监听 - 行的选中高亮事件
			currentChange(val) {
				that.table1.selectItem = val;
			},
			// 当选择项发生变化时会触发该事件
			selectionChange(list) {
				that.table1.multipleSelection = list;
			},
			// 显示添加页面
			addBtn() {
				that.resetForm();
				that.form1.props.action = 'admin/hrm/department/sys/add';
				that.form1.props.formType = 'add';
				that.form1.props.title = '添加';
				that.form1.props.show = true;

				let currentRow = that.getCurrentRow();
				if (currentRow) {
					let item = vk.pubfn.getListItem(this.form1.props.columns, "key",
						"parent_department_id");
					// 判断当前选中节点类型					
					if (currentRow.type === "company") {
						// 如果在公司节点上添加，则默认选择该公司					
						item.actionData.company_id = currentRow.company_id;
						that.$set(that.form1.data, "company_id", currentRow.company_id);
						that.$set(that.form1.data, "department_id", currentRow.company_id + "-");
					} else if (currentRow.department_id) {
						// 如果在部门节点上添加
						item.actionData.company_id = currentRow.company_id;
						that.$set(that.form1.data, "parent_department_id", currentRow.department_id);
						that.$set(that.form1.data, "company_id", currentRow.company_id);
						that.$set(that.form1.data, "department_id", currentRow.department_id + "-");
					}
				}
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				let departmentItem = vk.pubfn.getListItem(this.form1.props.columns, "key", "parent_department_id");
				departmentItem.actionData.company_id = item.company_id;
				that.form1.props.action = 'admin/hrm/department/sys/update';
				that.form1.props.formType = 'update';
				that.form1.props.title = '编辑';
				that.form1.props.show = true;
				that.form1.data = item;
			},
			formSuccess() {
				that.form1.props.show = false;
				// 下面的写法是为了部分修改完成后，减少一次再次请求数据库的查询
				if (that.form1.props.formType === "update") {
					let item = that.getCurrentRow(true);
					if (item.parent_department_id !== that.form1.data.parent_department_id) {
						that.refresh();
					} else {
						vk.pubfn.objectAssignForVue(item, that.form1.data, that);
					}
				} else {
					that.refresh();
				}
			},
			// 删除按钮
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/department/sys/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 设置内置权限

			// 修改排序值
			sortChange(sort, item) {
				// 如果是公司节点，需要调用不同的API
				const url = item.type === "company" ?
					'admin/hrm/company/sys/update' :
					'admin/hrm/department/sys/update';

				// 准备不同的参数
				const data = item.type === "company" ? {
					_id: item._id,
					sort: item.sort,
					company_id: item.company_id,
					company_name: item.company_name
				} : {
					_id: item._id,
					sort: item.sort,
					department_id: item.department_id,
					department_name: item.department_name,
					parent_department_id: item.parent_department_id,
					company_id: item.company_id
				};

				vk.callFunction({
					url,
					data,
					success: (data) => {
						this.refresh();
					}
				});
			},
			getPluginMenus() {
				const departments = [];
				const tableData = this.$refs.table1.getTableData() || [];
				const dbdepartments = vk.pubfn.treeToArray(tableData, {
					department_id: "department_id",
					parent_department_id: "parent_department_id",
					children: "children"
				});
				pluginMenuJsons.forEach(department => {
					// 查找尚未被注册到数据库中的菜单
					if (!dbdepartments.find(item => item.department_id === department.department_id)) {
						departments.push(department);
					}
				})
				return departments;
			},
		},
		// 监听属性
		watch: {

		},
		// 计算属性
		computed: {

		}
	};
</script>
<style lang="scss" scoped>

</style>