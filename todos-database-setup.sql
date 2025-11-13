-- Vytvoření tabulky pro to-do úkoly v projektech
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vazba na projekt
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Informace o úkolu
  title TEXT NOT NULL, -- Název úkolu
  description TEXT, -- Popis úkolu (volitelné)
  is_completed BOOLEAN DEFAULT FALSE, -- Zda je úkol dokončen
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Vytvoření indexů pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_todos_project_id ON todos(project_id);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON todos(is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_is_deleted ON todos(is_deleted);

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_todos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_todos_updated_at_column();

-- Povolení RLS (Row Level Security)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Politiky pro todos - povolení pro všechny (admin panel má vlastní autentizaci přes cookies)
CREATE POLICY "Allow insert for todos" ON todos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for todos" ON todos
  FOR SELECT USING (true);

CREATE POLICY "Allow update for todos" ON todos
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for todos" ON todos
  FOR DELETE USING (true);

