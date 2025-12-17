# Nastavení ukládání souborů pro projekty

Tento dokument popisuje, jak nastavit ukládání souborů spojených s projekty v admin panelu.

## Požadavky

1. **Supabase Storage Bucket** - musí být vytvořen v Supabase dashboardu
2. **SQL migrace** - spustit SQL skript pro vytvoření tabulky `project_files`

## Krok 1: Vytvoření Storage Bucketu v Supabase

1. Přihlaste se do [Supabase Dashboard](https://app.supabase.com/)
2. Vyberte svůj projekt
3. Přejděte na **Storage** v levém menu
4. Klikněte na **New bucket**
5. Nastavte:
   - **Name**: `project-files` (musí přesně odpovídat názvu v kódu)
   - **Public bucket**: **Vypnuto** (soubory budou přístupné přes signed URLs)
   - **File size limit**: 50 MB (pro free tier) nebo více podle vašeho plánu
   - **Allowed MIME types**: Ponechte prázdné pro povolení všech typů souborů

## Krok 2: Nastavení Storage Policies (RLS)

Pro bezpečnost byste měli nastavit Row Level Security politiky pro Storage bucket:

1. V Supabase Dashboard přejděte na **Storage** → **Policies**
2. Vyberte bucket `project-files`
3. Vytvořte následující politiky:

### Politika pro nahrávání souborů (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');
```

### Politika pro čtení souborů (SELECT)
```sql
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-files');
```

### Politika pro mazání souborů (DELETE)
```sql
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-files');
```

**Poznámka**: Vzhledem k tomu, že admin panel používá cookie-based autentizaci (ne Supabase Auth), můžete potřebovat upravit politiky nebo použít service role key pro operace se Storage. Alternativně můžete nastavit bucket jako public, ale to není doporučeno pro citlivé soubory.

## Krok 3: Spuštění SQL migrace

Spusťte SQL skript `project-files-database-setup.sql` v Supabase SQL Editor:

1. Přejděte na **SQL Editor** v Supabase Dashboard
2. Vytvořte nový query
3. Zkopírujte obsah souboru `project-files-database-setup.sql`
4. Spusťte query

## Krok 4: Ověření nastavení

Po dokončení všech kroků byste měli být schopni:

1. Otevřít admin panel
2. Vybrat projekt
3. Kliknout na záložku **📁 Soubory**
4. Nahrát soubor pomocí tlačítka s ikonou uploadu

## Limity Supabase Storage

### Free Tier
- **Celková kapacita**: 1 GB
- **Maximální velikost souboru**: 50 MB
- **Bandwidth**: 2 GB/měsíc

### Pro Tier ($25/měsíc)
- **Celková kapacita**: 100 GB
- **Maximální velikost souboru**: 5 GB
- **Bandwidth**: 200 GB/měsíc

### Team Tier ($599/měsíc)
- **Celková kapacita**: 500 GB
- **Maximální velikost souboru**: 5 GB
- **Bandwidth**: 1 TB/měsíc

## Alternativní řešení pro větší soubory

Pokud potřebujete ukládat větší soubory nebo více dat, zvažte:

1. **Upgrade Supabase plánu** - nejjednodušší řešení
2. **Externí storage** - AWS S3, Cloudflare R2, nebo jiné služby
3. **Kombinace** - malé soubory v Supabase, velké jinde

## Řešení problémů

### Chyba při nahrávání: "new row violates row-level security policy"
- Zkontrolujte, že jste nastavili správné Storage policies
- Pokud používáte cookie-based autentizaci, možná budete muset použít service role key

### Chyba: "Bucket not found"
- Ověřte, že bucket se jmenuje přesně `project-files`
- Zkontrolujte, že bucket existuje v Supabase Dashboard

### Soubory se nahrávají, ale nelze je stáhnout
- Zkontrolujte Storage policies pro SELECT operace
- Ověřte, že signed URLs jsou správně generovány

## Bezpečnost

- **Nikdy** neukládejte citlivé soubory do public bucketu
- Používejte signed URLs s expirací pro přístup k souborům
- Pravidelně kontrolujte Storage policies
- Zvažte šifrování citlivých souborů před nahráním

