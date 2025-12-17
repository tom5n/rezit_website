-- Vytvoření tabulky pro ukládání dat z kalkulačky úspor
CREATE TABLE IF NOT EXISTS calculator_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Údaje z formuláře
  business_name TEXT,
  service_name TEXT,
  monthly_fee DECIMAL(10,2) NOT NULL,
  fee_percentage DECIMAL(5,2) NOT NULL,
  monthly_revenue DECIMAL(12,2) NOT NULL,
  
  -- Výsledky výpočtu
  annual_competitor_costs DECIMAL(12,2) NOT NULL,
  annual_savings DECIMAL(12,2) NOT NULL,
  five_year_savings DECIMAL(12,2) NOT NULL,
  rezit_price DECIMAL(10,2) NOT NULL,
  payback_months INTEGER NOT NULL,
  scenario TEXT NOT NULL,
  show_savings BOOLEAN NOT NULL,
  show_five_year_savings BOOLEAN NOT NULL,
  message TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT
);

-- Vytvoření indexu pro rychlejší vyhledávání podle data
CREATE INDEX IF NOT EXISTS idx_calculator_submissions_created_at ON calculator_submissions(created_at);

-- Vytvoření indexu pro vyhledávání podle scénáře
CREATE INDEX IF NOT EXISTS idx_calculator_submissions_scenario ON calculator_submissions(scenario);

-- Povolení RLS (Row Level Security) pro bezpečnost
ALTER TABLE calculator_submissions ENABLE ROW LEVEL SECURITY;

-- Politika pro vkládání dat (umožní vložit data bez autentizace)
CREATE POLICY "Allow insert for calculator submissions" ON calculator_submissions
  FOR INSERT WITH CHECK (true);

-- Politika pro čtení dat (pouze pro autentizované uživatele - admin)
CREATE POLICY "Allow read for authenticated users" ON calculator_submissions
  FOR SELECT USING (auth.role() = 'authenticated');
