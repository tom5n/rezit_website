-- Přidání sloupce is_deleted do tabulky calculator_submissions
ALTER TABLE calculator_submissions 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Vytvoření indexu pro rychlejší vyhledávání smazaných záznamů
CREATE INDEX IF NOT EXISTS idx_calculator_submissions_is_deleted 
ON calculator_submissions(is_deleted) 
WHERE is_deleted = true;

-- Aktualizace existujících záznamů (nastavit is_deleted na false, pokud je NULL)
UPDATE calculator_submissions 
SET is_deleted = false 
WHERE is_deleted IS NULL;

-- Nastavení NOT NULL constraint (po aktualizaci existujících záznamů)
ALTER TABLE calculator_submissions 
ALTER COLUMN is_deleted SET NOT NULL;

