-- Přidání RLS politiky pro UPDATE operace na calculator_submissions
-- Tato politika umožní aktualizovat data v tabulce calculator_submissions

-- Nejdřív smazat existující politiku, pokud už existuje
DROP POLICY IF EXISTS "Allow update for calculator submissions" ON calculator_submissions;

-- Vytvořit novou politiku pro UPDATE
CREATE POLICY "Allow update for calculator submissions" ON calculator_submissions
  FOR UPDATE USING (true)
  WITH CHECK (true);

