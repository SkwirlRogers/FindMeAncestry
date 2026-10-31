INSERT INTO plans (slug, name, display_name, is_premium, price_monthly, price_yearly, metadata_json, created_at, updated_at)
VALUES
  ('demo', 'Demo', 'Demo', false, 0.00, 0.00, '{"tier":"demo","features":["basic-access"]}', NOW(), NOW()),
  ('forensic_explorer', 'Forensic Explorer', 'Forensic Explorer', true, 29.00, 290.00, '{"tier":"forensic_explorer","features":["research","advanced-workspace","premium-tools"]}', NOW(), NOW()),
  ('advocate', 'Advocate', 'Advocate', true, 49.00, 490.00, '{"tier":"advocate","features":["all-premium-features","advocacy-tools","priority-analysis"]}', NOW(), NOW()),
  ('investigator', 'Investigator', 'Investigator', true, 79.00, 790.00, '{"tier":"investigator","features":["full-platform-access","deep-analysis","investigation-suite"]}', NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  is_premium = EXCLUDED.is_premium,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  metadata_json = EXCLUDED.metadata_json,
  updated_at = NOW();
