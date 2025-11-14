-- Přidání sloupce is_important do tabulky todos pro označení důležitých úkolů
ALTER TABLE todos ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE;

-- Vytvoření indexu pro rychlejší vyhledávání důležitých úkolů
CREATE INDEX IF NOT EXISTS idx_todos_is_important ON todos(is_important);

