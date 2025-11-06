-- Přidání RLS politiky pro UPDATE operace na contact_submissions
-- Tato politika umožní aktualizovat data v tabulce contact_submissions

-- Nejdřív smazat existující politiku, pokud už existuje
DROP POLICY IF EXISTS "Allow update for contact submissions" ON contact_submissions;

-- Vytvořit novou politiku pro UPDATE
CREATE POLICY "Allow update for contact submissions" ON contact_submissions
  FOR UPDATE USING (true)
  WITH CHECK (true);

