# Deployment & Operations Guide — DumHouse Platform

> **System:** Direct Food-Ordering Website with Real-Time Kitchen Display System (KDS) & AI Prep-Time Predictor  
> **Client:** Company A, Hyderabad (14 Outlets & 3 Cloud Kitchens)  
> **Prepared For:** Isocode Engineering Evaluation  

---

## 1. Demo Login Credentials for Reviewer

The platform provides a **floating top Reviewer Mode Switcher** enabling one-click switching between customer and kitchen staff views at any time without entering credentials. 

Alternatively, sign in at `/login` using the documented demo accounts:

| Role | Email Address | Password | Assigned Outlet / Access Scope |
| :--- | :--- | :--- | :--- |
| **Customer Demo** | `customer.demo@example.com` | `DumHouseCustomer!2026` | Customer ordering, custom cart, checkout, live order tracking |
| **Kitchen Staff Demo** | `kitchen.demo@example.com` | `DumHouseKitchen!2026` | Kondapur Kitchen Station Lead (KDS order controls, prep overrides, menu CMS) |

*Note: These credentials are intentionally public, sample test accounts for assessment evaluation.*

---

## 2. Prerequisites

Ensure your host machine has the following tools installed:
- **Node.js:** v18.17.0 or higher (Tested and certified on Node v20.x and v24.x)
- **Package Manager:** `npm` (v9.x or higher)
- **Git:** v2.30 or higher
- Modern Web Browser: Chrome, Firefox, Edge, or Safari with JavaScript enabled

---

## 3. Local Setup Instructions (Step-by-Step)

### Step 3.1: Clone the Repository
```bash
git clone https://github.com/naman-isocode/dumhouse-platform.git
cd dumhouse-platform
```

### Step 3.2: Install Dependencies
```bash
npm install
```

### Step 3.3: Configure Environment Variables
Copy the example environment configuration template:
```bash
cp .env.example .env.local
```
*(On Windows PowerShell, use: `Copy-Item .env.example .env.local`)*

> **Zero-Configuration Mode:**  
> The application is architected with a resilient built-in local persistence engine and deterministic in-memory database pre-seeded with the exact assessment orders (`WEB-778120`, `WEB-778131`, `WEB-778146`), 3 Hyderabad outlets, and authentic menu items. You can leave Supabase variables empty for immediate local testing without any external cloud service blockers!

### Step 3.4: Run Automated Verification Tests
Verify all 13 unit tests covering the AI Ridge Regression model, state-machine transitions, and pricing integrity:
```bash
npm run test
```
*Expected Result: 2 test files passed, 13 tests passed.*

### Step 3.5: Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Production Deployment Guide (Vercel & Supabase)

### Step 4.1: Supabase Database Setup
1. Log into your [Supabase Dashboard](https://supabase.com) and create a new project (select Region: **Mumbai / India (ap-south-1)** for local data residency compliance under DPDP Act 2023).
2. Open the **SQL Editor** tab in your Supabase project.
3. Paste and execute the migration file located at:  
   `supabase/migrations/20261104000000_initial_schema.sql`
4. This migration automatically:
   - Creates the 9 normalised tables (`profiles`, `outlets`, `menu_categories`, `menu_items`, `outlet_menu_items`, `orders`, `order_items`, `order_events`, `prep_training_samples`).
   - Configures foreign keys, constraints, and indexes.
   - Enables Row Level Security (RLS) policies for customers and staff.
   - Enables the Supabase Realtime publication for `orders` and `order_events`.

### Step 4.2: Deploying to Vercel
1. Push your Git repository to GitHub or GitLab.
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"** ➔ **"Import Git Repository"**.
3. Select Framework Preset: **Next.js**.
4. In the **Environment Variables** section, configure the required variables (names listed below).
5. Click **Deploy**. Vercel will build and deploy the production bundle in ~1 minute.

---

## 5. Environment Variables Reference

*Per assignment security rules, only variable names are listed below. Secret values must NEVER be committed to Git.*

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Project API URL from Supabase dashboard (HTTPS) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Anonymous public API key for browser client queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | Privileged admin key for server actions & migration scripts (Never prefix with `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_APP_URL` | Client & Server | Canonical URL of the application (e.g. `https://dumhouse-platform.vercel.app`) |
| `NODE_ENV` | Build & Runtime | Set to `production` in production deployment |

---

## 6. Verifying the End-to-End Workflow in 3 Minutes

To evaluate the complete customer-to-kitchen-to-customer loop:
1. Open two browser windows side by side (e.g., standard window and Incognito window).
2. In **Window A (Kitchen)**: Navigate to `/staff/kitchen` (KDS). Observe the live tickets for Kondapur (`WEB-778120`), Gachibowli (`WEB-778131`), and Kukatpally (`WEB-778146`). Notice the late alert on `WEB-778146`.
3. In **Window B (Customer)**: Navigate to `/`. Pick items (e.g. *Chicken Dum Biryani Family Pack* + *Double Ka Meetha*), customize portions/add-ons, and click **"Proceed to Checkout"**.
4. Fill delivery address, click **"Authorize Mock Payment"**, and authorize.
5. Notice that the new order number (e.g. `WEB-778150`) appears **instantly on Window A's Kitchen Screen** via real-time sync with an audio chime!
6. In **Window A (Kitchen)**: Click **"Accept Order"** ➔ **"Start Cooking"**.
7. In **Window B (Customer)**: Watch the live progress timeline and AI countdown **immediately update without refreshing the page**!
