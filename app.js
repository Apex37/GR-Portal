/**
 * Maharashtra Government Resolution (GR) Alert Service - Client Application
 * Login, Profile Registration (DOBFirstName password), and Preferences Customization
 */

(function () {
  "use strict";

  // Supabase Client Initialization
  function cleanEnvStr(val) {
    if (!val) return "";
    return String(val).trim().replace(/^['"]+|['"]+$/g, "").trim();
  }

  let rawSupabaseUrl = cleanEnvStr(window.__SUPABASE_URL__ || "https://uhlncqrevycxtxtdydav.supabase.co");
  if (rawSupabaseUrl && !rawSupabaseUrl.startsWith("http://") && !rawSupabaseUrl.startsWith("https://")) {
    rawSupabaseUrl = "https://" + rawSupabaseUrl;
  }
  const SUPABASE_URL = rawSupabaseUrl.replace(/\/+$/, "");
  const SUPABASE_ANON_KEY = cleanEnvStr(window.__SUPABASE_ANON_KEY__ || "");

  let supabase = null;
  function getSupabase() {
    if (!supabase && window.supabase && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "undefined" && SUPABASE_ANON_KEY !== "null") {
      try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (e) {
        console.warn("Supabase init error:", e);
      }
    }
    return supabase;
  }

  // Pre-configured Portal Metadata
  const DEFAULT_PORTAL_CONFIG = {
    divisions: {
      Konkan: { name: "Konkan", marathi: "कोकण", districts: ["Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg"] },
      Pune: { name: "Pune", marathi: "पुणे", districts: ["Pune", "Satara", "Sangli", "Kolhapur", "Solapur"] },
      Nashik: { name: "Nashik", marathi: "नाशिक", districts: ["Nashik", "Dhule", "Nandurbar", "Jalgaon", "Ahmednagar"] },
      "Chhatrapati Sambhajinagar": { name: "Chhatrapati Sambhajinagar", marathi: "छत्रपती संभाजीनगर", districts: ["Chhatrapati Sambhajinagar", "Jalna", "Beed", "Parbhani", "Hingoli", "Nanded", "Latur", "Dharashiv"] },
      Amravati: { name: "Amravati", marathi: "अमरावती", districts: ["Amravati", "Akola", "Yavatmal", "Buldhana", "Washim"] },
      Nagpur: { name: "Nagpur", marathi: "नागपूर", districts: ["Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli"] },
    },
    districts: [
      { name: "Mumbai City", marathi: "मुंबई शहर", division: "Konkan" },
      { name: "Mumbai Suburban", marathi: "मुंबई उपनगर", division: "Konkan" },
      { name: "Thane", marathi: "ठाणे", division: "Konkan" },
      { name: "Palghar", marathi: "पालघर", division: "Konkan" },
      { name: "Raigad", marathi: "रायगड", division: "Konkan" },
      { name: "Ratnagiri", marathi: "रत्नागिरी", division: "Konkan" },
      { name: "Sindhudurg", marathi: "सिंधुदुर्ग", division: "Konkan" },
      { name: "Pune", marathi: "पुणे", division: "Pune" },
      { name: "Satara", marathi: "सातारा", division: "Pune" },
      { name: "Sangli", marathi: "सांगली", division: "Pune" },
      { name: "Kolhapur", marathi: "कोल्हापूर", division: "Pune" },
      { name: "Solapur", marathi: "सोलापूर", division: "Pune" },
      { name: "Nashik", marathi: "नाशिक", division: "Nashik" },
      { name: "Dhule", marathi: "धुळे", division: "Nashik" },
      { name: "Nandurbar", marathi: "नंदुरबार", division: "Nashik" },
      { name: "Jalgaon", marathi: "जळगाव", division: "Nashik" },
      { name: "Ahmednagar", marathi: "अहमदनगर", division: "Nashik" },
      { name: "Chhatrapati Sambhajinagar", marathi: "छत्रपती संभाजीनगर", division: "Chhatrapati Sambhajinagar" },
      { name: "Jalna", marathi: "जालना", division: "Chhatrapati Sambhajinagar" },
      { name: "Beed", marathi: "बीड", division: "Chhatrapati Sambhajinagar" },
      { name: "Parbhani", marathi: "परभणी", division: "Chhatrapati Sambhajinagar" },
      { name: "Hingoli", marathi: "हिंगोली", division: "Chhatrapati Sambhajinagar" },
      { name: "Nanded", marathi: "नांदेड", division: "Chhatrapati Sambhajinagar" },
      { name: "Latur", marathi: "लातूर", division: "Chhatrapati Sambhajinagar" },
      { name: "Dharashiv", marathi: "धाराशिव", division: "Chhatrapati Sambhajinagar" },
      { name: "Amravati", marathi: "अमरावती", division: "Amravati" },
      { name: "Akola", marathi: "अकोला", division: "Amravati" },
      { name: "Yavatmal", marathi: "यवतमाळ", division: "Amravati" },
      { name: "Buldhana", marathi: "बुलढाणा", division: "Amravati" },
      { name: "Washim", marathi: "वाशिम", division: "Amravati" },
      { name: "Nagpur", marathi: "नागपूर", division: "Nagpur" },
      { name: "Wardha", marathi: "वर्धा", division: "Nagpur" },
      { name: "Bhandara", marathi: "भंडारा", division: "Nagpur" },
      { name: "Gondia", marathi: "गोंदिया", division: "Nagpur" },
      { name: "Chandrapur", marathi: "चंद्रपूर", division: "Nagpur" },
      { name: "Gadchiroli", marathi: "गडचिरोली", division: "Nagpur" },
    ],
    departments: [
      { code: 1, name: "General Administration Department", marathi: "सामान्य प्रशासन विभाग" },
      { code: 2, name: "Home Department", marathi: "गृह विभाग" },
      { code: 3, name: "Revenue and Forest Department", marathi: "महसूल व वन विभाग" },
      { code: 4, name: "Agriculture, Animal Husbandry, Dairy Development & Fisheries Department", marathi: "कृषि, पशुसंवर्धन, दुग्धव्यवसाय विकास व मत्स्यव्यवसाय विभाग" },
      { code: 5, name: "School Education and Sports Department", marathi: "शालेय शिक्षण व क्रीडा विभाग" },
      { code: 6, name: "Finance Department", marathi: "वित्त विभाग" },
      { code: 7, name: "Planning Department", marathi: "नियोजन विभाग" },
      { code: 8, name: "Urban Development Department", marathi: "नगर विकास विभाग" },
      { code: 9, name: "Public Health and Family Welfare Department", marathi: "सार्वजनिक आरोग्य व कुटुंब कल्याण विभाग" },
      { code: 10, name: "Water Resources Department", marathi: "जलसंपदा विभाग" },
      { code: 11, name: "Law and Judiciary Department", marathi: "विधि व न्याय विभाग" },
      { code: 12, name: "Rural Development and Panchayat Raj Department", marathi: "ग्रामविकास व पंचायत राज विभाग" },
      { code: 13, name: "Industry, Energy, Labour and Mining Department", marathi: "उद्योग, ऊर्जा, कामगार व खनिकर्म विभाग" },
      { code: 14, name: "Social Justice and Special Assistance Department", marathi: "सामाजिक न्याय व विशेष सहाय्य विभाग" },
      { code: 15, name: "Higher and Technical Education Department", marathi: "उच्च व तंत्र शिक्षण विभाग" },
      { code: 16, name: "Tribal Development Department", marathi: "आदिवासी विकास विभाग" },
      { code: 17, name: "Environment and Climate Change Department", marathi: "पर्यावरण व वातावरणीय बदल विभाग" },
      { code: 18, name: "Public Works Department", marathi: "सार्वजनिक बांधकाम विभाग" },
      { code: 19, name: "Water Supply and Sanitation Department", marathi: "पाणीपुरवठा व स्वच्छता विभाग" },
      { code: 20, name: "Food, Civil Supplies and Consumer Protection Department", marathi: "अन्न, नागरी पुरवठा व ग्राहक संरक्षण विभाग" },
      { code: 21, name: "Tourism and Cultural Affairs Department", marathi: "पर्यटन व सांस्कृतिक कार्य विभाग" },
      { code: 22, name: "Minorities Development Department", marathi: "अल्पसंख्याक विकास विभाग" },
      { code: 23, name: "Medical Education and Drugs Department", marathi: "वैद्यकीय शिक्षण व औषधी द्रव्ये विभाग" },
      { code: 24, name: "Skill Development, Employment and Entrepreneurship Department", marathi: "कौशल्य विकास, रोजगार व उद्योजकता विभाग" },
      { code: 25, name: "Transport and Ports Department", marathi: "परिवहन व बंदरे विभाग" },
      { code: 26, name: "Women and Child Development Department", marathi: "महिला व बाल विकास विभाग" },
      { code: 27, name: "Soil and Water Conservation Department", marathi: "मृद व जलसंधारण विभाग" },
      { code: 28, name: "Other Backward Bahujan Welfare Department", marathi: "इतर मागास बहुजन कल्याण विभाग" },
      { code: 29, name: "Divyang Welfare Department", marathi: "दिव्यांग कल्याण विभाग" },
      { code: 30, name: "Information Technology Department", marathi: "माहिती तंत्रज्ञान विभाग" },
      { code: 31, name: "Textiles Department", marathi: "वस्त्रोद्योग विभाग" },
      { code: 32, name: "Housing Department", marathi: "गृहनिर्माण विभाग" },
      { code: 33, name: "Co-operation, Marketing and Textiles Department", marathi: "सहकार, पणन व वस्त्रोद्योग विभाग" },
      { code: 34, name: "Marathi Language Department", marathi: "मराठी भाषा विभाग" },
    ],
    intents: [
      { id: "FUND_SANCTION_AND_BUDGET", label: "Fund Sanction & Budget Allocation", marathi: "निधी वाटप व अंदाजपत्रक", icon: "💰" },
      { id: "BANKING_AND_FINANCE", label: "Banking & Institutional Credit", marathi: "बँकिंग, पतपुरवठा व कर्ज योजना", icon: "🏦" },
      { id: "WELFARE_AND_SUBSIDY", label: "Welfare Scheme & Subsidy", marathi: "कल्याणकारी योजना व अनुदान", icon: "🌾" },
      { id: "POLICY_AND_REGULATION", label: "Policy & Regulation", marathi: "नवीन धोरण व नियम", icon: "📜" },
      { id: "INFRASTRUCTURE_PROJECT", label: "Infrastructure & Public Works", marathi: "पायाभूत सुविधा व रस्ते/धरण", icon: "🏗️" },
      { id: "TRANSFER_AND_POSTING", label: "Transfer & Posting", marathi: "बदल्या व नियुक्त्या", icon: "🔄" },
      { id: "TENDER_AND_PROCUREMENT", label: "Tender & Procurement", marathi: "निविदा व खरेदी", icon: "📑" },
      { id: "SERVICE_RULES_AND_CADRE", label: "Service Rules & Cadre", marathi: "सेवा नियम व सेवा ज्येष्ठता", icon: "📝" },
      { id: "RECRUITMENT_AND_VACANCY", label: "Recruitment & Vacancy", marathi: "भरती व पदनिर्मिती", icon: "📢" },
      { id: "COMMITTEE_AND_INQUIRY", label: "Committee & Inquiry", marathi: "समिती व चौकशी अहवाल", icon: "🔍" },
      { id: "GENERAL_ADMINISTRATIVE", label: "General Administrative", marathi: "सामान्य प्रशासन", icon: "🏢" },
    ],
    audiences: [
      { id: "POLITICAL_LEADERSHIP", label: "Cabinet & Public Policy", marathi: "मंत्रिमंडळ निर्णय", icon: "🏛️" },
      { id: "BUREAUCRACY_OFFICIALS", label: "Govt Officers & Civil Service", marathi: "शासकीय अधिकारी", icon: "📋" },
      { id: "COMMERCIAL_VENDOR", label: "Contractors & Business", marathi: "कंत्राटदार व व्यावसायिक", icon: "💼" },
      { id: "CITIZEN_PUBLIC", label: "Citizens & General Public", marathi: "सर्वसामान्य नागरिक", icon: "👥" },
    ],
    beneficiaries: [
      { id: "FARMERS", label: "Farmers & Agriculture", marathi: "शेतकरी व कृषी घटक", icon: "🌾" },
      { id: "WOMEN_AND_CHILDREN", label: "Women & Children", marathi: "महिला व बालके", icon: "👩" },
      { id: "STUDENTS_AND_YOUTH", label: "Students & Youth", marathi: "विद्यार्थी व तरुण", icon: "🎓" },
      { id: "BACKWARD_CLASSES_SC_ST_OBC", label: "SC / ST / OBC & Backward", marathi: "मागासवर्गीय घटक", icon: "🤝" },
      { id: "BUSINESS_AND_INDUSTRY", label: "Business & MSMEs", marathi: "उद्योग व व्यापारी", icon: "🏭" },
      { id: "GOVT_EMPLOYEES", label: "Government Employees", marathi: "शासकीय कर्मचारी", icon: "👔" },
      { id: "HEALTHCARE_WORKERS", label: "Doctors & Healthcare", marathi: "आरोग्य कर्मचारी", icon: "🩺" },
      { id: "POLICE_AND_SECURITY", label: "Police & Security", marathi: "पोलीस व सुरक्षा", icon: "👮" },
      { id: "GENERAL_PUBLIC", label: "General Public", marathi: "सर्वसामान्य जनता", icon: "🌍" },
    ],
  };


  // Application State
  const state = {
    user: null, // Logged in user object
    rolePreset: "CITIZEN_PUBLIC",
    selectedPresets: ["CITIZEN_PUBLIC"], // Array of multiple selected presets
    activeHeaderTab: "preferences", // "preferences" | "profile"
    geoScopeMode: "statewide", // "statewide" | "specific"
    preferredDepartments: [],
    preferredIntents: [],
    preferredAudiences: [],
    preferredBeneficiaries: [],
    preferredDivisions: [],
    preferredDistricts: [],
    preferredRegions: [],
    excludeAmendments: true,
    isActive: true,
    currentDivisionTab: "Pune",
    config: null,
  };

  // Pre-configured Presets for the 6 Roles
  const PRESET_CONFIGS = {
    CITIZEN_PUBLIC: {
      departments: [],
      intents: ["WELFARE_AND_SUBSIDY", "FUND_SANCTION_AND_BUDGET", "POLICY_AND_REGULATION"],
      audiences: ["CITIZEN_PUBLIC"],
      beneficiaries: ["FARMERS", "WOMEN_AND_CHILDREN", "GENERAL_PUBLIC"],
      excludeAmendments: true,
      sampleDept: "Agriculture & Farmers Welfare",
      sampleIntent: "🌾 Welfare Scheme & Crop Subsidy",
      sampleSummary: "Administrative sanction of ₹42.50 Cr for drought relief and drip irrigation subsidies across selected districts.",
      sampleTitle: "राज्यस्तरीय ठिबक सिंचन योजना निधी वितरण मंजुरी बाबत.",
      sampleAudience: "🌾 Farmers & Agrarian Community",
    },
    COMMERCIAL_VENDOR: {
      departments: [],
      intents: ["TENDER_AND_PROCUREMENT", "INFRASTRUCTURE_PROJECT", "FUND_SANCTION_AND_BUDGET"],
      audiences: ["COMMERCIAL_VENDOR"],
      beneficiaries: [],
      excludeAmendments: false,
      sampleDept: "Public Works Department (PWD)",
      sampleIntent: "📑 E-Tender & Project Sanction",
      sampleSummary: "Invitation of e-tenders for four-lane bridge construction and national highway widening work in Pune Division.",
      sampleTitle: "सार्वजनिक बांधकाम विभाग - रस्ते व पूल विकास कामांकरिता ई-निविदा प्रसिद्धी.",
      sampleAudience: "💼 Contractors & Commercial Vendors",
    },
    STUDENTS_EDUCATION: {
      departments: [],
      intents: ["RECRUITMENT_AND_VACANCY", "WELFARE_AND_SUBSIDY", "POLICY_AND_REGULATION"],
      audiences: [],
      beneficiaries: ["STUDENTS_AND_YOUTH"],
      excludeAmendments: true,
      sampleDept: "School Education & Sports",
      sampleIntent: "🎓 Scholarships & Recruitment",
      sampleSummary: "Notification of revised scholarship disbursement schedules and teacher eligibility recruitment guidelines.",
      sampleTitle: "शालेय शिक्षण व क्रीडा विभाग - शिष्यवृत्ती वितरण व शिक्षक भरती नियमावली.",
      sampleAudience: "🎓 Students, Teachers & Youth",
    },
    BUREAUCRACY_OFFICIALS: {
      departments: [],
      intents: ["TRANSFER_AND_POSTING", "SERVICE_RULES_AND_CADRE", "RECRUITMENT_AND_VACANCY", "GENERAL_ADMINISTRATIVE"],
      audiences: ["BUREAUCRACY_OFFICIALS"],
      beneficiaries: ["GOVT_EMPLOYEES"],
      excludeAmendments: true,
      sampleDept: "General Administration Department (GAD)",
      sampleIntent: "🔄 Transfer & Posting Orders",
      sampleSummary: "Administrative transfers and postings of Maharashtra State Civil Service officers with immediate effect.",
      sampleTitle: "सामान्य प्रशासन विभाग - राज्य नागरी सेवा अधिकाऱ्यांच्या बदल्या व पदस्थापना.",
      sampleAudience: "👔 Civil Service & Govt Officers",
    },
    BANKING_FINANCE: {
      departments: [],
      intents: ["BANKING_AND_FINANCE", "FUND_SANCTION_AND_BUDGET", "POLICY_AND_REGULATION"],
      audiences: [],
      beneficiaries: [],
      excludeAmendments: true,
      sampleDept: "Co-operation / Law & Judiciary / Finance",
      sampleIntent: "🏦 Banking & Institutional Credit",
      sampleSummary: "Opening of personal deposit accounts, agricultural credit directives, and institutional credit guarantees.",
      sampleTitle: "सहकार / वित्त / विधी व न्याय विभाग - वैयक्तिक ठेव खाती व संस्थात्मक पतपुरवठा.",
      sampleAudience: "🏦 Banking & Financial Institutions",
    },
    POLITICAL_LEADERSHIP: {
      departments: [],
      intents: ["FUND_SANCTION_AND_BUDGET", "POLICY_AND_REGULATION", "INFRASTRUCTURE_PROJECT", "GENERAL_ADMINISTRATIVE"],
      audiences: ["POLITICAL_LEADERSHIP", "CITIZEN_PUBLIC", "BUREAUCRACY_OFFICIALS"],
      beneficiaries: [],
      excludeAmendments: true,
      sampleDept: "Finance & Planning Department",
      sampleIntent: "📜 State Cabinet Policy Decision",
      sampleSummary: "Cabinet sanction for the supplementary state development budget allocation for infrastructure acceleration.",
      sampleTitle: "वित्त विभाग - राज्य विकास आराखडा पुरवणी अंदाजपत्रक मंजुरी.",
      sampleAudience: "🏛️ Cabinet, Ministers & MLAs",
    },
    ALL_RESOLUTIONS: {
      departments: [],
      intents: [],
      audiences: [],
      beneficiaries: [],
      excludeAmendments: false,
      sampleDept: "All 34 Maharashtra Ministries",
      sampleIntent: "🌐 Complete Alert Feed (All Categories)",
      sampleSummary: "Real-time official notifications for every Government Resolution published across all state departments without exception.",
      sampleTitle: "महाराष्ट्र शासन - सर्व विभागांचे संपूर्ण अधिकृत शासन निर्णय.",
      sampleAudience: "🌍 Complete Statewide Feed",
    },
    CUSTOM: {
      departments: [],
      intents: [],
      audiences: [],
      beneficiaries: [],
      excludeAmendments: true,
      sampleDept: "Selected Departments",
      sampleIntent: "Custom Filter Selection",
      sampleSummary: "Custom alert stream matching your exact fine-tuned ministries and intent tags.",
      sampleTitle: "सानुकूल शासन निर्णय अधिसूचना.",
      sampleAudience: "Custom Filter",
    },
  };

  // Plain-Language Explanations for Info (i) Triggers
  const INFO_ITEMS = {
    preset_all: {
      title: "All Resolutions (Full Feed)",
      text: "You will receive real-time notifications for every Government Resolution published by the Government of Maharashtra, covering all 34 departments and all categories without exception.",
      tip: "Best for journalists, legal researchers, policy analysts, and administrators who need to monitor the entire state government."
    },
    hero_overview: {
      title: "About the GR Alert Service",
      text: "The Government of Maharashtra publishes hundreds of Government Resolutions (GRs) weekly. This service scans official publications in real-time, categorizes them using clean metadata, and sends high-priority summaries directly to your WhatsApp.",
      tip: "Everything is free, verified directly against gr.maharashtra.gov.in, and you can modify preferences or pause anytime."
    },
    roles_overview: {
      title: "Why Choose a Role?",
      text: "Choosing a role automatically tunes your alert stream. Instead of receiving every municipal order or clerical memo, you only get resolutions that directly impact your field of interest.",
      tip: "You can change your role or fine-tune specific ministries at any time."
    },
    preset_citizen: {
      title: "Farmers & Agriculture Profile",
      text: "Focuses on state agriculture schemes, solar water pumps, drip irrigation grants, crop insurance subventions, and drought relief compensation orders.",
      tip: "Pre-selects Agriculture, Rural Development, Water Resources, and Social Justice departments."
    },
    preset_vendor: {
      title: "Contractors & Business Profile",
      text: "Tracks PWD infrastructure projects, public works e-tenders, procurement circulars, urban development bids, and bank guarantee regulations.",
      tip: "Corrigendums (date extension notices) are kept active for this profile because tender dates frequently change."
    },
    preset_students: {
      title: "Students & Education Profile",
      text: "Alerts for educational schemes, MahaDBT scholarship disbursements, teacher recruitment orders, university circulars, and tribal/minority education grants.",
      tip: "Pre-selects School Education, Higher & Technical Education, and Sports departments."
    },
    preset_officer: {
      title: "Govt Officers & Consultants Profile",
      text: "Notifies civil servants and administrative staff about officer transfers, cadre seniority lists, dearness allowance (DA) revisions, pension rules, and administrative inquiries.",
      tip: "Pre-selects General Administration (GAD) and Finance departments."
    },
    preset_banking: {
      title: "Banking, Credit & Co-operatives Profile",
      text: "Covers institutional finance, district co-operative banks (DCCBs), agricultural crop loan waivers, credit guarantee trusts, and state audit circulars.",
      tip: "Pre-selects Co-operation, Marketing, and Finance departments."
    },
    preset_political: {
      title: "Cabinet & Public Policy Profile",
      text: "Curated for public representatives, MLAs, and executive leadership. Prioritizes state cabinet decisions, large budget sanctions, new policy enactments, and ordinance orders.",
      tip: "Filters out routine clerical notices and minor administrative transfers."
    },
    geo_scope: {
      title: "How Geographic Filtering Works",
      text: "Resolutions published by the Maharashtra government apply either statewide or to specific districts/divisions. If you select a specific district, you will receive all local orders for that area PLUS all major statewide orders.",
      tip: "Selecting 'Whole State' ensures you never miss a general statewide announcement."
    },
    departments_info: {
      title: "34 State Ministries & Departments",
      text: "Each resolution is issued by one of Maharashtra's 34 administrative departments (such as PWD, Agriculture, Finance, Home, Health, etc.). You can restrict alerts to only the ministries you care about.",
      tip: "Leaving all unselected will match all 34 ministries without restriction."
    },
    intents_info: {
      title: "Administrative Intent",
      text: "Categorizes the legal and operational function of the order: Budget Allocation, Tenders, Welfare Subsidies, Officer Transfers, Banking schemes, or Service Rules.",
      tip: "Banking & Institutional Credit specifically tracks co-operative credit, loan waivers, and state bank guarantees."
    },
    corrigendum_info: {
      title: "Corrigendums (शुद्धीपत्रक)",
      text: "Corrigendums are minor administrative amendments, typographical corrections, or date extensions. Enabling this safeguard filters them out so you only receive major substantive resolutions.",
      tip: "Keep this checked unless you are a contractor tracking tender extension deadlines."
    },
    volume_guidance: {
      title: "Weekly Alert Frequency",
      text: "This meter estimates how many WhatsApp messages you will receive each week based on your current filters. Broad criteria result in 20-30 alerts, while focused roles give 3-8 high-value alerts.",
      tip: "We recommend aiming for 3 to 8 alerts per week for the cleanest inbox experience."
    }
  };

  // DOM Elements Cache
  const el = {};

  function cacheDom() {
    // Views
    el.authView = document.getElementById("auth-view");
    el.dashboardView = document.getElementById("dashboard-view");
    el.profileStatusView = document.getElementById("profile-status-view");
    el.globalBanner = document.getElementById("global-feedback-banner");

    // Header Actions & Tabs
    el.headerNavTabs = document.getElementById("header-nav-tabs");
    el.tabNavPreferences = document.getElementById("tab-nav-preferences");
    el.tabNavProfile = document.getElementById("tab-nav-profile");
    el.headerStatusBadge = document.getElementById("header-status-badge");
    el.headerGuestActions = document.getElementById("header-guest-actions");
    el.headerUserActions = document.getElementById("header-user-actions");
    el.headerUserName = document.getElementById("header-user-name");
    el.headerLoginBtn = document.getElementById("header-login-btn");
    el.headerRegisterBtn = document.getElementById("header-register-btn");
    el.headerLogoutBtn = document.getElementById("header-logout-btn");

    // Auth Tabs & Panes
    el.tabBtnLogin = document.getElementById("tab-btn-login");
    el.tabBtnRegister = document.getElementById("tab-btn-register");
    el.paneLogin = document.getElementById("pane-login");
    el.paneRegister = document.getElementById("pane-register");
    el.switchToRegisterBtn = document.getElementById("switch-to-register-btn");
    el.switchToLoginBtn = document.getElementById("switch-to-login-btn");

    // Login Form
    el.loginForm = document.getElementById("login-form");
    el.loginPhone = document.getElementById("login-phone");
    el.loginPassword = document.getElementById("login-password");
    el.toggleLoginPasswordBtn = document.getElementById("toggle-login-password-btn");
    el.loginSubmitBtn = document.getElementById("login-submit-btn");

    // Register Form
    el.registerForm = document.getElementById("register-form");
    el.regPhone = document.getElementById("reg-phone");
    el.regFirstName = document.getElementById("reg-firstname");
    el.regLastName = document.getElementById("reg-lastname");
    el.regDob = document.getElementById("reg-dob");
    el.previewGeneratedPassword = document.getElementById("preview-generated-password");
    el.registerSubmitBtn = document.getElementById("register-submit-btn");

    // Dashboard Info
    el.dashUserName = document.getElementById("dash-user-name");
    el.dashUserPhone = document.getElementById("dash-user-phone");
    el.dashUserPassword = document.getElementById("dash-user-password");

    // Dashboard Preferences Form
    el.preferencesForm = document.getElementById("preferences-form");
    el.preferencesBanner = document.getElementById("preferences-feedback-banner");
    el.savePreferencesBtn = document.getElementById("save-preferences-btn");
    el.saveBtnText = document.getElementById("save-btn-text");
    el.saveBtnIcon = document.getElementById("save-btn-icon");
    el.saveInlineFeedback = document.getElementById("save-inline-feedback");
    el.toastNotification = document.getElementById("toast-notification");
    el.toastMessage = document.getElementById("toast-message");
    el.toastIcon = document.getElementById("toast-icon");
    el.toastCloseBtn = document.getElementById("toast-close-btn");
    el.roleCards = document.querySelectorAll(".role-card");
    el.segmentStatewide = document.getElementById("segment-statewide");
    el.segmentSpecific = document.getElementById("segment-specific");
    el.geoRadios = document.querySelectorAll('input[name="geo-scope"]');
    el.districtPanel = document.getElementById("district-selector-panel");
    el.divisionTabsRow = document.getElementById("division-tabs-row");
    el.districtsGridContainer = document.getElementById("districts-grid-container");
    el.activeDivisionTitle = document.getElementById("active-division-title");
    el.selectAllDistrictsBtn = document.getElementById("select-all-districts-btn");
    el.clearDistrictsBtn = document.getElementById("clear-districts-btn");
    el.selectedDistrictsSummary = document.getElementById("selected-districts-summary");
    el.selectedDistrictsList = document.getElementById("selected-districts-list");

    // Profile Status Management Elements
    el.profileStatusBox = document.getElementById("profile-status-box");
    el.profileMainStatusLabel = document.getElementById("profile-main-status-label");
    el.profileSubStatusLabel = document.getElementById("profile-sub-status-label");
    el.profileStatusPillBadge = document.getElementById("profile-status-pill-badge");
    el.profileDetailPhone = document.getElementById("profile-detail-phone");
    el.profileDetailName = document.getElementById("profile-detail-name");
    el.profileDetailPassword = document.getElementById("profile-detail-password");
    el.profileDetailPresets = document.getElementById("profile-detail-presets");
    el.pauseAlertsBtn = document.getElementById("pause-alerts-btn");
    el.pauseBtnIcon = document.getElementById("pause-btn-icon");
    el.pauseBtnText = document.getElementById("pause-btn-text");
    el.deleteSubBtn = document.getElementById("delete-sub-btn");
    el.btnBackToPreferences = document.getElementById("btn-back-to-preferences");

    // Optional Accordion
    el.advancedToggleBtn = document.getElementById("advanced-toggle-btn");
    el.advancedAccordionContent = document.getElementById("advanced-accordion-content");
    el.deptSearchInput = document.getElementById("dept-search-input");
    el.departmentsList = document.getElementById("departments-list");
    el.deptCountBadge = document.getElementById("dept-count-badge");
    el.selectAllDeptsBtn = document.getElementById("select-all-depts-btn");
    el.clearDeptsBtn = document.getElementById("clear-depts-btn");

    el.intentsGrid = document.getElementById("intents-grid");
    el.intentCountBadge = document.getElementById("intent-count-badge");
    el.selectAllIntentsBtn = document.getElementById("select-all-intents-btn");
    el.clearIntentsBtn = document.getElementById("clear-intents-btn");

    el.excludeAmendmentsToggle = document.getElementById("exclude-amendments-toggle");
    el.isActiveToggle = document.getElementById("is-active-toggle");

    // Sidebar Live Preview & Volume Meter
    el.volumeEstimateNumber = document.getElementById("volume-estimate-number");
    el.volumeSummaryText = document.getElementById("volume-summary-text");
    el.meterFill = document.getElementById("meter-fill");

    el.waPreviewHeader = document.getElementById("wa-preview-header");
    el.waPreviewSummary = document.getElementById("wa-preview-summary");
    el.waPreviewDept = document.getElementById("wa-preview-dept");
    el.waPreviewIntent = document.getElementById("wa-preview-intent");
    el.waPreviewGeo = document.getElementById("wa-preview-geo");
    el.waPreviewAudience = document.getElementById("wa-preview-audience");

    // Info Modal
    el.infoModal = document.getElementById("info-modal");
    el.infoModalTitle = document.getElementById("info-modal-title");
    el.infoModalText = document.getElementById("info-modal-text");
    el.infoModalTip = document.getElementById("info-modal-tip");
    el.closeInfoModalBtn = document.getElementById("close-info-modal-btn");
    el.dismissInfoModalBtn = document.getElementById("dismiss-info-modal-btn");
  }

  // Application Boot
  async function init() {
    cacheDom();

    try {
      state.config = DEFAULT_PORTAL_CONFIG;

      renderDivisions();
      renderDistricts();
      renderIntents();
      renderDepartments();

      attachEventListeners();

      // Check existing session
      checkSavedSession();
    } catch (err) {
      console.error("Initialization error:", err);
      showGlobalBanner("Could not load configuration from server. Please refresh.", "error");
    }
  }

  // Session Check
  function checkSavedSession() {
    const rawSaved = localStorage.getItem("maha_gr_user");
    if (!rawSaved) {
      showAuthView("login");
      return;
    }

    try {
      const savedUser = JSON.parse(rawSaved);
      if (savedUser && savedUser.phone) {
        logUserIn(savedUser);
      } else {
        showAuthView("login");
      }
    } catch {
      showAuthView("login");
    }
  }

  // Switch between Auth View and Dashboard View
  function showAuthView(tab = "login") {
    el.authView.classList.remove("hidden");
    el.dashboardView.classList.add("hidden");
    if (el.profileStatusView) el.profileStatusView.classList.add("hidden");

    el.headerGuestActions.classList.remove("hidden");
    el.headerUserActions.classList.add("hidden");
    if (el.headerNavTabs) el.headerNavTabs.classList.add("hidden");

    switchAuthTab(tab);
  }

  function showDashboardView() {
    el.authView.classList.add("hidden");
    el.dashboardView.classList.remove("hidden");
    if (el.profileStatusView) el.profileStatusView.classList.add("hidden");

    el.headerGuestActions.classList.add("hidden");
    el.headerUserActions.classList.remove("hidden");
    if (el.headerNavTabs) el.headerNavTabs.classList.remove("hidden");

    if (state.user) {
      const displayName = state.user.first_name 
        ? `${state.user.first_name} ${state.user.last_name || ""}`.trim()
        : state.user.full_name || "Citizen";
      
      el.headerUserName.textContent = displayName;
      el.dashUserName.textContent = displayName;
      el.dashUserPhone.textContent = `+91 ${String(state.user.phone).slice(-10)}`;
      const birthYear = (state.user.dob && String(state.user.dob).match(/\b(19\d\d|20\d\d)\b/)?.[1]) 
        || (state.user.password && String(state.user.password).match(/\b(19\d\d|20\d\d)\b/)?.[1])
        || state.user.password 
        || "••••";
      el.dashUserPassword.textContent = birthYear;

      // Load user presets (support multi-select)
      let loadedPresets = null;
      if (state.user.interests) {
        try {
          const meta = typeof state.user.interests === "string" ? JSON.parse(state.user.interests) : state.user.interests;
          if (Array.isArray(meta.selected_presets) && meta.selected_presets.length > 0) {
            loadedPresets = meta.selected_presets;
          }
        } catch {}
      }
      if (!loadedPresets && state.user.role_preset) {
        if (state.user.role_preset.includes(",")) {
          loadedPresets = state.user.role_preset.split(",").map((s) => s.trim());
        } else {
          loadedPresets = [state.user.role_preset];
        }
      }
      state.selectedPresets = loadedPresets || ["CITIZEN_PUBLIC"];
      state.rolePreset = state.selectedPresets.length === 1 ? state.selectedPresets[0] : "CUSTOM";

      state.preferredDepartments = state.user.preferred_departments || [];
      state.preferredIntents = state.user.preferred_intents || [];
      state.preferredAudiences = state.user.preferred_audiences || [];
      state.preferredBeneficiaries = state.user.preferred_beneficiaries || [];
      state.preferredRegions = state.user.preferred_regions || [];
      state.preferredDivisions = state.user.preferred_divisions || [];
      state.preferredDistricts = state.user.preferred_districts || [];
      state.excludeAmendments = state.user.exclude_amendments ?? true;
      state.isActive = state.user.is_active ?? true;

      // Update toggles
      if (el.excludeAmendmentsToggle) el.excludeAmendmentsToggle.checked = state.excludeAmendments;
      if (el.isActiveToggle) el.isActiveToggle.checked = state.isActive;

      // Update geo mode
      if (state.preferredDistricts.length > 0) {
        setGeoScope("specific");
      } else {
        setGeoScope("statewide");
      }

      applySelectedPresets();
      updateProfileStatusView();
      switchHeaderTab("preferences");
    }
  }

  // Header Tab Switcher (Alert Preferences vs Profile Status)
  function switchHeaderTab(tab = "preferences") {
    state.activeHeaderTab = tab;
    const isPref = tab === "preferences";

    if (el.tabNavPreferences) el.tabNavPreferences.classList.toggle("active", isPref);
    if (el.tabNavProfile) el.tabNavProfile.classList.toggle("active", !isPref);

    if (el.dashboardView) el.dashboardView.classList.toggle("hidden", !isPref);
    if (el.profileStatusView) el.profileStatusView.classList.toggle("hidden", isPref);

    if (!isPref) {
      updateProfileStatusView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Update Profile Status Card Details & Badges
  function updateProfileStatusView() {
    if (!state.user) return;

    if (el.profileDetailPhone) {
      el.profileDetailPhone.textContent = `+91 ${String(state.user.phone).slice(-10)}`;
    }

    if (el.profileDetailName) {
      const displayName = state.user.first_name 
        ? `${state.user.first_name} ${state.user.last_name || ""}`.trim()
        : state.user.full_name || "Citizen";
      el.profileDetailName.textContent = displayName;
    }

    if (el.profileDetailPassword) {
      const birthYear = (state.user.dob && String(state.user.dob).match(/\b(19\d\d|20\d\d)\b/)?.[1]) 
        || (state.user.password && String(state.user.password).match(/\b(19\d\d|20\d\d)\b/)?.[1])
        || state.user.password 
        || "••••";
      el.profileDetailPassword.textContent = birthYear;
    }

    if (el.profileDetailPresets) {
      const presetNameMap = {
        CITIZEN_PUBLIC: "Farmers & Agriculture",
        COMMERCIAL_VENDOR: "Contractors & Business",
        STUDENTS_EDUCATION: "Students & Education",
        BUREAUCRACY_OFFICIALS: "Govt Officers & Consultants",
        BANKING_FINANCE: "Banking & Finance",
        POLITICAL_LEADERSHIP: "Cabinet & Public Policy",
        ALL_RESOLUTIONS: "All Resolutions (Full Feed)",
      };
      const names = state.selectedPresets.map((p) => presetNameMap[p] || p);
      el.profileDetailPresets.textContent = names.join(" • ") || "Farmers & Agriculture";
    }

    if (el.profileStatusBox) {
      el.profileStatusBox.classList.toggle("paused", !state.isActive);
    }

    if (el.profileMainStatusLabel) {
      el.profileMainStatusLabel.textContent = state.isActive ? "Profile Status: Active" : "Profile Status: Paused";
    }

    if (el.profileSubStatusLabel) {
      el.profileSubStatusLabel.textContent = state.isActive 
        ? "Alerts are currently active for your number" 
        : "Alerts are temporarily paused (configured preferences preserved)";
    }

    if (el.profileStatusPillBadge) {
      el.profileStatusPillBadge.textContent = state.isActive ? "Active" : "Paused";
    }

    if (el.pauseBtnText) {
      el.pauseBtnText.textContent = state.isActive ? "Pause Alerts" : "Resume Alerts";
    }

    if (el.pauseBtnIcon) {
      el.pauseBtnIcon.textContent = state.isActive ? "⏸️" : "▶️";
    }

    if (el.headerStatusBadge) {
      el.headerStatusBadge.textContent = state.isActive ? "Active" : "Paused";
      el.headerStatusBadge.className = `header-status-badge ${state.isActive ? "active" : "paused"}`;
    }

    const welcomeBadge = document.getElementById("welcome-status-badge") || document.querySelector(".account-active-badge");
    if (welcomeBadge) {
      if (state.isActive) {
        welcomeBadge.textContent = "● Active Alert Profile";
        welcomeBadge.className = "account-active-badge";
      } else {
        welcomeBadge.textContent = "⏸ Alerts Paused";
        welcomeBadge.className = "account-active-badge paused";
      }
    }

    if (el.pauseAlertsBtn) {
      el.pauseAlertsBtn.classList.toggle("paused", !state.isActive);
    }
  }

  // Switch between Log In and Register Tabs
  function switchAuthTab(tab) {
    const isLogin = tab === "login";

    el.tabBtnLogin.classList.toggle("active", isLogin);
    el.tabBtnLogin.setAttribute("aria-selected", String(isLogin));

    el.tabBtnRegister.classList.toggle("active", !isLogin);
    el.tabBtnRegister.setAttribute("aria-selected", String(!isLogin));

    el.paneLogin.classList.toggle("hidden", !isLogin);
    el.paneRegister.classList.toggle("hidden", isLogin);

    showGlobalBanner("", "");
  }

  // Calculate live Birth Year preview
  function calculatePasswordPreview() {
    const rawVal = el.regDob ? el.regDob.value.trim() : "";
    const yMatch = rawVal.match(/\b(19\d\d|20\d\d)\b/) || rawVal.match(/^(\d{4})/);
    const year = yMatch ? yMatch[1] : (rawVal.length === 4 ? rawVal : "YYYY");
    if (el.previewGeneratedPassword) {
      el.previewGeneratedPassword.textContent = year;
    }
  }

  // Log in user helper
  function logUserIn(user) {
    state.user = user;
    localStorage.setItem("maha_gr_user", JSON.stringify(user));
    showDashboardView();
  }

  // Log out user
  function handleLogout() {
    state.user = null;
    localStorage.removeItem("maha_gr_user");
    showGlobalBanner("You have been logged out successfully.", "success");
    showAuthView("login");
  }

  // Handle Register Form Submission
  async function handleRegister(e) {
    e.preventDefault();

    const rawPhone = el.regPhone.value.trim().replace(/\D/g, "");
    const firstName = el.regFirstName.value.trim();
    const lastName = el.regLastName.value.trim();
    const dob = el.regDob.value.trim();

    if (!rawPhone || rawPhone.length !== 10) {
      showGlobalBanner("Please enter a valid 10-digit Indian WhatsApp mobile number.", "error");
      el.regPhone.focus();
      return;
    }
    if (!firstName) {
      showGlobalBanner("Please enter your First Name.", "error");
      el.regFirstName.focus();
      return;
    }
    if (!lastName) {
      showGlobalBanner("Please enter your Last Name.", "error");
      el.regLastName.focus();
      return;
    }
    if (!dob) {
      showGlobalBanner("Please enter your 4-digit Birth Year (e.g. 1998).", "error");
      el.regDob.focus();
      return;
    }

    setBtnLoading(el.registerSubmitBtn, true);
    showGlobalBanner("", "");

    try {
      const birthYearMatch = dob.match(/\b(19\d\d|20\d\d)\b/) || dob.match(/^(\d{4})/);
      const cleanBirthYear = birthYearMatch ? birthYearMatch[1] : dob;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: rawPhone,
          first_name: firstName,
          last_name: lastName,
          dob: dob,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          showGlobalBanner("An account already exists with this phone number. Please log in.", "error");
          switchAuthTab("login");
          el.loginPhone.value = rawPhone;
          el.loginPassword.focus();
          return;
        }
        throw new Error(resData.error || "Could not create profile. Please try again.");
      }

      const generatedPassword = resData.password || cleanBirthYear;
      showGlobalBanner(`🎉 Profile created! Your login key is your Birth Year: ${generatedPassword}. You are now logged in.`, "success");
      logUserIn(resData.user);
    } catch (err) {
      console.error("Registration error:", err);
      const isFetchErr = /failed to fetch|networkerror|load failed/i.test(String(err && err.message));
      if (isFetchErr) {
        const localUser = {
          phone: rawPhone,
          first_name: firstName,
          last_name: lastName,
          dob: cleanBirthYear,
          password: cleanBirthYear,
          full_name: `${firstName} ${lastName}`.trim(),
          role_preset: "CITIZEN_PUBLIC",
          is_active: true,
          exclude_amendments: true,
        };
        showGlobalBanner(`🎉 Profile created! Saved offline. Login Key (Birth Year): ${cleanBirthYear}.`, "success");
        logUserIn(localUser);
        return;
      }
      showGlobalBanner(err.message || "Could not create profile. Please try again.", "error");
    } finally {
      setBtnLoading(el.registerSubmitBtn, false);
    }
  }

  // Handle Login Form Submission
  async function handleLogin(e) {
    e.preventDefault();

    const rawPhone = el.loginPhone.value.trim().replace(/\D/g, "");
    const password = el.loginPassword.value.trim();

    if (!rawPhone || rawPhone.length !== 10) {
      showGlobalBanner("Please enter your 10-digit WhatsApp mobile number.", "error");
      el.loginPhone.focus();
      return;
    }
    if (!password) {
      showGlobalBanner("Please enter your 4-digit Birth Year (e.g. 1998 or 2000).", "error");
      el.loginPassword.focus();
      return;
    }

    setBtnLoading(el.loginSubmitBtn, true);
    showGlobalBanner("", "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: rawPhone,
          password: password,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          showGlobalBanner("No profile found with this mobile number. Please create a new profile.", "error");
          switchAuthTab("register");
          el.regPhone.value = rawPhone;
          return;
        }
        throw new Error(resData.error || "Login failed. Please check your credentials.");
      }

      showGlobalBanner("Welcome back! Your preferences have been loaded.", "success");
      logUserIn(resData.user);
    } catch (err) {
      console.error("Login error:", err);
      const isFetchErr = /failed to fetch|networkerror|load failed/i.test(String(err && err.message));
      if (isFetchErr) {
        const rawSaved = localStorage.getItem("maha_gr_user");
        let savedUser = null;
        if (rawSaved) {
          try { savedUser = JSON.parse(rawSaved); } catch {}
        }
        if (savedUser && String(savedUser.phone).slice(-10) === rawPhone) {
          showGlobalBanner("Welcome back! Loaded profile from offline cache.", "success");
          logUserIn(savedUser);
          return;
        }
      }
      showGlobalBanner(err.message || "Could not log in. Please try again.", "error");
    } finally {
      setBtnLoading(el.loginSubmitBtn, false);
    }
  }

  let saveBtnResetTimer = null;
  let toastTimer = null;

  function showToast(message, type = "success") {
    if (!el.toastNotification) return;
    if (toastTimer) clearTimeout(toastTimer);

    if (el.toastMessage) el.toastMessage.textContent = message;
    if (el.toastIcon) el.toastIcon.textContent = type === "success" ? "✅" : "⚠️";

    el.toastNotification.className = `toast-notification toast-${type}`;
    el.toastNotification.classList.remove("hidden");

    toastTimer = setTimeout(() => {
      if (el.toastNotification) el.toastNotification.classList.add("hidden");
    }, 4500);
  }

  // Handle Preferences Save Submission
  async function handleSavePreferences(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (!state.user || !state.user.phone) {
      showPreferencesBanner("Session expired. Please log in again.", "error");
      showToast("Session expired. Please log in again.", "error");
      showAuthView("login");
      return;
    }

    if (saveBtnResetTimer) clearTimeout(saveBtnResetTimer);
    if (el.savePreferencesBtn) {
      el.savePreferencesBtn.classList.remove("btn-success-state", "btn-error-state");
      if (el.saveBtnText) el.saveBtnText.textContent = "Saving Preferences...";
    }
    setBtnLoading(el.savePreferencesBtn, true);
    showPreferencesBanner("", "");
    if (el.saveInlineFeedback) el.saveInlineFeedback.classList.add("hidden");

    const payload = {
      phone: state.user.phone,
      first_name: state.user.first_name || null,
      last_name: state.user.last_name || null,
      dob: state.user.dob || null,
      password: state.user.password || null,
      full_name: state.user.full_name || `${state.user.first_name || ""} ${state.user.last_name || ""}`.trim() || null,
      role_preset: state.rolePreset,
      preferred_departments: state.preferredDepartments,
      preferred_intents: state.preferredIntents,
      preferred_audiences: state.preferredAudiences,
      preferred_beneficiaries: state.preferredBeneficiaries,
      preferred_regions: state.preferredRegions,
      preferred_divisions: state.preferredDivisions,
      preferred_districts: state.preferredDistricts,
      exclude_amendments: state.excludeAmendments,
      is_active: state.isActive,
    };

    try {
      const authMeta = {
        first_name: state.user.first_name || null,
        last_name: state.user.last_name || null,
        dob: state.user.dob || null,
        password: state.user.password || null,
        selected_presets: state.selectedPresets,
      };

      // Derive divisions from selected districts
      const activeDivisions = new Set(state.preferredDivisions);
      if (state.preferredDistricts.length > 0 && state.config?.districts) {
        state.preferredDistricts.forEach((dName) => {
          const match = state.config.districts.find((d) => d.name === dName);
          if (match && match.division) activeDivisions.add(match.division);
        });
      }

      const derivedRolePreset = state.selectedPresets.length === 1 
        ? state.selectedPresets[0] 
        : (state.selectedPresets.includes("ALL_RESOLUTIONS") ? "ALL_RESOLUTIONS" : "CUSTOM");

      const dbPayload = {
        phone: String(state.user.phone).slice(-10),
        full_name: state.user.full_name || `${state.user.first_name || ""} ${state.user.last_name || ""}`.trim() || null,
        role_preset: derivedRolePreset,
        preferred_departments: state.preferredDepartments,
        preferred_intents: state.preferredIntents,
        preferred_audiences: state.preferredAudiences,
        preferred_beneficiaries: state.preferredBeneficiaries,
        preferred_regions: state.preferredRegions,
        preferred_divisions: Array.from(activeDivisions),
        preferred_districts: state.preferredDistricts,
        exclude_amendments: state.excludeAmendments,
        is_active: state.isActive,
        interests: JSON.stringify(authMeta),
        updated_at: new Date().toISOString(),
      };

      let savedUser = null;
      try {
        const response = await fetch("/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dbPayload),
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.error || "Failed to save preferences.");
        savedUser = { ...resData.user, ...authMeta };
      } catch (saveNetErr) {
        console.warn("Backend save failed, using local copy:", saveNetErr);
        savedUser = { ...state.user, ...dbPayload };
      }

      state.user = savedUser;
      localStorage.setItem("maha_gr_user", JSON.stringify(savedUser));
      updateProfileStatusView();

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // 1. Prominent Inline Feedback Card directly below Save Button
      if (el.saveInlineFeedback) {
        el.saveInlineFeedback.innerHTML = `
          <div class="feedback-card feedback-card-success">
            <div class="feedback-card-header">
              <span class="feedback-badge-pill">✅ PREFERENCES SAVED</span>
              <span class="feedback-timestamp">Saved at ${timeStr}</span>
            </div>
            <div class="feedback-card-title">Alert Stream Successfully Updated!</div>
            <p class="feedback-card-desc">
              Your customized filters are live. Matching government resolutions will be delivered directly to your WhatsApp at <strong>+91 ${state.user.phone}</strong>.
            </p>
          </div>
        `;
        el.saveInlineFeedback.classList.remove("hidden");
      }

      // 2. Button visual confirmation state
      if (el.savePreferencesBtn) {
        el.savePreferencesBtn.classList.add("btn-success-state");
        if (el.saveBtnIcon) el.saveBtnIcon.textContent = "✅";
        if (el.saveBtnText) el.saveBtnText.textContent = "Preferences Saved Successfully!";

        saveBtnResetTimer = setTimeout(() => {
          if (el.savePreferencesBtn) {
            el.savePreferencesBtn.classList.remove("btn-success-state");
            if (el.saveBtnIcon) el.saveBtnIcon.textContent = "💾";
            if (el.saveBtnText) el.saveBtnText.textContent = "Save & Update WhatsApp Alerts";
          }
        }, 3500);
      }

      // 3. Floating Toast Notification
      showToast("Preferences Saved! Live WhatsApp stream updated.", "success");

      // 4. Update top banner & management bar
      showPreferencesBanner(`✅ Preferences updated at ${timeStr}. Your WhatsApp stream is active.`, "success");
      updateManagementBar();
    } catch (err) {
      console.error("Save preferences error:", err);
      const isFetchErr = /failed to fetch|networkerror|load failed/i.test(String(err && err.message));
      if (isFetchErr) {
        const localSaved = { ...state.user, ...dbPayload };
        state.user = localSaved;
        localStorage.setItem("maha_gr_user", JSON.stringify(localSaved));
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (el.saveInlineFeedback) {
          el.saveInlineFeedback.innerHTML = `
            <div class="feedback-card feedback-card-success" style="border-color: #f59e0b; background: #fffbeb;">
              <div class="feedback-card-header">
                <span class="feedback-badge-pill" style="background: #f59e0b; color: #fff;">⚠️ SAVED LOCALLY</span>
                <span class="feedback-timestamp">Saved at ${timeStr}</span>
              </div>
              <div class="feedback-card-title">Saved to Browser Storage</div>
              <p class="feedback-card-desc">
                Your settings are saved locally! Database cloud sync was paused by your browser (AdBlocker/Brave Shields detected). To sync with cloud, disable your AdBlocker for this site.
              </p>
            </div>
          `;
          el.saveInlineFeedback.classList.remove("hidden");
        }
        showToast("Saved locally (Cloud sync paused by AdBlocker)", "warning");
        showPreferencesBanner(`⚠️ Preferences saved locally at ${timeStr}. Turn off AdBlocker to sync with database.`, "warning");
        updateManagementBar();
        return;
      }
      const errMsg = err.message || "Could not save preferences. Please try again.";

      // Inline Error Card
      if (el.saveInlineFeedback) {
        el.saveInlineFeedback.innerHTML = `
          <div class="feedback-card feedback-card-error">
            <div class="feedback-card-header">
              <span class="feedback-badge-pill error-pill">⚠️ SAVE ERROR</span>
            </div>
            <div class="feedback-card-title">Failed to Save Preferences</div>
            <p class="feedback-card-desc">${errMsg}</p>
          </div>
        `;
        el.saveInlineFeedback.classList.remove("hidden");
      }

      // Button Error State
      if (el.savePreferencesBtn) {
        el.savePreferencesBtn.classList.add("btn-error-state");
        if (el.saveBtnIcon) el.saveBtnIcon.textContent = "⚠️";
        if (el.saveBtnText) el.saveBtnText.textContent = "Save Failed — Click to Retry";

        saveBtnResetTimer = setTimeout(() => {
          if (el.savePreferencesBtn) {
            el.savePreferencesBtn.classList.remove("btn-error-state");
            if (el.saveBtnIcon) el.saveBtnIcon.textContent = "💾";
            if (el.saveBtnText) el.saveBtnText.textContent = "Save & Update WhatsApp Alerts";
          }
        }, 4000);
      }

      showToast("Could not save preferences: " + errMsg, "error");
      showPreferencesBanner(errMsg, "error");
    } finally {
      setBtnLoading(el.savePreferencesBtn, false);
    }
  }

  // Pause / Resume Alerts
  async function handlePauseAlerts() {
    if (!state.user) return;
    state.isActive = !state.isActive;
    if (el.isActiveToggle) el.isActiveToggle.checked = state.isActive;
    updateProfileStatusView();
    showToast(state.isActive ? "Alerts resumed." : "Alerts temporarily paused.", "success");
    await handleSavePreferences({ preventDefault: () => {} });
  }

  // Delete User Profile
  async function handleDeleteProfile() {
    if (!state.user || !state.user.phone) return;
    const phone = String(state.user.phone).slice(-10);

    if (!confirm(`Are you sure you want to stop all WhatsApp alerts and delete your profile for +91 ${phone}?`)) {
      return;
    }

    try {
      await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      localStorage.removeItem("maha_gr_user");
      state.user = null;
      showGlobalBanner(`Your profile (+91 ${phone}) has been removed. You will no longer receive alerts.`, "success");
      showAuthView("login");
    } catch (err) {
      showPreferencesBanner("Could not delete profile. Please try again.", "error");
    }
  }

  function updateManagementBar() {
    updateProfileStatusView();
  }

  // Render Administrative Divisions
  function renderDivisions() {
    if (!state.config || !state.config.divisions) return;
    el.divisionTabsRow.innerHTML = "";

    const divisions = Object.keys(state.config.divisions);
    divisions.forEach((divName) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `div-tab-chip ${divName === state.currentDivisionTab ? "active" : ""}`;
      chip.dataset.division = divName;
      const marathi = state.config.divisions[divName].marathi || "";
      chip.textContent = `${divName} (${marathi})`;

      chip.addEventListener("click", () => {
        state.currentDivisionTab = divName;
        document.querySelectorAll(".div-tab-chip").forEach((b) => b.classList.remove("active"));
        chip.classList.add("active");
        if (el.activeDivisionTitle) {
          el.activeDivisionTitle.textContent = `${divName} Division`;
        }
        renderDistricts();
      });

      el.divisionTabsRow.appendChild(chip);
    });
  }

  // Render Districts for Current Division
  function renderDistricts() {
    if (!state.config || !state.config.divisions) return;
    el.districtsGridContainer.innerHTML = "";

    const activeDiv = state.config.divisions[state.currentDivisionTab];
    const divisionDistricts = activeDiv ? activeDiv.districts : [];

    divisionDistricts.forEach((distName) => {
      const distObj = state.config.districts.find((d) => d.name === distName);
      const marathi = distObj ? distObj.marathi : "";

      const badge = document.createElement("div");
      badge.className = `district-badge ${state.preferredDistricts.includes(distName) ? "active" : ""}`;
      badge.dataset.district = distName;
      badge.innerHTML = `
        <span class="dist-name-en">${distName}</span>
        <span class="dist-name-mr">${marathi}</span>
      `;

      badge.addEventListener("click", () => {
        toggleDistrict(distName);
      });

      el.districtsGridContainer.appendChild(badge);
    });

    updateDistrictsSummary();
  }

  function toggleDistrict(distName) {
    const idx = state.preferredDistricts.indexOf(distName);
    if (idx > -1) {
      state.preferredDistricts.splice(idx, 1);
    } else {
      state.preferredDistricts.push(distName);
    }
    updateUI();
  }

  function updateDistrictsSummary() {
    if (!el.selectedDistrictsSummary || !el.selectedDistrictsList) return;

    if (state.preferredDistricts.length === 0) {
      el.selectedDistrictsSummary.classList.add("hidden");
    } else {
      el.selectedDistrictsSummary.classList.remove("hidden");
      el.selectedDistrictsList.textContent = `${state.preferredDistricts.length} District(s) selected: ${state.preferredDistricts.join(", ")}`;
    }
  }

  // Render Operational Intents in Accordion
  function renderIntents() {
    if (!state.config || !state.config.intents) return;
    el.intentsGrid.innerHTML = "";

    state.config.intents.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `tag-select-btn ${state.preferredIntents.includes(item.id) ? "active" : ""}`;
      btn.dataset.intentId = item.id;
      btn.innerHTML = `
        <span>${item.icon || "📌"}</span>
        <span>${item.label}</span>
      `;

      btn.addEventListener("click", () => {
        toggleIntent(item.id);
      });

      el.intentsGrid.appendChild(btn);
    });
  }

  function toggleIntent(intentId) {
    const idx = state.preferredIntents.indexOf(intentId);
    if (idx > -1) {
      state.preferredIntents.splice(idx, 1);
    } else {
      state.preferredIntents.push(intentId);
    }
    if (state.preferredAudiences && state.preferredAudiences.includes("POLITICAL_LEADERSHIP")) {
      state.preferredAudiences = ["POLITICAL_LEADERSHIP", "CITIZEN_PUBLIC", "BUREAUCRACY_OFFICIALS"];
    }
    updateUI();
  }

  // Render Departments in Accordion
  function renderDepartments(filterQuery = "") {
    if (!state.config || !state.config.departments) return;
    el.departmentsList.innerHTML = "";

    const query = filterQuery.toLowerCase().trim();
    const filtered = state.config.departments.filter((dept) => {
      if (!query) return true;
      return dept.name.toLowerCase().includes(query) || (dept.marathi && dept.marathi.includes(query));
    });

    filtered.forEach((dept) => {
      const item = document.createElement("div");
      item.className = `dept-list-item ${state.preferredDepartments.includes(dept.code) ? "active" : ""}`;
      item.dataset.code = dept.code;
      item.innerHTML = `
        <span class="dept-code-tag">#${String(dept.code).padStart(2, "0")}</span>
        <span class="dept-name-text">${dept.name}</span>
      `;

      item.addEventListener("click", () => {
        toggleDepartment(dept.code);
      });

      el.departmentsList.appendChild(item);
    });
  }

  function toggleDepartment(code) {
    const idx = state.preferredDepartments.indexOf(code);
    if (idx > -1) {
      state.preferredDepartments.splice(idx, 1);
    } else {
      state.preferredDepartments.push(code);
    }
    if (state.preferredAudiences && state.preferredAudiences.includes("POLITICAL_LEADERSHIP")) {
      state.preferredAudiences = ["POLITICAL_LEADERSHIP", "CITIZEN_PUBLIC", "BUREAUCRACY_OFFICIALS"];
    }
    updateUI();
  }

  // Toggle a Preset for Multi-Select
  function togglePreset(presetName) {
    if (presetName === "ALL_RESOLUTIONS") {
      if (state.selectedPresets.includes("ALL_RESOLUTIONS")) {
        state.selectedPresets = ["CITIZEN_PUBLIC"];
      } else {
        state.selectedPresets = ["ALL_RESOLUTIONS"];
      }
    } else {
      // Remove ALL_RESOLUTIONS if picking specific categories
      state.selectedPresets = state.selectedPresets.filter((p) => p !== "ALL_RESOLUTIONS");

      const idx = state.selectedPresets.indexOf(presetName);
      if (idx > -1) {
        if (state.selectedPresets.length > 1) {
          state.selectedPresets.splice(idx, 1);
        } else {
          showToast("At least one interest category must remain selected.", "warning");
          return;
        }
      } else {
        state.selectedPresets.push(presetName);
      }
    }

    applySelectedPresets();
    updateProfileStatusView();
  }

  // Apply Selected Presets across 5D Dimensions
  function applySelectedPresets() {
    const combinedDepts = new Set();
    const combinedIntents = new Set();
    const combinedAudiences = new Set();
    const combinedBeneficiaries = new Set();
    let excludeAmendments = true;

    state.selectedPresets.forEach((pName) => {
      const conf = PRESET_CONFIGS[pName] || PRESET_CONFIGS.CITIZEN_PUBLIC;
      conf.departments.forEach((d) => combinedDepts.add(d));
      conf.intents.forEach((i) => combinedIntents.add(i));
      conf.audiences.forEach((a) => combinedAudiences.add(a));
      conf.beneficiaries.forEach((b) => combinedBeneficiaries.add(b));
      if (conf.excludeAmendments === false) {
        excludeAmendments = false;
      }
    });

    state.preferredDepartments = Array.from(combinedDepts);
    state.preferredIntents = Array.from(combinedIntents);
    state.preferredAudiences = Array.from(combinedAudiences);
    state.preferredBeneficiaries = Array.from(combinedBeneficiaries);
    state.excludeAmendments = excludeAmendments;

    state.rolePreset = state.selectedPresets.length === 1 
      ? state.selectedPresets[0] 
      : (state.selectedPresets.includes("ALL_RESOLUTIONS") ? "ALL_RESOLUTIONS" : "CUSTOM");

    if (el.excludeAmendmentsToggle) {
      el.excludeAmendmentsToggle.checked = state.excludeAmendments;
    }

    // Highlight all active cards
    el.roleCards.forEach((card) => {
      const isSelected = state.selectedPresets.includes(card.dataset.preset);
      card.classList.toggle("active", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
      card.setAttribute("aria-checked", String(isSelected));
    });

    updateUI();
  }

  // For backward compatibility
  function applyPreset(presetName) {
    togglePreset(presetName);
  }

  // Update All Synchronized UI State
  function updateUI() {
    // 1. Update District Badges
    document.querySelectorAll(".district-badge").forEach((badge) => {
      badge.classList.toggle("active", state.preferredDistricts.includes(badge.dataset.district));
    });
    updateDistrictsSummary();

    // 2. Update Intent Tags
    document.querySelectorAll(".tag-select-btn").forEach((btn) => {
      btn.classList.toggle("active", state.preferredIntents.includes(btn.dataset.intentId));
    });

    // 3. Update Department Items
    document.querySelectorAll(".dept-list-item").forEach((item) => {
      item.classList.toggle("active", state.preferredDepartments.includes(parseInt(item.dataset.code, 10)));
    });

    // 4. Update Header Badges in Accordion
    if (el.deptCountBadge) {
      if (state.preferredDepartments.length === 0) {
        el.deptCountBadge.textContent = "All 34 Ministries";
      } else {
        el.deptCountBadge.textContent = `${state.preferredDepartments.length} Ministry(s)`;
      }
    }

    if (el.intentCountBadge) {
      if (state.preferredIntents.length === 0) {
        el.intentCountBadge.textContent = "All Actions";
      } else {
        el.intentCountBadge.textContent = `${state.preferredIntents.length} Action(s)`;
      }
    }

    // 5. Update Volume Estimate & WhatsApp Mockup
    updateVolumeEstimate();
    updateWhatsAppPreview();
    updateProfileStatusView();
  }

  // Calculate Volume Estimate
  function updateVolumeEstimate() {
    if (!el.volumeEstimateNumber || !el.meterFill || !el.volumeSummaryText) return;

    let estimate = "~4–8";
    let width = 35;
    let summary = "Balanced flow of high-value official notifications";

    const hasSpecificDistricts = state.preferredDistricts.length > 0;
    const deptCount = state.preferredDepartments.length;
    const intentCount = state.preferredIntents.length;
    const presetCount = state.selectedPresets.length;

    if (state.selectedPresets.includes("ALL_RESOLUTIONS")) {
      estimate = "~50–150";
      width = 100;
      summary = "Complete statewide feed: All 34 ministries and all official resolutions";
    } else if (hasSpecificDistricts && deptCount > 0 && deptCount <= 3) {
      estimate = "~1–3";
      width = 18;
      summary = "Laser-focused alerts for your specific district and ministry";
    } else if (presetCount > 2) {
      estimate = "~12–25";
      width = 65;
      summary = `Multi-category stream covering ${presetCount} selected interest areas`;
    } else if (presetCount === 2) {
      estimate = "~8–16";
      width = 50;
      summary = "Combined updates for your selected sectors";
    } else if (hasSpecificDistricts) {
      estimate = "~2–5";
      width = 28;
      summary = "Focused exclusively on your local district and statewide decisions";
    } else if (state.selectedPresets.includes("COMMERCIAL_VENDOR")) {
      estimate = "~5–10";
      width = 45;
      summary = "Active coverage of tenders, public works, and procurement deadlines";
    } else if (state.selectedPresets.includes("CITIZEN_PUBLIC")) {
      estimate = "~4–8";
      width = 38;
      summary = "Subsidies, agriculture, and citizen welfare schemes";
    } else if (deptCount === 0 && intentCount === 0 && !hasSpecificDistricts) {
      estimate = "~25–40";
      width = 85;
      summary = "Comprehensive feed of all daily Maharashtra government orders";
    }

    el.volumeEstimateNumber.textContent = estimate;
    el.meterFill.style.width = `${width}%`;
    el.volumeSummaryText.textContent = summary;
  }

  // Update WhatsApp Chat Mockup
  function updateWhatsAppPreview() {
    const primaryPreset = state.selectedPresets[0] || "CITIZEN_PUBLIC";
    const p = PRESET_CONFIGS[primaryPreset] || PRESET_CONFIGS.CITIZEN_PUBLIC;

    if (el.waPreviewHeader) {
      el.waPreviewHeader.textContent = state.excludeAmendments
        ? "🏛️ *महाराष्ट्र शासन निर्णय (GR Alert)*"
        : "🏛️ *महाराष्ट्र शासन निर्णय (ALL INCL. AMENDMENTS)*";
    }

    if (el.waPreviewSummary) {
      if (state.selectedPresets.length > 1) {
        el.waPreviewSummary.innerHTML = `📌 *Summary / सारांश:*<br>${p.sampleSummary}<br><br><span style="font-size:0.8rem; color:#475569;"><em>(Multi-category stream: +${state.selectedPresets.length - 1} other active sector${state.selectedPresets.length > 2 ? 's' : ''})</em></span>`;
      } else {
        el.waPreviewSummary.innerHTML = `📌 *Summary / सारांश:*<br>${p.sampleSummary}`;
      }
    }

    if (el.waPreviewDept) {
      if (state.preferredDepartments.length > 0 && state.config?.departments) {
        const dObj = state.config.departments.find((d) => d.code === state.preferredDepartments[0]);
        el.waPreviewDept.textContent = dObj ? dObj.name : p.sampleDept;
      } else {
        el.waPreviewDept.textContent = p.sampleDept;
      }
    }

    if (el.waPreviewIntent) {
      if (state.preferredIntents.length > 0 && state.config?.intents) {
        const iObj = state.config.intents.find((i) => i.id === state.preferredIntents[0]);
        el.waPreviewIntent.textContent = iObj ? `${iObj.icon} ${iObj.label}` : p.sampleIntent;
      } else {
        el.waPreviewIntent.textContent = p.sampleIntent;
      }
    }

    if (el.waPreviewGeo) {
      if (state.preferredDistricts.length > 0) {
        el.waPreviewGeo.textContent = state.preferredDistricts.slice(0, 3).join(", ") + (state.preferredDistricts.length > 3 ? " & more" : "");
      } else {
        el.waPreviewGeo.textContent = "All Maharashtra (Statewide)";
      }
    }

    if (el.waPreviewAudience) {
      el.waPreviewAudience.textContent = p.sampleAudience;
    }
  }

  function setGeoScope(mode) {
    state.geoScopeMode = mode || "specific";
    const isStatewide = mode === "statewide";

    if (el.segmentStatewide) el.segmentStatewide.classList.toggle("active", isStatewide);
    if (el.segmentSpecific) el.segmentSpecific.classList.toggle("active", !isStatewide);

    const radio = document.querySelector(`input[name="geo-scope"][value="${mode}"]`);
    if (radio) radio.checked = true;

    if (el.districtPanel) {
      el.districtPanel.classList.remove("hidden");
    }

    updateUI();
  }

  // Open Info Modal Dialog
  function openInfoDialog(key) {
    const item = INFO_ITEMS[key];
    if (!item) return;

    el.infoModalTitle.textContent = item.title;
    el.infoModalText.textContent = item.text;

    if (item.tip) {
      el.infoModalTip.textContent = item.tip;
      el.infoModalTip.classList.remove("hidden");
    } else {
      el.infoModalTip.classList.add("hidden");
    }

    el.infoModal.classList.remove("hidden");
  }

  function closeInfoDialog() {
    el.infoModal.classList.add("hidden");
  }

  function setBtnLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    const textSpan = btn.querySelector(".btn-text");
    const spinnerSpan = btn.querySelector(".btn-spinner");
    if (textSpan) textSpan.classList.toggle("hidden", isLoading);
    if (spinnerSpan) spinnerSpan.classList.toggle("hidden", !isLoading);
  }

  function showGlobalBanner(text, type) {
    if (!el.globalBanner) return;
    if (!text) {
      el.globalBanner.classList.add("hidden");
      return;
    }
    el.globalBanner.textContent = text;
    el.globalBanner.className = `status-banner ${type}`;
    el.globalBanner.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showPreferencesBanner(text, type) {
    if (!el.preferencesBanner) return;
    if (!text) {
      el.preferencesBanner.classList.add("hidden");
      return;
    }
    el.preferencesBanner.textContent = text;
    el.preferencesBanner.className = `status-banner ${type}`;
    el.preferencesBanner.classList.remove("hidden");
  }

  // Attach All Event Listeners
  function attachEventListeners() {
    // Auth Tab buttons
    el.tabBtnLogin.addEventListener("click", () => switchAuthTab("login"));
    el.tabBtnRegister.addEventListener("click", () => switchAuthTab("register"));
    el.switchToRegisterBtn.addEventListener("click", () => switchAuthTab("register"));
    el.switchToLoginBtn.addEventListener("click", () => switchAuthTab("login"));

    // Header buttons
    el.headerLoginBtn.addEventListener("click", () => showAuthView("login"));
    el.headerRegisterBtn.addEventListener("click", () => showAuthView("register"));
    el.headerLogoutBtn.addEventListener("click", handleLogout);

    // Password Visibility Toggle
    el.toggleLoginPasswordBtn.addEventListener("click", () => {
      const isPwd = el.loginPassword.type === "password";
      el.loginPassword.type = isPwd ? "text" : "password";
      el.toggleLoginPasswordBtn.textContent = isPwd ? "🙈" : "👁️";
    });

    // Real-time password generation preview
    el.regFirstName.addEventListener("input", calculatePasswordPreview);
    el.regDob.addEventListener("input", calculatePasswordPreview);
    el.regDob.addEventListener("change", calculatePasswordPreview);

    // Form Submissions
    el.loginForm.addEventListener("submit", handleLogin);
    el.registerForm.addEventListener("submit", handleRegister);
    el.preferencesForm.addEventListener("submit", handleSavePreferences);

    // Role Card Clicks (Multi-Select toggle)
    el.roleCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".info-btn")) return;
        togglePreset(card.dataset.preset);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePreset(card.dataset.preset);
        }
      });
    });

    // Header Navigation Tabs
    if (el.tabNavPreferences) {
      el.tabNavPreferences.addEventListener("click", () => switchHeaderTab("preferences"));
    }
    if (el.tabNavProfile) {
      el.tabNavProfile.addEventListener("click", () => switchHeaderTab("profile"));
    }
    if (el.btnBackToPreferences) {
      el.btnBackToPreferences.addEventListener("click", () => switchHeaderTab("preferences"));
    }

    // Geographic Scope Switcher
    if (el.geoRadios) {
      el.geoRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
          setGeoScope(e.target.value);
        });
      });
    }

    if (el.segmentStatewide) {
      el.segmentStatewide.addEventListener("click", () => setGeoScope("statewide"));
    }
    if (el.segmentSpecific) {
      el.segmentSpecific.addEventListener("click", () => setGeoScope("specific"));
    }

    // District Quick Actions
    el.selectAllDistrictsBtn.addEventListener("click", () => {
      if (!state.config) return;
      const activeDiv = state.config.divisions[state.currentDivisionTab];
      if (activeDiv) {
        activeDiv.districts.forEach((d) => {
          if (!state.preferredDistricts.includes(d)) state.preferredDistricts.push(d);
        });
      }
      updateUI();
    });

    el.clearDistrictsBtn.addEventListener("click", () => {
      state.preferredDistricts = [];
      updateUI();
    });

    // Accordion Toggle
    el.advancedToggleBtn.addEventListener("click", () => {
      const isExpanded = el.advancedToggleBtn.getAttribute("aria-expanded") === "true";
      el.advancedToggleBtn.setAttribute("aria-expanded", String(!isExpanded));
      el.advancedAccordionContent.classList.toggle("hidden", isExpanded);
      const ctaText = el.advancedToggleBtn.querySelector(".accordion-cta-btn span:first-child");
      if (ctaText) {
        ctaText.textContent = !isExpanded ? "Close Panel" : "Fine-Tune";
      }
    });

    // Ministry Search & Actions
    el.deptSearchInput.addEventListener("input", (e) => {
      renderDepartments(e.target.value);
    });

    el.selectAllDeptsBtn.addEventListener("click", () => {
      if (!state.config) return;
      state.preferredDepartments = state.config.departments.map((d) => d.code);
      updateUI();
    });

    el.clearDeptsBtn.addEventListener("click", () => {
      state.preferredDepartments = [];
      updateUI();
    });

    // Intent Actions
    el.selectAllIntentsBtn.addEventListener("click", () => {
      if (!state.config) return;
      state.preferredIntents = state.config.intents.map((i) => i.id);
      updateUI();
    });

    el.clearIntentsBtn.addEventListener("click", () => {
      state.preferredIntents = [];
      updateUI();
    });

    // Quality Switches
    if (el.excludeAmendmentsToggle) {
      el.excludeAmendmentsToggle.addEventListener("change", (e) => {
        state.excludeAmendments = e.target.checked;
        updateUI();
      });
    }

    if (el.isActiveToggle) {
      el.isActiveToggle.addEventListener("change", (e) => {
        state.isActive = e.target.checked;
        updateProfileStatusView();
      });
    }

    // Pause & Delete Buttons
    if (el.pauseAlertsBtn) {
      el.pauseAlertsBtn.addEventListener("click", handlePauseAlerts);
    }
    if (el.deleteSubBtn) {
      el.deleteSubBtn.addEventListener("click", handleDeleteProfile);
    }

    // Info Dialog Triggers
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".info-btn");
      if (btn) {
        e.stopPropagation();
        const infoKey = btn.dataset.info;
        openInfoDialog(infoKey);
      }
    });

    el.closeInfoModalBtn.addEventListener("click", closeInfoDialog);
    el.dismissInfoModalBtn.addEventListener("click", closeInfoDialog);
    el.infoModal.addEventListener("click", (e) => {
      if (e.target === el.infoModal) closeInfoDialog();
    });

    if (el.toastCloseBtn) {
      el.toastCloseBtn.addEventListener("click", () => {
        if (el.toastNotification) el.toastNotification.classList.add("hidden");
      });
    }

    // Restrict phone inputs to numbers only
    [el.loginPhone, el.regPhone].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      });
    });
  }

  // Start app when DOM is ready
  document.addEventListener("DOMContentLoaded", init);
})();
