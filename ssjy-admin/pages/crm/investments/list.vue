<template>
	<view class="page-body">
		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline" @click="addBtn">添加</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection" :split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量操作1</el-dropdown-item>
						<el-dropdown-item :command="2">批量操作2</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始（设置宽度以支持横向滚动） -->
		<div style="overflow-x: auto;">
			<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
				:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true"
				@update="updateBtn" @delete="deleteBtn" @current-change="currentChange"
				@selection-change="selectionChange"></vk-data-table>
		</div>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="900px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="170px"
				@success="form1.props.show = false;refresh();" :inline="true" :columnsNumber="2"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	export default {
		data() {
			return {
				loading: false,
				data: {},
				table1: {
					// 数据请求地址（需后端实现对应的云函数）
					action: "admin/crm/investments/sys/getList",
					// 按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin')
							}
						}
					],
					columns: [{
							"key": "customers.company_name",
							"title": "关联企业",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "investor_type",
							"title": "投资主体类型",
							"type": "text",
							"width": colWidth,
							// 优化 formatter 参数顺序 (value, row, column, index)
							formatter: (value, row, column, index) => {
								const map = {
									company: '公司投资',
									actual_controller_spouse: '实控人及配偶投资'
								};
								return map[value] || value;
							}
						},
						{
							"key": "is_holding",
							"title": "是否控股",
							"type": "text",
							"width": colWidth,
							formatter: (value, row, column, index) => value ? '是' : '否'
						},
						{
							"key": "company_name",
							"title": "被投企业名称",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "registered_capital",
							"title": "注册资本(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "paid_in_capital",
							"title": "实收资本(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "main_business",
							"title": "主营业务",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "investment_ratio",
							"title": "投资比例(%)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "is_shell",
							"title": "是否空壳",
							"type": "text",
							"width": colWidth,
							formatter: (value, row, column, index) => value ? '是' : '否'
						},
						{
							"key": "profit_intro",
							"title": "营利介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": colWidth,
							"show": ["detail"]
						},
						{
							"key": "users.nickname",
							"title": "更新人",
							"type": "text",
							"width": colWidth,
							"show": ["detail"]
						}
					],
					multipleSelection: [],
					selectItem: ""
				},
				queryForm1: {
					formData: {},
					columns: [{
							key: "customer_id",
							title: "关联企业",
							type: "remote-select",
							placeholder: "请选择关联企业",
							width: colWidth,
							action: "admin/crm/customers/sys/getList",
							props: {
								list: "rows",
								value: "_id",
								label: "company_name"
							},
							showAll: true,
							actionData: {
								pageSize: 1000
							}
						},
						{
							key: "investor_type",
							title: "投资主体类型",
							type: "select",
							width: colWidth,
							mode: "=",
							// 使用 data 属性定义选项列表（静态数据方式 1）
							data: [{
									value: "company",
									label: "公司投资"
								},
								{
									value: "actual_controller_spouse",
									label: "实控人及配偶投资"
								}
							]
						},
						{
							key: "company_name",
							title: "被投企业名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						}
					]
				},
				form1: {
					data: {},
					props: {
						action: "",
						columns: [{
								key: "customer_id",
								title: "关联企业",
								type: "remote-select",
								placeholder: "请选择关联企业",
								width: colWidth,
								action: "admin/crm/customers/sys/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "company_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "investor_type",
								title: "投资主体类型",
								type: "select",
								width: colWidth,
								// 使用 data 属性定义选项列表（静态数据方式 1）
								data: [{
										value: "company",
										label: "公司投资"
									},
									{
										value: "actual_controller_spouse",
										label: "实控人及配偶投资"
									}
								]
							},
							{
								key: "is_holding",
								title: "是否控股",
								type: "switch",
								width: colWidth
							},
							{
								key: "company_name",
								title: "被投企业名称",
								type: "text",
								width: colWidth
							},
							{
								key: "registered_capital",
								title: "注册资本(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "paid_in_capital",
								title: "实收资本(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "main_business",
								title: "主营业务",
								type: "text",
								width: colWidth
							},
							{
								key: "investment_ratio",
								title: "投资比例(%)",
								type: "number",
								width: colWidth
							},
							{
								key: "is_shell",
								title: "是否空壳",
								type: "switch",
								width: colWidth
							},
							{
								key: "profit_intro",
								title: "营利介绍",
								type: "textarea",
								width: colWidth
							}
						],
						rules: {
							customer_id: [{
								required: true,
								message: '关联企业不能为空',
								trigger: 'blur'
							}],
							investor_type: [{
								required: true,
								message: '投资主体类型不能为空',
								trigger: 'change'
							}],
							company_name: [{
								required: true,
								message: '被投企业名称不能为空',
								trigger: 'blur'
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				},
				formDatas: {},
			};
		},
		onLoad(options = {}) {
			vk = this.vk;
			this.options = options;
			this.init(options);
		},
		onReady() {},
		onShow() {},
		onHide() {},
		methods: {
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			pageTo(path) {
				vk.navigateTo(path);
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			search() {
				this.$refs.table1.search();
			},
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
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/crm/investments/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加投资记录';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/crm/investments/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑投资记录';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/crm/investments/sys/delete",
					data: {
						_id: item._id
					},
				});
			},
			batchBtn(index) {
				switch (index) {
					case 1:
						vk.toast("批量操作1");
						break;
					case 2:
						vk.toast("批量操作2");
						break;
					default:
						break;
				}
			}
		},
		watch: {},
		computed: {}
	};
</script>

<style lang="scss" scoped>
	.page-body {}
</style>