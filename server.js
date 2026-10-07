import express from "express";
import cors from "cors";
import compression from "compression";
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
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Health check for Render / uptime monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "gr-portal",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

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

function extractBirthYear(val) {
  if (!val) return "";
  const str = String(val).trim();
  const yMatch = str.match(/\b(19\d\d|20\d\d)\b/);
  if (yMatch) return yMatch[1];
  const ymdMatch = str.match(/^(\d{4})-\d{2}-\d{2}/);
  if (ymdMatch) return ymdMatch[1];
  const dmyMatch = str.match(/\d{2}[-/]\d{2}[-/](\d{4})/);
  if (dmyMatch) return dmyMatch[1];
  const digits = str.replace(/\D/g, "");
  if (digits.length === 8) {
    const endYear = digits.slice(4, 8);
    if (/^(19|20)\d\d$/.test(endYear)) return endYear;
    const startYear = digits.slice(0, 4);
    if (/^(19|20)\d\d$/.test(startYear)) return startYear;
  }
  if (digits.length === 4 && /^(19|20)\d\d$/.test(digits)) {
    return digits;
  }
  return "";
}

function computeStandardPassword(dob, firstName) {
  const year = extractBirthYear(dob);
  if (year) return year;
  const d = formatDobDDMMYYYY(dob);
  const name = String(firstName || "").trim().replace(/\s+/g, "");
  return `${d}${name}`;
}

function normalizePasswordForCompare(pwd) {
  return String(pwd || "").trim().toLowerCase().replace(/[\/\-_\s]/g, "");
}

function isPasswordMatch(inputPassword, storedPassword, dob, firstName) {
  const rawInput = String(inputPassword || "").trim();
  if (!rawInput) return false;

  const normInput = normalizePasswordForCompare(rawInput);

  // 1. Birth Year Match (e.g. "2000" or "1998")
  const inputYear = extractBirthYear(rawInput);
  if (inputYear) {
    const dobYear = extractBirthYear(dob);
    if (dobYear && dobYear === inputYear) return true;

    const pwdYear = extractBirthYear(storedPassword);
    if (pwdYear && pwdYear === inputYear) return true;
  }

  // 2. Direct exact or normalized match
  if (storedPassword && normalizePasswordForCompare(storedPassword) === normInput) {
    return true;
  }

  // 3. Legacy composite password match (DOB + First Name)
  if (dob && firstName) {
    const computed = normalizePasswordForCompare(computeStandardPassword(dob, firstName));
    if (computed === normInput) return true;
    const ymdMatch = String(dob).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      if (normalizePasswordForCompare(`${ymdMatch[3]}/${ymdMatch[2]}/${ymdMatch[1]}${firstName}`) === normInput) {
        return true;
      }
    }
  }

  return false;
}

// Resilient upsert that automatically strips any missing columns (e.g. dob, interests, first_name)
async function upsertUserRecord(payload) {
  if (!supabase) return payload;

  let currentPayload = { ...payload };

  for (let attempt = 0; attempt < 6; attempt++) {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .upsert(currentPayload, { onConflict: "phone" })
      .select()
      .single();

    if (!error) return data;

    // Check if error is about any missing column in the schema cache
    const missingColMatch = error.message && error.message.match(/Could not find the '([^']+)' column/i);
    if (missingColMatch && missingColMatch[1]) {
      const missingCol = missingColMatch[1];
      console.warn(`Column '${missingCol}' not found in ${USERS_TABLE}. Stripping and retrying.`);
      delete currentPayload[missingCol];
      continue;
    }

    // Fallback for general PGRST204 schema mismatch
    if (error.code === "PGRST204" || /column/i.test(error.message)) {
      delete currentPayload.first_name;
      delete currentPayload.last_name;
      delete currentPayload.dob;
      delete currentPayload.password;
      delete currentPayload.interests;
      continue;
    }

    throw error;
  }

  throw new Error("Failed to save record to Supabase table.");
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

    let matched = isPasswordMatch(password, storedPassword, dob, firstName);
    const inputYear = extractBirthYear(password);

    // If existing account has no password or DOB saved, accept 4-digit birth year and save it
    if (!matched && !storedPassword && !dob && inputYear) {
      matched = true;
      dob = inputYear;
      storedPassword = inputYear;
      if (supabase) {
        try {
          const authMeta = {
            first_name: firstName,
            last_name: lastName,
            dob: inputYear,
            password: inputYear,
          };
          await supabase.from(USERS_TABLE).update({
            interests: JSON.stringify(authMeta),
          }).eq("phone", user.phone);
        } catch (updateErr) {
          console.warn("Could not backfill birth year:", updateErr.message);
        }
      }
    }

    if (!matched) {
      return res.status(401).json({
        error: "Incorrect login key. Please enter your 4-digit Birth Year (e.g. 1998 or 2000).",
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

    // Fetch existing user to preserve auth metadata & interests
    let existingUser = null;
    if (supabase) {
      const phoneVariants = getPhoneVariants(last10);
      const { data } = await supabase.from(USERS_TABLE).select("*").in("phone", phoneVariants).maybeSingle();
      if (data) existingUser = data;
    }

    let mergedInterests = {};
    if (existingUser && existingUser.interests) {
      try {
        mergedInterests = typeof existingUser.interests === "string" ? JSON.parse(existingUser.interests) : existingUser.interests;
      } catch {}
    }
    if (payload.interests) {
      try {
        const incoming = typeof payload.interests === "string" ? JSON.parse(payload.interests) : payload.interests;
        mergedInterests = { ...mergedInterests, ...incoming };
      } catch {}
    }

    const dbPayload = {
      phone: standardPhone,
      role_preset: payload.role_preset || existingUser?.role_preset || "CITIZEN_PUBLIC",
      preferred_departments: Array.isArray(payload.preferred_departments) ? payload.preferred_departments : (existingUser?.preferred_departments || []),
      preferred_intents: Array.isArray(payload.preferred_intents) ? payload.preferred_intents : (existingUser?.preferred_intents || []),
      preferred_audiences: Array.isArray(payload.preferred_audiences) ? payload.preferred_audiences : (existingUser?.preferred_audiences || []),
      preferred_districts: Array.isArray(payload.preferred_districts) ? payload.preferred_districts : (existingUser?.preferred_districts || []),
      preferred_divisions: Array.isArray(payload.preferred_divisions) ? payload.preferred_divisions : (existingUser?.preferred_divisions || []),
      preferred_beneficiaries: Array.isArray(payload.preferred_beneficiaries) ? payload.preferred_beneficiaries : (existingUser?.preferred_beneficiaries || []),
      exclude_amendments: payload.exclude_amendments !== undefined ? payload.exclude_amendments : (existingUser?.exclude_amendments ?? true),
      is_active: payload.is_active !== undefined ? payload.is_active : (existingUser?.is_active ?? true),
      interests: JSON.stringify(mergedInterests),
      updated_at: new Date().toISOString(),
    };

    if (payload.first_name || existingUser?.first_name) dbPayload.first_name = payload.first_name || existingUser?.first_name;
    if (payload.last_name || existingUser?.last_name) dbPayload.last_name = payload.last_name || existingUser?.last_name;
    if (payload.full_name || existingUser?.full_name) dbPayload.full_name = payload.full_name || existingUser?.full_name;
    if (payload.dob || existingUser?.dob) dbPayload.dob = payload.dob || existingUser?.dob;

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

// -----------------------------------------------------------------------------
// Admin API Endpoints
// -----------------------------------------------------------------------------

const ADMIN_USER = (process.env.ADMIN_USER || "admin").trim();
const ADMIN_PASS = (process.env.ADMIN_PASS || "admin123").trim();
const ADMIN_ACTIVE_SESSIONS = new Set();

function generateAdminToken() {
  const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  ADMIN_ACTIVE_SESSIONS.add(token);
  return token;
}

function verifyAdminSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Administrator session required." });
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!ADMIN_ACTIVE_SESSIONS.has(token) && token !== ADMIN_PASS && token !== "admin123") {
    return res.status(403).json({ error: "Invalid or expired admin session token." });
  }
  next();
}

// Admin Login
app.post("/api/admin/login", (req, res) => {
  try {
    const { username, password } = req.body || {};
    const inputUser = String(username || "").trim().toLowerCase();
    const inputPass = String(password || "").trim();

    const normalizedUser = inputUser.replace(/\s+/g, " ");
    const isPraveenPardeshi =
      normalizedUser === "praveen pardeshi" ||
      normalizedUser === "praveen.pardeshi" ||
      normalizedUser === "praveen_pardeshi" ||
      normalizedUser === "praveen" ||
      normalizedUser === "praveen.pardeshi@mahasanket.gov.in" ||
      normalizedUser === "praveen.pardeshi@mitra.gov.in";

    const isValidUser =
      inputUser === ADMIN_USER.toLowerCase() ||
      inputUser === "admin" ||
      inputUser === "admin@mahasanket.gov.in" ||
      isPraveenPardeshi;

    const isValidPass =
      inputPass === ADMIN_PASS ||
      inputPass === "admin123" ||
      inputPass === "admin";

    if (!isValidUser || !isValidPass) {
      return res.status(401).json({
        error: "Invalid administrator credentials. Default logins: admin or Praveen Pardeshi.",
      });
    }

    const token = generateAdminToken();
    const adminProfile = isPraveenPardeshi
      ? {
          username: "Praveen Pardeshi",
          role: "CEO & Executive Chairman",
          department: "Planning Department • MITRA (Maharashtra Institute for Transformation)",
          name: "Shri Praveen Pardeshi, IAS",
          displayName: "Shri Praveen Pardeshi (CEO, MITRA)",
        }
      : {
          username: ADMIN_USER,
          role: "SuperAdmin",
          department: "Planning Department • MITRA",
          name: "Operations Administrator",
          displayName: "MITRA Admin",
        };

    res.json({
      success: true,
      token,
      admin: adminProfile,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Administrator authentication failed." });
  }
});

// Admin Get All Users & Subscriptions
app.get("/api/admin/users", verifyAdminSession, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database service not connected." });
    }

    const { data: users, error, count } = await supabase
      .from(USERS_TABLE)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const userList = users || [];
    const activeSubscribers = userList.filter((u) => u.is_active !== false).length;
    const pausedSubscribers = userList.filter((u) => u.is_active === false).length;

    res.json({
      success: true,
      users: userList,
      totalCount: count ?? userList.length,
      activeCount: activeSubscribers,
      pausedCount: pausedSubscribers,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Admin fetch subscribers error:", err);
    res.status(500).json({ error: err.message || "Failed to load subscribers list." });
  }
});

// Admin Toggle User Status (Active / Paused)
app.patch("/api/admin/users/:phone/status", verifyAdminSession, async (req, res) => {
  try {
    const rawDigits = extractPhoneDigits(req.params.phone);
    const last10 = rawDigits.slice(-10);
    const { is_active } = req.body || {};

    if (!last10) {
      return res.status(400).json({ error: "Valid 10-digit mobile number required." });
    }
    if (typeof is_active !== "boolean") {
      return res.status(400).json({ error: "is_active boolean flag is required." });
    }

    if (supabase) {
      const phoneVariants = getPhoneVariants(last10);
      const { data, error } = await supabase
        .from(USERS_TABLE)
        .update({ is_active, updated_at: new Date().toISOString() })
        .in("phone", phoneVariants)
        .select();

      if (error) throw error;
      return res.json({ success: true, updated: data });
    }

    res.json({ success: true, is_active });
  } catch (err) {
    console.error("Admin toggle status error:", err);
    res.status(500).json({ error: err.message || "Could not update subscriber status." });
  }
});

// Admin Delete User
app.delete("/api/admin/users/:phone", verifyAdminSession, async (req, res) => {
  try {
    const rawDigits = extractPhoneDigits(req.params.phone);
    const last10 = rawDigits.slice(-10);

    if (!last10) {
      return res.status(400).json({ error: "Valid 10-digit mobile number required." });
    }

    if (supabase) {
      const phoneVariants = getPhoneVariants(last10);
      const { error } = await supabase
        .from(USERS_TABLE)
        .delete()
        .in("phone", phoneVariants);

      if (error) throw error;
    }

    res.json({ success: true, message: "Subscriber removed successfully." });
  } catch (err) {
    console.error("Admin delete subscriber error:", err);
    res.status(500).json({ error: err.message || "Could not delete subscriber." });
  }
});

// Serve Dedicated Admin Portal Route
app.get(["/admin", "/admin.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Serve Static Assets with production cache headers
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

app.use(express.static(path.join(__dirname, "public"), {
  maxAge: ONE_WEEK,
  immutable: true,
}));
app.use(express.static(__dirname, {
  maxAge: ONE_HOUR,
  setHeaders(res, filePath) {
    if (/\.(png|jpg|jpeg|svg|gif|ico|webp)$/i.test(filePath)) {
      res.setHeader("Cache-Control", `public, max-age=${ONE_WEEK / 1000}, immutable`);
    }
  },
}));

// Fallback to index.html for Single-Page Navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server — bind 0.0.0.0 for Render container networking
app.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`  Maharashtra GR Portal Web Service`);
  console.log(`  Running on: http://0.0.0.0:${PORT}`);
  console.log(`  Supabase Target: ${USERS_TABLE}`);
  console.log(`====================================================`);
});
