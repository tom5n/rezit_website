# ✅ Google Analytics Setup - Rychlý Návod

## 🎯 Vaše Google Analytics ID
**ID:** `G-6MWWD3TD10`

## 📝 Co udělat:

### 1. Lokální vývoj (volitelné - pro testování)
Vytvořte soubor `.env.local` v kořenovém adresáři projektu s obsahem:
```
NEXT_PUBLIC_GA_ID=G-6MWWD3TD10
```

### 2. Vercel (POVINNÉ - pro produkci) ⚠️
1. Jděte na: https://vercel.com/dashboard
2. Vyberte váš projekt **rezit**
3. Klikněte na **Settings** (v menu vlevo)
4. Klikněte na **Environment Variables**
5. Klikněte na **Add New**
6. Vyplňte:
   - **Name:** `NEXT_PUBLIC_GA_ID`
   - **Value:** `G-6MWWD3TD10`
   - **Environment:** Zaškrtněte všechny tři:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
7. Klikněte na **Save**

### 3. Redeploy
Po přidání environment variable:
- Jděte na **Deployments**
- Klikněte na **⋯** (tři tečky) u posledního deploymentu
- Vyberte **Redeploy**
- Nebo prostě pushněte nový commit

## ✅ Ověření
Po nasazení:
1. Otevřete https://rezit.cz
2. Otevřete DevTools (F12) → Network tab
3. Hledejte requesty na `googletagmanager.com` - měly by tam být ✅
4. Jděte na Google Analytics → Realtime → Měli byste vidět aktivní uživatele ✅

---
**Hotovo!** 🎉 Google Analytics bude fungovat po přidání na Vercelu.

