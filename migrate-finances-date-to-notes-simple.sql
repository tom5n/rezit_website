-- Migrace: Změna sloupce date na notes v tabulce finances
-- Tento skript změní typ sloupce date z DATE na TEXT a přejmenuje ho na notes

-- Krok 1: Pokud sloupec date existuje, změníme jeho typ na TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'finances' 
    AND column_name = 'date'
  ) THEN
    -- Změníme typ sloupce z DATE na TEXT
    ALTER TABLE finances ALTER COLUMN date TYPE TEXT USING COALESCE(date::TEXT, '');
    -- Přejmenujeme sloupec na notes
    ALTER TABLE finances RENAME COLUMN date TO notes;
  END IF;
END $$;

-- Krok 2: Pokud sloupec notes neexistuje (a date také ne), přidáme ho
ALTER TABLE finances ADD COLUMN IF NOT EXISTS notes TEXT;

-- Krok 3: Odstraníme index na date pokud existuje
DROP INDEX IF EXISTS idx_finances_date;

