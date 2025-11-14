-- Migrace: Změna sloupce date na notes v tabulce finances

-- Pokud sloupec date existuje, změníme ho na notes s typem TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'finances' 
    AND column_name = 'date'
  ) THEN
    -- Změníme typ sloupce z DATE na TEXT
    ALTER TABLE finances ALTER COLUMN date TYPE TEXT USING date::TEXT;
    -- Přejmenujeme sloupec
    ALTER TABLE finances RENAME COLUMN date TO notes;
  END IF;
END $$;

-- Pokud sloupec notes neexistuje (a date také ne), přidáme ho
ALTER TABLE finances ADD COLUMN IF NOT EXISTS notes TEXT;

-- Odstraníme index na date pokud existuje
DROP INDEX IF EXISTS idx_finances_date;

-- Aktualizujeme trigger (použijeme CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_finances_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Odstraníme starý trigger pokud existuje a vytvoříme nový
DROP TRIGGER IF EXISTS update_finances_updated_at ON finances;
CREATE TRIGGER update_finances_updated_at BEFORE UPDATE ON finances
    FOR EACH ROW EXECUTE FUNCTION update_finances_updated_at_column();

