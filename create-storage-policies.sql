-- Vytvoření Storage Policies pro bucket project-files
-- Tento skript umožní anon uživatelům (cookie-based autentizace) nahrávat, číst a mazat soubory

-- Politika pro nahrávání souborů (INSERT)
CREATE POLICY "Allow upload to project-files"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'project-files');

-- Politika pro čtení souborů (SELECT)
CREATE POLICY "Allow read from project-files"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'project-files');

-- Politika pro mazání souborů (DELETE)
CREATE POLICY "Allow delete from project-files"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'project-files');

-- Poznámka: Pokud chcete omezit přístup pouze na autentizované uživatele Supabase Auth,
-- změňte TO anon na TO authenticated

