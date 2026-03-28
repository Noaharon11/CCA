-- Seed trusted sources whitelist
-- Only these sources are allowed for regulatory content retrieval

INSERT INTO trusted_sources (name, base_url, description, is_active) VALUES
  ('gov.il', 'https://www.gov.il', 'Israeli Government Portal - Official regulations and laws', true),
  ('Ministry of Labor', 'https://www.gov.il/he/departments/ministry_of_labor', 'Ministry of Labor, Social Affairs and Social Services', true),
  ('OSH Israel', 'https://www.osh.org.il', 'Institute for Safety and Hygiene - Safety guidelines and training', true),
  ('Standards Institute', 'https://www.sii.org.il', 'Standards Institute of Israel - Technical standards', true)
ON CONFLICT DO NOTHING;
