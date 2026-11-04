# DumHouse — Hyderabad Biryani & Authentic Cuisine Direct Ordering Platform

> **Client:** Company A, Hyderabad (Biryani and Hyderabadi food chain with 14 outlets and 3 cloud kitchens, 520 staff, ₹90–105 Cr annual revenue, 55% via delivery apps).  
> **Core Objective:** Eliminate 25–30% delivery app commissions by capturing 12% direct orders (saving ₹95.04L in commission + ₹19.44L recovered phone bulk orders = ₹1.14 Cr/yr), while streamlining kitchen throughput with a real-time Kitchen Display System (KDS) and honest AI prep-time prediction.

---

## 🔗 Repository & Live Deployment Links

- **GitHub Repository:** `https://github.com/NamanBhatia-NB/Restaurant_Ordering_Kitchen_Display_System`
- **Live Deployed Application:** `https://restaurant-ordering-kitchen-display-two.vercel.app`

---

## ⚡ Key Highlights & Core Built Slice

1. **Customer Direct Web Experience:**
   - Outlet selection by area (Kondapur, Gachibowli Cloud Kitchen, Kukatpally) with live kitchen capacity indicators.
   - Rich menu with high-resolution photography, authentic spice indicators (Mild to Extra Hot), veg/non-veg emblems, and allergen tags.
   - Portion customization (Regular vs. Family Pack) and side add-ons (Extra Mirchi Ka Salan, Double Ka Meetha Rabdi, Boiled Eggs).
   - Transparent pricing: **all displayed prices explicitly include 5% statutory restaurant GST**.
   - Simulated instant payment flow (Dynamic UPI QR simulation, test cards, and cash on pickup).
2. **Real-time Order Tracking:**
   - Server-Sent Events (SSE) and Supabase Realtime synchronization: status changes made in the kitchen reflect immediately on the customer screen without page refreshing.
   - Live stage progression timeline: `Order Placed` ➔ `Accepted` ➔ `Dum Cooking` ➔ `Ready for Pickup` ➔ `Handed Over` ➔ `Completed`.
   - Live timer displaying promised delivery time and AI estimated preparation countdown.
3. **Kitchen Display System (KDS) for Tablet Use:**
   - High-contrast, high-readability design readable from **2 metres away** in hot, noisy kitchen environments.
   - Large order cards with item quantities, portions, and add-ons formatted for quick kitchen scanning.
   - **Late Order Warning Alerts:** Automatically turns amber if promised time is passed, and flashes bold red if delayed by **>10 minutes**.
   - Preparation time override with mandatory audit reason logging.
   - Audio chime notifications upon arrival of new orders.
4. **Interpretable AI Preparation Time Estimator:**
   - Powered by a mathematically rigorous **Ridge Regression** model ($L_2$ regularization $\lambda=1.0$) trained on 180 reproducible synthetic order samples.
   - Takes 5 kitchen operational features: item count, dish complexity score sum, kitchen queue depth, peak-hour load (12–15h, 19–22h), and weekend rush.
   - **Hard Safeguard:** Promised preparation time is strictly calculated as $\max(\text{Outlet Minimum Prep}, \text{Predicted Time} + \lceil\text{MAE}/2\rceil)$.
   - Transparent AI Disclosure badge on tracking screen detailing model error ($\text{MAE} \approx 3.2\text{ mins}$) and synthetic calibration data note.
5. **Central Menu CMS:**
   - Headquarters dashboard to update dish descriptions, prices, spice levels, and complexity scores.
   - Real-time outlet availability toggling (pause sold-out handi pots per individual outlet).

---

## 👥 Demo Reviewer Accounts

The application includes a floating **Reviewer Mode Switcher** at the top of every screen to switch roles with a single click, or use standard credentials:

| Role | Email | Password | Assigned Outlet / Access |
| :--- | :--- | :--- | :--- |
| **Customer Demo** | `customer.demo@example.com` | `DumHouseCustomer!2026` | Full customer ordering & tracking |
| **Kitchen Staff Demo** | `kitchen.demo@example.com` | `DumHouseKitchen!2026` | Kondapur Kitchen Lead (KDS & Menu CMS) |

---

## 🛠️ Technology Stack

| Layer | Technology | Reason for Choice |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 App Router (TypeScript) | Fast SSR/SSG, optimized server actions, strict typing |
| **Styling & UI** | Tailwind CSS + Lucide React | Clean, responsive, minimalist Nizami palette |
| **Database & Schema** | Supabase PostgreSQL (SQL migrations) | Relational integrity, foreign keys, and RLS policies |
| **Local Persistence** | Zero-config in-memory/JSON store | Ensures 100% out-of-the-box evaluation without cloud lock |
| **Realtime Engine** | Server-Sent Events (SSE) & Supabase Realtime | Sub-second order dispatch to kitchen screens without polling |
| **AI / ML Model** | Ridge Regression ($X^T X + \lambda I)^{-1} X^T y$ | Interpretable, deterministic, no LLM hallucinations |
| **Validation** | Zod v3 | Server-side price calculation and state transition enforcement |
| **Testing** | Vitest | Fast automated unit testing of AI and business logic |

---

## 🚀 Quick Local Setup

```bash
# 1. Clone repository
git clone https://github.com/NamanBhatia-NB/Restaurant_Ordering_Kitchen_Display_System.git
cd dumhouse-platform

# 2. Install dependencies
npm install

# 3. Run automated tests (All 13 tests pass)
npm run test

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Coverage

The test suite validates all critical restaurant business rules:

```
✓ tests/ai-prep-estimator.test.ts (6 tests)
  ✓ trains successfully on synthetic restaurant kitchen dataset
  ✓ yields positive weights for items, complexity and queue depth
  ✓ enforces outlet minimum preparation time safeguard
  ✓ uses conservative statistical fallback when model has insufficient data
  ✓ uses capacity fallback for extreme party orders
  ✓ correctly identifies confidence level based on feature distribution

✓ tests/order-business-logic.test.ts (7 tests)
  ✓ allows all valid forward status transitions
  ✓ permits cancellation from early stages but not terminal states
  ✓ strictly rejects backward and invalid jump transitions
  ✓ calculates order prices securely server-side from menu snapshot
  ✓ accurately applies add-on side costs to line items
  ✓ handles kitchen staff prep time override with audit trail
  ✓ prevents customer from querying or modifying other customer private data

Test Files: 2 passed (2)
Tests:      13 passed (13)
```

---

## 📜 Regulatory Disclaimers

- **FSSAI Compliance:** License numbers (e.g. `13624011000001`) are demo/sample identifiers used for assignment evaluation purposes.
- **DPDP Act 2023:** Customer contact details are processed strictly for order routing and fulfillment.
- **GST Disclosure:** All listed menu food prices include 5% statutory restaurant GST under Indian tax regulations.
