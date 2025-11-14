-- Přidání sloupce deadline do tabulky projects (s možností NULL)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline DATE NULL;

-- Vytvoření indexu pro rychlejší vyhledávání projektů podle deadline
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);

-- Pokud sloupec už existuje, ujistit se, že umožňuje NULL hodnoty
ALTER TABLE projects ALTER COLUMN deadline DROP NOT NULL;

