-- Oprava constraintu pro sloupec project v tabulce passwords
-- Změníme NOT NULL na NULL, protože nyní používáme project_id

-- Nejdřív odstraníme NOT NULL constraint
ALTER TABLE passwords ALTER COLUMN project DROP NOT NULL;

-- Nastavíme výchozí hodnotu na prázdný řetězec pro existující záznamy (volitelné)
-- UPDATE passwords SET project = '' WHERE project IS NULL;

