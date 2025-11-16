# 🚀 SEO a Analytics Setup Guide

## ✅ Co už je hotové

- ✅ SEO komponenta s meta tagy
- ✅ Structured Data (JSON-LD)
- ✅ Open Graph a Twitter Cards
- ✅ robots.txt a sitemap.xml
- ✅ Optimalizované alt texty
- ✅ Google Analytics komponenta (připravená k použití)

## 📋 Co musíte udělat před pushnutím na Vercel

### 1. Google Analytics Setup

#### Krok 1: Vytvořte Google Analytics účet
1. Jděte na https://analytics.google.com/
2. Přihlaste se svým Google účtem
3. Klikněte na "Začít měřit" nebo "Create Account"
4. Vyplňte název účtu (např. "rezit")
5. Vyplňte název vlastnosti (např. "rezit.cz")
6. Vyberte časové pásmo: (UTC+01:00) Praha
7. Vyberte měnu: CZK
8. Klikněte na "Vytvořit"

#### Krok 2: Získejte Measurement ID
1. Po vytvoření účtu uvidíte "Measurement ID" (formát: `G-XXXXXXXXXX`)
2. Zkopírujte toto ID

#### Krok 3: Přidejte ID do projektu ✅ HOTOVO
1. ✅ Soubor `.env.local` je vytvořen s ID: `G-6MWWD3TD10`
2. ✅ Lokálně to funguje automaticky
3. ⚠️ **DŮLEŽITÉ:** Musíte přidat toto ID i na Vercelu (viz krok 4)

#### Krok 4: Nastavte na Vercelu ⚠️ DŮLEŽITÉ - MUSÍTE UDĚLAT
1. Jděte do Vercel dashboardu: https://vercel.com/dashboard
2. Vyberte váš projekt (rezit)
3. Jděte na **Settings** → **Environment Variables**
4. Klikněte na **Add New**
5. Přidejte novou proměnnou:
   - **Name:** `NEXT_PUBLIC_GA_ID`
   - **Value:** `G-6MWWD3TD10`
   - **Environment:** ✅ Production ✅ Preview ✅ Development (zaškrtněte všechny tři)
6. Klikněte na **Save**
7. **Redeploy projekt:**
   - Jděte na **Deployments**
   - Klikněte na tři tečky u posledního deploymentu
   - Vyberte **Redeploy**
   - Nebo pushněte nový commit (automatický redeploy)

### 2. Google Search Console Setup

#### Krok 1: Přidejte vlastnost
1. Jděte na https://search.google.com/search-console
2. Klikněte na "Přidat vlastnost"
3. Vyberte "Předpona adresy URL"
4. Zadejte: `https://rezit.cz`
5. Klikněte na "Pokračovat"

#### Krok 2: Ověření vlastnictví
Vercel automaticky přidá DNS záznamy, ale můžete použít:
- **HTML tag metoda:** Vercel automaticky přidá meta tag do `<head>`
- **DNS metoda:** Přidejte TXT záznam do DNS vaší domény

#### Krok 3: Odeslat sitemap
1. Po ověření jděte na "Soubory Sitemap"
2. Přidejte: `https://rezit.cz/sitemap.xml`
3. Klikněte na "Odeslat"

### 3. Facebook Pixel (volitelné)

Pokud chcete sledovat konverze z Facebook reklam:

1. Jděte na https://business.facebook.com/events_manager
2. Vytvořte nový Pixel
3. Zkopírujte Pixel ID
4. Přidejte do `.env.local`:
   ```
   NEXT_PUBLIC_FB_PIXEL_ID=VAŠE-PIXEL-ID
   ```
5. (Pokud chcete, můžu přidat Facebook Pixel komponentu)

### 4. Ověření před nasazením

#### Lokální testování:
```bash
# Vytvořte .env.local s vaším GA ID
echo "NEXT_PUBLIC_GA_ID=G-TEST123" > .env.local

# Spusťte dev server
npm run dev

# Otevřete http://localhost:3000
# Otevřete DevTools → Network tab
# Měli byste vidět requesty na google-analytics.com
```

#### Kontrola po nasazení:
1. Po nasazení na Vercel otevřete https://rezit.cz
2. Otevřete DevTools → Network tab
3. Měli byste vidět requesty na `www.googletagmanager.com`
4. V Google Analytics → Realtime → Měli byste vidět sebe jako aktivního uživatele

### 5. Doporučené další kroky

1. **Google Business Profile** (pokud máte fyzickou pobočku)
   - Vytvořte profil na https://business.google.com/
   - Přidejte structured data pro LocalBusiness

2. **Bing Webmaster Tools**
   - Jděte na https://www.bing.com/webmasters
   - Přidejte sitemap

3. **Yandex Webmaster** (pokud cílíte na východní Evropu)
   - Jděte na https://webmaster.yandex.com/

## 🔍 Jak ověřit, že vše funguje

### Google Analytics:
1. Jděte na https://analytics.google.com/
2. Realtime → Overview
3. Měli byste vidět aktivní uživatele

### Structured Data:
1. Jděte na https://search.google.com/test/rich-results
2. Zadejte URL: `https://rezit.cz`
3. Měli byste vidět všechny structured data bez chyb

### SEO kontrola:
1. Jděte na https://pagespeed.web.dev/
2. Zadejte URL: `https://rezit.cz`
3. Zkontrolujte skóre (mělo by být 90+)

## 📝 Checklist před pushnutím

- [ ] Vytvořen Google Analytics účet
- [ ] Measurement ID přidáno do `.env.local`
- [ ] Environment variable nastavena na Vercelu
- [ ] Sitemap.xml je přístupný na `/sitemap.xml`
- [ ] robots.txt je přístupný na `/robots.txt`
- [ ] Všechny stránky mají SEO komponentu
- [ ] Structured data jsou validní
- [ ] Obrázky mají alt texty

## 🚀 Pushnutí na Vercel

```bash
# Commit změn
git add .
git commit -m "Add SEO optimization and Google Analytics"

# Push na GitHub
git push origin main

# Vercel automaticky nasadí
# Po nasazení zkontrolujte:
# 1. Google Analytics funguje
# 2. Sitemap je přístupný
# 3. Structured data jsou validní
```

## 📞 Potřebujete pomoc?

Pokud máte problémy s nastavením, zkontrolujte:
- [ ] Environment variables jsou správně nastavené
- [ ] Measurement ID má správný formát (G-XXXXXXXXXX)
- [ ] Vercel má přístup k environment variables
- [ ] Google Analytics účet je aktivní

---

**Poznámka:** Google Analytics začne sbírat data okamžitě po nasazení. První reporty uvidíte během 24-48 hodin.

