-- Přidání sloupců is_deleted a is_resolved do tabulky contact_submissions
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT false;

-- Vytvoření indexů pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_deleted 
ON contact_submissions(is_deleted) 
WHERE is_deleted = true;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_resolved 
ON contact_submissions(is_resolved) 
WHERE is_resolved = true;

-- Aktualizace existujících záznamů (nastavit is_deleted a is_resolved na false, pokud jsou NULL)
UPDATE contact_submissions 
SET is_deleted = false 
WHERE is_deleted IS NULL;

UPDATE contact_submissions 
SET is_resolved = false 
WHERE is_resolved IS NULL;

-- Nastavení NOT NULL constraint (po aktualizaci existujících záznamů)
ALTER TABLE contact_submissions 
ALTER COLUMN is_deleted SET NOT NULL;

ALTER TABLE contact_submissions 
ALTER COLUMN is_resolved SET NOT NULL;

-- Přidání RLS politiky pro UPDATE operace (umožní aktualizovat data)
-- Nejdřív smazat existující politiku, pokud už existuje
DROP POLICY IF EXISTS "Allow update for contact submissions" ON contact_submissions;

-- Vytvořit novou politiku pro UPDATE
CREATE POLICY "Allow update for contact submissions" ON contact_submissions
  FOR UPDATE USING (true)
  WITH CHECK (true);

