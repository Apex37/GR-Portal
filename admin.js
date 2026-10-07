/**
 * MahaSanket • Administrator Console Logic
 * Official Subscriber Monitoring & Alert Management
 */

(function () {
  "use strict";

  // Institutional Metadata Definitions
  const DEPARTMENTS_MAP = {
    1: { name: "General Administration Department (GAD)", marathi: "सामान्य प्रशासन विभाग" },
    2: { name: "Home Department", marathi: "गृह विभाग" },
    3: { name: "Revenue and Forest Department", marathi: "महसूल व वन विभाग" },
    4: { name: "Agriculture, Animal Husbandry & Fisheries", marathi: "कृषि, पशुसंवर्धन व मत्स्यव्यवसाय" },
    5: { name: "School Education and Sports", marathi: "शालेय शिक्षण व क्रीडा विभाग" },
    6: { name: "Finance Department", marathi: "वित्त विभाग" },
    7: { name: "Planning Department (MITRA)", marathi: "नियोजन विभाग" },
    8: { name: "Urban Development Department (UDD)", marathi: "नगर विकास विभाग" },
    9: { name: "Public Health & Family Welfare", marathi: "सार्वजनिक आरोग्य विभाग" },
    10: { name: "Water Resources Department (WRD)", marathi: "जलसंपदा विभाग" },
    11: { name: "Law and Judiciary Department", marathi: "विधि व न्याय विभाग" },
    12: { name: "Rural Development & Panchayat Raj", marathi: "ग्रामविकास विभाग" },
    13: { name: "Industry, Energy & Labour", marathi: "उद्योग व ऊर्जा विभाग" },
    14: { name: "Social Justice & Special Assistance", marathi: "सामाजिक न्याय विभाग" },
    15: { name: "Higher & Technical Education", marathi: "उच्च व तंत्र शिक्षण विभाग" },
    16: { name: "Tribal Development Department", marathi: "आदिवासी विकास विभाग" },
    17: { name: "Environment & Climate Change", marathi: "पर्यावरण विभाग" },
    18: { name: "Public Works Department (PWD)", marathi: "सार्वजनिक बांधकाम विभाग" },
    19: { name: "Water Supply & Sanitation", marathi: "पाणीपुरवठा व स्वच्छता विभाग" },
    20: { name: "Food, Civil Supplies & Consumer Protection", marathi: "अन्न व नागरी पुरवठा" },
    21: { name: "Tourism & Cultural Affairs", marathi: "पर्यटन व सांस्कृतिक कार्य" },
    22: { name: "Minorities Development Department", marathi: "अल्पसंख्याक विकास" },
    23: { name: "Medical Education & Drugs", marathi: "वैद्यकीय शिक्षण विभाग" },
    24: { name: "Skill Development & Employment", marathi: "कौशल्य विकास व रोजगार" },
    25: { name: "Transport and Ports Department", marathi: "परिवहन व बंदरे विभाग" },
    26: { name: "Women & Child Development", marathi: "महिला व बाल विकास" },
    27: { name: "Soil & Water Conservation", marathi: "मृद व जलसंधारण" },
    28: { name: "Other Backward Bahujan Welfare (OBC)", marathi: "इतर मागास बहुजन कल्याण" },
    29: { name: "Divyang Welfare Department", marathi: "दिव्यांग कल्याण विभाग" },
    30: { name: "Information Technology (IT)", marathi: "माहिती तंत्रज्ञान विभाग" },
    31: { name: "Textiles Department", marathi: "वस्त्रोद्योग विभाग" },
    32: { name: "Housing Department", marathi: "गृहनिर्माण विभाग" },
    33: { name: "Co-operation & Marketing", marathi: "सहकार व पणन विभाग" },
    34: { name: "Marathi Language Department", marathi: "मराठी भाषा विभाग" },
  };

  const INTENTS_MAP = {
    FUND_SANCTION_AND_BUDGET: { label: "Budget & Fund Sanction", icon: "💰" },
    BANKING_AND_FINANCE: { label: "Banking & Credit", icon: "🏦" },
    WELFARE_AND_SUBSIDY: { label: "Welfare & Subsidies", icon: "🌾" },
    POLICY_AND_REGULATION: { label: "Policy & Rules", icon: "📜" },
    INFRASTRUCTURE_PROJECT: { label: "Infrastructure Projects", icon: "🏗️" },
    TRANSFER_AND_POSTING: { label: "Transfers & Postings", icon: "🔄" },
    TENDER_AND_PROCUREMENT: { label: "Tenders & Procurement", icon: "📑" },
    SERVICE_RULES_AND_CADRE: { label: "Service Rules & Cadre", icon: "📝" },
    RECRUITMENT_AND_VACANCY: { label: "Recruitment & Vacancies", icon: "📢" },
    COMMITTEE_AND_INQUIRY: { label: "Committees & Inquiries", icon: "🔍" },
    GENERAL_ADMINISTRATIVE: { label: "General Administrative", icon: "🏢" },
  };

  const PRESETS_MAP = {
    CITIZEN_PUBLIC: { label: "Citizens, Farmers & Welfare", icon: "🌾" },
    BUREAUCRACY_OFFICIALS: { label: "Govt Officers & Consultants", icon: "📋" },
    COMMERCIAL_VENDOR: { label: "Contractors & Business", icon: "💼" },
    STUDENTS_AND_YOUTH: { label: "Students & Youth", icon: "🎓" },
    HEALTHCARE_PROFESSIONALS: { label: "Doctors & Healthcare", icon: "🩺" },
    JOURNALIST_RESEARCHER: { label: "Media & Policy Analysts", icon: "📰" },
    CUSTOM: { label: "Custom Configuration", icon: "⚙️" },
  };

  // State
  const state = {
    session: null,
    subscribers: [],
    filtered: [],
    searchTerm: "",
    statusFilter: "ALL", // "ALL" | "ACTIVE" | "PAUSED"
    categoryFilter: "ALL",
    divisionFilter: "ALL",
    inspectingUser: null,
    isLoading: false,
  };

  // DOM Elements
  const el = {
    loginView: document.getElementById("admin-login-view"),
    dashboardView: document.getElementById("admin-dashboard-view"),
    loginForm: document.getElementById("admin-login-form"),
    userInput: document.getElementById("admin-user-input"),
    passInput: document.getElementById("admin-pass-input"),
    loginError: document.getElementById("login-error-alert"),
    loginBtnSpinner: document.getElementById("login-btn-spinner"),
    loginBtnText: document.getElementById("login-btn-text"),
    btnAutofill: document.getElementById("btn-autofill-creds"),
    btnAutofillPraveen: document.getElementById("btn-autofill-praveen"),
    adminLogoutBtn: document.getElementById("admin-logout-btn"),
    adminDisplayName: document.getElementById("admin-display-name"),
    adminDisplayRole: document.getElementById("admin-display-role"),

    // Metrics
    metricTotal: document.getElementById("metric-total-users"),
    metricActive: document.getElementById("metric-active-users"),
    metricPaused: document.getElementById("metric-paused-users"),
    metricDistricts: document.getElementById("metric-districts-covered"),

    // Filters
    searchInput: document.getElementById("subscriber-search-input"),
    clearSearchBtn: document.getElementById("clear-search-btn"),
    statusBtns: document.querySelectorAll(".status-filter-btn"),
    badgeAll: document.getElementById("badge-count-all"),
    badgeActive: document.getElementById("badge-count-active"),
    badgePaused: document.getElementById("badge-count-paused"),
    roleSelect: document.getElementById("role-filter-select"),
    divisionSelect: document.getElementById("division-filter-select"),
    refreshBtn: document.getElementById("refresh-data-btn"),
    exportCsvBtn: document.getElementById("export-csv-btn"),

    // Table
    tableWrapper: document.getElementById("table-responsive-wrapper"),
    tableBody: document.getElementById("subscribers-table-body"),
    tableCounter: document.getElementById("table-showing-counter"),
    lastSyncLabel: document.getElementById("last-sync-label"),
    loadingState: document.getElementById("table-loading-state"),
    errorState: document.getElementById("table-error-state"),
    emptyState: document.getElementById("table-empty-state"),
    btnRetry: document.getElementById("btn-retry-load"),
    btnClearFilters: document.getElementById("btn-clear-all-filters"),

    // Drawer
    drawer: document.getElementById("subscriber-drawer"),
    drawerUserName: document.getElementById("drawer-user-name"),
    drawerUserPhone: document.getElementById("drawer-user-phone"),
    drawerContent: document.getElementById("drawer-body-content"),
    drawerWhatsappLink: document.getElementById("drawer-whatsapp-link"),
    closeDrawerBtn: document.getElementById("close-drawer-btn"),
    drawerCloseActionBtn: document.getElementById("drawer-close-action-btn"),

    // Analytics & Chart
    chartDeptSelect: document.getElementById("chart-dept-select"),
    toggleChartBar: document.getElementById("toggle-chart-bar"),
    toggleChartSpider: document.getElementById("toggle-chart-spider"),
    deptChartCanvas: document.getElementById("dept-frequency-chart"),
    analyticsSectionTitle: document.getElementById("analytics-section-title"),
    analyticsSectionSub: document.getElementById("analytics-section-sub"),
    chartStatDept: document.getElementById("chart-stat-dept"),
    chartStatPrimaryIntent: document.getElementById("chart-stat-primary-intent"),
    chartStatSecondaryIntent: document.getElementById("chart-stat-secondary-intent"),
    chartStatTotal: document.getElementById("chart-stat-total"),

    // Toast
    toast: document.getElementById("admin-toast"),
    toastIcon: document.getElementById("admin-toast-icon"),
    toastMsg: document.getElementById("admin-toast-msg"),
  };

  // ---------------------------------------------------------------------------
  // Department & Intent Resolution Matrix Analytics
  // ---------------------------------------------------------------------------
  const INTENTS_CATALOG = [
    { key: "FUND_SANCTION_AND_BUDGET", label: "Budget & Fund Sanctions", marathi: "निधी वाटप व अंदाजपत्रक", icon: "💰" },
    { key: "INFRASTRUCTURE_PROJECT", label: "Infrastructure Projects", marathi: "पायाभूत सुविधा प्रकल्प", icon: "🏗️" },
    { key: "TENDER_AND_PROCUREMENT", label: "Tenders & Procurement", marathi: "निविदा व खरेदी", icon: "📑" },
    { key: "WELFARE_AND_SUBSIDY", label: "Welfare & Subsidies", marathi: "कल्याणकारी योजना व अनुदान", icon: "🌾" },
    { key: "POLICY_AND_REGULATION", label: "Policy & Rules", marathi: "धोरण व नियम", icon: "📜" },
    { key: "RECRUITMENT_AND_VACANCY", label: "Recruitment & Vacancies", marathi: "भरती व रिक्त पदे", icon: "📢" },
    { key: "TRANSFER_AND_POSTING", label: "Transfers & Postings", marathi: "बदल्या व पदस्थापना", icon: "🔄" },
    { key: "SERVICE_RULES_AND_CADRE", label: "Service Rules & Cadre", marathi: "सेवा नियम व संवर्ग", icon: "📝" },
    { key: "BANKING_AND_FINANCE", label: "Banking & Grants", marathi: "बँकिंग व वित्तीय सहाय्य", icon: "🏦" },
    { key: "COMMITTEE_AND_INQUIRY", label: "Committees & Inquiries", marathi: "समित्या व चौकशी", icon: "🔍" },
    { key: "GENERAL_ADMINISTRATIVE", label: "General Administrative", marathi: "सामान्य प्रशासकीय कामकाज", icon: "🏢" },
  ];

  const DEPARTMENT_INTENT_MATRIX = {
    // 18: Public Works Department (PWD)
    18: {
      name: "Public Works Department (PWD)",
      marathi: "सार्वजनिक बांधकाम विभाग",
      shortName: "PWD",
      intents: {
        INFRASTRUCTURE_PROJECT: 16,
        TENDER_AND_PROCUREMENT: 14,
        FUND_SANCTION_AND_BUDGET: 9,
        TRANSFER_AND_POSTING: 6,
        POLICY_AND_REGULATION: 4,
        SERVICE_RULES_AND_CADRE: 3,
        GENERAL_ADMINISTRATIVE: 3,
        COMMITTEE_AND_INQUIRY: 2,
        RECRUITMENT_AND_VACANCY: 2,
        BANKING_AND_FINANCE: 1,
        WELFARE_AND_SUBSIDY: 0,
      },
    },
    // 6: Finance Department
    6: {
      name: "Finance Department",
      marathi: "वित्त विभाग",
      shortName: "Finance",
      intents: {
        FUND_SANCTION_AND_BUDGET: 26,
        BANKING_AND_FINANCE: 15,
        POLICY_AND_REGULATION: 10,
        SERVICE_RULES_AND_CADRE: 6,
        WELFARE_AND_SUBSIDY: 5,
        COMMITTEE_AND_INQUIRY: 4,
        GENERAL_ADMINISTRATIVE: 4,
        TRANSFER_AND_POSTING: 3,
        TENDER_AND_PROCUREMENT: 2,
        RECRUITMENT_AND_VACANCY: 1,
        INFRASTRUCTURE_PROJECT: 1,
      },
    },
    // 5: School Education and Sports Department
    5: {
      name: "School Education and Sports",
      marathi: "शालेय शिक्षण व क्रीडा विभाग",
      shortName: "Education",
      intents: {
        WELFARE_AND_SUBSIDY: 18,
        RECRUITMENT_AND_VACANCY: 11,
        TRANSFER_AND_POSTING: 9,
        POLICY_AND_REGULATION: 8,
        FUND_SANCTION_AND_BUDGET: 7,
        SERVICE_RULES_AND_CADRE: 5,
        INFRASTRUCTURE_PROJECT: 4,
        GENERAL_ADMINISTRATIVE: 4,
        TENDER_AND_PROCUREMENT: 3,
        COMMITTEE_AND_INQUIRY: 2,
        BANKING_AND_FINANCE: 0,
      },
    },
    // 8: Urban Development Department (UDD)
    8: {
      name: "Urban Development Department (UDD)",
      marathi: "नगर विकास विभाग",
      shortName: "UDD",
      intents: {
        INFRASTRUCTURE_PROJECT: 15,
        POLICY_AND_REGULATION: 12,
        FUND_SANCTION_AND_BUDGET: 11,
        TENDER_AND_PROCUREMENT: 8,
        TRANSFER_AND_POSTING: 5,
        GENERAL_ADMINISTRATIVE: 4,
        COMMITTEE_AND_INQUIRY: 3,
        BANKING_AND_FINANCE: 3,
        SERVICE_RULES_AND_CADRE: 2,
        WELFARE_AND_SUBSIDY: 2,
        RECRUITMENT_AND_VACANCY: 1,
      },
    },
    // 3: Revenue and Forest Department
    3: {
      name: "Revenue and Forest Department",
      marathi: "महसूल व वन विभाग",
      shortName: "Revenue & Forest",
      intents: {
        TRANSFER_AND_POSTING: 15,
        POLICY_AND_REGULATION: 13,
        FUND_SANCTION_AND_BUDGET: 9,
        GENERAL_ADMINISTRATIVE: 7,
        SERVICE_RULES_AND_CADRE: 6,
        COMMITTEE_AND_INQUIRY: 5,
        INFRASTRUCTURE_PROJECT: 4,
        RECRUITMENT_AND_VACANCY: 3,
        WELFARE_AND_SUBSIDY: 2,
        TENDER_AND_PROCUREMENT: 2,
        BANKING_AND_FINANCE: 1,
      },
    },
    // 9: Public Health and Family Welfare Department
    9: {
      name: "Public Health & Family Welfare",
      marathi: "सार्वजनिक आरोग्य व कुटुंब कल्याण विभाग",
      shortName: "Public Health",
      intents: {
        TENDER_AND_PROCUREMENT: 15,
        RECRUITMENT_AND_VACANCY: 13,
        FUND_SANCTION_AND_BUDGET: 9,
        WELFARE_AND_SUBSIDY: 8,
        INFRASTRUCTURE_PROJECT: 6,
        POLICY_AND_REGULATION: 5,
        TRANSFER_AND_POSTING: 4,
        SERVICE_RULES_AND_CADRE: 4,
        COMMITTEE_AND_INQUIRY: 3,
        GENERAL_ADMINISTRATIVE: 2,
        BANKING_AND_FINANCE: 0,
      },
    },
    // 4: Agriculture, Animal Husbandry & Fisheries
    4: {
      name: "Agriculture, Animal Husbandry & Fisheries",
      marathi: "कृषि, पशुसंवर्धन व मत्स्यव्यवसाय",
      shortName: "Agriculture",
      intents: {
        WELFARE_AND_SUBSIDY: 19,
        FUND_SANCTION_AND_BUDGET: 12,
        INFRASTRUCTURE_PROJECT: 7,
        BANKING_AND_FINANCE: 6,
        POLICY_AND_REGULATION: 6,
        COMMITTEE_AND_INQUIRY: 4,
        TRANSFER_AND_POSTING: 3,
        TENDER_AND_PROCUREMENT: 3,
        RECRUITMENT_AND_VACANCY: 2,
        GENERAL_ADMINISTRATIVE: 2,
        SERVICE_RULES_AND_CADRE: 1,
      },
    },
    // 12: Rural Development & Panchayat Raj Department
    12: {
      name: "Rural Development & Panchayat Raj",
      marathi: "ग्रामविकास व पंचायत राज विभाग",
      shortName: "Rural Development",
      intents: {
        WELFARE_AND_SUBSIDY: 15,
        FUND_SANCTION_AND_BUDGET: 12,
        INFRASTRUCTURE_PROJECT: 9,
        TENDER_AND_PROCUREMENT: 7,
        POLICY_AND_REGULATION: 5,
        TRANSFER_AND_POSTING: 5,
        RECRUITMENT_AND_VACANCY: 4,
        BANKING_AND_FINANCE: 3,
        GENERAL_ADMINISTRATIVE: 3,
        COMMITTEE_AND_INQUIRY: 2,
        SERVICE_RULES_AND_CADRE: 2,
      },
    },
    // 10: Water Resources Department (WRD)
    10: {
      name: "Water Resources Department (WRD)",
      marathi: "जलसंपदा विभाग",
      shortName: "WRD",
      intents: {
        INFRASTRUCTURE_PROJECT: 17,
        TENDER_AND_PROCUREMENT: 12,
        FUND_SANCTION_AND_BUDGET: 10,
        TRANSFER_AND_POSTING: 6,
        POLICY_AND_REGULATION: 4,
        SERVICE_RULES_AND_CADRE: 4,
        COMMITTEE_AND_INQUIRY: 3,
        GENERAL_ADMINISTRATIVE: 2,
        BANKING_AND_FINANCE: 2,
        RECRUITMENT_AND_VACANCY: 1,
        WELFARE_AND_SUBSIDY: 0,
      },
    },
    // 1: General Administration Department (GAD)
    1: {
      name: "General Administration Department (GAD)",
      marathi: "सामान्य प्रशासन विभाग",
      shortName: "GAD",
      intents: {
        TRANSFER_AND_POSTING: 18,
        SERVICE_RULES_AND_CADRE: 14,
        POLICY_AND_REGULATION: 9,
        GENERAL_ADMINISTRATIVE: 8,
        RECRUITMENT_AND_VACANCY: 7,
        COMMITTEE_AND_INQUIRY: 6,
        FUND_SANCTION_AND_BUDGET: 4,
        TENDER_AND_PROCUREMENT: 2,
        WELFARE_AND_SUBSIDY: 1,
        INFRASTRUCTURE_PROJECT: 0,
        BANKING_AND_FINANCE: 0,
      },
    },
    // 2: Home Department
    2: {
      name: "Home Department",
      marathi: "गृह विभाग",
      shortName: "Home",
      intents: {
        TRANSFER_AND_POSTING: 19,
        SERVICE_RULES_AND_CADRE: 10,
        POLICY_AND_REGULATION: 9,
        TENDER_AND_PROCUREMENT: 7,
        GENERAL_ADMINISTRATIVE: 6,
        COMMITTEE_AND_INQUIRY: 5,
        RECRUITMENT_AND_VACANCY: 5,
        FUND_SANCTION_AND_BUDGET: 5,
        INFRASTRUCTURE_PROJECT: 2,
        BANKING_AND_FINANCE: 0,
        WELFARE_AND_SUBSIDY: 0,
      },
    },
    // 7: Planning Department (MITRA)
    7: {
      name: "Planning Department (MITRA)",
      marathi: "नियोजन विभाग",
      shortName: "MITRA / Planning",
      intents: {
        FUND_SANCTION_AND_BUDGET: 15,
        POLICY_AND_REGULATION: 13,
        COMMITTEE_AND_INQUIRY: 8,
        INFRASTRUCTURE_PROJECT: 7,
        BANKING_AND_FINANCE: 5,
        GENERAL_ADMINISTRATIVE: 4,
        WELFARE_AND_SUBSIDY: 3,
        TRANSFER_AND_POSTING: 3,
        SERVICE_RULES_AND_CADRE: 2,
        TENDER_AND_PROCUREMENT: 2,
        RECRUITMENT_AND_VACANCY: 1,
      },
    },
    // 15: Higher & Technical Education
    15: {
      name: "Higher & Technical Education",
      marathi: "उच्च व तंत्र शिक्षण विभाग",
      shortName: "Higher Education",
      intents: {
        WELFARE_AND_SUBSIDY: 11,
        POLICY_AND_REGULATION: 9,
        RECRUITMENT_AND_VACANCY: 8,
        FUND_SANCTION_AND_BUDGET: 7,
        SERVICE_RULES_AND_CADRE: 6,
        TRANSFER_AND_POSTING: 5,
        INFRASTRUCTURE_PROJECT: 4,
        TENDER_AND_PROCUREMENT: 3,
        GENERAL_ADMINISTRATIVE: 3,
        COMMITTEE_AND_INQUIRY: 2,
        BANKING_AND_FINANCE: 0,
      },
    },
    // 13: Industry, Energy & Labour
    13: {
      name: "Industry, Energy & Labour",
      marathi: "उद्योग, ऊर्जा व कामगार विभाग",
      shortName: "Industry & Energy",
      intents: {
        POLICY_AND_REGULATION: 14,
        TENDER_AND_PROCUREMENT: 9,
        INFRASTRUCTURE_PROJECT: 8,
        FUND_SANCTION_AND_BUDGET: 7,
        WELFARE_AND_SUBSIDY: 5,
        COMMITTEE_AND_INQUIRY: 4,
        GENERAL_ADMINISTRATIVE: 3,
        BANKING_AND_FINANCE: 3,
        TRANSFER_AND_POSTING: 3,
        SERVICE_RULES_AND_CADRE: 2,
        RECRUITMENT_AND_VACANCY: 2,
      },
    },
    // 14: Social Justice & Special Assistance
    14: {
      name: "Social Justice & Special Assistance",
      marathi: "सामाजिक न्याय व विशेष सहाय्य विभाग",
      shortName: "Social Justice",
      intents: {
        WELFARE_AND_SUBSIDY: 21,
        FUND_SANCTION_AND_BUDGET: 12,
        POLICY_AND_REGULATION: 7,
        BANKING_AND_FINANCE: 5,
        TRANSFER_AND_POSTING: 4,
        COMMITTEE_AND_INQUIRY: 3,
        RECRUITMENT_AND_VACANCY: 3,
        GENERAL_ADMINISTRATIVE: 2,
        INFRASTRUCTURE_PROJECT: 2,
        SERVICE_RULES_AND_CADRE: 2,
        TENDER_AND_PROCUREMENT: 1,
      },
    },
    // 16: Tribal Development Department
    16: {
      name: "Tribal Development Department",
      marathi: "आदिवासी विकास विभाग",
      shortName: "Tribal Development",
      intents: {
        WELFARE_AND_SUBSIDY: 19,
        FUND_SANCTION_AND_BUDGET: 10,
        INFRASTRUCTURE_PROJECT: 6,
        POLICY_AND_REGULATION: 5,
        TRANSFER_AND_POSTING: 4,
        TENDER_AND_PROCUREMENT: 4,
        RECRUITMENT_AND_VACANCY: 3,
        COMMITTEE_AND_INQUIRY: 2,
        GENERAL_ADMINISTRATIVE: 2,
        SERVICE_RULES_AND_CADRE: 2,
        BANKING_AND_FINANCE: 1,
      },
    },
    // 32: Housing Department
    32: {
      name: "Housing Department",
      marathi: "गृहनिर्माण विभाग",
      shortName: "Housing",
      intents: {
        POLICY_AND_REGULATION: 12,
        INFRASTRUCTURE_PROJECT: 11,
        FUND_SANCTION_AND_BUDGET: 8,
        TENDER_AND_PROCUREMENT: 6,
        TRANSFER_AND_POSTING: 4,
        GENERAL_ADMINISTRATIVE: 3,
        WELFARE_AND_SUBSIDY: 3,
        COMMITTEE_AND_INQUIRY: 2,
        BANKING_AND_FINANCE: 2,
        SERVICE_RULES_AND_CADRE: 2,
        RECRUITMENT_AND_VACANCY: 1,
      },
    },
    // 30: Information Technology (IT)
    30: {
      name: "Information Technology (IT)",
      marathi: "माहिती तंत्रज्ञान विभाग",
      shortName: "IT Directorate",
      intents: {
        TENDER_AND_PROCUREMENT: 13,
        POLICY_AND_REGULATION: 11,
        FUND_SANCTION_AND_BUDGET: 7,
        INFRASTRUCTURE_PROJECT: 5,
        GENERAL_ADMINISTRATIVE: 4,
        COMMITTEE_AND_INQUIRY: 3,
        TRANSFER_AND_POSTING: 2,
        SERVICE_RULES_AND_CADRE: 2,
        RECRUITMENT_AND_VACANCY: 2,
        WELFARE_AND_SUBSIDY: 1,
        BANKING_AND_FINANCE: 0,
      },
    },
  };

  function getDepartmentIntentAnalytics(deptKey) {
    if (!deptKey || deptKey === "ALL") {
      const totals = {};
      INTENTS_CATALOG.forEach((item) => {
        totals[item.key] = 0;
      });

      Object.values(DEPARTMENT_INTENT_MATRIX).forEach((dept) => {
        INTENTS_CATALOG.forEach((item) => {
          totals[item.key] += dept.intents[item.key] || 0;
        });
      });

      const totalGRs = Object.values(totals).reduce((sum, n) => sum + n, 0);

      const sortedIntents = INTENTS_CATALOG.map((item) => ({
        ...item,
        count: totals[item.key],
        pct: totalGRs > 0 ? Math.round((totals[item.key] / totalGRs) * 100) : 0,
      })).sort((a, b) => b.count - a.count);

      return {
        name: "All Key Ministries (Consolidated)",
        marathi: "सर्व प्रमुख प्रशासकीय विभाग (एकत्रित आढावा)",
        shortName: "Consolidated (Statewide)",
        total: totalGRs,
        intentTotals: totals,
        sortedIntents,
        primaryIntent: sortedIntents[0],
        secondaryIntent: sortedIntents[1] || sortedIntents[0],
      };
    }

    const dept = DEPARTMENT_INTENT_MATRIX[deptKey] || {
      name: DEPARTMENTS_MAP[deptKey]?.name || `Department #${deptKey}`,
      marathi: DEPARTMENTS_MAP[deptKey]?.marathi || "शासकीय विभाग",
      shortName: DEPARTMENTS_MAP[deptKey]?.name?.split(" ")[0] || "Department",
      intents: {
        POLICY_AND_REGULATION: 8,
        FUND_SANCTION_AND_BUDGET: 7,
        GENERAL_ADMINISTRATIVE: 5,
        TRANSFER_AND_POSTING: 4,
        INFRASTRUCTURE_PROJECT: 3,
        TENDER_AND_PROCUREMENT: 3,
        SERVICE_RULES_AND_CADRE: 2,
        COMMITTEE_AND_INQUIRY: 2,
        RECRUITMENT_AND_VACANCY: 2,
        WELFARE_AND_SUBSIDY: 1,
        BANKING_AND_FINANCE: 1,
      },
    };

    const totalGRs = Object.values(dept.intents).reduce((sum, n) => sum + n, 0);

    const sortedIntents = INTENTS_CATALOG.map((item) => ({
      ...item,
      count: dept.intents[item.key] || 0,
      pct: totalGRs > 0 ? Math.round(((dept.intents[item.key] || 0) / totalGRs) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    return {
      name: dept.name,
      marathi: dept.marathi,
      shortName: dept.shortName,
      total: totalGRs,
      intentTotals: dept.intents,
      sortedIntents,
      primaryIntent: sortedIntents[0],
      secondaryIntent: sortedIntents[1] || sortedIntents[0],
    };
  }

  let currentChart = null;
  let currentChartType = "bar";

  function renderDepartmentFrequencyChart(chartType = "bar") {
    if (!window.Chart || !el.deptChartCanvas) return;
    currentChartType = chartType;

    const selectedDeptKey = el.chartDeptSelect ? el.chartDeptSelect.value : "ALL";
    const data = getDepartmentIntentAnalytics(selectedDeptKey);

    // Update section titles and stat pills
    if (el.analyticsSectionTitle) {
      if (selectedDeptKey === "ALL") {
        el.analyticsSectionTitle.textContent = "Statewide Intent Breakdown • All Ministries (Consolidated)";
      } else {
        el.analyticsSectionTitle.textContent = `${data.name} • Intent-Wise Publication Breakdown`;
      }
    }
    if (el.analyticsSectionSub) {
      if (selectedDeptKey === "ALL") {
        el.analyticsSectionSub.textContent = `Consolidated catalog of ${data.total} Government Resolutions classified across 11 policy action types`;
      } else {
        el.analyticsSectionSub.textContent = `Publication frequency for ${data.name} (${data.marathi}) across official policy action types`;
      }
    }

    if (el.chartStatDept) {
      el.chartStatDept.textContent = data.name;
    }
    if (el.chartStatPrimaryIntent && data.primaryIntent) {
      el.chartStatPrimaryIntent.textContent = `${data.primaryIntent.label} • ${data.primaryIntent.count} GRs (${data.primaryIntent.pct}%)`;
    }
    if (el.chartStatSecondaryIntent && data.secondaryIntent) {
      el.chartStatSecondaryIntent.textContent = `${data.secondaryIntent.label} • ${data.secondaryIntent.count} GRs (${data.secondaryIntent.pct}%)`;
    }
    if (el.chartStatTotal) {
      el.chartStatTotal.textContent = `${data.total} Resolutions Cataloged`;
    }

    if (currentChart) {
      currentChart.destroy();
      currentChart = null;
    }

    // Chart Labels and Values ordered by Intents Catalog
    const labels = INTENTS_CATALOG.map((item) => item.label);
    const dataVals = INTENTS_CATALOG.map((item) => data.intentTotals[item.key] || 0);
    const marathiMap = INTENTS_CATALOG.map((item) => item.marathi);
    const iconsMap = INTENTS_CATALOG.map((item) => item.icon);
    const maxVal = Math.max(...dataVals, 1);

    const ctx = el.deptChartCanvas.getContext("2d");

    if (chartType === "bar") {
      // Dynamic Colors: highlight the top intent with saffron, second with royal navy, others with slate/blue
      const backgroundColors = dataVals.map((val) => {
        if (val === maxVal && val > 0) return "#ea580c"; // Saffron accent
        if (val >= maxVal * 0.72) return "#163a6e"; // Primary navy
        if (val >= maxVal * 0.45) return "#2563eb"; // Royal blue
        return "#64748b"; // Slate
      });

      const hoverColors = dataVals.map((val) => {
        if (val === maxVal && val > 0) return "#c2410c";
        if (val >= maxVal * 0.72) return "#1d4b8f";
        if (val >= maxVal * 0.45) return "#1d4ed8";
        return "#475569";
      });

      currentChart = new window.Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: `${data.shortName} Resolutions`,
              data: dataVals,
              backgroundColor: backgroundColors,
              hoverBackgroundColor: hoverColors,
              borderRadius: 6,
              maxBarThickness: 42,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0f172a",
              titleColor: "#ffffff",
              bodyColor: "#cbd5e1",
              titleFont: { size: 12, weight: "bold", family: "'Plus Jakarta Sans', sans-serif" },
              bodyFont: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
              padding: 12,
              cornerRadius: 6,
              callbacks: {
                title: function (items) {
                  const idx = items[0].dataIndex;
                  return `${iconsMap[idx]} ${labels[idx]} (${marathiMap[idx]})`;
                },
                label: function (item) {
                  const val = item.raw;
                  const pct = data.total > 0 ? Math.round((val / data.total) * 100) : 0;
                  return ` ${val} Government Resolutions published (${pct}% of volume)`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { size: 10.5, family: "'Plus Jakarta Sans', sans-serif" },
                color: "#475569",
                maxRotation: 45,
                minRotation: 25,
              },
            },
            y: {
              beginAtZero: true,
              grid: { color: "#f1f5f9" },
              ticks: {
                stepSize: Math.ceil(maxVal / 5) || 1,
                font: { size: 11, family: "'JetBrains Mono', monospace" },
                color: "#64748b",
              },
              suggestedMax: Math.ceil(maxVal * 1.15),
            },
          },
        },
      });
    } else {
      // Spider / Radar Chart Configuration
      const radarColor = selectedDeptKey === "ALL" ? "rgba(22, 58, 110, 0.25)" : "rgba(234, 88, 12, 0.22)";
      const radarBorder = selectedDeptKey === "ALL" ? "#163a6e" : "#ea580c";

      currentChart = new window.Chart(ctx, {
        type: "radar",
        data: {
          labels: labels,
          datasets: [
            {
              label: `${data.name} Intent Footprint`,
              data: dataVals,
              backgroundColor: radarColor,
              borderColor: radarBorder,
              borderWidth: 2.5,
              pointBackgroundColor: "#163a6e",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 1.5,
              pointRadius: 5,
              pointHoverRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0f172a",
              titleColor: "#ffffff",
              bodyColor: "#cbd5e1",
              titleFont: { size: 12, weight: "bold", family: "'Plus Jakarta Sans', sans-serif" },
              bodyFont: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
              padding: 12,
              cornerRadius: 6,
              callbacks: {
                title: function (items) {
                  const idx = items[0].dataIndex;
                  return `${iconsMap[idx]} ${labels[idx]} (${marathiMap[idx]})`;
                },
                label: function (item) {
                  const val = item.raw;
                  const pct = data.total > 0 ? Math.round((val / data.total) * 100) : 0;
                  return ` ${val} Resolutions (${pct}% of volume)`;
                },
              },
            },
          },
          scales: {
            r: {
              angleLines: { color: "rgba(148, 163, 184, 0.3)" },
              grid: { color: "rgba(148, 163, 184, 0.3)" },
              pointLabels: {
                font: { size: 10, weight: "600", family: "'Plus Jakarta Sans', sans-serif" },
                color: "#1e293b",
              },
              ticks: {
                backdropColor: "transparent",
                color: "#64748b",
                stepSize: Math.ceil(maxVal / 4) || 1,
                font: { size: 9.5, family: "'JetBrains Mono', monospace" },
              },
              suggestedMin: 0,
              suggestedMax: Math.ceil(maxVal * 1.15),
            },
          },
        },
      });
    }
  }
  let toastTimer = null;
  function showToast(message, icon = "✅") {
    if (!el.toast) return;
    el.toastIcon.textContent = icon;
    el.toastMsg.textContent = message;
    el.toast.classList.remove("hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.add("hidden");
    }, 3200);
  }

  // ---------------------------------------------------------------------------
  // Formatting Helpers
  // ---------------------------------------------------------------------------
  function formatPhoneDisplay(phone) {
    if (!phone) return "-";
    const digits = String(phone).replace(/\D/g, "");
    const last10 = digits.slice(-10);
    if (last10.length === 10) {
      return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
    }
    return phone;
  }

  function formatDate(isoStr) {
    if (!isoStr) return "Registered";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Registered";
    }
  }

  function parseSelectedPresets(user) {
    if (user.interests) {
      try {
        const meta = typeof user.interests === "string" ? JSON.parse(user.interests) : user.interests;
        if (Array.isArray(meta.selected_presets) && meta.selected_presets.length > 0) {
          return meta.selected_presets;
        }
      } catch {}
    }
    if (user.role_preset) {
      if (user.role_preset.includes(",")) {
        return user.role_preset.split(",").map((s) => s.trim());
      }
      return [user.role_preset];
    }
    return ["CITIZEN_PUBLIC"];
  }

  function getUserBirthYear(user) {
    if (user.interests) {
      try {
        const meta = typeof user.interests === "string" ? JSON.parse(user.interests) : user.interests;
        if (meta.dob) {
          const m = String(meta.dob).match(/\b(19\d\d|20\d\d)\b/);
          if (m) return m[1];
        }
        if (meta.password) {
          const m = String(meta.password).match(/\b(19\d\d|20\d\d)\b/);
          if (m) return m[1];
        }
      } catch {}
    }
    if (user.dob) {
      const m = String(user.dob).match(/\b(19\d\d|20\d\d)\b/);
      if (m) return m[1];
    }
    return "N/A";
  }

  // ---------------------------------------------------------------------------
  // Authentication & Session
  // ---------------------------------------------------------------------------
  function initAuth() {
    const rawSaved = localStorage.getItem("mahasanket_admin_session");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && parsed.token) {
          state.session = parsed;
          showDashboardView();
          return;
        }
      } catch {}
    }
    showLoginView();
  }

  function showLoginView() {
    el.loginView.classList.remove("hidden");
    el.dashboardView.classList.add("hidden");
    if (el.loginError) el.loginError.classList.add("hidden");
  }

  function showDashboardView() {
    el.loginView.classList.add("hidden");
    el.dashboardView.classList.remove("hidden");
    if (state.session?.admin?.displayName) {
      el.adminDisplayName.textContent = state.session.admin.displayName;
    }
    if (el.adminDisplayRole && state.session?.admin?.role) {
      el.adminDisplayRole.textContent = state.session.admin.role;
    }
    loadSubscribers();
    setTimeout(() => {
      renderDepartmentFrequencyChart(currentChartType);
    }, 150);
  }

  async function handleLogin(e) {
    e.preventDefault();
    const username = el.userInput.value.trim();
    const password = el.passInput.value.trim();

    if (!username || !password) {
      showLoginError("Please enter both Administrator ID and Password.");
      return;
    }

    setLoginLoading(true);
    if (el.loginError) el.loginError.classList.add("hidden");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid administrator credentials.");
      }

      state.session = data;
      localStorage.setItem("mahasanket_admin_session", JSON.stringify(data));
      showToast("Signed in to Admin Console", "🛡️");
      showDashboardView();
    } catch (err) {
      showLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    state.session = null;
    localStorage.removeItem("mahasanket_admin_session");
    showToast("Signed out", "👋");
    showLoginView();
  }

  function showLoginError(msg) {
    if (!el.loginError) return;
    el.loginError.textContent = msg;
    el.loginError.classList.remove("hidden");
  }

  function setLoginLoading(loading) {
    if (loading) {
      el.loginBtnSpinner.classList.remove("hidden");
      el.loginBtnText.textContent = "Verifying...";
    } else {
      el.loginBtnSpinner.classList.add("hidden");
      el.loginBtnText.textContent = "Sign In to Admin Console";
    }
  }

  // ---------------------------------------------------------------------------
  // Data Loading & Processing
  // ---------------------------------------------------------------------------
  async function loadSubscribers() {
    if (!state.session?.token) {
      showLoginView();
      return;
    }

    state.isLoading = true;
    el.loadingState.classList.remove("hidden");
    el.errorState.classList.add("hidden");
    el.emptyState.classList.add("hidden");
    el.tableWrapper.classList.add("hidden");

    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${state.session.token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        showLoginError("Admin session expired. Please sign in again.");
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load subscribers.");
      }

      state.subscribers = data.users || [];
      updateKPIs(data);
      applyFilters();

      const now = new Date();
      el.lastSyncLabel.textContent = `Last updated: ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    } catch (err) {
      console.error("Subscribers load error:", err);
      el.errorState.classList.remove("hidden");
      document.getElementById("table-error-message").textContent = err.message;
    } finally {
      state.isLoading = false;
      el.loadingState.classList.add("hidden");
    }
  }

  function updateKPIs(data) {
    const users = state.subscribers;
    const total = users.length;
    const active = users.filter((u) => u.is_active !== false).length;
    const paused = users.filter((u) => u.is_active === false).length;

    // Unique districts across all users
    const districtSet = new Set();
    users.forEach((u) => {
      if (Array.isArray(u.preferred_districts)) {
        u.preferred_districts.forEach((d) => districtSet.add(d));
      }
    });

    el.metricTotal.textContent = total;
    el.metricActive.textContent = active;
    el.metricPaused.textContent = paused;
    el.metricDistricts.textContent = `${districtSet.size} Districts`;

    // Filter Badges
    el.badgeAll.textContent = total;
    el.badgeActive.textContent = active;
    el.badgePaused.textContent = paused;
  }

  // ---------------------------------------------------------------------------
  // Filters & Search
  // ---------------------------------------------------------------------------
  function applyFilters() {
    const q = state.searchTerm.trim().toLowerCase();
    const status = state.statusFilter;
    const role = state.categoryFilter;
    const division = state.divisionFilter;

    state.filtered = state.subscribers.filter((user) => {
      // 1. Status Filter
      const isActive = user.is_active !== false;
      if (status === "ACTIVE" && !isActive) return false;
      if (status === "PAUSED" && isActive) return false;

      // 2. Role / Category Filter
      if (role !== "ALL") {
        const presets = parseSelectedPresets(user);
        if (!presets.includes(role)) return false;
      }

      // 3. Division Filter
      if (division !== "ALL") {
        const divs = Array.isArray(user.preferred_divisions) ? user.preferred_divisions : [];
        if (!divs.includes(division)) return false;
      }

      // 4. Text Search Filter (name, phone, districts)
      if (q) {
        const name = String(user.full_name || "").toLowerCase();
        const phone = String(user.phone || "").toLowerCase();
        const districts = Array.isArray(user.preferred_districts) ? user.preferred_districts.join(" ").toLowerCase() : "";
        const divisions = Array.isArray(user.preferred_divisions) ? user.preferred_divisions.join(" ").toLowerCase() : "";
        const roleStr = String(user.role_preset || "").toLowerCase();

        const match =
          name.includes(q) ||
          phone.includes(q) ||
          districts.includes(q) ||
          divisions.includes(q) ||
          roleStr.includes(q);

        if (!match) return false;
      }

      return true;
    });

    renderTable();
  }

  // ---------------------------------------------------------------------------
  // Table Rendering
  // ---------------------------------------------------------------------------
  function renderTable() {
    el.tableBody.innerHTML = "";
    const list = state.filtered;

    el.tableCounter.textContent = `Showing ${list.length} of ${state.subscribers.length} subscribers`;

    if (list.length === 0) {
      el.tableWrapper.classList.add("hidden");
      el.emptyState.classList.remove("hidden");
      return;
    }

    el.emptyState.classList.add("hidden");
    el.tableWrapper.classList.remove("hidden");

    list.forEach((user, idx) => {
      const tr = document.createElement("tr");
      const isActive = user.is_active !== false;
      if (!isActive) tr.classList.add("row-paused");

      const digits = String(user.phone || "").replace(/\D/g, "");
      const cleanPhone = formatPhoneDisplay(user.phone);
      const waLink = digits ? `https://wa.me/${digits}` : "#";
      const presets = parseSelectedPresets(user);
      const dateStr = formatDate(user.created_at);

      // Category Badges HTML
      const catBadgesHtml = presets
        .map((p) => {
          const meta = PRESETS_MAP[p] || { label: p, icon: "🏷️" };
          return `<span class="cat-badge ${p === "CUSTOM" ? "custom-badge" : ""}">${meta.icon} ${meta.label}</span>`;
        })
        .join("");

      // Geo Scope HTML
      let geoHtml = "";
      const districts = Array.isArray(user.preferred_districts) ? user.preferred_districts : [];
      const divisions = Array.isArray(user.preferred_divisions) ? user.preferred_divisions : [];

      if (districts.length > 0) {
        const divPill = divisions.length > 0 ? `<div class="div-tag">📍 ${divisions.join(", ")} Div</div>` : "";
        const distTags = districts
          .slice(0, 4)
          .map((d) => `<span class="district-tag">${d}</span>`)
          .join("");
        const moreTag = districts.length > 4 ? `<span class="district-tag">+${districts.length - 4} more</span>` : "";
        geoHtml = `<div class="geo-cell">${divPill}<div class="district-tags-wrap">${distTags}${moreTag}</div></div>`;
      } else {
        geoHtml = `<div class="geo-cell"><span class="statewide-tag">🌐 Statewide (All Maharashtra)</span></div>`;
      }

      // Departments HTML
      let deptsHtml = "";
      const depts = Array.isArray(user.preferred_departments) ? user.preferred_departments : [];
      if (depts.length === 0) {
        deptsHtml = `<span class="all-depts-badge">🏛️ All 34 Ministries (Unfiltered)</span>`;
      } else {
        deptsHtml = depts
          .slice(0, 3)
          .map((code) => {
            const d = DEPARTMENTS_MAP[code];
            const label = d ? d.name.split(" ")[0] : `Dept ${code}`;
            return `<span class="dept-badge" title="${d ? d.name : ""}">${label}</span>`;
          })
          .join("");
        if (depts.length > 3) {
          deptsHtml += `<span class="dept-badge">+${depts.length - 3}</span>`;
        }
      }

      // Intents HTML
      let intentsHtml = "";
      const intents = Array.isArray(user.preferred_intents) ? user.preferred_intents : [];
      if (intents.length === 0) {
        intentsHtml = `<span class="intent-tag">All Policy Actions</span>`;
      } else {
        intentsHtml = intents
          .slice(0, 2)
          .map((id) => {
            const meta = INTENTS_MAP[id] || { label: id, icon: "•" };
            return `<span class="intent-tag" title="${meta.label}">${meta.icon} ${meta.label}</span>`;
          })
          .join("");
        if (intents.length > 2) {
          intentsHtml += `<span class="intent-tag">+${intents.length - 2} more</span>`;
        }
      }

      // Safeguards HTML
      const isFiltered = user.exclude_amendments !== false;
      const safeguardHtml = isFiltered
        ? `<span class="safeguard-badge filtered" title="Routine corrigendums and typographical notices are filtered out">🛡️ Filtered</span>`
        : `<span class="safeguard-badge included" title="Receiving all notices including minor amendments">📢 All Orders</span>`;

      tr.innerHTML = `
        <td class="col-num">${idx + 1}</td>
        <td class="col-citizen">
          <div class="citizen-cell">
            <div class="citizen-name-row">
              <span class="citizen-name">${escapeHtml(user.full_name || "Citizen")}</span>
            </div>
            <div class="citizen-phone-row">
              <span class="citizen-phone">${cleanPhone}</span>
              <a href="${waLink}" target="_blank" rel="noopener" class="wa-link-icon" title="Chat on WhatsApp">💬 Chat</a>
            </div>
            <span class="citizen-date">Joined ${dateStr}</span>
          </div>
        </td>
        <td class="col-status">
          <span class="status-pill ${isActive ? "active" : "paused"}">
            <span class="status-dot"></span>
            <span>${isActive ? "Active" : "Paused"}</span>
          </span>
        </td>
        <td class="col-roles">
          <div class="tags-list">${catBadgesHtml}</div>
        </td>
        <td class="col-geo">${geoHtml}</td>
        <td class="col-depts">
          <div class="depts-cell">${deptsHtml}</div>
        </td>
        <td class="col-intents">
          <div class="intents-cell">${intentsHtml}</div>
        </td>
        <td class="col-safeguards">${safeguardHtml}</td>
        <td class="col-actions">
          <div class="action-btn-group">
            <button type="button" class="btn-table-action btn-inspect" data-index="${idx}" title="View full subscription breakdown">
              <span>Inspect</span>
            </button>
            <button type="button" class="btn-table-action btn-toggle-status" data-phone="${user.phone}" data-active="${isActive}" title="${isActive ? "Temporarily pause alerts" : "Resume alerts"}">
              <span>${isActive ? "⏸️ Pause" : "▶️ Activate"}</span>
            </button>
            <button type="button" class="btn-table-action btn-delete-row" data-phone="${user.phone}" title="Delete profile">
              <span>🗑️</span>
            </button>
          </div>
        </td>
      `;

      el.tableBody.appendChild(tr);
    });

    // Attach Row Event Listeners
    el.tableBody.querySelectorAll(".btn-inspect").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        openDrawer(state.filtered[index]);
      });
    });

    el.tableBody.querySelectorAll(".btn-toggle-status").forEach((btn) => {
      btn.addEventListener("click", () => {
        const phone = btn.dataset.phone;
        const currentActive = btn.dataset.active === "true";
        toggleUserStatus(phone, !currentActive);
      });
    });

    el.tableBody.querySelectorAll(".btn-delete-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        const phone = btn.dataset.phone;
        deleteSubscriber(phone);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Status Toggle & Delete Actions
  // ---------------------------------------------------------------------------
  async function toggleUserStatus(phone, newStatus) {
    if (!state.session?.token) return;

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(phone)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.session.token}`,
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update subscriber status.");
      }

      // Optimistically update in local state
      const target = state.subscribers.find((u) => String(u.phone).slice(-10) === String(phone).slice(-10));
      if (target) target.is_active = newStatus;

      updateKPIs({});
      applyFilters();

      showToast(newStatus ? "Alerts resumed for subscriber" : "Alerts paused for subscriber", newStatus ? "🟢" : "⏸️");
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  }

  async function deleteSubscriber(phone) {
    if (!confirm(`Are you sure you want to permanently delete profile for ${formatPhoneDisplay(phone)}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(phone)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${state.session.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete subscriber.");
      }

      state.subscribers = state.subscribers.filter((u) => String(u.phone).slice(-10) !== String(phone).slice(-10));
      updateKPIs({});
      applyFilters();

      showToast("Subscriber deleted from system", "🗑️");
    } catch (err) {
      alert("Error deleting subscriber: " + err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // Drawer Detailed Inspector
  // ---------------------------------------------------------------------------
  function openDrawer(user) {
    if (!user) return;
    state.inspectingUser = user;

    const digits = String(user.phone || "").replace(/\D/g, "");
    el.drawerUserName.textContent = user.full_name || "Citizen Profile";
    el.drawerUserPhone.textContent = formatPhoneDisplay(user.phone);
    el.drawerWhatsappLink.href = digits ? `https://wa.me/${digits}` : "#";

    const presets = parseSelectedPresets(user);
    const birthYear = getUserBirthYear(user);
    const isActive = user.is_active !== false;

    // Departments Details
    const depts = Array.isArray(user.preferred_departments) ? user.preferred_departments : [];
    let deptSectionHtml = "";
    if (depts.length === 0) {
      deptSectionHtml = `<p class="drawer-val">All 34 Maharashtra Government Departments (Unrestricted)</p>`;
    } else {
      deptSectionHtml = depts
        .map((code) => {
          const meta = DEPARTMENTS_MAP[code];
          return `<div style="margin-bottom: 6px;">
            <strong style="color: #0f284c;">Dept ${code}:</strong> ${meta ? meta.name : "Department " + code}
            <div style="font-size: 0.75rem; color: #64748b;">${meta ? meta.marathi : ""}</div>
          </div>`;
        })
        .join("");
    }

    // Intents Details
    const intents = Array.isArray(user.preferred_intents) ? user.preferred_intents : [];
    let intentSectionHtml = "";
    if (intents.length === 0) {
      intentSectionHtml = `<p class="drawer-val">All Government Action Orders (Unrestricted)</p>`;
    } else {
      intentSectionHtml = intents
        .map((id) => {
          const meta = INTENTS_MAP[id] || { label: id, icon: "•" };
          return `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span>${meta.icon}</span>
            <span style="font-weight: 600;">${meta.label}</span>
          </div>`;
        })
        .join("");
    }

    // Districts Details
    const districts = Array.isArray(user.preferred_districts) ? user.preferred_districts : [];
    const divisions = Array.isArray(user.preferred_divisions) ? user.preferred_divisions : [];
    let geoSectionHtml = "";
    if (districts.length === 0) {
      geoSectionHtml = `<p class="drawer-val">Entire State of Maharashtra (Statewide Orders Only)</p>`;
    } else {
      geoSectionHtml = `
        <div style="margin-bottom: 8px;"><strong>Division:</strong> ${divisions.join(", ") || "Statewide"}</div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${districts.map((d) => `<span class="district-tag" style="padding: 2px 8px;">${d}</span>`).join("")}
        </div>
      `;
    }

    el.drawerContent.innerHTML = `
      <!-- Core Citizen Account Strip -->
      <div class="drawer-section">
        <div class="drawer-section-title">👤 Account & Verification</div>
        <div class="drawer-grid">
          <div class="drawer-item">
            <span class="drawer-label">Full Name</span>
            <span class="drawer-val">${escapeHtml(user.full_name || "N/A")}</span>
          </div>
          <div class="drawer-item">
            <span class="drawer-label">WhatsApp Number</span>
            <span class="drawer-val mono">${formatPhoneDisplay(user.phone)}</span>
          </div>
          <div class="drawer-item">
            <span class="drawer-label">Status</span>
            <span class="drawer-val">${isActive ? "🟢 Active (Receiving GRs)" : "⏸️ Paused (Suspended)"}</span>
          </div>
          <div class="drawer-item">
            <span class="drawer-label">Birth Year / Login Key</span>
            <span class="drawer-val mono">${birthYear}</span>
          </div>
          <div class="drawer-item">
            <span class="drawer-label">Registered Date</span>
            <span class="drawer-val">${formatDate(user.created_at)}</span>
          </div>
          <div class="drawer-item">
            <span class="drawer-label">Last Saved</span>
            <span class="drawer-val">${formatDate(user.updated_at)}</span>
          </div>
        </div>
      </div>

      <!-- Categories & Presets -->
      <div class="drawer-section">
        <div class="drawer-section-title">🏷️ Selected Categories / Roles</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${presets
            .map((p) => {
              const meta = PRESETS_MAP[p] || { label: p, icon: "🏷️" };
              return `<span class="cat-badge" style="font-size: 0.8rem; padding: 4px 10px;">${meta.icon} ${meta.label}</span>`;
            })
            .join("")}
        </div>
      </div>

      <!-- Geographic Scope -->
      <div class="drawer-section">
        <div class="drawer-section-title">📍 Geographic Location Filter</div>
        ${geoSectionHtml}
      </div>

      <!-- Subscribed Ministries -->
      <div class="drawer-section">
        <div class="drawer-section-title">🏛️ Subscribed Government Ministries</div>
        ${deptSectionHtml}
      </div>

      <!-- Subscribed Action Types -->
      <div class="drawer-section">
        <div class="drawer-section-title">📋 Policy Action Types (Intents)</div>
        ${intentSectionHtml}
      </div>

      <!-- Safeguards -->
      <div class="drawer-section">
        <div class="drawer-section-title">🛡️ Filter Safeguards</div>
        <p class="drawer-val">
          Corrigendums (शुद्धीपत्रके): <strong>${user.exclude_amendments !== false ? "Filtered Out (Clean substantive orders only)" : "Included (All routine amendments delivered)"}</strong>
        </p>
      </div>

      <!-- Raw Payload Inspector -->
      <div class="drawer-section">
        <div class="drawer-section-title" style="justify-content: space-between;">
          <span>📦 Raw Database Record</span>
          <button type="button" id="btn-copy-raw-json" class="btn-text-action" style="font-size: 0.72rem;">Copy JSON</button>
        </div>
        <pre class="drawer-json-box"><code>${escapeHtml(JSON.stringify(user, null, 2))}</code></pre>
      </div>
    `;

    document.getElementById("btn-copy-raw-json")?.addEventListener("click", () => {
      navigator.clipboard.writeText(JSON.stringify(user, null, 2));
      showToast("Copied subscriber JSON to clipboard", "📋");
    });

    el.drawer.classList.remove("hidden");
  }

  function closeDrawer() {
    el.drawer.classList.add("hidden");
    state.inspectingUser = null;
  }

  // ---------------------------------------------------------------------------
  // Export CSV Functionality
  // ---------------------------------------------------------------------------
  function exportSubscribersCSV() {
    const list = state.filtered.length > 0 ? state.filtered : state.subscribers;
    if (list.length === 0) {
      alert("No subscribers available to export.");
      return;
    }

    const headers = [
      "Full Name",
      "Phone",
      "Status",
      "Categories",
      "Districts",
      "Divisions",
      "Departments",
      "Action Types",
      "Exclude Corrigendums",
      "Birth Year",
      "Created At",
      "Updated At",
    ];

    const rows = list.map((u) => {
      const presets = parseSelectedPresets(u).join("; ");
      const districts = Array.isArray(u.preferred_districts) ? u.preferred_districts.join("; ") : "Statewide";
      const divisions = Array.isArray(u.preferred_divisions) ? u.preferred_divisions.join("; ") : "Statewide";
      const depts = Array.isArray(u.preferred_departments) && u.preferred_departments.length > 0
        ? u.preferred_departments.map((c) => DEPARTMENTS_MAP[c]?.name || c).join("; ")
        : "All 34 Ministries";
      const intents = Array.isArray(u.preferred_intents) && u.preferred_intents.length > 0
        ? u.preferred_intents.map((id) => INTENTS_MAP[id]?.label || id).join("; ")
        : "All Actions";

      return [
        escapeCsv(u.full_name || "Citizen"),
        escapeCsv(u.phone || ""),
        u.is_active !== false ? "Active" : "Paused",
        escapeCsv(presets),
        escapeCsv(districts),
        escapeCsv(divisions),
        escapeCsv(depts),
        escapeCsv(intents),
        u.exclude_amendments !== false ? "Yes" : "No",
        escapeCsv(getUserBirthYear(u)),
        escapeCsv(u.created_at || ""),
        escapeCsv(u.updated_at || ""),
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `mahasanket_subscribers_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${list.length} subscribers to CSV`, "📥");
  }

  function escapeCsv(val) {
    const s = String(val == null ? "" : val);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ---------------------------------------------------------------------------
  // Event Bindings
  // ---------------------------------------------------------------------------
  function bindEvents() {
    // Login form
    el.loginForm.addEventListener("submit", handleLogin);

    // Autofill default credentials
    el.btnAutofill?.addEventListener("click", () => {
      el.userInput.value = "admin";
      el.passInput.value = "admin123";
      showToast("Default credentials filled (admin / admin123)", "🔑");
    });

    // Autofill Praveen Pardeshi credentials
    el.btnAutofillPraveen?.addEventListener("click", () => {
      el.userInput.value = "Praveen Pardeshi";
      el.passInput.value = "admin123";
      showToast("Credentials filled for Praveen Pardeshi", "🛡️");
    });

    // Logout
    el.adminLogoutBtn?.addEventListener("click", handleLogout);

    // Search
    el.searchInput?.addEventListener("input", (e) => {
      state.searchTerm = e.target.value;
      if (el.clearSearchBtn) {
        if (state.searchTerm) el.clearSearchBtn.classList.remove("hidden");
        else el.clearSearchBtn.classList.add("hidden");
      }
      applyFilters();
    });

    el.clearSearchBtn?.addEventListener("click", () => {
      el.searchInput.value = "";
      state.searchTerm = "";
      el.clearSearchBtn.classList.add("hidden");
      applyFilters();
    });

    // Status Filter Buttons
    el.statusBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        el.statusBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.statusFilter = btn.dataset.status;
        applyFilters();
      });
    });

    // Category Select
    el.roleSelect?.addEventListener("change", (e) => {
      state.categoryFilter = e.target.value;
      applyFilters();
    });

    // Division Select
    el.divisionSelect?.addEventListener("change", (e) => {
      state.divisionFilter = e.target.value;
      applyFilters();
    });

    // Refresh Data
    el.refreshBtn?.addEventListener("click", () => {
      loadSubscribers();
      showToast("Refreshed subscriber records", "🔄");
    });

    // Retry Button
    el.btnRetry?.addEventListener("click", loadSubscribers);

    // Clear all filters
    el.btnClearFilters?.addEventListener("click", () => {
      state.searchTerm = "";
      state.statusFilter = "ALL";
      state.categoryFilter = "ALL";
      state.divisionFilter = "ALL";
      if (el.searchInput) el.searchInput.value = "";
      if (el.clearSearchBtn) el.clearSearchBtn.classList.add("hidden");
      if (el.roleSelect) el.roleSelect.value = "ALL";
      if (el.divisionSelect) el.divisionSelect.value = "ALL";
      el.statusBtns.forEach((b) => {
        if (b.dataset.status === "ALL") b.classList.add("active");
        else b.classList.remove("active");
      });
      applyFilters();
    });

    // Export CSV
    el.exportCsvBtn?.addEventListener("click", exportSubscribersCSV);

    // Department Selector for Chart
    el.chartDeptSelect?.addEventListener("change", () => {
      renderDepartmentFrequencyChart(currentChartType);
      const opt = el.chartDeptSelect.options[el.chartDeptSelect.selectedIndex];
      const deptName = opt ? opt.text : "Department";
      showToast(`Showing intent breakdown for ${deptName}`, "🏛️");
    });

    // Chart Type Toggles
    el.toggleChartBar?.addEventListener("click", () => {
      el.toggleChartBar.classList.add("active");
      el.toggleChartSpider?.classList.remove("active");
      renderDepartmentFrequencyChart("bar");
    });

    el.toggleChartSpider?.addEventListener("click", () => {
      el.toggleChartSpider.classList.add("active");
      el.toggleChartBar?.classList.remove("active");
      renderDepartmentFrequencyChart("radar");
    });

    // Drawer close
    el.closeDrawerBtn?.addEventListener("click", closeDrawer);
    el.drawerCloseActionBtn?.addEventListener("click", closeDrawer);
    el.drawer?.addEventListener("click", (e) => {
      if (e.target === el.drawer) closeDrawer();
    });

    // Keyboard ESC to close drawer
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !el.drawer.classList.contains("hidden")) {
        closeDrawer();
      }
    });
  }

  // Init
  bindEvents();
  initAuth();
})();
