-- Vytvoření tabulky pro kontaktní formulář
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Údaje z kontaktního formuláře
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_type TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT
);

-- Vytvoření indexu pro rychlejší vyhledávání podle data
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);

-- Vytvoření indexu pro vyhledávání podle emailu
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Povolení RLS (Row Level Security) pro bezpečnost
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Politika pro vkládání dat (umožní vložit data bez autentizace)
CREATE POLICY "Allow insert for contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Politika pro čtení dat (umožní číst data bez autentizace pro admin účely)
CREATE POLICY "Allow read for all" ON contact_submissions
  FOR SELECT USING (true);
