import { createClient } from "@supabase/supabase-js";

// Read from Vite environment variables (configurable in Render dashboard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://uhlncqrevycxtxtdydav.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const RESOLUTIONS_TABLE = import.meta.env.VITE_SUPABASE_RESOLUTIONS_TABLE || "gov-res-staging";
export const USERS_TABLE = import.meta.env.VITE_SUPABASE_USERS_TABLE || "gov-users-v2";

export const isSupabaseConnected = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey || "dummy-anon-key-placeholder", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Fetch resolutions from Supabase with multi-factor filtering
 */
export async function fetchResolutions({
  searchQuery = "",
  departmentCode = null,
  intentId = null,
  district = null,
  page = 1,
  pageSize = 12,
} = {}) {
  if (!isSupabaseConnected) {
    console.warn("Supabase Anon Key is not set in VITE_SUPABASE_ANON_KEY. Returning demo data.");
    return { data: getSampleResolutions(), count: getSampleResolutions().length };
  }

  try {
    let query = supabase
      .from(RESOLUTIONS_TABLE)
      .select("*", { count: "exact" })
      .order("gr_date", { ascending: false });

    if (searchQuery.trim()) {
      query = query.or(`title.ilike.%${searchQuery.trim()}%,ref_id.ilike.%${searchQuery.trim()}%`);
    }

    if (departmentCode != null && departmentCode !== "") {
      query = query.eq("department_name", Number(departmentCode));
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      console.error("Error fetching resolutions from Supabase:", error);
      return { data: getSampleResolutions(), count: getSampleResolutions().length, error };
    }

    // Client-side filtering for nested JSON 5D classification if specified
    let filtered = data || [];
    if (intentId) {
      filtered = filtered.filter((r) => r.classification?.intent === intentId);
    }
    if (district) {
      filtered = filtered.filter((r) => {
        const geo = r.classification?.geography;
        if (!geo) return true;
        if (geo.level === "STATEWIDE") return true;
        return Array.isArray(geo.districts) && geo.districts.includes(district);
      });
    }

    return { data: filtered, count: count ?? filtered.length };
  } catch (err) {
    console.error("Supabase query failure:", err);
    return { data: getSampleResolutions(), count: getSampleResolutions().length, error: err };
  }
}

/**
 * Upsert subscriber into gov-users-v2
 */
export async function saveUserSubscription(subscriberData) {
  if (!isSupabaseConnected) {
    // Local simulation if keys not provided
    console.warn("VITE_SUPABASE_ANON_KEY not configured. Simulating subscription save.");
    return { success: true, simulated: true, user: subscriberData };
  }

  try {
    const { phone, full_name, role_preset, preferred_departments, preferred_intents, preferred_audiences, preferred_districts, preferred_beneficiaries } = subscriberData;

    const payload = {
      phone: String(phone).replace(/\D/g, ""),
      full_name: full_name?.trim() || null,
      role_preset: role_preset || "CUSTOM",
      preferred_departments: preferred_departments || [],
      preferred_intents: preferred_intents || [],
      preferred_audiences: preferred_audiences || [],
      preferred_districts: preferred_districts || [],
      preferred_beneficiaries: preferred_beneficiaries || [],
      exclude_amendments: subscriberData.exclude_amendments ?? true,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(USERS_TABLE)
      .upsert(payload, { onConflict: "phone" })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, user: data };
  } catch (err) {
    console.error("Failed to save subscriber:", err);
    throw err;
  }
}

/**
 * Fetch existing subscriber preferences
 */
export async function getSubscriberByPhone(phone) {
  if (!isSupabaseConnected) {
    return null;
  }

  const cleanPhone = String(phone).replace(/\D/g, "");
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("*")
    .eq("phone", cleanPhone)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Rich fallback resolutions so the UI is immediately interactive even before Supabase credentials are typed
function getSampleResolutions() {
  return [
    {
      ref_id: "202610051510472812",
      title: "Regarding the opening of one separate personal deposit account in the name of the Civil Judge, Senior Division, Pimpri-Chinchwad (District Pune), for amounts related to civil suits.",
      gr_date: "05-10-2026",
      department_name: 11,
      pdf_link: "https://gr.maharashtra.gov.in/Site/Upload/Government%20Resolutions/English/202610051510472812.pdf",
      classification: {
        intent: "BANKING_AND_FINANCE",
        audience_scope: "BUREAUCRACY_OFFICIALS",
        target_beneficiary: "GOVT_EMPLOYEES",
        summary_en: "Sanction granted to open a dedicated personal deposit account for civil court suit deposits at Pimpri-Chinchwad senior division.",
        geography: { level: "DISTRICT", division: "Pune", districts: ["Pune"] },
        legal: { is_amendment: false },
      },
    },
    {
      ref_id: "202610051627325127",
      title: "Continuation of Temporary Posts under Water Resources Department for Minor Irrigation Works.",
      gr_date: "05-10-2026",
      department_name: 10,
      pdf_link: "https://gr.maharashtra.gov.in/Site/Upload/Government%20Resolutions/English/202610051627325127.pdf",
      classification: {
        intent: "SERVICE_RULES_AND_CADRE",
        audience_scope: "BUREAUCRACY_OFFICIALS",
        target_beneficiary: "GOVT_EMPLOYEES",
        summary_en: "Extended 45 temporary engineering posts across Konkan and Nashik irrigation divisions until March 2027.",
        geography: { level: "STATEWIDE" },
        legal: { is_amendment: false },
      },
    },
    {
      ref_id: "202610041120401804",
      title: "e-Tender Notice for Improvement and Asphalting of State Highway 42 in Nashik District.",
      gr_date: "04-10-2026",
      department_name: 18,
      pdf_link: "https://gr.maharashtra.gov.in/Site/Upload/Government%20Resolutions/English/202610041120401804.pdf",
      classification: {
        intent: "TENDER_AND_PROCUREMENT",
        audience_scope: "COMMERCIAL_VENDOR",
        target_beneficiary: "BUSINESS_AND_INDUSTRY",
        summary_en: "Notice inviting commercial bids for 24 km highway asphalting with estimated procurement outlay of ₹14.8 Crore.",
        geography: { level: "DISTRICT", division: "Nashik", districts: ["Nashik"] },
        legal: { is_amendment: false },
      },
    },
    {
      ref_id: "202610030915224019",
      title: "Financial Assistance and Subsidy Disbursal under Dr. Punjabrao Deshmukh Organic Farming Mission.",
      gr_date: "03-10-2026",
      department_name: 4,
      pdf_link: "https://gr.maharashtra.gov.in/Site/Upload/Government%20Resolutions/English/202610030915224019.pdf",
      classification: {
        intent: "WELFARE_AND_SUBSIDY",
        audience_scope: "CITIZEN_PUBLIC",
        target_beneficiary: "FARMERS",
        summary_en: "Approved ₹52 Crore capital subsidy for direct DBT transfer to certified organic farming clusters across Vidarbha and Marathwada.",
        geography: { level: "STATEWIDE" },
        legal: { is_amendment: false },
      },
    },
    {
      ref_id: "202610021445012501",
      title: "Recruitment to Group B Gazetted Assistant Town Planner Posts through MPSC.",
      gr_date: "02-10-2026",
      department_name: 8,
      pdf_link: "https://gr.maharashtra.gov.in/Site/Upload/Government%20Resolutions/English/202610021445012501.pdf",
      classification: {
        intent: "RECRUITMENT_AND_VACANCY",
        audience_scope: "CITIZEN_PUBLIC",
        target_beneficiary: "STUDENTS_AND_YOUTH",
        summary_en: "Notified 138 open vacancies for Assistant Town Planners with online application guidelines and reservation matrix.",
        geography: { level: "STATEWIDE" },
        legal: { is_amendment: false },
      },
    },
  ];
}
