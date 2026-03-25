-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bank accounts / sources
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'credit', 'investment', 'other')),
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories (hierarchical)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  exclude_from_totals BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, parent_id, name)
);

-- File uploads
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  row_count INT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Unified transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES uploads(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  categorization_method TEXT CHECK (categorization_method IN ('user_rule', 'system_rule', 'ai', 'manual', 'uncategorized')),
  ai_confidence NUMERIC(3,2),
  notes TEXT,
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User categorization rules
CREATE TABLE categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  match_field TEXT NOT NULL DEFAULT 'description'
    CHECK (match_field IN ('description', 'amount', 'institution')),
  match_type TEXT NOT NULL DEFAULT 'contains'
    CHECK (match_type IN ('exact', 'contains', 'starts_with', 'regex')),
  match_value TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_field, match_type, match_value)
);

-- System rules (global, read-only for users)
CREATE TABLE system_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  match_field TEXT NOT NULL DEFAULT 'description',
  match_type TEXT NOT NULL DEFAULT 'contains',
  match_value TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Monthly budget limits
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies (for v1 with dev user, these are permissive)
CREATE POLICY "Users see own profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Users see own accounts" ON accounts FOR ALL USING (true);
CREATE POLICY "Users see own categories" ON categories FOR ALL USING (true);
CREATE POLICY "Users see own uploads" ON uploads FOR ALL USING (true);
CREATE POLICY "Users see own transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Users see own rules" ON categorization_rules FOR ALL USING (true);
CREATE POLICY "Users see own budgets" ON budgets FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_transactions_user_date ON transactions (user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions (user_id, category_id);
CREATE INDEX idx_transactions_upload ON transactions (upload_id);
CREATE INDEX idx_rules_user_active ON categorization_rules (user_id) WHERE is_active = true;
CREATE INDEX idx_categories_user_parent ON categories (user_id, parent_id);
