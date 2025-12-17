-- Vytvoření tabulky pro správu souborů spojených s projekty
CREATE TABLE IF NOT EXISTS project_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vazba na projekt
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Informace o souboru
  file_name TEXT NOT NULL, -- Původní název souboru
  file_path TEXT NOT NULL, -- Cesta v Supabase Storage (bucket/project_id/filename)
  file_size BIGINT NOT NULL, -- Velikost souboru v bytech
  file_type TEXT, -- MIME typ souboru (např. application/pdf, image/png)
  file_extension TEXT, -- Přípona souboru (pdf, png, docx, atd.)
  
  -- Metadata
  description TEXT, -- Popis souboru (volitelné)
  category TEXT, -- Kategorie souboru (např. "dokumentace", "design", "smlouva", "faktura")
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Vytvoření indexů pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_created_at ON project_files(created_at);
CREATE INDEX IF NOT EXISTS idx_project_files_category ON project_files(category);
CREATE INDEX IF NOT EXISTS idx_project_files_is_deleted ON project_files(is_deleted);

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_project_files_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_files_updated_at BEFORE UPDATE ON project_files
    FOR EACH ROW EXECUTE FUNCTION update_project_files_updated_at_column();

-- Povolení RLS (Row Level Security) pro bezpečnost
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Politiky pro soubory - povolení pro všechny (admin panel má vlastní autentizaci přes cookies)
CREATE POLICY "Allow insert for project_files" ON project_files
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for project_files" ON project_files
  FOR SELECT USING (true);

CREATE POLICY "Allow update for project_files" ON project_files
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for project_files" ON project_files
  FOR DELETE USING (true);

