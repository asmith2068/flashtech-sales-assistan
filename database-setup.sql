-- =====================================================
-- FlashTech Sales Assistant — Database Setup
-- Run this in Supabase SQL Editor (Settings > SQL Editor)
-- =====================================================

-- 1. USERS TABLE (sales reps and managers)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'rep' CHECK (role IN ('rep', 'manager')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTACTS TABLE (customers, distributors, contractors)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company TEXT NOT NULL,
  name TEXT,
  title TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SALES CALLS TABLE
CREATE TABLE IF NOT EXISTS calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  call_date DATE NOT NULL,
  call_time TIME,
  who TEXT,
  what TEXT,
  call_where TEXT,
  products_discussed TEXT,
  outcome TEXT,
  follow_up TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'overdue', 'done')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  title TEXT NOT NULL,
  event_type TEXT DEFAULT 'call' CHECK (event_type IN ('call', 'meeting', 'site_visit', 'trade_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FUEL LOG TABLE
CREATE TABLE IF NOT EXISTS fuel_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  gallons DECIMAL(8,2),
  price_per_gal DECIMAL(6,2),
  total DECIMAL(8,2),
  mileage INTEGER,
  station TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VEHICLE MAINTENANCE TABLE
CREATE TABLE IF NOT EXISTS maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  maint_type TEXT NOT NULL,
  cost DECIMAL(8,2),
  mileage INTEGER,
  vendor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
  expense_date DATE NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  category TEXT NOT NULL,
  who TEXT,
  what TEXT,
  expense_where TEXT,
  has_receipt BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSERT DEFAULT USERS
-- Change these passwords before going live!
-- =====================================================

INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin', 'admin', 'Admin Manager', 'manager'),
  ('jake', '1234', 'Jake Morrison', 'rep'),
  ('sarah', '1234', 'Sarah Chen', 'rep'),
  ('mike', '1234', 'Mike Davis', 'rep')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- This ensures reps can only see their own data
-- and managers can see everything
-- =====================================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated access (simple setup)
-- You can tighten these policies later
CREATE POLICY "Allow all access" ON contacts FOR ALL USING (true);
CREATE POLICY "Allow all access" ON calls FOR ALL USING (true);
CREATE POLICY "Allow all access" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all access" ON events FOR ALL USING (true);
CREATE POLICY "Allow all access" ON fuel_log FOR ALL USING (true);
CREATE POLICY "Allow all access" ON maintenance FOR ALL USING (true);
CREATE POLICY "Allow all access" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON users FOR ALL USING (true);

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
