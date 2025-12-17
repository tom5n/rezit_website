-- Přidání sloupce is_favorite do tabulky projects pro označení hlavních projektů
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Vytvoření indexu pro rychlejší vyhledávání hlavních projektů
CREATE INDEX IF NOT EXISTS idx_projects_is_favorite ON projects(is_favorite);

