-- Přidání sloupce is_favorite do tabulky calculator_submissions
ALTER TABLE calculator_submissions 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Vytvoření indexu pro rychlejší vyhledávání oblíbených záznamů
CREATE INDEX IF NOT EXISTS idx_calculator_submissions_is_favorite 
ON calculator_submissions(is_favorite) 
WHERE is_favorite = true;

-- Aktualizace existujících záznamů (nastavit is_favorite na false, pokud je NULL)
UPDATE calculator_submissions 
SET is_favorite = false 
WHERE is_favorite IS NULL;

-- Nastavení NOT NULL constraint (po aktualizaci existujících záznamů)
ALTER TABLE calculator_submissions 
ALTER COLUMN is_favorite SET NOT NULL;

