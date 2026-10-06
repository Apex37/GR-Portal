import { createClient } from "@supabase/supabase-js";

// Read from Vite environment variables (configured in Render dashboard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://uhlncqrevycxtxtdydav.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const USERS_TABLE = import.meta.env.VITE_SUPABASE_USERS_TABLE || "gov-users-v2";

export const isSupabaseConnected = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey || "dummy-anon-key-placeholder", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Upsert subscriber preferences directly into gov-users-v2
 */
export async function saveUserSubscription(subscriberData) {
  if (!isSupabaseConnected) {
    console.warn("VITE_SUPABASE_ANON_KEY not configured. Simulating subscription save.");
    return { success: true, simulated: true, user: subscriberData };
  }

  try {
    const {
      phone,
      full_name,
      role_preset,
      preferred_departments,
      preferred_intents,
      preferred_audiences,
      preferred_districts,
      preferred_beneficiaries,
      exclude_amendments,
    } = subscriberData;

    const cleanPhone = String(phone).replace(/\D/g, "");

    const payload = {
      phone: cleanPhone,
      full_name: full_name?.trim() || null,
      role_preset: role_preset || "CUSTOM",
      preferred_departments: preferred_departments || [],
      preferred_intents: preferred_intents || [],
      preferred_audiences: preferred_audiences || [],
      preferred_districts: preferred_districts || [],
      preferred_beneficiaries: preferred_beneficiaries || [],
      exclude_amendments: exclude_amendments ?? true,
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
 * Fetch existing subscriber preferences by phone number from gov-users-v2
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
