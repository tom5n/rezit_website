-- Přidání sloupce order do tabulky todos pro vlastní řazení pomocí drag and drop
ALTER TABLE todos ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Vytvoření indexu pro rychlejší řazení
CREATE INDEX IF NOT EXISTS idx_todos_order ON todos("order");

-- Nastavení výchozího pořadí pro existující úkoly podle created_at
UPDATE todos 
SET "order" = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at DESC) as row_number
  FROM todos
  WHERE "order" IS NULL
) AS subquery
WHERE todos.id = subquery.id;

