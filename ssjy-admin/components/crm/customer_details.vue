<template>
	<div class="customer-report">
		<el-container>
			<el-main>
				<!-- 企业基本信息 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>企业基本信息</span>
					</div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="企业名称">{{ customer.company_name || '-' }}</el-descriptions-item>
						<el-descriptions-item label="所属行业">{{ customer.industry || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="成立时间">{{ formatDate(customer.established_date) }}</el-descriptions-item>
						<el-descriptions-item label="注册资本(万元)">{{ customer.registered_capital }}</el-descriptions-item>
						<el-descriptions-item label="实收资本(万元)">{{ customer.paid_in_capital }}</el-descriptions-item>
						<el-descriptions-item label="公司地址">{{ customer.address || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="对接人及电话、职务">{{ customer.contact_person_info || '-' }}</el-descriptions-item>
						<el-descriptions-item label="企业性质">{{ customer.business_nature || '-' }}</el-descriptions-item>
						<el-descriptions-item label="企业类型">{{ customer.enterprise_type || '-' }}</el-descriptions-item>
						<el-descriptions-item label="上市板块">{{ customer.listing_status || '-' }}</el-descriptions-item>
						<el-descriptions-item label="企业资质">{{ customer.qualifications || '-' }}</el-descriptions-item>
						<el-descriptions-item label="基本户银行">{{ customer.basic_bank || '-' }}</el-descriptions-item>
						<el-descriptions-item label="员工总数">{{ customer.total_employees }}</el-descriptions-item>
						<el-descriptions-item label="月代发工资额(万元)">{{ customer.monthly_payroll }}</el-descriptions-item>
						<el-descriptions-item label="高级认证人数">{{ customer.senior_cert_count }}</el-descriptions-item>
						<el-descriptions-item label="中级认证人数">{{ customer.mid_cert_count }}</el-descriptions-item>
						<el-descriptions-item label="硕士人数">{{ customer.master_count }}</el-descriptions-item>
						<el-descriptions-item label="博士及以上人数">{{ customer.doctor_count }}</el-descriptions-item>
						<el-descriptions-item label="法人">{{ customer.legal_person || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="实际控制人">{{ customer.actual_controller || '-' }}</el-descriptions-item>
						<el-descriptions-item label="总经理">{{ customer.general_manager || '-' }}</el-descriptions-item>
						<el-descriptions-item label="核心人员">{{ customer.core_personnel || '-' }}</el-descriptions-item>
						<el-descriptions-item label="公司介绍"
							:span="2">{{ customer.company_intro || '-' }}</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<!-- 股东信息 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>股东信息</span>
					</div>
					<el-table :data="shareholders" border stripe>
						<el-table-column prop="shareholder_name" label="股东名称" />
						<el-table-column prop="subscribed_capital" label="应出资(万元)" />
						<el-table-column prop="actual_capital" label="实际出资(万元)" />
						<el-table-column prop="ownership_ratio" label="占股比例(%)" />
						<el-table-column prop="relationship_desc" label="股东间关系说明" />
					</el-table>
					<el-descriptions :column="2">
						<el-descriptions-item label="股东情况简述"
							:span="2">{{ customer.shareholder_summary }}</el-descriptions-item>
						<el-descriptions-item label="股东之间关系"
							:span="2">{{ customer.related_party_relationship }}</el-descriptions-item>
						<el-descriptions-item label="实控人持股情况"
							:span="2">{{ customer.controller_shareholding }}</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<!-- 研发与知识产权 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>研发与知识产权</span>
					</div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="软件著作权数量">{{ customer.copyrights }}</el-descriptions-item>
						<el-descriptions-item label="商标总数">{{ customer.trademark_count }}</el-descriptions-item>
						<el-descriptions-item label="品牌数">{{ customer.brand_count }}</el-descriptions-item>
						<el-descriptions-item label="专项技术">{{ customer.proprietary_tech || '-' }}</el-descriptions-item>
						<el-descriptions-item label="专利详情"
							:span="2">{{ customer.patent_detail || '-' }}</el-descriptions-item>
						<el-descriptions-item label="研发人数">{{ customer.rnd_staff_count }}</el-descriptions-item>
						<el-descriptions-item label="研发投入介绍"
							:span="2">{{ customer.rnd_investment_intro || '-' }}</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<!-- 税务评级与纳税明细 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>税务信息</span>
					</div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="税务评级">{{ customer.tax_rating || '-' }}</el-descriptions-item>
						<el-descriptions-item label="纳税介绍">{{ customer.tax_intro || '-' }}</el-descriptions-item>
					</el-descriptions>
					<el-table :data="taxRecords" border stripe style="margin-top: 10px">
						<el-table-column prop="year" label="年份" />
						<el-table-column prop="tax_type" label="税种" />
						<el-table-column prop="tax_rate" label="税率" />
						<el-table-column prop="tax_paid" label="已交税款(万元)" />
						<el-table-column prop="is_overdue" label="是否逾期">
							<template slot-scope="{ row }">{{ row.is_overdue ? '是' : '否' }}</template>
						</el-table-column>
						<el-table-column prop="is_tax_refund" label="是否退税">
							<template slot-scope="{ row }">{{ row.is_tax_refund ? '是' : '否' }}</template>
						</el-table-column>
						<el-table-column prop="estimated_next_year" label="下年度预计(万元)" />
					</el-table>
				</el-card>

				<!-- 征信情况 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>征信情况</span>
					</div>
					<el-table :data="creditData" border stripe>
						<el-table-column prop="subject" label="主体" />
						<el-table-column prop="half_year_queries" label="半年内查询次数" />
						<el-table-column prop="last_query_time" label="最近一期查询时间" />
						<el-table-column prop="result" label="查询结果" />
					</el-table>
				</el-card>

				<!-- 融资介绍（对外担保、逾期等） -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>融资相关介绍</span>
					</div>
					<el-descriptions :column="2" border>
						<el-descriptions-item
							label="对外担保介绍">{{ customer.external_guarantee_intro || '-' }}</el-descriptions-item>
						<el-descriptions-item label="逾期介绍">{{ customer.overdue_intro || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="存单质押介绍">{{ customer.pledged_deposit_intro || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="银行承兑介绍">{{ customer.bank_acceptance_intro || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="供应链金融介绍">{{ customer.supply_chain_finance_intro || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="代采介绍">{{ customer.procurement_intro || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="融资租赁介绍">{{ customer.finance_lease_intro || '-' }}</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<!-- 贷款记录 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>贷款记录</span>
						<el-radio-group v-model="loanTypeFilter" size="small" style="margin-left: 20px">
							<el-radio-button label="all">全部</el-radio-button>
							<el-radio-button label="company">公司贷款</el-radio-button>
							<el-radio-button label="actual_controller">实控人及配偶</el-radio-button>
							<el-radio-button label="legal_person">法人及配偶</el-radio-button>
							<el-radio-button label="related_company">关联公司</el-radio-button>
						</el-radio-group>
					</div>
					<el-table :data="filteredLoans" border stripe>
						<el-table-column prop="loan_type_label" label="贷款主体" />
						<el-table-column prop="bank_name" label="贷款银行" />
						<el-table-column prop="credit_or_mortgage" label="信用/抵押" />
						<el-table-column prop="loan_name" label="贷款名称" />
						<el-table-column prop="loan_intro" label="贷款介绍" />
						<el-table-column prop="total_limit" label="总额度(万元)" />
						<el-table-column prop="credit_start_date" label="授信开始时间" />
						<el-table-column prop="credit_end_date" label="授信结束时间" />
						<el-table-column prop="loan_term" label="贷款期" />
						<el-table-column prop="actual_amount" label="实际发生额(万元)" />
						<el-table-column prop="loan_start_date" label="贷款开始时间" />
						<el-table-column prop="loan_end_date" label="贷款结束时间" />
						<el-table-column prop="annual_rate" label="年化利率(%)" />
						<el-table-column prop="collateral" label="抵押物" />
						<el-table-column prop="guarantor" label="担保人" />
						<el-table-column prop="is_overdue" label="是否逾期">
							<template slot-scope="{ row }">{{ row.is_overdue ? '是' : '否' }}</template>
						</el-table-column>
						<el-table-column prop="subsidy_amount" label="补贴额(万元)" />
						<el-table-column prop="monthly_repayment" label="每月还款额(万元)" />
						<el-table-column prop="other_notes" label="其它" />
					</el-table>
				</el-card>

				<!-- 投资记录 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>投资记录</span>
						<el-radio-group v-model="investTypeFilter" size="small" style="margin-left: 20px">
							<el-radio-button label="all">全部</el-radio-button>
							<el-radio-button label="company">公司投资</el-radio-button>
							<el-radio-button label="actual_controller_spouse">实控人及配偶投资</el-radio-button>
						</el-radio-group>
					</div>
					<el-table :data="filteredInvestments" border stripe>
						<el-table-column prop="investor_type_label" label="投资主体" />
						<el-table-column prop="is_holding" label="是否控股">
							<template slot-scope="{ row }">{{ row.is_holding ? '是' : '否' }}</template>
						</el-table-column>
						<el-table-column prop="company_name" label="被投企业名称" />
						<el-table-column prop="registered_capital" label="注册资本(万元)" />
						<el-table-column prop="paid_in_capital" label="实收资本(万元)" />
						<el-table-column prop="main_business" label="主营业务" />
						<el-table-column prop="investment_ratio" label="投资比例(%)" />
						<el-table-column prop="is_shell" label="是否空壳">
							<template slot-scope="{ row }">{{ row.is_shell ? '是' : '否' }}</template>
						</el-table-column>
						<el-table-column prop="profit_intro" label="营利介绍" />
					</el-table>
				</el-card>

				<!-- 房产信息 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>房产信息</span>
						<el-radio-group v-model="propertyOwnerFilter" size="small" style="margin-left: 20px">
							<el-radio-button label="all">全部</el-radio-button>
							<el-radio-button label="company">公司房产</el-radio-button>
							<el-radio-button label="actual_controller_spouse">实控人及配偶</el-radio-button>
							<el-radio-button label="related_person">关联人员及配偶</el-radio-button>
						</el-radio-group>
					</div>
					<el-table :data="filteredProperties" border stripe>
						<el-table-column prop="owner_type_label" label="归属" />
						<el-table-column prop="property_type" label="房产性质" />
						<el-table-column prop="location" label="位置" />
						<el-table-column prop="area" label="面积(㎡)" />
						<el-table-column prop="mortgage_intro" label="按揭介绍" />
						<el-table-column prop="mortgage_balance" label="按揭未结清额(万元)" />
						<el-table-column prop="mortgage_rate" label="按揭年化利率(%)" />
						<el-table-column prop="remaining_terms" label="尚余期数" />
						<el-table-column label="一押信息">
							<el-table-column prop="first_mortgage_balance" label="未结清额(万元)" />
							<el-table-column prop="first_mortgage_rate" label="年化利率(%)" />
							<el-table-column prop="first_mortgage_due_date" label="到期日" />
						</el-table-column>
						<el-table-column label="二押信息">
							<el-table-column prop="second_mortgage_balance" label="未结清额(万元)" />
							<el-table-column prop="second_mortgage_rate" label="年化利率(%)" />
							<el-table-column prop="second_mortgage_due_date" label="到期日" />
						</el-table-column>
						<el-table-column prop="remarks" label="备注" />
					</el-table>
				</el-card>

				<!-- 诉讼记录 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>诉讼记录</span>
						<el-radio-group v-model="lawsuitPartyFilter" size="small" style="margin-left: 20px">
							<el-radio-button label="all">全部</el-radio-button>
							<el-radio-button label="company">公司诉讼</el-radio-button>
							<el-radio-button label="actual_controller_spouse">实控人及配偶诉讼</el-radio-button>
						</el-radio-group>
					</div>
					<el-table :data="filteredLawsuits" border stripe>
						<el-table-column prop="party_type_label" label="主体" />
						<el-table-column prop="is_restricted" label="是否限高">
							<template slot-scope="{ row }">{{ row.is_restricted ? '是' : '否' }}</template>
						</el-table-column>
						<el-table-column prop="role" label="被告/原告" />
						<el-table-column prop="case_amount" label="标的额(万元)" />
						<el-table-column prop="case_progress" label="诉讼进展" />
						<el-table-column prop="frozen_amount" label="保全/冻结额(万元)" />
						<el-table-column prop="is_executed" label="是否执行">
							<template slot-scope="{ row }">{{ row.is_executed ? '是' : '否' }}</template>
						</el-table-column>
					</el-table>
				</el-card>

				<!-- 政府补贴 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>政府补贴</span>
					</div>
					<el-table :data="subsidies" border stripe>
						<el-table-column prop="grant_date" label="补贴时间" />
						<el-table-column prop="project_name" label="项目名称" />
						<el-table-column prop="grant_amount" label="补贴额(万元)" />
						<el-table-column prop="grant_target" label="补贴对象" />
						<el-table-column prop="grant_intro" label="补贴介绍" />
					</el-table>
				</el-card>

				<!-- 银行流水与水电租金 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>银行流水与水电租金</span>
					</div>
					<el-table :data="bankFlows" border stripe style="margin-bottom: 10px">
						<el-table-column prop="bank_name" label="银行名称" />
						<el-table-column prop="half_year_total_flow" label="近半年总流水额(万元)" />
					</el-table>
					<el-descriptions :column="2" border>
						<el-descriptions-item
							label="水费近一年(万元)">{{ customer.water_fee_last_year || 0 }}</el-descriptions-item>
						<el-descriptions-item
							label="水费近一个月(万元)">{{ customer.water_fee_last_month || 0 }}</el-descriptions-item>
						<el-descriptions-item
							label="电费近一年(万元)">{{ customer.electricity_fee_last_year || 0 }}</el-descriptions-item>
						<el-descriptions-item
							label="电费近一个月(万元)">{{ customer.electricity_fee_last_month || 0 }}</el-descriptions-item>
						<el-descriptions-item
							label="租金近一年(万元)">{{ customer.rent_last_year || 0 }}</el-descriptions-item>
						<el-descriptions-item
							label="租金近一个月(万元)">{{ customer.rent_last_month || 0 }}</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<!-- 下年度经营计划 -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>下年度经营计划</span>
					</div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="预计下年度经营情况介绍"
							:span="2">{{ customer.next_year_business_intro || '-' }}</el-descriptions-item>
						<el-descriptions-item label="预计营业收入(万元)">{{ customer.planned_revenue }}</el-descriptions-item>
						<el-descriptions-item label="预计净利润(万元)">{{ customer.planned_netprofit }}</el-descriptions-item>
						<el-descriptions-item
							label="新增融资需求">{{ customer.new_financing_needs || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="股权投资是否上下游">{{ customer.equity_investment_is_upstream_downstream ? '是' : '否' }}</el-descriptions-item>
						<el-descriptions-item
							label="股权投资额(万元)">{{ customer.equity_investment_amount }}</el-descriptions-item>
						<el-descriptions-item
							label="股权投资约占股权比(%)">{{ customer.equity_investment_ratio }}</el-descriptions-item>
						<el-descriptions-item label="股权投资介绍"
							:span="2">{{ customer.equity_investment_intro || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="固定资产拟投入额(万元)">{{ customer.fixed_asset_investment_amount }}</el-descriptions-item>
						<el-descriptions-item
							label="固定资产投资资金来源">{{ customer.fixed_asset_investment_source || '-' }}</el-descriptions-item>
						<el-descriptions-item label="固定资产投资介绍"
							:span="2">{{ customer.fixed_asset_investment_intro || '-' }}</el-descriptions-item>
					</el-descriptions>
				</el-card>
				<!-- 经营情况（近四年） -->
				<el-card class="card" shadow="never">
					<div slot="header" class="card-header">
						<span>经营情况（年度）</span>
					</div>
					<el-table :data="businessPerformances" border stripe>
						<el-table-column prop="year" label="年份" />
						<el-table-column prop="is_audited" label="是否审计">
							<template slot-scope="{ row }">{{ row.is_audited ? '是' : '否' }}</template>
						</el-table-column>
						<el-table-column prop="debt_ratio" label="资产负债率(%)" />
						<el-table-column prop="accounts_receivable" label="应收账款(万元)" />
						<el-table-column prop="accounts_payable" label="应付账款(万元)" />
						<el-table-column prop="fixed_assets_original" label="固定资产原值(万元)" />
						<el-table-column prop="fixed_assets_net" label="固定资产净值(万元)" />
						<el-table-column prop="monetary_funds" label="货币资金(万元)" />
						<el-table-column prop="payment_terms" label="账期" />
						<el-table-column prop="top1_customer_revenue" label="第一大客户营业额(万元)" />
						<el-table-column prop="top2_customer_revenue" label="第二大客户营业额(万元)" />
						<el-table-column label="外账">
							<el-table-column prop="external_financial_revenue" label="营业收入(万元)" />
							<el-table-column prop="external_financial_profit" label="营业利润(万元)" />
							<el-table-column prop="external_financial_netprofit" label="净利润(万元)" />
						</el-table-column>
						<el-table-column label="内账">
							<el-table-column prop="internal_financial_revenue" label="营业收入(万元)" />
							<el-table-column prop="internal_financial_totalprofit" label="总利润(万元)" />
							<el-table-column prop="internal_financial_netprofit" label="净利润(万元)" />
						</el-table-column>
					</el-table>
				</el-card>
			</el-main>
		</el-container>
	</div>
</template>

<script>
	export default {
		props: {
			customer_id: {
				type: String,
				default: '0'
			}
		},
		data() {
			return {
				customer: {},
				shareholders: [],
				taxRecords: [],
				loans: [],
				investments: [],
				properties: [],
				lawsuits: [],
				businessPerformances: [],
				subsidies: [],
				bankFlows: [],
				// 筛选器
				loanTypeFilter: 'all',
				investTypeFilter: 'all',
				propertyOwnerFilter: 'all',
				lawsuitPartyFilter: 'all',
			};
		},
		computed: {
			creditData() {
				return [{
						subject: '企业',
						half_year_queries: this.customer.corporate_credit_query_half_year,
						last_query_time: this.formatDate(this.customer.corporate_credit_last_query_time),
						result: this.customer.corporate_credit_result,
					},
					{
						subject: '实控人及配偶',
						half_year_queries: this.customer.actual_credit_query_half_year,
						last_query_time: this.formatDate(this.customer.actual_credit_last_query_time),
						result: this.customer.actual_credit_result,
					},
					{
						subject: '法人及配偶',
						half_year_queries: this.customer.legal_credit_query_half_year,
						last_query_time: this.formatDate(this.customer.legal_credit_last_query_time),
						result: this.customer.legal_credit_result,
					},
				];
			},
			filteredLoans() {
				let newObj = vk.pubfn.copyObject(this.loans)
				if (this.loanTypeFilter !== 'all') {
					newObj = newObj.filter(item => item.loan_type === this.loanTypeFilter);
				}
				newObj.forEach(item => {
					item.credit_start_date = this.formatDate(item.credit_start_date);
					item.credit_end_date = this.formatDate(item.credit_end_date);
					item.loan_start_date = this.formatDate(item.loan_start_date);
					item.loan_end_date = this.formatDate(item.loan_end_date);
				});
				return newObj;
			},
			filteredInvestments() {
				if (this.investTypeFilter === 'all') return this.investments;
				return this.investments.filter(item => item.investor_type === this.investTypeFilter);
			},
			filteredProperties() {
				let newObj = vk.pubfn.copyObject(this.properties)
				if (this.propertyOwnerFilter !== 'all') {
					newObj = newObj.filter(item => item.owner_type === this.propertyOwnerFilter);
				}
				newObj.forEach(item => {
					item.first_mortgage_due_date = this.formatDate(item.first_mortgage_due_date);
					item.second_mortgage_due_date = this.formatDate(item.second_mortgage_due_date);
				});
				return newObj;
			},
			filteredLawsuits() {
				if (this.lawsuitPartyFilter === 'all') return this.lawsuits;
				return this.lawsuits.filter(item => item.party_type === this.lawsuitPartyFilter);
			},
		},
		created() {
			this.loadData();
		},
		methods: {
			async loadData() {
				uni.showLoading({
					title: '加载中...'
				});
				try {
					// 主表 customer 假设固定测试 ID
					const db = uniCloud.database();
					const customerRes = await db.collection('customers').doc(this.customer_id).get();
					this.customer = customerRes.result.data[0] || {};

					// 并行查询所有子表
					const [
						shareholdersRes,
						taxRes,
						loansRes,
						investmentsRes,
						propertiesRes,
						lawsuitsRes,
						bpRes,
						subsidiesRes,
						bankFlowsRes,
					] = await Promise.all([
						db.collection('shareholders').where({
							customer_id: this.customer_id
						}).get(),
						db.collection('tax_records').where({
							customer_id: this.customer_id
						}).get(),
						db.collection('loans').where({
							customer_id: this.customer_id
						}).get(),
						db.collection('investments').where({
							customer_id: this.customer_id
						}).get(),
						db.collection('properties').where({
							customer_id: this.customer_id
						}).get(),
						db.collection('lawsuits').where({
							customer_id: this.customer_id
						}).get(),
						db.collection('business_performance').where({
							customer_id: this.customer_id
						}).get(),
						db.collection('subsidies').where({
							customer_id: this.customer_id
						}).get(),
						db.collection('bank_flows').where({
							customer_id: this.customer_id
						}).get(),
					]);

					this.shareholders = shareholdersRes.result.data;
					this.taxRecords = taxRes.result.data;
					this.loans = loansRes.result.data.map(item => ({
						...item,
						loan_type_label: this.getLoanTypeLabel(item.loan_type),
					}));
					this.investments = investmentsRes.result.data.map(item => ({
						...item,
						investor_type_label: this.getInvestorTypeLabel(item.investor_type),
					}));
					this.properties = propertiesRes.result.data.map(item => ({
						...item,
						owner_type_label: this.getPropertyOwnerLabel(item.owner_type),
					}));
					this.lawsuits = lawsuitsRes.result.data.map(item => ({
						...item,
						party_type_label: this.getPartyTypeLabel(item.party_type),
					}));
					this.businessPerformances = bpRes.result.data.sort((a, b) => b.year - a.year);
					this.subsidies = subsidiesRes.result.data;
					this.bankFlows = bankFlowsRes.result.data;

					this.subsidies.forEach(item => {
						item.grant_date = this.formatDate(item.grant_date)
					})



				} catch (e) {
					console.error(e);
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			formatDate(date) {
				if (!date) return '-';
				// date 可能是 uniCloud 返回的 date 对象或时间戳						
				return vk.pubfn.timeFormat(new Date(date), 'yyyy-MM-dd');
			},
			getLoanTypeLabel(type) {
				const map = {
					company: '公司贷款',
					actual_controller: '实控人及配偶',
					legal_person: '法人及配偶',
					related_company: '关联公司',
				};
				return map[type] || type;
			},
			getInvestorTypeLabel(type) {
				return type === 'company' ? '公司投资' : '实控人及配偶投资';
			},
			getPropertyOwnerLabel(owner) {
				const map = {
					company: '公司房产',
					actual_controller_spouse: '实控人及配偶',
					related_person: '关联人员及配偶',
				};
				return map[owner] || owner;
			},
			getPartyTypeLabel(party) {
				return party === 'company' ? '公司诉讼' : '实控人及配偶诉讼';
			},
		},
	};
</script>

<style scoped>
	.customer-report {
		background: #f5f7fa;
		padding: 20px;
	}

	.card {
		margin-bottom: 20px;
	}

	.card-header {
		font-size: 18px;
		font-weight: bold;
		display: flex;
		align-items: center;
	}

	.mt-2 {
		margin-top: 10px;
	}
</style>