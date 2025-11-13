-- Přidání pole status do tabulky projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Možné hodnoty: 'active' (aktivní/čekající), 'completed' (dokončené)
-- Vytvoření indexu pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Aktualizace existujících projektů na 'active' pokud nemají status
UPDATE projects SET status = 'active' WHERE status IS NULL;

