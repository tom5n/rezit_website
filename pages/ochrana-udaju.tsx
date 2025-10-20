import React from 'react'
import Layout from '@/components/Layout'

export default function OchranaUdaju() {
  return (
    <Layout>
      <section className="min-h-screen bg-white py-24">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-left mb-20">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6">
                Ochrana <span className="text-primary-500">osobních údajů</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl leading-relaxed">
                Informace o tom, jak zpracováváme a chráníme vaše osobní údaje v souladu s GDPR.
              </p>
            </div>

            {/* Content */}
            <div className="w-full">
              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Jaké údaje zpracováváme</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                V rámci poskytování našich služeb zpracováváme následující kategorie osobních údajů:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-8">
                <li>Identifikační údaje (jméno, příjmení)</li>
                <li>Kontaktní údaje (email, telefon)</li>
                <li>Údaje o podnikání (název firmy, typ služeb)</li>
                <li>Technické údaje (IP adresa, cookies)</li>
              </ul>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Účel zpracování</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Vaše osobní údaje zpracováváme za účelem:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-8">
                <li>Poskytování rezervačních systémů na míru</li>
                <li>Komunikace s klienty a potenciálními klienty</li>
                <li>Placení za naše služby</li>
                <li>Zlepšování kvality našich služeb</li>
                <li>Plnění zákonných povinností</li>
              </ul>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Právní základ zpracování</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Zpracování vašich osobních údajů je založeno na:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-8">
                <li><strong>Smlouvě</strong> - pro poskytování našich služeb</li>
                <li><strong>Oprávněnému zájmu</strong> - pro komunikaci a marketing</li>
                <li><strong>Souhlasu</strong> - pro cookies a marketingové komunikace</li>
                <li><strong>Zákonné povinnosti</strong> - pro účetnictví a daně</li>
              </ul>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Doba uchovávání</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Osobní údaje uchováváme pouze po dobu nezbytně nutnou pro naplnění účelu zpracování. 
                Údaje o klientech uchováváme po dobu trvání smlouvy a následně podle zákonných povinností 
                (zejména účetní doklady po dobu 5 let). Marketingové údaje uchováváme do odvolání souhlasu.
              </p>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Vaše práva</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                V souvislosti se zpracováním osobních údajů máte následující práva:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-8">
                <li><strong>Právo na informace</strong> - o zpracování vašich údajů</li>
                <li><strong>Právo na přístup</strong> - k vašim osobním údajům</li>
                <li><strong>Právo na opravu</strong> - nepřesných údajů</li>
                <li><strong>Právo na výmaz</strong> - vašich údajů</li>
                <li><strong>Právo na omezení zpracování</strong></li>
                <li><strong>Právo na přenositelnost údajů</strong></li>
                <li><strong>Právo vznést námitku</strong> proti zpracování</li>
                <li><strong>Právo podat stížnost</strong> u Úřadu pro ochranu osobních údajů</li>
              </ul>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Předávání údajů třetím stranám</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Vaše osobní údaje nepředáváme třetím stranám, s výjimkou případů, kdy je to nezbytné pro 
                poskytování našich služeb (např. hosting, platební brány) nebo kdy to vyžaduje zákon. 
                Všechny třetí strany jsou povinny dodržovat stejné standardy ochrany údajů.
              </p>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Zabezpečení údajů</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Implementujeme vhodná technická a organizační opatření k ochraně vašich osobních údajů 
                před neoprávněným přístupem, změnou, zničením nebo ztrátou. Používáme šifrování, 
                bezpečné servery a pravidelně aktualizujeme naše bezpečnostní systémy.
              </p>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Kontakt</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Pokud máte jakékoli otázky ohledně zpracování vašich osobních údajů nebo chcete uplatnit 
                svá práva, kontaktujte nás:
              </p>
              <div className="space-y-2 text-gray-600 mb-8">
                <p><strong>Email:</strong> info@rezit.cz</p>
                <p><strong>Telefon:</strong> +420 123 456 789</p>
              </div>

              <div className="text-center mt-12">
                <p className="text-sm text-gray-500">
                  Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

// Explicit export for static generation
export async function getStaticProps() {
  return {
    props: {},
  }
}
