# Rychlý návod: Vytvoření Storage Bucketu

## Problém: "Bucket not found"

Pokud vidíte tuto chybu, bucket `project-files` ještě neexistuje v Supabase Storage.

## Řešení - 2 možnosti:

### Možnost 1: Automatické vytvoření (doporučeno)

Kód se pokusí automaticky vytvořit bucket při prvním nahrání souboru. Pokud máte správná oprávnění, mělo by to fungovat automaticky.

### Možnost 2: Manuální vytvoření v Supabase Dashboard

Pokud automatické vytvoření nefunguje, vytvořte bucket manuálně:

1. **Přihlaste se do Supabase Dashboard**
   - Jděte na https://app.supabase.com/
   - Vyberte svůj projekt

2. **Přejděte na Storage**
   - V levém menu klikněte na **Storage**

3. **Vytvořte nový bucket**
   - Klikněte na tlačítko **New bucket** (nebo **Create bucket**)
   - Vyplňte:
     - **Name**: `project-files` (musí být přesně tento název!)
     - **Public bucket**: **VYPNUTO** (neveřejný bucket)
     - **File size limit**: `52428800` (50 MB) nebo více podle vašeho plánu
     - **Allowed MIME types**: Ponechte prázdné (povolí všechny typy souborů)

4. **Uložte bucket**
   - Klikněte na **Create bucket** nebo **Save**

5. **Nastavte Storage Policies (DŮLEŽITÉ!)**

   ⚠️ **Toto je kritické!** Bez správných policies nebude nahrávání fungovat, i když bucket existuje!
   
   **Rychlé řešení - spusťte SQL skript:**
   
   1. V Supabase Dashboard → **SQL Editor**
   2. Vytvořte nový query
   3. Zkopírujte obsah souboru `create-storage-policies.sql`
   4. Spusťte query
   
   **Nebo manuálně v Storage → Policies:**
   
   Pro cookie-based autentizaci (váš případ) použijte `anon`:

   ```sql
   -- Politika pro nahrávání (INSERT)
   CREATE POLICY "Allow upload to project-files"
   ON storage.objects FOR INSERT
   TO anon
   WITH CHECK (bucket_id = 'project-files');

   -- Politika pro čtení (SELECT)
   CREATE POLICY "Allow read from project-files"
   ON storage.objects FOR SELECT
   TO anon
   USING (bucket_id = 'project-files');

   -- Politika pro mazání (DELETE)
   CREATE POLICY "Allow delete from project-files"
   ON storage.objects FOR DELETE
   TO anon
   USING (bucket_id = 'project-files');
   ```

   **Alternativa: Pokud policies nefungují, můžete dočasně nastavit bucket jako PUBLIC:**
   - V Supabase Dashboard → Storage → `project-files` → Settings
   - Zapněte "Public bucket"
   - ⚠️ **Varování**: To umožní přístup k souborům komukoli, kdo má URL

## Ověření

Po vytvoření bucketu zkuste znovu nahrát soubor v admin panelu. Mělo by to fungovat!

## Pokud stále nefunguje

1. Zkontrolujte, že název bucketu je přesně `project-files` (malá písmena, pomlčka)
2. Ověřte, že máte správná oprávnění v Supabase
3. Zkontrolujte konzoli prohlížeče pro další chybové zprávy
4. Ujistěte se, že jste spustili SQL migraci (`project-files-database-setup.sql`)

