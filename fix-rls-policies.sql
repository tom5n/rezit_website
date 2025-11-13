-- Oprava RLS politik pro projekty a hesla
-- Tento skript opraví existující politiky v databázi

-- Odstranění starých politik pro projects
DROP POLICY IF EXISTS "Allow insert for projects" ON projects;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON projects;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON projects;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON projects;

-- Vytvoření nových politik pro projects
CREATE POLICY "Allow insert for projects" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Allow update for projects" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for projects" ON projects
  FOR DELETE USING (true);

-- Odstranění starých politik pro passwords
DROP POLICY IF EXISTS "Allow insert for passwords" ON passwords;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON passwords;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON passwords;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON passwords;

-- Vytvoření nových politik pro passwords
CREATE POLICY "Allow insert for passwords" ON passwords
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for passwords" ON passwords
  FOR SELECT USING (true);

CREATE POLICY "Allow update for passwords" ON passwords
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for passwords" ON passwords
  FOR DELETE USING (true);

