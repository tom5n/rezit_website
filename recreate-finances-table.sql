-- Smazání staré tabulky finances a vytvoření nové s správnou strukturou

-- Krok 1: Odstranit všechny závislosti (triggery, indexy, politiky)
DROP TRIGGER IF EXISTS update_finances_updated_at ON finances;
DROP FUNCTION IF EXISTS update_finances_updated_at_column();
DROP INDEX IF EXISTS idx_finances_project_id;
DROP INDEX IF EXISTS idx_finances_created_at;
DROP INDEX IF EXISTS idx_finances_is_deleted;
DROP INDEX IF EXISTS idx_finances_date;

-- Krok 2: Smazat všechny RLS politiky
DROP POLICY IF EXISTS "Allow insert for finances" ON finances;
DROP POLICY IF EXISTS "Allow read for finances" ON finances;
DROP POLICY IF EXISTS "Allow update for finances" ON finances;
DROP POLICY IF EXISTS "Allow delete for finances" ON finances;

-- Krok 3: Smazat celou tabulku (POZOR: Toto smaže všechna data!)
DROP TABLE IF EXISTS finances CASCADE;

-- Krok 4: Vytvořit novou tabulku s správnou strukturou
CREATE TABLE finances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vazba na projekt
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Finanční údaje
  description TEXT NOT NULL, -- Za co (např. "Web design", "Vývoj funkcí")
  amount NUMERIC(10, 2), -- Kolik (v Kč) - volitelné
  hours NUMERIC(5, 2), -- Odpracované hodiny - volitelné
  notes TEXT, -- Poznámka - volitelné (SPRÁVNĚ jako TEXT, ne DATE!)
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Krok 5: Vytvořit indexy pro rychlejší vyhledávání
CREATE INDEX idx_finances_project_id ON finances(project_id);
CREATE INDEX idx_finances_created_at ON finances(created_at);
CREATE INDEX idx_finances_is_deleted ON finances(is_deleted);

-- Krok 6: Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_finances_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_finances_updated_at BEFORE UPDATE ON finances
    FOR EACH ROW EXECUTE FUNCTION update_finances_updated_at_column();

-- Krok 7: Povolení RLS (Row Level Security)
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

-- Krok 8: Politiky pro finanční záznamy - povolení pro všechny (admin panel má vlastní autentizaci přes cookies)
CREATE POLICY "Allow insert for finances" ON finances
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for finances" ON finances
  FOR SELECT USING (true);

CREATE POLICY "Allow update for finances" ON finances
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for finances" ON finances
  FOR DELETE USING (true);

