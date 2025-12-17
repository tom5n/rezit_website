# ⚡ Rychlý Start - SEO a Analytics

## 🎯 Co je hotové
✅ Všechny SEO optimalizace jsou implementované
✅ Google Analytics komponenta je připravená
✅ Structured data, sitemap, robots.txt - vše hotovo

## 🚀 Co musíte udělat TEĎ (5 minut)

### 1. Google Analytics (POVINNÉ) ✅ ID je už nastavené lokálně
1. ✅ Google Analytics ID: `G-6MWWD3TD10` je přidáno do `.env.local`
2. **Na Vercelu musíte přidat Environment Variable:**
   - Jděte na: Vercel Dashboard → Váš projekt → Settings → Environment Variables
   - Přidejte novou proměnnou:
     - **Name:** `NEXT_PUBLIC_GA_ID`
     - **Value:** `G-6MWWD3TD10`
     - **Environment:** ✅ Production ✅ Preview ✅ Development
   - Klikněte na "Save"
   - Redeploy projekt (nebo počkejte na automatický redeploy)

### 2. Google Search Console (DOPORUČENÉ)
1. Jděte na: https://search.google.com/search-console
2. Přidejte vlastnost: `https://rezit.cz`
3. Ověřte vlastnictví (Vercel to udělá automaticky)
4. Odeslete sitemap: `https://rezit.cz/sitemap.xml`

### 3. Push na Vercel
```bash
git add .
git commit -m "Add SEO and Analytics"
git push origin main
```

## ✅ Ověření (po nasazení)
1. Otevřete https://rezit.cz
2. DevTools → Network → Hledejte `googletagmanager.com` ✅
3. Google Analytics → Realtime → Měli byste vidět sebe ✅
4. Otevřete https://rezit.cz/sitemap.xml ✅
5. Otevřete https://rezit.cz/robots.txt ✅

## 📚 Detailní instrukce
Všechny detailní instrukce najdete v souboru `SEO_SETUP.md`

---
**Hotovo!** 🎉 Váš web je připravený pro SEO a analytics!

