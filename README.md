# 🏛️ Maharashtra Government Resolutions (GR) Portal

> **शासन निर्णय नागरिक व व्यवसाय व्यासपीठ**  
> Institutional civic portal for browsing official Government Resolutions of Maharashtra with 5D AI tagging, district-level filtering, and instant WhatsApp alerts.

---

## 🚀 Features

* **34 Ministry Explorer:** Instant search across all 34 ministries with Marathi & English subject categorization.
* **5D AI Intelligence:** Real-time extraction of Intent (Tenders, Subsidies, Fund Sanctions, Service Rules), Audience Scope, Target Beneficiary, and Geography.
* **Secure Web Service Backend:** Node.js Express server (`server.js`) that safely interfaces with Supabase (`gov-users-v2`) using your `SUPABASE_SERVICE_ROLE_KEY`.
* **Zero CORS / AdBlocker Free:** Browser talks to same-origin relative endpoints (`/api/auth/*`, `/api/preferences`), eliminating all `Failed to fetch` errors caused by adblockers/Brave shields.
* **WhatsApp Notification Stream:** Real-time smartphone simulator demonstrating exact message formatting before subscribing.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Web Service
npm start
# Server starts on http://localhost:3000
```

---

## 🌐 Deploying to Render (Node.js Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\to$ **Web Service**.
3. Select your GitHub repository `Apex37/GR-Portal`.
4. Configure settings:
   * **Environment:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   * `SUPABASE_URL`: `https://uhlncqrevycxtxtdydav.supabase.co`
   * `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_secret_key_here`
   * `SUPABASE_GOV_USERS_TABLE`: `gov-users-v2`
6. Click **Deploy Web Service**.
