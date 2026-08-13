<template>
  <view class="detail-page">
    <!-- 加载状态 -->
    <u-loading-page v-if="!customer" loading-text="加载中..." />

    <view v-else>
      <!-- 页面标题栏（模拟小程序原生导航栏） -->
      <view class="navbar">
        <view class="navbar-left" @click="goBack">
          <u-icon name="arrow-left" size="22" color="#ffffff"></u-icon>
        </view>
        <view class="navbar-title">客户详细页</view>
        <view class="navbar-right" @click="showMore">
          <u-icon name="more-dot-fill" size="22" color="#ffffff"></u-icon>
        </view>
      </view>

      <!-- 公司名称栏 -->
      <view class="company-header">
        <view class="company-name">{{ customer.company_name || '—' }}</view>
        <view class="company-tags">
          <text class="tag industry" v-if="customer.industry">{{ customer.industry }}</text>
          <text class="tag legal-person" v-if="customer.legal_person">法人: {{ customer.legal_person }}</text>
        </view>
      </view>

      <!-- 企业概况（新增） -->
      <view class="section">
        <view class="section-title">企业概况</view>
        <view class="section-content">
          <view class="info-row">
            <text class="info-label">成立日期</text>
            <text class="info-value">{{ formatDate(customer.established_date) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">注册资本</text>
            <text class="info-value">{{ formatNumber(customer.registered_capital) }} 万元</text>
          </view>
          <view class="info-row">
            <text class="info-label">实收资本</text>
            <text class="info-value">{{ formatNumber(customer.paid_in_capital) }} 万元</text>
          </view>
          <view class="info-row">
            <text class="info-label">企业性质</text>
            <text class="info-value">{{ customer.business_nature || '—' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">企业类型</text>
            <text class="info-value">{{ customer.enterprise_type || '—' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">上市状态</text>
            <text class="info-value">{{ customer.listing_status || '—' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">资质证书</text>
            <text class="info-value">{{ customer.qualifications || '—' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">开户银行</text>
            <text class="info-value">{{ customer.basic_bank || '—' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">员工总数</text>
            <text class="info-value">{{ formatNumber(customer.total_employees) }} 人</text>
          </view>
          <view class="info-row">
            <text class="info-label">月薪总额</text>
            <text class="info-value">{{ formatNumber(customer.monthly_payroll) }} 万元</text>
          </view>
          <view class="info-row">
            <text class="info-label">高级职称</text>
            <text class="info-value">{{ formatNumber(customer.senior_cert_count) }} 人</text>
          </view>
          <view class="info-row">
            <text class="info-label">中级职称</text>
            <text class="info-value">{{ formatNumber(customer.mid_cert_count) }} 人</text>
          </view>
          <view class="info-row">
            <text class="info-label">硕士人数</text>
            <text class="info-value">{{ formatNumber(customer.master_count) }} 人</text>
          </view>
          <view class="info-row">
            <text class="info-label">博士人数</text>
            <text class="info-value">{{ formatNumber(customer.doctor_count) }} 人</text>
          </view>
          <view class="info-row">
            <text class="info-label">实际控制人</text>
            <text class="info-value">{{ customer.actual_controller || '—' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">总经理</text>
            <text class="info-value">{{ customer.general_manager || '—' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">核心人员</text>
            <text class="info-value">{{ customer.core_personnel || '—' }}</text>
          </view>
          <view class="info-row multi-line" v-if="customer.company_intro">
            <text class="info-label">公司简介</text>
            <text class="info-value">{{ customer.company_intro }}</text>
          </view>
        </view>
      </view>

      <!-- 基本信息（保留地址和法人，其他已移至概况，避免重复） -->
      <view class="section" v-if="customer.address">
        <view class="section-title">联系方式</view>
        <view class="section-content">
          <view class="info-row">
            <text class="info-label">地址</text>
            <text class="info-value">{{ customer.address }}</text>
          </view>
          <view class="info-row" v-if="customer.contact_person_info">
            <text class="info-label">联系人信息</text>
            <text class="info-value">{{ customer.contact_person_info }}</text>
          </view>
        </view>
      </view>

      <!-- 财务信息（增强） -->
      <view class="section" v-if="hasFinancialData">
        <view class="section-title">财务信息</view>
        
        <!-- 银行流水 -->
        <view class="card" v-if="customer.bank_flows && customer.bank_flows.length">
          <view class="card-title">银行流水</view>
          <view class="card-content">
            <view 
              class="data-row" 
              v-for="item in customer.bank_flows" 
              :key="item._id"
            >
              <text class="data-label">{{ item.bank_name }}</text>
              <text class="data-value">{{ formatNumber(item.half_year_total_flow) }} 万元</text>
            </view>
          </view>
        </view>

        <!-- 股东信息 -->
        <view class="card" v-if="customer.shareholders && customer.shareholders.length">
          <view class="card-title">股东信息</view>
          <view class="card-content">
            <view 
              class="data-row" 
              v-for="item in customer.shareholders" 
              :key="item._id"
            >
              <text class="data-label">{{ item.shareholder_name }}</text>
              <view class="data-values">
                <text class="value-tag capital">{{ formatNumber(item.actual_capital) }} 万元</text>
                <text class="value-tag ratio">{{ item.ownership_ratio }}%</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 纳税记录 -->
        <view class="card" v-if="customer.tax_records && customer.tax_records.length">
          <view class="card-title">纳税记录</view>
          <view class="card-content">
            <view 
              class="data-row" 
              v-for="item in customer.tax_records" 
              :key="item._id"
            >
              <view class="data-label-group">
                <text class="data-label">{{ item.year }}年</text>
                <text class="tax-type">{{ item.tax_type }} ({{ item.tax_rate }})</text>
              </view>
              <text class="data-value tax">{{ formatNumber(item.tax_paid) }} 万元</text>
            </view>
          </view>
        </view>

        <!-- 贷款信息 -->
        <view class="card" v-if="customer.loans && customer.loans.length">
          <view class="card-title">贷款信息</view>
          <view class="card-content">
            <view 
              class="loan-row" 
              v-for="item in customer.loans" 
              :key="item._id"
            >
              <view class="loan-header">
                <text class="bank-name">{{ item.bank_name }}</text>
                <text class="loan-name">{{ item.loan_name }}</text>
              </view>
              <view class="loan-data">
                <view class="loan-item">
                  <text class="loan-label">总额度</text>
                  <text class="loan-value total">{{ formatNumber(item.total_limit) }} 万元</text>
                </view>
                <view class="loan-item">
                  <text class="loan-label">已使用</text>
                  <text class="loan-value used">{{ formatNumber(item.actual_amount) }} 万元</text>
                </view>
                <view class="loan-item">
                  <text class="loan-label">使用率</text>
                  <text class="loan-value rate">{{ calculateUsageRate(item) }}%</text>
                </view>
              </view>
              <view class="loan-progress">
                <view 
                  class="progress-bar" 
                  :style="{ width: calculateUsageRate(item) + '%' }"
                ></view>
              </view>
              <view class="loan-footer" v-if="item.annual_rate || item.guarantor">
                <text class="loan-detail">年利率 {{ item.annual_rate }}%</text>
                <text class="loan-detail">担保人 {{ item.guarantor || '无' }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 经营业绩（扩展） -->
        <view class="card" v-if="customer.business_performance && customer.business_performance.length">
          <view class="card-title">经营业绩</view>
          <view class="card-content">
            <view 
              class="performance-row" 
              v-for="item in customer.business_performance" 
              :key="item._id"
            >
              <text class="data-label">{{ item.year }}年</text>
              <view class="performance-value">
                <text class="revenue-label">外部营收</text>
                <text class="revenue-value">{{ formatNumber(item.external_financial_revenue) }} 万元</text>
              </view>
            </view>
            <!-- 展示更详细的财务指标 -->
            <view v-if="customer.business_performance[0]" class="financial-detail">
              <view class="detail-row">
                <text class="detail-label">内部营收</text>
                <text class="detail-value">{{ formatNumber(customer.business_performance[0].internal_financial_revenue) }} 万元</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">内部总利润</text>
                <text class="detail-value">{{ formatNumber(customer.business_performance[0].internal_financial_totalprofit) }} 万元</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">内部净利润</text>
                <text class="detail-value">{{ formatNumber(customer.business_performance[0].internal_financial_netprofit) }} 万元</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">资产负债率</text>
                <text class="detail-value">{{ formatNumber(customer.business_performance[0].debt_ratio) }}%</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">应收账款</text>
                <text class="detail-value">{{ formatNumber(customer.business_performance[0].accounts_receivable) }} 万元</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">应付账款</text>
                <text class="detail-value">{{ formatNumber(customer.business_performance[0].accounts_payable) }} 万元</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 水电租金 -->
        <view class="card" v-if="hasUtilitiesData">
          <view class="card-title">水电租金</view>
          <view class="card-content">
            <view class="data-row" v-if="customer.water_fee_last_year">
              <text class="data-label">上年度水费</text>
              <text class="data-value">{{ formatNumber(customer.water_fee_last_year) }} 万元</text>
            </view>
            <view class="data-row" v-if="customer.water_fee_last_month">
              <text class="data-label">上月水费</text>
              <text class="data-value">{{ formatNumber(customer.water_fee_last_month) }} 万元</text>
            </view>
            <view class="data-row" v-if="customer.electricity_fee_last_year">
              <text class="data-label">上年度电费</text>
              <text class="data-value">{{ formatNumber(customer.electricity_fee_last_year) }} 万元</text>
            </view>
            <view class="data-row" v-if="customer.electricity_fee_last_month">
              <text class="data-label">上月电费</text>
              <text class="data-value">{{ formatNumber(customer.electricity_fee_last_month) }} 万元</text>
            </view>
            <view class="data-row" v-if="customer.rent_last_year">
              <text class="data-label">上年度房租</text>
              <text class="data-value">{{ formatNumber(customer.rent_last_year) }} 万元</text>
            </view>
            <view class="data-row" v-if="customer.rent_last_month">
              <text class="data-label">上月房租</text>
              <text class="data-value">{{ formatNumber(customer.rent_last_month) }} 万元</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 信用与征信 -->
      <view class="section" v-if="hasCreditData">
        <view class="section-title">信用与征信</view>
        <view class="section-content">
          <view class="card">
            <view class="card-title">纳税信用</view>
            <view class="card-content">
              <view class="data-row" v-if="customer.tax_rating">
                <text class="data-label">信用等级</text>
                <text class="data-value">{{ customer.tax_rating }}</text>
              </view>
              <view class="data-row" v-if="customer.tax_intro">
                <text class="data-label">说明</text>
                <text class="data-value">{{ customer.tax_intro }}</text>
              </view>
            </view>
          </view>

          <view class="card" v-if="hasQueryRecords">
            <view class="card-title">征信查询记录</view>
            <view class="card-content">
              <view class="data-row" v-if="customer.corporate_credit_query_half_year">
                <text class="data-label">企业征信查询</text>
                <text class="data-value">{{ customer.corporate_credit_query_half_year }} 次 (最近: {{ formatDate(customer.corporate_credit_last_query_time) }})</text>
              </view>
              <view class="data-row" v-if="customer.corporate_credit_result">
                <text class="data-label">结果</text>
                <text class="data-value">{{ customer.corporate_credit_result }}</text>
              </view>
              <view class="data-row" v-if="customer.actual_credit_query_half_year">
                <text class="data-label">实际控制人征信</text>
                <text class="data-value">{{ customer.actual_credit_query_half_year }} 次 (最近: {{ formatDate(customer.actual_credit_last_query_time) }})</text>
              </view>
              <view class="data-row" v-if="customer.actual_credit_result">
                <text class="data-label">结果</text>
                <text class="data-value">{{ customer.actual_credit_result }}</text>
              </view>
              <view class="data-row" v-if="customer.legal_credit_query_half_year">
                <text class="data-label">法人征信查询</text>
                <text class="data-value">{{ customer.legal_credit_query_half_year }} 次 (最近: {{ formatDate(customer.legal_credit_last_query_time) }})</text>
              </view>
              <view class="data-row" v-if="customer.legal_credit_result">
                <text class="data-label">结果</text>
                <text class="data-value">{{ customer.legal_credit_result }}</text>
              </view>
            </view>
          </view>

          <view class="card" v-if="hasGuaranteeData">
            <view class="card-title">担保与负债</view>
            <view class="card-content">
              <view class="data-row" v-if="customer.external_guarantee_intro">
                <text class="data-label">对外担保</text>
                <text class="data-value">{{ customer.external_guarantee_intro }}</text>
              </view>
              <view class="data-row" v-if="customer.overdue_intro">
                <text class="data-label">逾期情况</text>
                <text class="data-value">{{ customer.overdue_intro }}</text>
              </view>
              <view class="data-row" v-if="customer.pledged_deposit_intro">
                <text class="data-label">存单质押</text>
                <text class="data-value">{{ customer.pledged_deposit_intro }}</text>
              </view>
              <view class="data-row" v-if="customer.bank_acceptance_intro">
                <text class="data-label">银行承兑汇票</text>
                <text class="data-value">{{ customer.bank_acceptance_intro }}</text>
              </view>
              <view class="data-row" v-if="customer.supply_chain_finance_intro">
                <text class="data-label">供应链金融</text>
                <text class="data-value">{{ customer.supply_chain_finance_intro }}</text>
              </view>
              <view class="data-row" v-if="customer.procurement_intro">
                <text class="data-label">采购融资</text>
                <text class="data-value">{{ customer.procurement_intro }}</text>
              </view>
              <view class="data-row" v-if="customer.finance_lease_intro">
                <text class="data-label">融资租赁</text>
                <text class="data-value">{{ customer.finance_lease_intro }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 知识产权与研发 -->
      <view class="section" v-if="hasIpData">
        <view class="section-title">知识产权与研发</view>
        <view class="section-content">
          <view class="card">
            <view class="card-title">知识产权</view>
            <view class="card-content">
              <view class="data-row" v-if="customer.copyrights">
                <text class="data-label">版权</text>
                <text class="data-value">{{ customer.copyrights }} 项</text>
              </view>
              <view class="data-row" v-if="customer.trademark_count">
                <text class="data-label">商标</text>
                <text class="data-value">{{ customer.trademark_count }} 项</text>
              </view>
              <view class="data-row" v-if="customer.brand_count">
                <text class="data-label">品牌</text>
                <text class="data-value">{{ customer.brand_count }} 项</text>
              </view>
              <view class="data-row multi-line" v-if="customer.patent_detail">
                <text class="data-label">专利详情</text>
                <text class="data-value">{{ customer.patent_detail }}</text>
              </view>
            </view>
          </view>

          <view class="card" v-if="customer.rnd_staff_count || customer.rnd_investment_intro">
            <view class="card-title">研发实力</view>
            <view class="card-content">
              <view class="data-row" v-if="customer.rnd_staff_count">
                <text class="data-label">研发人员</text>
                <text class="data-value">{{ customer.rnd_staff_count }} 人</text>
              </view>
              <view class="data-row multi-line" v-if="customer.rnd_investment_intro">
                <text class="data-label">研发投入</text>
                <text class="data-value">{{ customer.rnd_investment_intro }}</text>
              </view>
              <view class="data-row" v-if="customer.proprietary_tech">
                <text class="data-label">专有技术</text>
                <text class="data-value">{{ customer.proprietary_tech }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 未来规划 -->
      <view class="section" v-if="hasFutureData">
        <view class="section-title">未来规划</view>
        <view class="section-content">
          <view class="card">
            <view class="card-content">
              <view class="data-row multi-line" v-if="customer.next_year_business_intro">
                <text class="data-label">业务展望</text>
                <text class="data-value">{{ customer.next_year_business_intro }}</text>
              </view>
              <view class="data-row" v-if="customer.planned_revenue">
                <text class="data-label">计划营收</text>
                <text class="data-value">{{ formatNumber(customer.planned_revenue) }} 万元</text>
              </view>
              <view class="data-row" v-if="customer.planned_netprofit">
                <text class="data-label">计划净利润</text>
                <text class="data-value">{{ formatNumber(customer.planned_netprofit) }} 万元</text>
              </view>
              <view class="data-row" v-if="customer.new_financing_needs">
                <text class="data-label">融资需求</text>
                <text class="data-value">{{ customer.new_financing_needs }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 股权与固定资产投资 -->
      <view class="section" v-if="hasInvestmentData">
        <view class="section-title">股权与固定资产投资</view>
        <view class="section-content">
          <view class="card" v-if="customer.equity_investment_amount || customer.equity_investment_ratio">
            <view class="card-title">股权融资</view>
            <view class="card-content">
              <view class="data-row" v-if="customer.equity_investment_amount">
                <text class="data-label">拟引入金额</text>
                <text class="data-value">{{ formatNumber(customer.equity_investment_amount) }} 万元</text>
              </view>
              <view class="data-row" v-if="customer.equity_investment_ratio">
                <text class="data-label">拟让股份比例</text>
                <text class="data-value">{{ customer.equity_investment_ratio }}%</text>
              </view>
              <view class="data-row multi-line" v-if="customer.equity_investment_intro">
                <text class="data-label">说明</text>
                <text class="data-value">{{ customer.equity_investment_intro }}</text>
              </view>
            </view>
          </view>

          <view class="card" v-if="customer.fixed_asset_investment_amount">
            <view class="card-title">固定资产投资</view>
            <view class="card-content">
              <view class="data-row">
                <text class="data-label">投资金额</text>
                <text class="data-value">{{ formatNumber(customer.fixed_asset_investment_amount) }} 万元</text>
              </view>
              <view class="data-row" v-if="customer.fixed_asset_investment_source">
                <text class="data-label">资金来源</text>
                <text class="data-value">{{ customer.fixed_asset_investment_source }}</text>
              </view>
              <view class="data-row multi-line" v-if="customer.fixed_asset_investment_intro">
                <text class="data-label">说明</text>
                <text class="data-value">{{ customer.fixed_asset_investment_intro }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 对外投资 -->
      <view class="section" v-if="customer.investments && customer.investments.length">
        <view class="section-title">对外投资</view>
        <view class="section-content">
          <view 
            class="investment-row" 
            v-for="item in customer.investments" 
            :key="item._id"
          >
            <view class="investment-info">
              <text class="company-name">{{ item.company_name }}</text>
              <text class="investment-detail">{{ item.main_business }}</text>
            </view>
            <text class="investment-ratio">{{ item.investment_ratio }}%</text>
          </view>
        </view>
      </view>

      <!-- 不动产 -->
      <view class="section" v-if="customer.properties && customer.properties.length">
        <view class="section-title">不动产</view>
        <view class="section-content">
          <view 
            class="property-row" 
            v-for="item in customer.properties" 
            :key="item._id"
          >
            <view class="property-info">
              <text class="property-type">{{ item.property_type }}</text>
              <text class="property-area">{{ item.area }} ㎡</text>
            </view>
            <text class="property-location">{{ item.location }}</text>
          </view>
        </view>
      </view>

      <!-- 补贴记录 -->
      <view class="section" v-if="customer.subsidies && customer.subsidies.length">
        <view class="section-title">补贴记录</view>
        <view class="section-content">
          <view 
            class="subsidy-row" 
            v-for="item in customer.subsidies" 
            :key="item._id"
          >
            <text class="project-name">{{ item.project_name }}</text>
            <text class="subsidy-amount">{{ formatNumber(item.grant_amount) }} 万元</text>
          </view>
        </view>
      </view>

      <!-- 涉诉信息 -->
      <view class="section" v-if="customer.lawsuits && customer.lawsuits.length">
        <view class="section-title">涉诉信息</view>
        <view class="section-content">
          <view 
            class="lawsuit-row" 
            v-for="item in customer.lawsuits" 
            :key="item._id"
          >
            <view class="lawsuit-info">
              <text class="lawsuit-role">{{ item.role }}</text>
              <text class="lawsuit-amount">{{ formatNumber(item.case_amount) }} 万元</text>
            </view>
            <text class="lawsuit-progress" v-if="item.case_progress">状态: {{ item.case_progress }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      customer: null
    };
  },
  computed: {
    hasFinancialData() {
      return (this.customer?.bank_flows?.length || 0) > 0 ||
             (this.customer?.shareholders?.length || 0) > 0 ||
             (this.customer?.tax_records?.length || 0) > 0 ||
             (this.customer?.loans?.length || 0) > 0 ||
             (this.customer?.business_performance?.length || 0) > 0 ||
             this.hasUtilitiesData;
    },
    hasUtilitiesData() {
      return this.customer?.water_fee_last_year || this.customer?.electricity_fee_last_year || this.customer?.rent_last_year;
    },
    hasCreditData() {
      return this.customer?.tax_rating || this.hasQueryRecords || this.hasGuaranteeData;
    },
    hasQueryRecords() {
      return this.customer?.corporate_credit_query_half_year || this.customer?.actual_credit_query_half_year || this.customer?.legal_credit_query_half_year;
    },
    hasGuaranteeData() {
      return this.customer?.external_guarantee_intro || this.customer?.overdue_intro || this.customer?.pledged_deposit_intro ||
             this.customer?.bank_acceptance_intro || this.customer?.supply_chain_finance_intro || this.customer?.procurement_intro ||
             this.customer?.finance_lease_intro;
    },
    hasIpData() {
      return this.customer?.copyrights || this.customer?.trademark_count || this.customer?.brand_count || this.customer?.patent_detail ||
             this.customer?.rnd_staff_count || this.customer?.rnd_investment_intro;
    },
    hasFutureData() {
      return this.customer?.next_year_business_intro || this.customer?.planned_revenue || this.customer?.new_financing_needs;
    },
    hasInvestmentData() {
      return this.customer?.equity_investment_amount || this.customer?.fixed_asset_investment_amount;
    }
  },
  onLoad(options = {}) {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel && typeof eventChannel.on === 'function') {
      eventChannel.on('data', (data) => {
        this.customer = data.customer;
      });
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    showMore() {
      uni.showActionSheet({
        itemList: ['编辑', '导出', '分享'],
        success: (res) => {
          console.log('选择了：' + res.tapIndex);
        }
      });
    },
    formatNumber(num) {
      if (num === undefined || num === null) return '—';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatDate(date) {
      if (!date) return '—';
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      } catch (e) {
        return date;
      }
    },
    calculateUsageRate(loan) {
      if (!loan.total_limit || loan.total_limit === 0) return '0';
      const rate = (loan.actual_amount / loan.total_limit) * 100;
      return Math.round(rate);
    }
  }
};
</script>

<style lang="scss" scoped>
/* 保持原有样式，新增 .multi-line 和 .financial-detail 等类 */
.detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-color: #007aff;
  color: #ffffff;
  padding: 0 32rpx;
  position: sticky;
  top: 0;
  z-index: 1000;
  
  .navbar-left,
  .navbar-right {
    width: 80rpx;
    display: flex;
    align-items: center;
  }
  
  .navbar-title {
    font-size: 36rpx;
    font-weight: 600;
    flex: 1;
    text-align: center;
  }
}

.company-header {
  background-color: #007aff;
  padding: 32rpx 32rpx 40rpx;
  color: #ffffff;
  
  .company-name {
    font-size: 40rpx;
    font-weight: 600;
    margin-bottom: 24rpx;
    line-height: 1.2;
  }
  
  .company-tags {
    display: flex;
    gap: 16rpx;
    
    .tag {
      font-size: 24rpx;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      background-color: rgba(255, 255, 255, 0.2);
      
      &.industry {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      &.legal-person {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.section {
  background-color: #ffffff;
  margin-top: 24rpx;
  padding: 0 32rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
    padding: 32rpx 0 24rpx;
    border-bottom: 2rpx solid #007aff;
    margin-bottom: 24rpx;
  }
  
  .section-content {
    padding-bottom: 32rpx;
  }
}

.card {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .card-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #666666;
    margin-bottom: 20rpx;
    padding-left: 12rpx;
    border-left: 6rpx solid #007aff;
  }
  
  .card-content {
    background-color: #f9f9f9;
    border-radius: 16rpx;
    padding: 24rpx;
  }
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  min-height: 88rpx;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #eeeeee;
  }
  
  .data-label {
    font-size: 28rpx;
    color: #333333;
    flex: 1;
  }
  
  .data-value {
    font-size: 28rpx;
    font-weight: 600;
    color: #007aff;
    min-width: 200rpx;
    text-align: right;
    
    &.tax {
      color: #ff6b35;
    }
  }
  
  .data-label-group {
    display: flex;
    flex-direction: column;
    flex: 1;
    
    .tax-type {
      font-size: 24rpx;
      color: #999999;
      margin-top: 4rpx;
    }
  }
  
  .data-values {
    display: flex;
    gap: 16rpx;
    min-width: 200rpx;
    justify-content: flex-end;
    
    .value-tag {
      font-size: 24rpx;
      padding: 8rpx 16rpx;
      border-radius: 12rpx;
      font-weight: 600;
      
      &.capital {
        background-color: #d9f7be;
        color: #389e0d;
      }
      
      &.ratio {
        background-color: #fff7e6;
        color: #fa8c16;
      }
    }
  }
}

.info-row {
  display: flex;
  padding: 24rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #eeeeee;
  }
  
  .info-label {
    font-size: 28rpx;
    color: #666666;
    width: 200rpx;
  }
  
  .info-value {
    font-size: 28rpx;
    color: #333333;
    flex: 1;
    text-align: right;
  }
  
  &.multi-line {
    flex-direction: column;
    align-items: flex-start;
    .info-label {
      width: auto;
      margin-bottom: 12rpx;
    }
    .info-value {
      text-align: left;
      line-height: 1.4;
    }
  }
}

.loan-row {
  padding: 24rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #eeeeee;
  }
  
  .loan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .bank-name {
      font-size: 28rpx;
      color: #333333;
      font-weight: 600;
    }
    
    .loan-name {
      font-size: 24rpx;
      color: #666666;
      background-color: #f0f0f0;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
    }
  }
  
  .loan-data {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    
    .loan-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .loan-label {
        font-size: 24rpx;
        color: #999999;
        margin-bottom: 8rpx;
      }
      
      .loan-value {
        font-size: 28rpx;
        font-weight: 600;
        
        &.total {
          color: #007aff;
        }
        
        &.used {
          color: #ff4d4f;
        }
        
        &.rate {
          color: #52c41a;
        }
      }
    }
  }
  
  .loan-progress {
    height: 8rpx;
    background-color: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;
    
    .progress-bar {
      height: 100%;
      background-color: #007aff;
      border-radius: 4rpx;
      transition: width 0.3s ease;
    }
  }
  
  .loan-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
    .loan-detail {
      font-size: 24rpx;
      color: #999999;
    }
  }
}

.performance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #eeeeee;
  }
  
  .performance-value {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 200rpx;
    
    .revenue-label {
      font-size: 24rpx;
      color: #999999;
      margin-bottom: 4rpx;
    }
    
    .revenue-value {
      font-size: 32rpx;
      font-weight: 600;
      color: #13c2c2;
    }
  }
}

.financial-detail {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed #eeeeee;
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 12rpx 0;
    
    .detail-label {
      font-size: 26rpx;
      color: #666666;
    }
    
    .detail-value {
      font-size: 26rpx;
      font-weight: 500;
      color: #333333;
    }
  }
}

.investment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #eeeeee;
  }
  
  .investment-info {
    flex: 1;
    .company-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #333333;
      display: block;
      margin-bottom: 8rpx;
    }
    .investment-detail {
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .investment-ratio {
    font-size: 28rpx;
    color: #007aff;
    font-weight: 600;
    min-width: 120rpx;
    text-align: right;
  }
}

.property-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #eeeeee;
  }
  
  .property-info {
    display: flex;
    flex-direction: column;
    
    .property-type {
      font-size: 28rpx;
      color: #333333;
      font-weight: 600;
      margin-bottom: 8rpx;
    }
    
    .property-area {
      font-size: 24rpx;
      color: #666666;
    }
  }
  
  .property-location {
    font-size: 24rpx;
    color: #999999;
    max-width: 300rpx;
    text-align: right;
  }
}

.subsidy-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #eeeeee;
  }
  
  .subsidy-amount {
    font-size: 28rpx;
    color: #52c41a;
    font-weight: 600;
    min-width: 200rpx;
    text-align: right;
  }
}

.lawsuit-row {
  padding: 24rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #eeeeee;
  }
  
  .lawsuit-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
    
    .lawsuit-role {
      font-size: 28rpx;
      color: #333333;
      padding: 8rpx 16rpx;
      background-color: #f0f0f0;
      border-radius: 12rpx;
    }
    
    .lawsuit-amount {
      font-size: 28rpx;
      color: #ff4d4f;
      font-weight: 600;
      min-width: 200rpx;
      text-align: right;
    }
  }
  
  .lawsuit-progress {
    font-size: 24rpx;
    color: #999999;
    padding-left: 80rpx;
  }
}
</style>