<template>
	<view class="page-body">
		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns" @search="search">
			<template v-slot:established_date>
				<vk-data-input-date-time v-model="queryForm1.formData.established_date" type="daterange" /></template>
		</vk-data-table-query>
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

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @detail="handleDetail"
			@update="updateBtn" @delete="deleteBtn" @current-change="currentChange"
			@selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="1200px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="230px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 详细页面 -->
		<vk-data-dialog v-model="detailVisible" :title="detailTitle" width="1700px" mode="form"
			:close-on-click-modal="false" @closed="detailVisible = false">
			<customer_details :customer_id="customer_id"></customer_details>
		</vk-data-dialog>
		<!-- 详细页面结束 -->
		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	import customer_details from "@/components/crm/customer_details.vue";
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 250;
	export default {
		components: {
			customer_details
		},
		data() {
			// 页面数据变量
			return {
				loading: false,
				customer_id: '',
				detailVisible: false,
				detailTitle: '',
				// init请求返回的数据
				data: {},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					action: "admin/crm/customers/sys/getList",
					//按钮显示
					rightBtns: [
						// 将原有的 detail 改为自定义按钮
						{
							mode: 'detail',
							title: '详情',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('client-info-view');
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('client-info-edit');
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('client-info-delete');
							}
						}
					],
					columns: [{
							"key": "company_name",
							"title": "企业名称",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "industry",
							"title": "所属行业",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "established_date",
							"title": "成立时间",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth
						},
						{
							"key": "registered_capital",
							"title": "注册资本(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "paid_in_capital",
							"title": "实收资本(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "address",
							"title": "公司地址",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "contact_person_info",
							"title": "对接人及电话、职务",
							"type": "text",
							"width": colWidth
						},
						// 多选字段在表格中展示为文本（以逗号分隔）
						{
							"key": "business_nature",
							"title": "企业性质",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "enterprise_type",
							"title": "企业类型",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "listing_status",
							"title": "上市板块",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "qualifications",
							"title": "企业资质",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "basic_bank",
							"title": "基本户银行",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "total_employees",
							"title": "员工总数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "monthly_payroll",
							"title": "月代发工资额(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "senior_cert_count",
							"title": "高级认证人数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "mid_cert_count",
							"title": "中级认证人数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "master_count",
							"title": "硕士人数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "doctor_count",
							"title": "博士及以上人数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "legal_person",
							"title": "法人",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "actual_controller",
							"title": "实际控制人",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "general_manager",
							"title": "总经理",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "core_personnel",
							"title": "核心人员",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "company_intro",
							"title": "公司介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "shareholder_summary",
							"title": "股东情况简述",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "related_party_relationship",
							"title": "股东之间关系",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "controller_shareholding",
							"title": "实控人持股情况",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "copyrights",
							"title": "软件著作权数量",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "trademark_count",
							"title": "商标总数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "brand_count",
							"title": "品牌数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "proprietary_tech",
							"title": "专项技术",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "patent_detail",
							"title": "专利详情",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "rnd_staff_count",
							"title": "研发人数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "rnd_investment_intro",
							"title": "研发投入介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "tax_rating",
							"title": "税务评级",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "tax_intro",
							"title": "纳税介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "external_guarantee_intro",
							"title": "对外担保介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "overdue_intro",
							"title": "逾期介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "pledged_deposit_intro",
							"title": "存单质押介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "bank_acceptance_intro",
							"title": "银行承兑介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "supply_chain_finance_intro",
							"title": "供应链金融介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "procurement_intro",
							"title": "代采介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "finance_lease_intro",
							"title": "融资租赁介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "corporate_credit_query_half_year",
							"title": "企业半年内征信查询次数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "corporate_credit_last_query_time",
							"title": "企业最近征信查询时间",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth
						},
						{
							"key": "corporate_credit_result",
							"title": "企业征信查询结果",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "actual_credit_query_half_year",
							"title": "实控人及配偶半年内征信查询次数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "actual_credit_last_query_time",
							"title": "实控人及配偶最近征信查询时间",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth
						},
						{
							"key": "actual_credit_result",
							"title": "实控人及配偶征信查询结果",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "legal_credit_query_half_year",
							"title": "法人及配偶半年内征信查询次数",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "legal_credit_last_query_time",
							"title": "法人及配偶最近征信查询时间",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth
						},
						{
							"key": "legal_credit_result",
							"title": "法人及配偶征信查询结果",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "water_fee_last_year",
							"title": "水费近一年(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "water_fee_last_month",
							"title": "水费近一个月(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "electricity_fee_last_year",
							"title": "电费近一年(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "electricity_fee_last_month",
							"title": "电费近一个月(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "rent_last_year",
							"title": "租金近一年(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "rent_last_month",
							"title": "租金近一个月(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "next_year_business_intro",
							"title": "预计下年度经营情况介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "planned_revenue",
							"title": "预计下年度营业收入(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "planned_netprofit",
							"title": "预计下年度净利润(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "new_financing_needs",
							"title": "新增融资需求",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "equity_investment_is_upstream_downstream",
							"title": "股权投资是否上下游",
							"type": "switch",
							"width": colWidth
						},
						{
							"key": "equity_investment_amount",
							"title": "股权投资额(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "equity_investment_ratio",
							"title": "股权投资约占股权比(%)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "equity_investment_intro",
							"title": "股权投资介绍",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "fixed_asset_investment_amount",
							"title": "固定资产拟投入额(万元)",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "fixed_asset_investment_source",
							"title": "固定资产投资资金来源",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "fixed_asset_investment_intro",
							"title": "固定资产投资介绍",
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
				// 表格相关结束 -----------------------------------------------------------
				// 表单相关开始 -----------------------------------------------------------
				queryForm1: {
					formData: {},
					columns: [{
							"key": "company_name",
							"title": "企业名称",
							"type": "text",
							"mode": "%%"
						},
						{
							"key": "business_nature",
							"title": "企业性质",
							"type": "select",
							"mode": "=",
							"data": [{
									"value": "一般纳税人",
									"label": "一般纳税人"
								},
								{
									"value": "小微企业",
									"label": "小微企业"
								},
								{
									"value": "个体户",
									"label": "个体户"
								},
								{
									"value": "其它",
									"label": "其它"
								}
							]
						},
						{
							"key": "enterprise_type",
							"title": "企业类型",
							"type": "select",
							"mode": "=",
							"data": [{
									"value": "内资企业",
									"label": "内资企业"
								},
								{
									"value": "台资企业",
									"label": "台资企业"
								},
								{
									"value": "港资企业",
									"label": "港资企业"
								},
								{
									"value": "中外合资",
									"label": "中外合资"
								},
								{
									"value": "外资企业",
									"label": "外资企业"
								},
								{
									"value": "其它列明",
									"label": "其它列明"
								}
							]
						},
						{
							"key": "listing_status",
							"title": "上市板块",
							"type": "select",
							"mode": "=",
							"data": [{
									"value": "国内主板上市公司（板块）",
									"label": "国内主板上市公司"
								},
								{
									"value": "港板（板块）",
									"label": "港板"
								},
								{
									"value": "新三板",
									"label": "新三板"
								},
								{
									"value": "其它列明",
									"label": "其它列明"
								}
							]
						},
						{
							"key": "qualifications",
							"title": "企业资质",
							"type": "select",
							"mode": "=",
							"data": [{
									"value": "国高认证",
									"label": "国高认证"
								},
								{
									"value": "专精新认证",
									"label": "专精新认证"
								},
								{
									"value": "科小认证",
									"label": "科小认证"
								},
								{
									"value": "特殊资质列明",
									"label": "特殊资质列明"
								}
							]
						},
						{
							"key": "established_date",
							"title": "成立时间",
							"type": "daterange",
							"dateType": "datetime",
							"width": colWidth,
							"mode": "[]"
						}
					]
				},
				form1: {
					data: {},
					props: {
						action: "",
						columns: [
							// 普通字段（非 textarea）按顺序排列
							{
								"key": "company_name",
								"title": "企业名称",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "industry",
								"title": "所属行业",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "established_date",
								"title": "成立时间",
								"type": "date",
								"width": colWidth
							},
							{
								"key": "registered_capital",
								"title": "注册资本(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "paid_in_capital",
								"title": "实收资本(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "address",
								"title": "公司地址",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "contact_person_info",
								"title": "对接人及电话、职务",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "business_nature",
								"title": "企业性质",
								"type": "select",
								"multiple": true,
								"width": colWidth,
								"data": [{
										"value": "一般纳税人",
										"label": "一般纳税人"
									},
									{
										"value": "小微企业",
										"label": "小微企业"
									},
									{
										"value": "个体户",
										"label": "个体户"
									},
									{
										"value": "其它",
										"label": "其它"
									}
								]
							},
							{
								"key": "enterprise_type",
								"title": "企业类型",
								"type": "select",
								"multiple": true,
								"width": colWidth,
								"data": [{
										"value": "内资企业",
										"label": "内资企业"
									},
									{
										"value": "台资企业",
										"label": "台资企业"
									},
									{
										"value": "港资企业",
										"label": "港资企业"
									},
									{
										"value": "中外合资",
										"label": "中外合资"
									},
									{
										"value": "外资企业",
										"label": "外资企业"
									},
									{
										"value": "其它列明",
										"label": "其它列明"
									}
								]
							},
							{
								"key": "listing_status",
								"title": "上市板块",
								"type": "select",
								"multiple": true,
								"width": colWidth,
								"data": [{
										"value": "国内主板上市公司（板块）",
										"label": "国内主板上市公司"
									},
									{
										"value": "港板（板块）",
										"label": "港板"
									},
									{
										"value": "新三板",
										"label": "新三板"
									},
									{
										"value": "其它列明",
										"label": "其它列明"
									}
								]
							},
							{
								"key": "qualifications",
								"title": "企业资质",
								"type": "select",
								"multiple": true,
								"width": colWidth,
								"data": [{
										"value": "国高认证",
										"label": "国高认证"
									},
									{
										"value": "专精新认证",
										"label": "专精新认证"
									},
									{
										"value": "科小认证",
										"label": "科小认证"
									},
									{
										"value": "特殊资质列明",
										"label": "特殊资质列明"
									}
								]
							},
							{
								"key": "basic_bank",
								"title": "基本户银行",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "total_employees",
								"title": "员工总数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "monthly_payroll",
								"title": "月代发工资额(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "senior_cert_count",
								"title": "高级认证人数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "mid_cert_count",
								"title": "中级认证人数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "master_count",
								"title": "硕士人数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "doctor_count",
								"title": "博士及以上人数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "legal_person",
								"title": "法人",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "actual_controller",
								"title": "实际控制人",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "general_manager",
								"title": "总经理",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "core_personnel",
								"title": "核心人员",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "controller_shareholding",
								"title": "实控人持股情况",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "shareholder_summary",
								"title": "股东情况简述",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "copyrights",
								"title": "软件著作权数量",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "related_party_relationship",
								"title": "股东之间关系",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},

							{
								"key": "trademark_count",
								"title": "商标总数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "brand_count",
								"title": "品牌数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "proprietary_tech",
								"title": "专项技术",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "rnd_staff_count",
								"title": "研发人数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "tax_rating",
								"title": "税务评级",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "patent_detail",
								"title": "专利详情",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "tax_intro",
								"title": "纳税介绍",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "rnd_investment_intro",
								"title": "研发投入介绍",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "overdue_intro",
								"title": "逾期介绍",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "external_guarantee_intro",
								"title": "对外担保介绍",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "bank_acceptance_intro",
								"title": "银行承兑介绍",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "pledged_deposit_intro",
								"title": "存单质押介绍",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "procurement_intro",
								"title": "代采介绍",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "supply_chain_finance_intro",
								"title": "供应链金融介绍",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "corporate_credit_query_half_year",
								"title": "企业半年内征信查询次数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "finance_lease_intro",
								"title": "融资租赁介绍",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "corporate_credit_last_query_time",
								"title": "企业最近征信查询时间",
								"type": "date",
								"width": colWidth
							},
							{
								"key": "corporate_credit_result",
								"title": "企业征信查询结果",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "actual_credit_query_half_year",
								"title": "实控人及配偶半年内征信查询次数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "actual_credit_last_query_time",
								"title": "实控人及配偶最近征信查询时间",
								"type": "date",
								"width": colWidth
							},
							{
								"key": "actual_credit_result",
								"title": "实控人及配偶征信查询结果",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "legal_credit_query_half_year",
								"title": "法人及配偶半年内征信查询次数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "legal_credit_last_query_time",
								"title": "法人及配偶最近征信查询时间",
								"type": "date",
								"width": colWidth
							},
							{
								"key": "legal_credit_result",
								"title": "法人及配偶征信查询结果",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "water_fee_last_year",
								"title": "水费近一年(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "water_fee_last_month",
								"title": "水费近一个月(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "electricity_fee_last_year",
								"title": "电费近一年(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "electricity_fee_last_month",
								"title": "电费近一个月(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "rent_last_year",
								"title": "租金近一年(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "rent_last_month",
								"title": "租金近一个月(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "planned_revenue",
								"title": "预计下年度营业收入(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "next_year_business_intro",
								"title": "预计下年度经营情况介绍",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},

							{
								"key": "planned_netprofit",
								"title": "预计下年度净利润(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "new_financing_needs",
								"title": "新增融资需求",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "equity_investment_is_upstream_downstream",
								"title": "股权投资是否上下游",
								"type": "switch",
								"width": colWidth
							},
							{
								"key": "equity_investment_amount",
								"title": "股权投资额(万元)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "equity_investment_ratio",
								"title": "股权投资约占股权比(%)",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "fixed_asset_investment_amount",
								"title": "固定资产拟投入额(万元)",
								"type": "number",
								"width": colWidth
							}, 
							{
								"key": "fixed_asset_investment_source",
								"title": "固定资产投资资金来源",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "equity_investment_intro",
								"title": "股权投资介绍",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							},
							{
								"key": "fixed_asset_investment_intro",
								"title": "固定资产投资介绍",
								"type": "textarea",
								"width": colWidth,
								"colspan": 2
							} 
						],
						rules: {},
						formType: "",
						title: "",
						show: false
					}
				},
				formDatas: {},
				// 表单相关结束 -----------------------------------------------------------
			};
		},
		onLoad(data = {}) {
			vk = this.vk;
			this.data = data;
			this.init(data);
		},
		onReady() {},
		onShow() {},
		onHide() {},
		methods: {
			init(data) {
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
				this.form1.props.action = 'admin/crm/customers/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/crm/customers/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/crm/customers/sys/delete",
					data: {
						_id: item._id
					},
				});
			},
			batchBtn(index) {
				switch (index) {
					case 1:
						vk.toast("批量操作按钮1");
						break;
					case 2:
						vk.toast("批量操作按钮2");
						break;
					default:
						break;
				}
			},
			handleDetail({
				item
			}) {
				this.customer_id = item._id;
				this.detailVisible = true;
				this.detailTitle = '客户资料信息汇总表';
				console.log("item:", item);
				// 实际项目中可在此根据 row._id 加载子表数据，这里使用静态 mockData
			}
		},
		watch: {},
		computed: {}
	};
</script>

<style lang="scss" scoped>
	.page-body {}
</style>