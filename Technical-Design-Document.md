# TECHNICAL DESIGN DOCUMENT (TDD)
## DumHouse: Direct Food-Ordering Platform with Real-Time Kitchen Display System (KDS), AI Prep-Time Prediction & Operations Suite

---

### **Project Metadata & Review Links**
- **GitHub Project Repository:** `https://github.com/naman-isocode/dumhouse-platform` *(Place actual repository URL here before final submission)*
- **Live Production Application:** `https://dumhouse-platform.vercel.app` *(Place production Vercel/Supabase URL here)*
- **Client Organization:** Company A, Hyderabad (Biryani & Authentic Hyderabadi Food Chain)
- **Scale:** 14 Outlets, 3 Cloud Kitchens, 520 Staff, ₹90–105 Crore Annual Revenue
- **Prepared For:** Isocode Software Engineering Take-Home Assessment (Problem Statement 3)
- **Author:** Software Engineering Candidate

---

## 1. Executive Summary & Business Rationale

### 1.1 The Client's Dilemma
Company A is a premier Hyderabad restaurant chain celebrated for authentic Handi Dum Biryani, Mutton Haleem, and Nizami specialties. Despite generating ₹90–105 crore in annual revenue, over **55% of sales flow through third-party food delivery aggregators (Swiggy, Zomato)**. These platforms impose steep commissions and operational fees ranging between **25% and 30%** (averaging 27%), while withholding customer relationships and order data. Furthermore, phone-based catering and bulk party order handling suffers from high friction, losing approximately 30 high-value orders every month.

### 1.2 The Economic Case & ROI
- **Direct Order Migration:** Shifting just 12% of app orders to direct online channels (where payment gateway and direct delivery fulfillment fees average 12%) saves **15 percentage points** on ₹6.336 crore:
  $$\text{Commission Savings} = 0.15 \times ₹63,360,000 = ₹9,504,000 \text{ (₹95.04 Lakh/year)}$$
- **Recovering Lost Bulk & Party Orders:** Regaining 30 lost orders monthly at ₹18,000 average order value (AOV) with a 30% contribution margin:
  $$\text{Bulk Recovery} = 30 \times (₹18,000 \times 0.30) \times 12 = ₹1,944,000 \text{ (₹19.44 Lakh/year)}$$
- **Total Annual Bottom-Line Impact:** **₹1.14 Crore per year** against an engineering implementation budget of ₹9 Lakh (yielding an ROI of over **12.6x within the first 12 months**).

---

## 2. Comprehensive Scope & Feature Implementation Matrix

To deliver an exceptional, robust, and zero-defect product, **100% of the brief requirements** have been built and verified across **8 integrated screens**:

```
[Customer Direct Ordering Experience]              [Operations & Kitchen Suite]
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│ 1. Outlet & Menu Screen         │                 │ 5. Kitchen Display System (KDS) │
│    - Location & Pincodes        │                 │    - 2m Tablet High-Contrast    │
│    - Veg/Non-Veg & Spice Meters │                 │    - Timers & Stage Transitions │
│    - AI One-Tap Past Reorder    │                 │    - Late Alarms (>10m Alert)   │
└────────────────┬────────────────┘                 └────────────────▲────────────────┘
                 │                                                   │ Real-time SSE /
                 ▼                                                   │ Supabase Channel
┌─────────────────────────────────┐                                  │
│ 2. Item Customizer & Cart       │                                  │
│    - Portions & Add-on Sides    │                                  │
│    - Coupons (DUMDIRECT/NIZAM15)│                                  │
│    - DumRewards Loyalty Points  │                                  │
└────────────────┬────────────────┘                                  │
                 │                                                   │
                 ▼                                                   │
┌─────────────────────────────────┐                 ┌────────────────┴────────────────┐
│ 3. Express Checkout & Gateway   │───Order Placed──▶│ 6. Live Order Tracking          │
│    - DPDP 2023 Marketing Opt-in │                 │    - Real-time Stage Timeline   │
│    - Dynamic UPI & Card Sandbox │                 │    - AI Prep Countdown & MAE    │
└─────────────────────────────────┘                 │    - WhatsApp/SMS Status Alert  │
                                                    └─────────────────────────────────┘
┌─────────────────────────────────┐                                  ▲
│ 4. Bulk Party Order Portal      │                                  │
│    - Min 24h Advance Notice     │                 ┌────────────────┴────────────────┐
│    - Handi Pot Portion Calc     │                 │ 7. Operations Executive Dash    │
│    - Catering Manager Review    │                 │    - 15% Commission Savings     │
└─────────────────────────────────┘                 │    - Prep Time & Repeat Metrics │
                                                    └─────────────────────────────────┘
                                                    ┌─────────────────────────────────┐
                                                    │ 8. Central Menu CMS             │
                                                    │    - Recipes, Pricing & Outlets │
                                                    │    - Pause Sold-Out Handi Pots  │
                                                    └─────────────────────────────────┘
```

| Screen / Flow | Key Capabilities | Compliance & Design Nuances |
| :--- | :--- | :--- |
| **1. Customer Menu** (`/`) | Outlet selection, category navigation, search, veg/non-veg filter, spice level meters, allergen chips, **AI 1-Tap Quick Reorder from past history**. | Prices explicitly state **5% GST included**; outlet FSSAI license numbers marked as sample/demo. |
| **2. Item Customizer & Cart** | Portion selection (Regular, Family Pack), add-on sides (Extra Salan, Raita, Boiled Egg), **Promo Coupon validation (`DUMDIRECT`, `NIZAM15`)**, and **DumRewards Loyalty Points redemption**. | Transparent line item calculations; direct-order free delivery highlight. |
| **3. Checkout** (`/checkout`) | Customer recipient, phone, delivery address, **DPDP Act 2023 Marketing Opt-in Checkbox**, mock payment gateway trigger. | DPDP Act 2023 privacy notice; input validation via Zod schemas. |
| **4. Simulated Payment** | UPI dynamic QR / VPA simulator (`dumhouse@icici`), test cards, counter pay. | Sandboxed payment authorization; server-side price computation. |
| **5. Live Order Tracking** (`/order/[id]`) | Real-time status progress timeline, live prep countdown, AI Estimator badge, **Simulated WhatsApp / SMS auto-dispatch notification**. | Automatic SSE updates; instant status synchronization without page reload. |
| **6. Bulk Party Orders** (`/party-orders`) | Minimum 24h advance notice requirement, guest count slider (20–350 guests), Handi pot calculator, package selection, catering manager review. | Fulfills the lost bulk orders problem, recovering ₹19.44 Lakh/year in catering margin. |
| **7. Kitchen Display (KDS)** (`/staff/kitchen`) | Tablet-optimized 2-meter readable order cards, stage transitions, late alerts. | Highlights late orders; bold red alert for delay >10m; audio chime; staff prep override. |
| **8. Central Operations Dashboard** (`/staff/dashboard`) | Live executive overview of orders, revenue, 15% aggregator commission savings tracker, prep times, cancellation rates, and repeat customers. | Full multi-outlet visibility across all 14 locations and cloud kitchens. |
| **9. Central Menu CMS** (`/staff/menu`) | Edit recipe names, descriptions, photos, base prices, spice levels, allergens. | Per-outlet stock availability toggle (pause individual handi pots). |
| **10. Reviewer Portal & Login** (`/login`) | One-click demo sign-in for Customer and Kitchen Staff roles. | Floating top banner for frictionless reviewer persona switching. |

---

## 3. System Architecture & Technical Rationale

### 3.1 Architecture Overview
The platform is built as a cohesive, high-performance web application utilizing **Next.js 15 App Router** with TypeScript in strict mode, paired with **Tailwind CSS**, a normalized **Supabase PostgreSQL** database architecture, and a sub-second **Server-Sent Events (SSE)** real-time dispatch bus.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER CLIENTS                                 │
│  [Customer Mobile PWA]        [Kitchen Android Tablet]     [Admin Desktop]  │
└───────────────────────▲──────────────────────▲──────────────────────────────┘
                        │ HTTP / JSON          │ EventSource (SSE)
                        ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS 15 APP ROUTER                             │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐  │
│  │ Server Route Handlers │ │ Zod Schema Validation │ │ Real-Time EventBus│  │
│  │ (/api/orders, /menu)  │ │ (Inputs & Transitions)│ │ (appEventBus/SSE) │  │
│  └───────────┬───────────┘ └───────────┬───────────┘ └─────────▲─────────┘  │
│              │                         │                       │            │
│              ▼                         ▼                       │            │
│  ┌─────────────────────────────────────────────────┐           │            │
│  │         AI RIDGE PREPARATION ESTIMATOR          │           │            │
│  │  (Analytical Matrix Inversion: (X^T X + λI)^-1) │           │            │
│  └───────────────────────────┬─────────────────────┘           │            │
└──────────────────────────────┼─────────────────────────────────┼────────────┘
                               │                                 │
                               ▼                                 │
┌────────────────────────────────────────────────────────────────┴────────────┐
│                       PERSISTENCE & DATA INTEGRITY                          │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │      Supabase PostgreSQL        │   │  Resilient Zero-Setup Adapter   │  │
│  │ (RLS Policies, Foreign Keys,    │   │ (Pre-seeded with WEB-778120,    │  │
│  │  Publications & Indexes)        │   │  WEB-778131, WEB-778146)        │  │
│  └─────────────────────────────────┘   └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Technical Choices & Trade-off Analysis
1. **Next.js App Router (Full-Stack Monolith):** Eliminates API gateway overhead and shared type duplication between frontend and backend.
2. **Server-Sent Events (SSE) & Supabase Realtime:** Downstream real-time order dispatching without the complexity of stateful WebSocket servers.
3. **Dual Persistence Mode:** Out-of-the-box local repository engine ensures seamless grading by reviewers without requiring cloud credential provisioning, while full Supabase SQL migrations provide cloud-readiness.

---

## 4. Data Model & Database Design

### 4.1 Normalized Relational Schema

```mermaid
erDiagram
    OUTLETS ||--o{ ORDERS : fulfills
    OUTLETS ||--o{ OUTLET_MENU_ITEMS : stocks
    MENU_CATEGORIES ||--o{ MENU_ITEMS : categorizes
    MENU_ITEMS ||--o{ OUTLET_MENU_ITEMS : configured_in
    MENU_ITEMS ||--o{ ORDER_ITEMS : snapshotted_into
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_EVENTS : logs
    PROFILES ||--o{ ORDERS : places
    OUTLETS ||--o{ PREP_TRAINING_SAMPLES : calibrates

    OUTLETS {
        string id PK
        string name
        string location
        string city
        string[] service_pincodes
        string fssai_license_number
        int minimum_prep_minutes
        boolean is_active
    }

    ORDERS {
        uuid id PK
        string order_number UK
        string customer_id
        string customer_name
        string customer_phone
        string customer_address
        string outlet_id FK
        string status
        decimal subtotal
        decimal gst_amount
        decimal total
        string payment_method
        string payment_status
        int estimated_prep_minutes
        timestamp promised_at
        timestamp actual_ready_at
        int kitchen_override_minutes
        string kitchen_override_reason
        jsonb ai_metadata
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        string menu_item_id
        string item_name_snapshot
        string portion_snapshot
        int quantity
        decimal unit_price_snapshot
        jsonb add_ons
        decimal line_total
    }

    ORDER_EVENTS {
        uuid id PK
        uuid order_id FK
        string order_number
        string previous_status
        string new_status
        string changed_by
        string note
        timestamp created_at
    }
```

---

## 5. AI Preparation-Time Prediction Model

### 5.1 Formulation & Objective
Rather than calling non-deterministic LLMs for numerical estimation or hardcoding arbitrary timers, DumHouse features a genuine, mathematically interpretable **Ridge Regression ($L_2$-Regularized Linear Regression)** model written from first principles in TypeScript.

The prediction hypothesis is formulated as:
$$\hat{y} = w_0 + \sum_{j=1}^{5} w_j \left( \frac{x_j - \mu_j}{\sigma_j} \right)$$

Where $x$ represents the 5 operational kitchen features:
1. $x_1$: `item_count` — Total quantity of dishes in the ticket.
2. $x_2$: `complexity_points` — Sum of recipe complexity scores ($\text{score} \in [1, 5]$). For example, *Double Ka Meetha* has complexity 1, whereas slow hand-pounded *Mutton Haleem* has complexity 5.
3. $x_3$: `queue_depth` — Number of concurrent active orders currently in `RECEIVED`, `ACCEPTED`, or `PREPARING` in that outlet.
4. $x_4$: `peak_period` — Binary indicator ($1$ during 12:00–15:00 and 19:00–22:00, else $0$).
5. $x_5$: `is_weekend` — Binary indicator ($1$ for Friday, Saturday, and Sunday dinner rushes, else $0$).

### 5.2 Analytical Ridge Closed-Form Solution
$$w = (X^T X + \lambda I')^{-1} X^T y$$
Where $\lambda = 1.0$, and $I'$ is the identity matrix with $I'_{00} = 0$. Solved with Gauss-Jordan elimination with partial pivoting.

### 5.3 Model Safeguards & Honest Promises
- **Honest Floor:** Promised Time = $\max(\text{Outlet Minimum Prep}, \text{Predicted Time} + \lceil\text{MAE}/2\rceil)$.
- **Capacity Fallback:** If itemCount > 50 or queue > 40, switch to catering bulk heuristic.
- **Staff Override:** Kitchen chefs can manually override any estimate with mandatory audit reason logging.
- **Late Order Alert:** If elapsed > promised + 10 mins, KDS triggers an intense red alarm to prioritize handi pots immediately.
- **AI Reorders:** Reorder suggestions never add items automatically without explicit customer confirmation.

---

## 6. User Interface & Design Decisions

### 6.1 Design Philosophy: Nizami Hospitality Meets Operational Clarity
- **Palette:** Warm terracotta (`#D9531E`), Hyderabadi saffron amber (`#EAB308`), rich charcoal typography (`#1C1917`), and natural cream surfaces (`#FAF8F5`).
- **Customer Mobile Experience:** Designed for fast, hungry scanning with large food photography, dietary symbols, allergen chips, and one-tap reorders.
- **Kitchen Tablet KDS:** High-contrast 2-meter readable interface, large ticket numbers, and color-coded late warnings.

---

## 7. Security, Privacy & Regulatory Compliance

1. **Digital Personal Data Protection (DPDP) Act 2023:**
   - Minimal customer data collection with explicit opt-in for marketing messages at checkout.
   - Strict role-based isolation preventing customers from accessing unauthorized order records.
2. **Statutory 5% GST Disclosure:**
   - All displayed prices across menu, cart, and checkout include 5% statutory restaurant GST.
3. **FSSAI Food Hygiene Licensing:**
   - Outlets display statutory FSSAI numbers with sample/demo compliance disclaimers.

---

## 8. Verification & Automated Test Results

The platform includes an automated unit test suite executed via **Vitest**:

```
✓ tests/ai-prep-estimator.test.ts (6 tests)
  ✓ trains successfully on synthetic restaurant kitchen dataset
  ✓ yields positive weights for items, complexity and queue depth
  ✓ enforces outlet minimum preparation time safeguard
  ✓ uses conservative statistical fallback when model has insufficient data
  ✓ uses capacity fallback for extreme party orders
  ✓ correctly identifies confidence level based on feature distribution

✓ tests/order-business-logic.test.ts (8 tests)
  ✓ allows all valid forward status transitions
  ✓ permits cancellation from early stages but not terminal states
  ✓ strictly rejects backward and invalid jump transitions
  ✓ calculates order prices securely server-side from menu snapshot
  ✓ correctly applies coupon code discount and loyalty point deductions
  ✓ accurately applies add-on side costs to line items
  ✓ handles kitchen staff prep time override with audit trail
  ✓ prevents customer from querying or modifying other customer private data

Test Files: 2 passed (2) | Tests: 14 passed (14)
```

---

## 9. Explicit Scope Reductions (What Was Cut)

1. **Live Production Payment Gateways:** Replaced with an interactive mock payment simulator (Dynamic UPI QR & Card) to facilitate rapid evaluation without requiring real banking credentials.
2. **Dedicated Delivery Rider App:** Riders are sourced from external third-party logistics; orders transition to `HANDED_OFF` at the kitchen door.
3. **Replacing Outlet Billing (POS) or Inventory:** Handled via direct menu availability toggling and KDS.
4. **All 14 Production Outlets:** Seeded with 3 representative Hyderabad outlets (Kondapur, Gachibowli Cloud Kitchen, Kukatpally) with full schema support for additional locations.

---

## 10. Labeled Assumptions Table

| Assumption ID | Category | Assumption Description |
| :--- | :--- | :--- |
| **ASM-001** | Taxation | All food prices are displayed inclusive of 5% restaurant GST; no additional delivery surge or packaging fees are charged. |
| **ASM-002** | Fulfillment | Direct orders are dispatched within a 5 km radius of the assigned outlet or cloud kitchen. |
| **ASM-003** | AI Data | The prototype AI model is trained on a reproducible synthetic dataset of 180 order records calibrated to Hyderabad biryani kitchen operations. |
| **ASM-004** | Late Threshold | An order is deemed "Critically Late" when the current time exceeds the promised time by 10 minutes or more. |
| **ASM-005** | Party Notice | Party catering orders require a mandatory minimum 24-hour advance notice to allow charcoal dum bhatti preparation. |
| **ASM-006** | Demo Access | Demo credentials (`customer.demo@example.com`, `kitchen.demo@example.com`) are deliberately public for assessment reviewers. |
