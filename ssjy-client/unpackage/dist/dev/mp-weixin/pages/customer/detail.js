"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      customer: null
    };
  },
  computed: {
    hasFinancialData() {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      return (((_b = (_a = this.customer) == null ? void 0 : _a.bank_flows) == null ? void 0 : _b.length) || 0) > 0 || (((_d = (_c = this.customer) == null ? void 0 : _c.shareholders) == null ? void 0 : _d.length) || 0) > 0 || (((_f = (_e = this.customer) == null ? void 0 : _e.tax_records) == null ? void 0 : _f.length) || 0) > 0 || (((_h = (_g = this.customer) == null ? void 0 : _g.loans) == null ? void 0 : _h.length) || 0) > 0 || (((_j = (_i = this.customer) == null ? void 0 : _i.business_performance) == null ? void 0 : _j.length) || 0) > 0 || this.hasUtilitiesData;
    },
    hasUtilitiesData() {
      var _a, _b, _c;
      return ((_a = this.customer) == null ? void 0 : _a.water_fee_last_year) || ((_b = this.customer) == null ? void 0 : _b.electricity_fee_last_year) || ((_c = this.customer) == null ? void 0 : _c.rent_last_year);
    },
    hasCreditData() {
      var _a;
      return ((_a = this.customer) == null ? void 0 : _a.tax_rating) || this.hasQueryRecords || this.hasGuaranteeData;
    },
    hasQueryRecords() {
      var _a, _b, _c;
      return ((_a = this.customer) == null ? void 0 : _a.corporate_credit_query_half_year) || ((_b = this.customer) == null ? void 0 : _b.actual_credit_query_half_year) || ((_c = this.customer) == null ? void 0 : _c.legal_credit_query_half_year);
    },
    hasGuaranteeData() {
      var _a, _b, _c, _d, _e, _f, _g;
      return ((_a = this.customer) == null ? void 0 : _a.external_guarantee_intro) || ((_b = this.customer) == null ? void 0 : _b.overdue_intro) || ((_c = this.customer) == null ? void 0 : _c.pledged_deposit_intro) || ((_d = this.customer) == null ? void 0 : _d.bank_acceptance_intro) || ((_e = this.customer) == null ? void 0 : _e.supply_chain_finance_intro) || ((_f = this.customer) == null ? void 0 : _f.procurement_intro) || ((_g = this.customer) == null ? void 0 : _g.finance_lease_intro);
    },
    hasIpData() {
      var _a, _b, _c, _d, _e, _f;
      return ((_a = this.customer) == null ? void 0 : _a.copyrights) || ((_b = this.customer) == null ? void 0 : _b.trademark_count) || ((_c = this.customer) == null ? void 0 : _c.brand_count) || ((_d = this.customer) == null ? void 0 : _d.patent_detail) || ((_e = this.customer) == null ? void 0 : _e.rnd_staff_count) || ((_f = this.customer) == null ? void 0 : _f.rnd_investment_intro);
    },
    hasFutureData() {
      var _a, _b, _c;
      return ((_a = this.customer) == null ? void 0 : _a.next_year_business_intro) || ((_b = this.customer) == null ? void 0 : _b.planned_revenue) || ((_c = this.customer) == null ? void 0 : _c.new_financing_needs);
    },
    hasInvestmentData() {
      var _a, _b;
      return ((_a = this.customer) == null ? void 0 : _a.equity_investment_amount) || ((_b = this.customer) == null ? void 0 : _b.fixed_asset_investment_amount);
    }
  },
  onLoad(options = {}) {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel && typeof eventChannel.on === "function") {
      eventChannel.on("data", (data) => {
        this.customer = data.customer;
      });
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    showMore() {
      common_vendor.index.showActionSheet({
        itemList: ["编辑", "导出", "分享"],
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/customer/detail.vue:622", "选择了：" + res.tapIndex);
        }
      });
    },
    formatNumber(num) {
      if (num === void 0 || num === null)
        return "—";
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatDate(date) {
      if (!date)
        return "—";
      try {
        const d = new Date(date);
        if (isNaN(d.getTime()))
          return date;
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      } catch (e) {
        return date;
      }
    },
    calculateUsageRate(loan) {
      if (!loan.total_limit || loan.total_limit === 0)
        return "0";
      const rate = loan.actual_amount / loan.total_limit * 100;
      return Math.round(rate);
    }
  }
};
if (!Array) {
  const _easycom_u_loading_page2 = common_vendor.resolveComponent("u-loading-page");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  (_easycom_u_loading_page2 + _easycom_u_icon2)();
}
const _easycom_u_loading_page = () => "../../uni_modules/vk-uview-ui/components/u-loading-page/u-loading-page.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
if (!Math) {
  (_easycom_u_loading_page + _easycom_u_icon)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.customer
  }, !$data.customer ? {
    b: common_vendor.p({
      ["loading-text"]: "加载中..."
    })
  } : common_vendor.e({
    c: common_vendor.p({
      name: "arrow-left",
      size: "22",
      color: "#ffffff"
    }),
    d: common_vendor.o((...args) => $options.goBack && $options.goBack(...args), "3d"),
    e: common_vendor.p({
      name: "more-dot-fill",
      size: "22",
      color: "#ffffff"
    }),
    f: common_vendor.o((...args) => $options.showMore && $options.showMore(...args), "57"),
    g: common_vendor.t($data.customer.company_name || "—"),
    h: $data.customer.industry
  }, $data.customer.industry ? {
    i: common_vendor.t($data.customer.industry)
  } : {}, {
    j: $data.customer.legal_person
  }, $data.customer.legal_person ? {
    k: common_vendor.t($data.customer.legal_person)
  } : {}, {
    l: common_vendor.t($options.formatDate($data.customer.established_date)),
    m: common_vendor.t($options.formatNumber($data.customer.registered_capital)),
    n: common_vendor.t($options.formatNumber($data.customer.paid_in_capital)),
    o: common_vendor.t($data.customer.business_nature || "—"),
    p: common_vendor.t($data.customer.enterprise_type || "—"),
    q: common_vendor.t($data.customer.listing_status || "—"),
    r: common_vendor.t($data.customer.qualifications || "—"),
    s: common_vendor.t($data.customer.basic_bank || "—"),
    t: common_vendor.t($options.formatNumber($data.customer.total_employees)),
    v: common_vendor.t($options.formatNumber($data.customer.monthly_payroll)),
    w: common_vendor.t($options.formatNumber($data.customer.senior_cert_count)),
    x: common_vendor.t($options.formatNumber($data.customer.mid_cert_count)),
    y: common_vendor.t($options.formatNumber($data.customer.master_count)),
    z: common_vendor.t($options.formatNumber($data.customer.doctor_count)),
    A: common_vendor.t($data.customer.actual_controller || "—"),
    B: common_vendor.t($data.customer.general_manager || "—"),
    C: common_vendor.t($data.customer.core_personnel || "—"),
    D: $data.customer.company_intro
  }, $data.customer.company_intro ? {
    E: common_vendor.t($data.customer.company_intro)
  } : {}, {
    F: $data.customer.address
  }, $data.customer.address ? common_vendor.e({
    G: common_vendor.t($data.customer.address),
    H: $data.customer.contact_person_info
  }, $data.customer.contact_person_info ? {
    I: common_vendor.t($data.customer.contact_person_info)
  } : {}) : {}, {
    J: $options.hasFinancialData
  }, $options.hasFinancialData ? common_vendor.e({
    K: $data.customer.bank_flows && $data.customer.bank_flows.length
  }, $data.customer.bank_flows && $data.customer.bank_flows.length ? {
    L: common_vendor.f($data.customer.bank_flows, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.bank_name),
        b: common_vendor.t($options.formatNumber(item.half_year_total_flow)),
        c: item._id
      };
    })
  } : {}, {
    M: $data.customer.shareholders && $data.customer.shareholders.length
  }, $data.customer.shareholders && $data.customer.shareholders.length ? {
    N: common_vendor.f($data.customer.shareholders, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.shareholder_name),
        b: common_vendor.t($options.formatNumber(item.actual_capital)),
        c: common_vendor.t(item.ownership_ratio),
        d: item._id
      };
    })
  } : {}, {
    O: $data.customer.tax_records && $data.customer.tax_records.length
  }, $data.customer.tax_records && $data.customer.tax_records.length ? {
    P: common_vendor.f($data.customer.tax_records, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.year),
        b: common_vendor.t(item.tax_type),
        c: common_vendor.t(item.tax_rate),
        d: common_vendor.t($options.formatNumber(item.tax_paid)),
        e: item._id
      };
    })
  } : {}, {
    Q: $data.customer.loans && $data.customer.loans.length
  }, $data.customer.loans && $data.customer.loans.length ? {
    R: common_vendor.f($data.customer.loans, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.bank_name),
        b: common_vendor.t(item.loan_name),
        c: common_vendor.t($options.formatNumber(item.total_limit)),
        d: common_vendor.t($options.formatNumber(item.actual_amount)),
        e: common_vendor.t($options.calculateUsageRate(item)),
        f: $options.calculateUsageRate(item) + "%",
        g: item.annual_rate || item.guarantor
      }, item.annual_rate || item.guarantor ? {
        h: common_vendor.t(item.annual_rate),
        i: common_vendor.t(item.guarantor || "无")
      } : {}, {
        j: item._id
      });
    })
  } : {}, {
    S: $data.customer.business_performance && $data.customer.business_performance.length
  }, $data.customer.business_performance && $data.customer.business_performance.length ? common_vendor.e({
    T: common_vendor.f($data.customer.business_performance, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.year),
        b: common_vendor.t($options.formatNumber(item.external_financial_revenue)),
        c: item._id
      };
    }),
    U: $data.customer.business_performance[0]
  }, $data.customer.business_performance[0] ? {
    V: common_vendor.t($options.formatNumber($data.customer.business_performance[0].internal_financial_revenue)),
    W: common_vendor.t($options.formatNumber($data.customer.business_performance[0].internal_financial_totalprofit)),
    X: common_vendor.t($options.formatNumber($data.customer.business_performance[0].internal_financial_netprofit)),
    Y: common_vendor.t($options.formatNumber($data.customer.business_performance[0].debt_ratio)),
    Z: common_vendor.t($options.formatNumber($data.customer.business_performance[0].accounts_receivable)),
    aa: common_vendor.t($options.formatNumber($data.customer.business_performance[0].accounts_payable))
  } : {}) : {}, {
    ab: $options.hasUtilitiesData
  }, $options.hasUtilitiesData ? common_vendor.e({
    ac: $data.customer.water_fee_last_year
  }, $data.customer.water_fee_last_year ? {
    ad: common_vendor.t($options.formatNumber($data.customer.water_fee_last_year))
  } : {}, {
    ae: $data.customer.water_fee_last_month
  }, $data.customer.water_fee_last_month ? {
    af: common_vendor.t($options.formatNumber($data.customer.water_fee_last_month))
  } : {}, {
    ag: $data.customer.electricity_fee_last_year
  }, $data.customer.electricity_fee_last_year ? {
    ah: common_vendor.t($options.formatNumber($data.customer.electricity_fee_last_year))
  } : {}, {
    ai: $data.customer.electricity_fee_last_month
  }, $data.customer.electricity_fee_last_month ? {
    aj: common_vendor.t($options.formatNumber($data.customer.electricity_fee_last_month))
  } : {}, {
    ak: $data.customer.rent_last_year
  }, $data.customer.rent_last_year ? {
    al: common_vendor.t($options.formatNumber($data.customer.rent_last_year))
  } : {}, {
    am: $data.customer.rent_last_month
  }, $data.customer.rent_last_month ? {
    an: common_vendor.t($options.formatNumber($data.customer.rent_last_month))
  } : {}) : {}) : {}, {
    ao: $options.hasCreditData
  }, $options.hasCreditData ? common_vendor.e({
    ap: $data.customer.tax_rating
  }, $data.customer.tax_rating ? {
    aq: common_vendor.t($data.customer.tax_rating)
  } : {}, {
    ar: $data.customer.tax_intro
  }, $data.customer.tax_intro ? {
    as: common_vendor.t($data.customer.tax_intro)
  } : {}, {
    at: $options.hasQueryRecords
  }, $options.hasQueryRecords ? common_vendor.e({
    av: $data.customer.corporate_credit_query_half_year
  }, $data.customer.corporate_credit_query_half_year ? {
    aw: common_vendor.t($data.customer.corporate_credit_query_half_year),
    ax: common_vendor.t($options.formatDate($data.customer.corporate_credit_last_query_time))
  } : {}, {
    ay: $data.customer.corporate_credit_result
  }, $data.customer.corporate_credit_result ? {
    az: common_vendor.t($data.customer.corporate_credit_result)
  } : {}, {
    aA: $data.customer.actual_credit_query_half_year
  }, $data.customer.actual_credit_query_half_year ? {
    aB: common_vendor.t($data.customer.actual_credit_query_half_year),
    aC: common_vendor.t($options.formatDate($data.customer.actual_credit_last_query_time))
  } : {}, {
    aD: $data.customer.actual_credit_result
  }, $data.customer.actual_credit_result ? {
    aE: common_vendor.t($data.customer.actual_credit_result)
  } : {}, {
    aF: $data.customer.legal_credit_query_half_year
  }, $data.customer.legal_credit_query_half_year ? {
    aG: common_vendor.t($data.customer.legal_credit_query_half_year),
    aH: common_vendor.t($options.formatDate($data.customer.legal_credit_last_query_time))
  } : {}, {
    aI: $data.customer.legal_credit_result
  }, $data.customer.legal_credit_result ? {
    aJ: common_vendor.t($data.customer.legal_credit_result)
  } : {}) : {}, {
    aK: $options.hasGuaranteeData
  }, $options.hasGuaranteeData ? common_vendor.e({
    aL: $data.customer.external_guarantee_intro
  }, $data.customer.external_guarantee_intro ? {
    aM: common_vendor.t($data.customer.external_guarantee_intro)
  } : {}, {
    aN: $data.customer.overdue_intro
  }, $data.customer.overdue_intro ? {
    aO: common_vendor.t($data.customer.overdue_intro)
  } : {}, {
    aP: $data.customer.pledged_deposit_intro
  }, $data.customer.pledged_deposit_intro ? {
    aQ: common_vendor.t($data.customer.pledged_deposit_intro)
  } : {}, {
    aR: $data.customer.bank_acceptance_intro
  }, $data.customer.bank_acceptance_intro ? {
    aS: common_vendor.t($data.customer.bank_acceptance_intro)
  } : {}, {
    aT: $data.customer.supply_chain_finance_intro
  }, $data.customer.supply_chain_finance_intro ? {
    aU: common_vendor.t($data.customer.supply_chain_finance_intro)
  } : {}, {
    aV: $data.customer.procurement_intro
  }, $data.customer.procurement_intro ? {
    aW: common_vendor.t($data.customer.procurement_intro)
  } : {}, {
    aX: $data.customer.finance_lease_intro
  }, $data.customer.finance_lease_intro ? {
    aY: common_vendor.t($data.customer.finance_lease_intro)
  } : {}) : {}) : {}, {
    aZ: $options.hasIpData
  }, $options.hasIpData ? common_vendor.e({
    ba: $data.customer.copyrights
  }, $data.customer.copyrights ? {
    bb: common_vendor.t($data.customer.copyrights)
  } : {}, {
    bc: $data.customer.trademark_count
  }, $data.customer.trademark_count ? {
    bd: common_vendor.t($data.customer.trademark_count)
  } : {}, {
    be: $data.customer.brand_count
  }, $data.customer.brand_count ? {
    bf: common_vendor.t($data.customer.brand_count)
  } : {}, {
    bg: $data.customer.patent_detail
  }, $data.customer.patent_detail ? {
    bh: common_vendor.t($data.customer.patent_detail)
  } : {}, {
    bi: $data.customer.rnd_staff_count || $data.customer.rnd_investment_intro
  }, $data.customer.rnd_staff_count || $data.customer.rnd_investment_intro ? common_vendor.e({
    bj: $data.customer.rnd_staff_count
  }, $data.customer.rnd_staff_count ? {
    bk: common_vendor.t($data.customer.rnd_staff_count)
  } : {}, {
    bl: $data.customer.rnd_investment_intro
  }, $data.customer.rnd_investment_intro ? {
    bm: common_vendor.t($data.customer.rnd_investment_intro)
  } : {}, {
    bn: $data.customer.proprietary_tech
  }, $data.customer.proprietary_tech ? {
    bo: common_vendor.t($data.customer.proprietary_tech)
  } : {}) : {}) : {}, {
    bp: $options.hasFutureData
  }, $options.hasFutureData ? common_vendor.e({
    bq: $data.customer.next_year_business_intro
  }, $data.customer.next_year_business_intro ? {
    br: common_vendor.t($data.customer.next_year_business_intro)
  } : {}, {
    bs: $data.customer.planned_revenue
  }, $data.customer.planned_revenue ? {
    bt: common_vendor.t($options.formatNumber($data.customer.planned_revenue))
  } : {}, {
    bv: $data.customer.planned_netprofit
  }, $data.customer.planned_netprofit ? {
    bw: common_vendor.t($options.formatNumber($data.customer.planned_netprofit))
  } : {}, {
    bx: $data.customer.new_financing_needs
  }, $data.customer.new_financing_needs ? {
    by: common_vendor.t($data.customer.new_financing_needs)
  } : {}) : {}, {
    bz: $options.hasInvestmentData
  }, $options.hasInvestmentData ? common_vendor.e({
    bA: $data.customer.equity_investment_amount || $data.customer.equity_investment_ratio
  }, $data.customer.equity_investment_amount || $data.customer.equity_investment_ratio ? common_vendor.e({
    bB: $data.customer.equity_investment_amount
  }, $data.customer.equity_investment_amount ? {
    bC: common_vendor.t($options.formatNumber($data.customer.equity_investment_amount))
  } : {}, {
    bD: $data.customer.equity_investment_ratio
  }, $data.customer.equity_investment_ratio ? {
    bE: common_vendor.t($data.customer.equity_investment_ratio)
  } : {}, {
    bF: $data.customer.equity_investment_intro
  }, $data.customer.equity_investment_intro ? {
    bG: common_vendor.t($data.customer.equity_investment_intro)
  } : {}) : {}, {
    bH: $data.customer.fixed_asset_investment_amount
  }, $data.customer.fixed_asset_investment_amount ? common_vendor.e({
    bI: common_vendor.t($options.formatNumber($data.customer.fixed_asset_investment_amount)),
    bJ: $data.customer.fixed_asset_investment_source
  }, $data.customer.fixed_asset_investment_source ? {
    bK: common_vendor.t($data.customer.fixed_asset_investment_source)
  } : {}, {
    bL: $data.customer.fixed_asset_investment_intro
  }, $data.customer.fixed_asset_investment_intro ? {
    bM: common_vendor.t($data.customer.fixed_asset_investment_intro)
  } : {}) : {}) : {}, {
    bN: $data.customer.investments && $data.customer.investments.length
  }, $data.customer.investments && $data.customer.investments.length ? {
    bO: common_vendor.f($data.customer.investments, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.company_name),
        b: common_vendor.t(item.main_business),
        c: common_vendor.t(item.investment_ratio),
        d: item._id
      };
    })
  } : {}, {
    bP: $data.customer.properties && $data.customer.properties.length
  }, $data.customer.properties && $data.customer.properties.length ? {
    bQ: common_vendor.f($data.customer.properties, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.property_type),
        b: common_vendor.t(item.area),
        c: common_vendor.t(item.location),
        d: item._id
      };
    })
  } : {}, {
    bR: $data.customer.subsidies && $data.customer.subsidies.length
  }, $data.customer.subsidies && $data.customer.subsidies.length ? {
    bS: common_vendor.f($data.customer.subsidies, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.project_name),
        b: common_vendor.t($options.formatNumber(item.grant_amount)),
        c: item._id
      };
    })
  } : {}, {
    bT: $data.customer.lawsuits && $data.customer.lawsuits.length
  }, $data.customer.lawsuits && $data.customer.lawsuits.length ? {
    bU: common_vendor.f($data.customer.lawsuits, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.role),
        b: common_vendor.t($options.formatNumber(item.case_amount)),
        c: item.case_progress
      }, item.case_progress ? {
        d: common_vendor.t(item.case_progress)
      } : {}, {
        e: item._id
      });
    })
  } : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-25465ad7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/customer/detail.js.map
