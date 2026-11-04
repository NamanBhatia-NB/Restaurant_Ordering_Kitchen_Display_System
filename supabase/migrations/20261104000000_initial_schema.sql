-- ========================================================================
-- DUMHOUSE RESTAURANT CHAIN: PRODUCTION SCHEMA & RLS MIGRATION
-- Hyderabad Biryani & Cuisine Direct Ordering + Kitchen Display System
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Supabase Auth integration)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CUSTOMER', 'KITCHEN_STAFF', 'ADMIN')),
    outlet_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OUTLETS TABLE
CREATE TABLE IF NOT EXISTS public.outlets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Hyderabad',
    service_pincodes TEXT[] NOT NULL DEFAULT '{}',
    fssai_license_number TEXT NOT NULL,
    minimum_prep_minutes INTEGER NOT NULL DEFAULT 20,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MENU CATEGORIES
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
    spice_level INTEGER NOT NULL DEFAULT 1 CHECK (spice_level BETWEEN 0 AND 3),
    allergens TEXT[] NOT NULL DEFAULT '{}',
    complexity_score INTEGER NOT NULL DEFAULT 3 CHECK (complexity_score BETWEEN 1 AND 5),
    portion_options JSONB DEFAULT '[]'::jsonb,
    available_add_ons JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OUTLET MENU ITEMS (Availability & Price Override per outlet)
CREATE TABLE IF NOT EXISTS public.outlet_menu_items (
    outlet_id TEXT NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (outlet_id, menu_item_id)
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    outlet_id TEXT NOT NULL REFERENCES public.outlets(id),
    outlet_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('RECEIVED', 'ACCEPTED', 'PREPARING', 'READY', 'HANDED_OFF', 'COMPLETED', 'CANCELLED')),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'CARD', 'CASH')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    estimated_prep_minutes INTEGER NOT NULL DEFAULT 25,
    promised_at TIMESTAMPTZ NOT NULL,
    actual_ready_at TIMESTAMPTZ,
    kitchen_override_minutes INTEGER,
    kitchen_override_reason TEXT,
    ai_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS (Immutable historical snapshot)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL,
    item_name_snapshot TEXT NOT NULL,
    portion_snapshot TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_snapshot NUMERIC(10, 2) NOT NULL,
    add_ons JSONB DEFAULT '[]'::jsonb,
    line_total NUMERIC(10, 2) NOT NULL,
    is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
    complexity_score INTEGER NOT NULL DEFAULT 3
);

-- 8. ORDER EVENTS (Auditable timeline log)
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PREP TRAINING SAMPLES (Ridge regression training dataset)
CREATE TABLE IF NOT EXISTS public.prep_training_samples (
    id TEXT PRIMARY KEY,
    outlet_id TEXT NOT NULL REFERENCES public.outlets(id),
    item_count INTEGER NOT NULL,
    complexity_points INTEGER NOT NULL,
    queue_depth INTEGER NOT NULL,
    peak_period INTEGER NOT NULL CHECK (peak_period IN (0, 1)),
    is_weekend INTEGER NOT NULL CHECK (is_weekend IN (0, 1)),
    actual_prep_minutes INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_orders_outlet_status ON public.orders(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON public.order_events(order_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlet_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_training_samples ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Public reading for Outlets, Categories, Menu Items
CREATE POLICY "Public can view active outlets" ON public.outlets
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active menu categories" ON public.menu_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active menu items" ON public.menu_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view outlet menu items" ON public.outlet_menu_items
    FOR SELECT USING (is_available = true);

-- Staff can edit menu items and outlet availability
CREATE POLICY "Staff can update menu items" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('KITCHEN_STAFF', 'ADMIN')
        )
    );

CREATE POLICY "Staff can update outlet menu items" ON public.outlet_menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('KITCHEN_STAFF', 'ADMIN')
        )
    );

-- Orders RLS:
-- Customers see only their own orders
CREATE POLICY "Customers can view own orders" ON public.orders
    FOR SELECT USING (
        customer_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('KITCHEN_STAFF', 'ADMIN')
        )
    );

-- Customers can create orders
CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT WITH CHECK (
        customer_id = auth.uid()::text OR auth.uid() IS NOT NULL
    );

-- Kitchen staff can update orders for their assigned outlet
CREATE POLICY "Kitchen staff can update outlet orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'ADMIN' OR (profiles.role = 'KITCHEN_STAFF' AND (profiles.outlet_id = orders.outlet_id OR profiles.outlet_id IS NULL)))
        )
    );

-- Order items RLS
CREATE POLICY "Users can view order items for accessible orders" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.customer_id = auth.uid()::text OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role IN ('KITCHEN_STAFF', 'ADMIN')
            ))
        )
    );

-- Realtime publication for Supabase Realtime
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_events;
