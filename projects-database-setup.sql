-- Vytvoření tabulky pro projekty
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Základní informace o projektu
  name TEXT NOT NULL UNIQUE, -- blackrosebarber, msstudio, nastrizeno, atd.
  display_name TEXT NOT NULL, -- Black Rose Barber, MS Studio Hair, atd.
  description TEXT, -- Popis projektu
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Vytvoření indexů
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted);

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_projects_updated_at_column();

-- Povolení RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Politiky pro projekty - povolení pro všechny (admin panel má vlastní autentizaci přes cookies)
CREATE POLICY "Allow insert for projects" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Allow update for projects" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for projects" ON projects
  FOR DELETE USING (true);

-- Úprava tabulky passwords - přidání vazby na projekt přes project_id místo project text
-- Nejdřív přidáme nový sloupec
ALTER TABLE passwords ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Vytvoření indexu pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_passwords_project_id ON passwords(project_id);

-- Poznámka: Starý sloupec 'project' (TEXT) zůstane pro zpětnou kompatibilitu, 
-- ale nové záznamy by měly používat project_id

