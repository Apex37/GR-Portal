import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase Connection Configuration
const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://uhlncqrevycxtxtdydav.supabase.co"
).replace(/^['"]+|['"]+$/g, "").trim().replace(/\/+$/, "");

const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ""
).replace(/^['"]+|['"]+$/g, "").trim();

const USERS_TABLE = (
  process.env.SUPABASE_GOV_USERS_TABLE ||
  process.env.VITE_SUPABASE_USERS_TABLE ||
  "gov-users-v2"
).replace(/^['"]+|['"]+$/g, "").trim();

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    console.log(`✓ Supabase Admin connected to ${USERS_TABLE} at ${SUPABASE_URL}`);
  } catch (err) {
    console.error("✗ Failed to initialize Supabase client:", err.message);
  }
}

// Helpers for Phone and Password Normalization
function extractPhoneDigits(phone) {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "");
}

function getPhoneVariants(rawPhone) {
  const digits = extractPhoneDigits(rawPhone);
  if (!digits) return [];
  const last10 = digits.slice(-10);
  const with91 = `91${last10}`;
  return Array.from(new Set([digits, last10, with91]));
}

function formatDobDDMMYYYY(dob) {
  if (!dob) return "01012000";
  const ymdMatch = String(dob).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    return `${ymdMatch[3]}${ymdMatch[2]}${ymdMatch[1]}`;
  }
  const dmyMatch = String(dob).match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[1]}${dmyMatch[2]}${dmyMatch[3]}`;
  }
  const digits = String(dob).replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(0, 8) : "01012000";
}

function computeStandardPassword(dob, firstName) {
  const d = formatDobDDMMYYYY(dob);
  const name = String(firstName || "").trim().replace(/\s+/g, "");
  return `${d}${name}`;
}

function normalizePasswordForCompare(pwd) {
  return String(pwd || "").trim().toLowerCase().replace(/[\/\-_\s]/g, "");
}

function isPasswordMatch(inputPassword, storedPassword, dob, firstName) {
  const normInput = normalizePasswordForCompare(inputPassword);
  if (!normInput) return false;

  const candidates = [];
  if (storedPassword) {
    candidates.push(normalizePasswordForCompare(storedPassword));
  }
  if (dob && firstName) {
    const computed = computeStandardPassword(dob, firstName);
    candidates.push(normalizePasswordForCompare(computed));
    // also with slash format DD/MM/YYYYName
    const ymdMatch = String(dob).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      candidates.push(normalizePasswordForCompare(`${ymdMatch[3]}/${ymdMatch[2]}/${ymdMatch[1]}${firstName}`));
    }
  }

  return candidates.includes(normInput);
}

// Resilient upsert that supports both extended columns and JSON interests column
async function upsertUserRecord(payload) {
  if (!supabase) return payload;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .upsert(payload, { onConflict: "phone" })
    .select()
    .single();

  if (!error) return data;

  // If Supabase PGRST204 column missing error, fallback to base columns
  if (error.code === "PGRST204" || /column/i.test(error.message)) {
    const basePayload = { ...payload };
    delete basePayload.first_name;
    delete basePayload.last_name;
    delete basePayload.dob;
    delete basePayload.password;

    const { data: baseData, error: baseErr } = await supabase
      .from(USERS_TABLE)
      .upsert(basePayload, { onConflict: "phone" })
      .select()
      .single();

    if (baseErr) throw baseErr;
    return baseData;
  }

  throw error;
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "gr-portal-web-service",
    supabaseConnected: Boolean(supabase),
    table: USERS_TABLE,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "gr-portal-web-service",
    supabaseConnected: Boolean(supabase),
    table: USERS_TABLE,
    timestamp: new Date().toISOString(),
  });
});

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { phone, first_name, last_name, dob } = req.body;
    const rawDigits = extractPhoneDigits(phone);
    const last10 = rawDigits.slice(-10);

    if (!last10 || last10.length !== 10) {
      return res.status(400).json({ error: "Please provide a valid 10-digit WhatsApp phone number." });
    }
    if (!first_name || !String(first_name).trim()) {
      return res.status(400).json({ error: "First Name is required." });
    }
    if (!dob) {
      return res.status(400).json({ error: "Date of Birth is required." });
    }

    const cleanFirstName = String(first_name).trim();
    const cleanLastName = String(last_name || "").trim();
    const generatedPassword = computeStandardPassword(dob, cleanFirstName);
    const standardPhone = `91${last10}`;

    if (!supabase) {
      // In-memory / offline mock fallback
      return res.json({
        success: true,
        user: {
          phone: standardPhone,
          first_name: cleanFirstName,
          last_name: cleanLastName,
          dob: dob,
          password: generatedPassword,
          full_name: `${cleanFirstName} ${cleanLastName}`.trim(),
          role_preset: "CITIZEN_PUBLIC",
          is_active: true,
          exclude_amendments: true,
        },
        password: generatedPassword,
        offline: true,
      });
    }

    // Check if user already exists
    const phoneVariants = getPhoneVariants(last10);
    const { data: existingUsers, error: searchErr } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .in("phone", phoneVariants);

    if (searchErr) {
      console.error("User search error:", searchErr);
    }

    if (existingUsers && existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.first_name || existing.full_name) {
        return res.status(409).json({
          error: "An account already exists with this phone number. Please log in.",
          phone: last10,
        });
      }
    }

    const authMeta = {
      first_name: cleanFirstName,
      last_name: cleanLastName,
      dob: dob,
      password: generatedPassword,
    };

    const newUserPayload = {
      phone: standardPhone,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      dob: dob,
      full_name: `${cleanFirstName} ${cleanLastName}`.trim(),
      role_preset: "CITIZEN_PUBLIC",
      is_active: true,
      exclude_amendments: true,
      interests: JSON.stringify(authMeta),
      updated_at: new Date().toISOString(),
    };

    const savedUser = await upsertUserRecord(newUserPayload);

    res.json({
      success: true,
      user: {
        ...savedUser,
        first_name: cleanFirstName,
        last_name: cleanLastName,
        dob: dob,
        password: generatedPassword,
      },
      password: generatedPassword,
    });
  } catch (err) {
    console.error("Register endpoint error:", err);
    res.status(500).json({ error: err.message || "Could not create user profile." });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const rawDigits = extractPhoneDigits(phone);
    const last10 = rawDigits.slice(-10);

    if (!last10 || last10.length !== 10) {
      return res.status(400).json({ error: "Please enter your 10-digit WhatsApp mobile number." });
    }
    if (!password) {
      return res.status(400).json({ error: "Please enter your password." });
    }

    if (!supabase) {
      return res.status(500).json({ error: "Database service not configured." });
    }

    const phoneVariants = getPhoneVariants(last10);
    const { data: users, error: searchErr } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .in("phone", phoneVariants);

    if (searchErr) throw searchErr;
    if (!users || users.length === 0) {
      return res.status(404).json({
        error: "No profile found with this mobile number. Please create a new profile.",
        phone: last10,
      });
    }

    const user = users[0];
    let storedPassword = user.password || "";
    let firstName = user.first_name || "";
    let lastName = user.last_name || "";
    let dob = user.dob || "";

    if (user.interests) {
      try {
        const meta = typeof user.interests === "string" ? JSON.parse(user.interests) : user.interests;
        if (meta.password) storedPassword = meta.password;
        if (meta.first_name) firstName = meta.first_name;
        if (meta.last_name) lastName = meta.last_name;
        if (meta.dob) dob = meta.dob;
      } catch {}
    }

    const matched = isPasswordMatch(password, storedPassword, dob, firstName);
    if (!matched) {
      return res.status(401).json({
        error: "Incorrect password. Note: Password is your Date of Birth followed by your First Name (e.g. 07/11/2003Vishal).",
      });
    }

    const resolvedUser = {
      ...user,
      first_name: firstName || user.first_name || "Citizen",
      last_name: lastName || user.last_name || "",
      dob: dob || user.dob || "",
      password: storedPassword || password,
    };

    res.json({
      success: true,
      user: resolvedUser,
    });
  } catch (err) {
    console.error("Login endpoint error:", err);
    res.status(500).json({ error: err.message || "Login failed." });
  }
});

// Update Preferences
app.post("/api/preferences", async (req, res) => {
  try {
    const payload = req.body;
    const rawDigits = extractPhoneDigits(payload.phone);
    const last10 = rawDigits.slice(-10);

    if (!last10 || last10.length !== 10) {
      return res.status(400).json({ error: "Valid 10-digit phone number is required." });
    }

    const standardPhone = `91${last10}`;
    const dbPayload = {
      phone: standardPhone,
      role_preset: payload.role_preset || "CITIZEN_PUBLIC",
      preferred_departments: Array.isArray(payload.preferred_departments) ? payload.preferred_departments : [],
      preferred_intents: Array.isArray(payload.preferred_intents) ? payload.preferred_intents : [],
      preferred_audiences: Array.isArray(payload.preferred_audiences) ? payload.preferred_audiences : [],
      preferred_districts: Array.isArray(payload.preferred_districts) ? payload.preferred_districts : [],
      preferred_divisions: Array.isArray(payload.preferred_divisions) ? payload.preferred_divisions : [],
      preferred_beneficiaries: Array.isArray(payload.preferred_beneficiaries) ? payload.preferred_beneficiaries : [],
      exclude_amendments: payload.exclude_amendments !== false,
      is_active: payload.is_active !== false,
      interests: typeof payload.interests === "object" ? JSON.stringify(payload.interests) : (payload.interests || "{}"),
      updated_at: new Date().toISOString(),
    };

    if (payload.first_name) dbPayload.first_name = payload.first_name;
    if (payload.last_name) dbPayload.last_name = payload.last_name;
    if (payload.full_name) dbPayload.full_name = payload.full_name;
    if (payload.dob) dbPayload.dob = payload.dob;

    if (!supabase) {
      return res.json({ success: true, user: dbPayload, offline: true });
    }

    const updated = await upsertUserRecord(dbPayload);

    res.json({
      success: true,
      user: {
        ...updated,
        first_name: payload.first_name || updated.first_name,
        last_name: payload.last_name || updated.last_name,
        dob: payload.dob || updated.dob,
      },
    });
  } catch (err) {
    console.error("Preferences endpoint error:", err);
    res.status(500).json({ error: err.message || "Could not save preferences." });
  }
});

// Delete Profile
app.delete("/api/profile", async (req, res) => {
  try {
    const rawDigits = extractPhoneDigits(req.body.phone || req.query.phone);
    const last10 = rawDigits.slice(-10);

    if (!last10) {
      return res.status(400).json({ error: "Phone number required." });
    }

    if (supabase) {
      const phoneVariants = getPhoneVariants(last10);
      await supabase.from(USERS_TABLE).delete().in("phone", phoneVariants);
    }

    res.json({ success: true, message: "Profile deleted successfully." });
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ error: err.message || "Could not delete profile." });
  }
});

// Serve Static Assets directly
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

// Fallback to index.html for Single-Page Navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Maharashtra GR Portal Web Service`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`  Supabase Target: ${USERS_TABLE}`);
  console.log(`====================================================`);
});
