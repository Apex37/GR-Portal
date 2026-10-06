# 🏛️ Maharashtra Government Resolutions (GR) Portal

> **शासन निर्णय नागरिक व व्यवसाय व्यासपीठ**  
> Modern, interactive intelligence portal for browsing official Government Resolutions of Maharashtra with 5D AI tagging, district-level filtering, and instant WhatsApp alerts.

---

## 🚀 Features

* **34 Ministry Explorer:** Instant search across all 34 ministries with Marathi & English subject categorization.
* **5D AI Intelligence:** Real-time extraction of Intent (Tenders, Subsidies, Fund Sanctions, Service Rules), Audience Scope, Target Beneficiary, and Geography.
* **WhatsApp Alerts Onboarding:** Seamless 3-step citizen and contractor registration that saves directly to Supabase (`gov-users-v2`).
* **Subscription Management:** Easily look up and toggle active notifications using your WhatsApp number.
* **Interactive WhatsApp Preview:** Real-time smartphone simulator demonstrating exact message formatting before subscribing.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Start development server
npm run dev
```

---

## 🌐 Deploying to Render

This repository includes a [`render.yaml`](render.yaml) blueprint for 1-click static site deployment.

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\to$ **Static Site**.
3. Connect your GitHub repository `Apex37/GR-Portal`.
4. Configure Build & Publish settings:
   * **Build Command:** `npm install && npm run build`
   * **Publish Directory:** `dist`
5. Under **Environment Variables**, add:
   * `VITE_SUPABASE_URL`: `https://uhlncqrevycxtxtdydav.supabase.co`
   * `VITE_SUPABASE_ANON_KEY`: *(Your Supabase public anon key from Project Settings > API)*
   * `VITE_SUPABASE_RESOLUTIONS_TABLE`: `gov-res`
   * `VITE_SUPABASE_USERS_TABLE`: `gov-users-v2`
6. Click **Create Static Site**.

---

## 🔒 Security
Frontend clients connect strictly to Supabase using the public `ANON_KEY` with Row Level Security (RLS). Secret service keys are never exposed in this frontend application.
