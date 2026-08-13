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
				:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
				@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		</div>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="1000px" mode="form"
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
	const colWidth = 150;
	export default {
		data() {
			return {
				loading: false,
				data: {},
				table1: {
					// 数据请求地址（需后端实现对应的云函数）
					action: "admin/crm/properties/sys/getList",
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
							"key": "owner_type",
							"title": "房产归属",
							"type": "text",
							"width": colWidth,
							formatter: (value, row, column, index) => {
								const map = {
									company: '公司房产',
									actual_controller_spouse: '实控人及配偶',
									related_person: '关联人员及配偶'
								};
								return map[value] || value;
							}
						},
						{
							"key": "property_type",
							"title": "房产性质",
							"type": "text",
							"width": colWidth,
							formatter: (value, row, column, index) => {
								const map = {
									factory: '厂房',
									shop: '商铺',
									apartment: '公寓',
									office: '写字楼',
									residence: '住宅',
									self_built: '自建房'
								};
								return map[value] || value;
							}
						},
						{
							"key": "location",
							"title": "位置",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "area",
							"title": "面积(㎡)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "mortgage_intro",
							"title": "按揭介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "mortgage_balance",
							"title": "按揭未结清额(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "mortgage_rate",
							"title": "按揭年化利率(%)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "remaining_terms",
							"title": "尚余期数",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "first_mortgage_balance",
							"title": "一押未结清额(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "first_mortgage_rate",
							"title": "一押年化利率(%)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "first_mortgage_due_date",
							"title": "一押到期日",
							"type": "date",
							valueFormat: "yyyy-MM-dd",
							dateType: "date",
							"width": colWidth
						},
						{
							"key": "second_mortgage_balance",
							"title": "二押未结清额(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "second_mortgage_rate",
							"title": "二押年化利率(%)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "second_mortgage_due_date",
							"title": "二押到期日",
							"type": "date",
							valueFormat: "yyyy-MM-dd",
							dateType: "date",
							"width": colWidth
						},
						{
							"key": "remarks",
							"title": "备注",
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
							key: "owner_type",
							title: "房产归属",
							type: "select",
							width: colWidth,
							mode: "=",
							data: [{
									value: "company",
									label: "公司房产"
								},
								{
									value: "actual_controller_spouse",
									label: "实控人及配偶"
								},
								{
									value: "related_person",
									label: "关联人员及配偶"
								}
							]
						},
						{
							key: "property_type",
							title: "房产性质",
							type: "select",
							width: colWidth,
							mode: "=",
							data: [{
									value: "factory",
									label: "厂房"
								},
								{
									value: "shop",
									label: "商铺"
								},
								{
									value: "apartment",
									label: "公寓"
								},
								{
									value: "office",
									label: "写字楼"
								},
								{
									value: "residence",
									label: "住宅"
								},
								{
									value: "self_built",
									label: "自建房"
								}
							]
						},
						{
							key: "location",
							title: "位置",
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
								key: "owner_type",
								title: "房产归属",
								type: "select",
								width: colWidth,
								data: [{
										value: "company",
										label: "公司房产"
									},
									{
										value: "actual_controller_spouse",
										label: "实控人及配偶"
									},
									{
										value: "related_person",
										label: "关联人员及配偶"
									}
								]
							},
							{
								key: "property_type",
								title: "房产性质",
								type: "select",
								width: colWidth,
								data: [{
										value: "factory",
										label: "厂房"
									},
									{
										value: "shop",
										label: "商铺"
									},
									{
										value: "apartment",
										label: "公寓"
									},
									{
										value: "office",
										label: "写字楼"
									},
									{
										value: "residence",
										label: "住宅"
									},
									{
										value: "self_built",
										label: "自建房"
									}
								]
							},
							{
								key: "location",
								title: "位置",
								type: "text",
								width: colWidth
							},
							{
								key: "area",
								title: "面积(㎡)",
								type: "number",
								width: colWidth
							},
							{
								key: "mortgage_intro",
								title: "按揭介绍",
								type: "text",
								width: colWidth
							},
							{
								key: "mortgage_balance",
								title: "按揭未结清额(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "mortgage_rate",
								title: "按揭年化利率(%)",
								type: "number",
								width: colWidth
							},
							{
								key: "remaining_terms",
								title: "尚余期数",
								type: "number",
								width: colWidth
							},
							{
								key: "first_mortgage_balance",
								title: "一押未结清额(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "first_mortgage_rate",
								title: "一押年化利率(%)",
								type: "number",
								width: colWidth
							},
							{
								key: "first_mortgage_due_date",
								title: "一押到期日",
								type: "date",
								width: colWidth
							},
							{
								key: "second_mortgage_balance",
								title: "二押未结清额(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "second_mortgage_rate",
								title: "二押年化利率(%)",
								type: "number",
								width: colWidth
							},
							{
								key: "second_mortgage_due_date",
								title: "二押到期日",
								type: "date",
								width: colWidth
							},
							{
								key: "remarks",
								title: "备注",
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
							owner_type: [{
								required: true,
								message: '房产归属不能为空',
								trigger: 'change'
							}],
							property_type: [{
								required: true,
								message: '房产性质不能为空',
								trigger: 'change'
							}],
							location: [{
								required: true,
								message: '位置不能为空',
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
				this.form1.props.action = 'admin/crm/properties/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加房产信息';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/crm/properties/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑房产信息';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/crm/properties/sys/delete",
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