import React from 'react'
import Layout from '@/components/Layout'

export default function Cookies() {
  return (
    <Layout>
      <section className="min-h-screen bg-white py-24">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-left mb-20">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6">
                Zásady <span className="text-primary-500">používání cookies</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl leading-relaxed">
                Informace o tom, jak používáme cookies na našich webových stránkách.
              </p>
            </div>

            {/* Content */}
            <div className="w-full">
              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Co jsou cookies?</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení při návštěvě webových stránek. 
                Pomáhají nám poskytovat lepší uživatelskou zkušenost a analyzovat, jak naše stránky používají návštěvníci.
              </p>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Jaké cookies používáme?</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Nezbytné cookies</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Tyto cookies jsou nezbytné pro správné fungování webových stránek. Bez nich by stránky nemohly fungovat správně. 
                Tyto cookies nelze vypnout.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Analytické cookies</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Pomáhají nám pochopit, jak návštěvníci používají naše stránky. Shromažďují anonymní informace o počtu návštěvníků, 
                nejnavštěvovanějších stránkách a dalších statistikách.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Marketingové cookies</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Používáme je k zobrazování relevantních reklam a měření efektivity našich marketingových kampaní. 
                Tyto cookies nám pomáhají přizpůsobit obsah vašim zájmům.
              </p>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Jak můžete cookies spravovat?</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Většina webových prohlížečů automaticky přijímá cookies, ale můžete své nastavení změnit. 
                Můžete cookies odmítnout nebo nastavit prohlížeč tak, aby vás upozornil, když jsou cookies odesílány.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Upozorňujeme, že pokud cookies vypnete, některé funkce našich stránek nemusí fungovat správně.
              </p>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Třetí strany</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Naše stránky mohou obsahovat cookies od třetích stran, jako jsou:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-8">
                <li>Google Analytics - pro analýzu návštěvnosti</li>
                <li>Sociální sítě - pro sdílení obsahu</li>
                <li>Reklamní sítě - pro zobrazování relevantních reklam</li>
              </ul>

              <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6">Kontakt</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Pokud máte jakékoli otázky ohledně našich zásad používání cookies, neváhejte nás kontaktovat:
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
