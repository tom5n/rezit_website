-- Vytvoření tabulky pro správu hesel podle projektů
CREATE TABLE IF NOT EXISTS passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informace o projektu a službě
  project TEXT NOT NULL, -- blackrosebarber, msstudio, nastrizeno, avabarber, ivanajirakova
  service_name TEXT NOT NULL, -- Název služby/účtu (např. "Admin panel", "Supabase", "Vercel", atd.)
  
  -- Přihlašovací údaje
  username TEXT,
  password TEXT NOT NULL,
  
  -- Další informace
  notes TEXT, -- Poznámky k heslu
  url TEXT, -- URL pro přístup (volitelné)
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Vytvoření indexů pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_passwords_project ON passwords(project);
CREATE INDEX IF NOT EXISTS idx_passwords_service_name ON passwords(service_name);
CREATE INDEX IF NOT EXISTS idx_passwords_created_at ON passwords(created_at);
CREATE INDEX IF NOT EXISTS idx_passwords_is_deleted ON passwords(is_deleted);

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_passwords_updated_at BEFORE UPDATE ON passwords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Povolení RLS (Row Level Security) pro bezpečnost
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Politiky pro hesla - povolení pro všechny (admin panel má vlastní autentizaci přes cookies)
CREATE POLICY "Allow insert for passwords" ON passwords
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for passwords" ON passwords
  FOR SELECT USING (true);

CREATE POLICY "Allow update for passwords" ON passwords
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for passwords" ON passwords
  FOR DELETE USING (true);

