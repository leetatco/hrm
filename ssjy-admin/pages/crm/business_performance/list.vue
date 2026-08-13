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
	const colWidth = 150;
	export default {
		data() {
			return {
				loading: false,
				data: {},
				table1: {
					// 数据请求地址（需后端实现对应的云函数）
					action: "admin/crm/business_performance/sys/getList",
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
							"key": "year",
							"title": "年份",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "is_audited",
							"title": "是否审计",
							"type": "text",
							"width": colWidth,
							"formatter": (row, value) => value ? '是' : '否'
						},
						{
							"key": "debt_ratio",
							"title": "资产负债率(%)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "accounts_receivable",
							"title": "应收账款(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "accounts_payable",
							"title": "应付账款(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "fixed_assets_original",
							"title": "固定资产原值(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "fixed_assets_net",
							"title": "固定资产净值(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "monetary_funds",
							"title": "货币资金(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "payment_terms",
							"title": "账期",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "top1_customer_revenue",
							"title": "第一大客户营业额(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "top2_customer_revenue",
							"title": "第二大客户营业额(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "external_financial_revenue",
							"title": "外账营业收入(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "external_financial_profit",
							"title": "外账营业利润(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "external_financial_netprofit",
							"title": "外账净利润(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "internal_financial_revenue",
							"title": "内账营业收入(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "internal_financial_totalprofit",
							"title": "内账总利润(万元)",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "internal_financial_netprofit",
							"title": "内账净利润(万元)",
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
							key: "year",
							title: "年份",
							type: "number",
							width: colWidth,
							mode: "="
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
								key: "year",
								title: "年份",
								type: "number",
								width: colWidth
							},
							{
								key: "is_audited",
								title: "是否审计",
								type: "switch",
								width: colWidth
							},
							{
								key: "debt_ratio",
								title: "资产负债率(%)",
								type: "number",
								width: colWidth
							},
							{
								key: "accounts_receivable",
								title: "应收账款(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "accounts_payable",
								title: "应付账款(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "fixed_assets_original",
								title: "固定资产原值(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "fixed_assets_net",
								title: "固定资产净值(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "monetary_funds",
								title: "货币资金(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "payment_terms",
								title: "账期",
								type: "text",
								width: colWidth
							},
							{
								key: "top1_customer_revenue",
								title: "第一大客户营业额(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "top2_customer_revenue",
								title: "第二大客户营业额(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "external_financial_revenue",
								title: "外账营业收入(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "external_financial_profit",
								title: "外账营业利润(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "external_financial_netprofit",
								title: "外账净利润(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "internal_financial_revenue",
								title: "内账营业收入(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "internal_financial_totalprofit",
								title: "内账总利润(万元)",
								type: "number",
								width: colWidth
							},
							{
								key: "internal_financial_netprofit",
								title: "内账净利润(万元)",
								type: "number",
								width: colWidth
							}
						],
						rules: {
							customer_id: [{
								required: true,
								message: '关联企业不能为空',
								trigger: 'blur'
							}],
							year: [{
								required: true,
								message: '年份不能为空',
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
				this.form1.props.action = 'admin/crm/business_performance/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加经营情况';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/crm/business_performance/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑经营情况';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/crm/business_performance/sys/delete",
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