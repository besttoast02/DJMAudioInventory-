-- ============================================================
-- DJMAudio Inventory & Rental Manager — Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)
-- ============================================================

-- 1. Items table — every individual physical piece of gear
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'Generic',
  category TEXT NOT NULL,
  storage_case TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'damaged', 'lost')),
  purchase_price NUMERIC(10,2) DEFAULT 0,
  current_value NUMERIC(10,2) DEFAULT 0,
  rate_half_day NUMERIC(10,2) DEFAULT 0,
  rate_daily NUMERIC(10,2) DEFAULT 0,
  rate_weekend NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Rentals table — rental requests and approved events
CREATE TABLE rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  event_date DATE NOT NULL,
  return_date DATE,
  venue TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'returned', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Junction table — which items are on which rental
CREATE TABLE rental_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(rental_id, item_id)
);

-- 4. Indexes for fast lookups
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_storage_case ON items(storage_case);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_event_date ON rentals(event_date);
CREATE INDEX idx_rental_items_rental ON rental_items(rental_id);
CREATE INDEX idx_rental_items_item ON rental_items(item_id);

-- 5. Enable Row Level Security (but allow all for now — single admin user)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service_role key (used by the app)
CREATE POLICY "Allow all for service role" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON rentals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON rental_items FOR ALL USING (true) WITH CHECK (true);
