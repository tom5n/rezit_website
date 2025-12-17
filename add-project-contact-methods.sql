-- Přidání sloupce contact_methods do tabulky projects pro způsoby kontaktování
-- Uložíme jako JSONB pole pro flexibilitu
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_methods JSONB DEFAULT '[]'::jsonb;

-- Vytvoření indexu pro rychlejší vyhledávání podle způsobů kontaktování
CREATE INDEX IF NOT EXISTS idx_projects_contact_methods ON projects USING GIN (contact_methods);

