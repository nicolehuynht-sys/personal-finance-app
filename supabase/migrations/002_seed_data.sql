-- Seed dev user
INSERT INTO profiles (id, display_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alex Rivera');

-- Seed default categories
-- Parent categories
INSERT INTO categories (id, user_id, name, icon, is_system, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Housing', 'home', true, 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Food & Beverage', 'restaurant', true, 2),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Transport', 'directions_car', true, 3),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Entertainment', 'movie', true, 4),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Shopping', 'shopping_bag', true, 5),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Healthcare', 'local_hospital', true, 6),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Utilities', 'bolt', true, 7),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Insurance', 'shield', true, 8),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Education', 'school', true, 9),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Travel', 'flight', true, 10),
  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Personal Care', 'spa', true, 11),
  ('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Gifts', 'redeem', true, 12),
  ('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Income', 'payments', true, 13),
  ('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Investment', 'trending_up', true, 14),
  ('10000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Other', 'more_horiz', true, 15);

-- Internal transfer categories (users can toggle exclude_from_totals in the UI)
INSERT INTO categories (id, user_id, name, icon, is_system, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Account Transfer', 'swap_horiz', true, 16),
  ('10000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Card Payment', 'credit_card', true, 17);

-- Sub-categories
INSERT INTO categories (id, user_id, parent_id, name, icon, is_system, sort_order) VALUES
  -- Food & Beverage children
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Groceries', 'shopping_cart', true, 1),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Dining Out', 'restaurant_menu', true, 2),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Coffee Shops', 'coffee', true, 3),
  -- Transport children
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Public Transit', 'train', true, 1),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Fuel', 'local_gas_station', true, 2),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Ride Share', 'hail', true, 3),
  -- Entertainment children
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Subscriptions', 'subscriptions', true, 1),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Events', 'event', true, 2),
  -- Income children
  ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000013', 'Salary', 'account_balance', true, 1),
  ('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000013', 'Freelance', 'work', true, 2),
  ('20000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Dividends', 'savings', true, 1);

-- Seed system rules
INSERT INTO system_rules (category_name, match_field, match_type, match_value, priority) VALUES
-- Food & Beverage
('Groceries',       'description', 'contains', 'WHOLE FOODS',    10),
('Groceries',       'description', 'contains', 'TRADER JOE',     10),
('Groceries',       'description', 'contains', 'COSTCO',         10),
('Groceries',       'description', 'contains', 'KROGER',         10),
('Groceries',       'description', 'contains', 'SAFEWAY',        10),
('Dining Out',      'description', 'contains', 'DOORDASH',       10),
('Dining Out',      'description', 'contains', 'UBER EATS',      10),
('Dining Out',      'description', 'contains', 'GRUBHUB',        10),
('Coffee Shops',    'description', 'contains', 'STARBUCKS',      10),
('Coffee Shops',    'description', 'contains', 'DUNKIN',         10),
-- Transport
('Ride Share',      'description', 'contains', 'UBER',            8),
('Ride Share',      'description', 'contains', 'LYFT',           10),
('Fuel',            'description', 'contains', 'SHELL',          10),
('Fuel',            'description', 'contains', 'CHEVRON',        10),
('Fuel',            'description', 'contains', 'EXXON',          10),
('Public Transit',  'description', 'contains', 'MTA',            10),
('Public Transit',  'description', 'contains', 'METRO',           8),
-- Entertainment
('Subscriptions',   'description', 'contains', 'NETFLIX',        10),
('Subscriptions',   'description', 'contains', 'SPOTIFY',        10),
('Subscriptions',   'description', 'contains', 'HULU',           10),
('Subscriptions',   'description', 'contains', 'DISNEY+',        10),
('Subscriptions',   'description', 'contains', 'APPLE.COM/BILL', 10),
('Subscriptions',   'description', 'contains', 'AMAZON PRIME',   10),
-- Utilities
('Utilities',       'description', 'contains', 'ELECTRIC',        8),
('Utilities',       'description', 'contains', 'WATER BILL',     10),
('Utilities',       'description', 'contains', 'GAS BILL',       10),
('Utilities',       'description', 'contains', 'INTERNET',        8),
-- Shopping
('Shopping',        'description', 'contains', 'AMAZON',          5),
('Shopping',        'description', 'contains', 'TARGET',          8),
('Shopping',        'description', 'contains', 'WALMART',         8),
-- Healthcare
('Healthcare',      'description', 'contains', 'PHARMACY',        8),
('Healthcare',      'description', 'contains', 'CVS',             8),
('Healthcare',      'description', 'contains', 'WALGREENS',       8),
-- Account Transfer
('Account Transfer', 'description', 'contains', 'TRANSFER',        8),
('Account Transfer', 'description', 'contains', 'ACH TRANSFER',   10),
('Account Transfer', 'description', 'contains', 'WIRE TRANSFER',  10),
('Account Transfer', 'description', 'contains', 'ZELLE',          10),
('Account Transfer', 'description', 'contains', 'VENMO',           8),
-- Card Payment
('Card Payment',     'description', 'contains', 'PAYMENT THANK YOU', 10),
('Card Payment',     'description', 'contains', 'AUTOPAY',        10),
('Card Payment',     'description', 'contains', 'ONLINE PAYMENT', 10),
('Card Payment',     'description', 'contains', 'CREDIT CARD PAYMENT', 10),
('Card Payment',     'description', 'contains', 'BILL PAY',        8);

-- Seed sample budgets
INSERT INTO budgets (user_id, category_id, monthly_limit) VALUES
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1000.00),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 300.00),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 400.00);
