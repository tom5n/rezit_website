import React, { useState, useEffect } from 'react'
import { saveCalculatorData } from '../lib/calculator-db'

const Calculator = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    serviceName: '',
    monthlyFee: '',
    feePercentage: '',
    monthlyRevenue: ''
  })
  
  const [results, setResults] = useState<{
    annualCompetitorCosts: number
    annualSavings: number
    fiveYearSavings: number
    rezitPrice: number
    paybackMonths: number
    scenario: string
    showSavings: boolean
    showFiveYearSavings: boolean
    message: string
  } | null>(null)
  const [isCalculated, setIsCalculated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    calculator: false
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setIsCalculated(false)
  }

  // Kontrola, jestli jsou všechna povinná pole vyplněná
  const isFormValid = () => {
    const { monthlyFee, feePercentage, monthlyRevenue } = formData
    return monthlyFee && feePercentage && monthlyRevenue
  }


  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            const animationType = target.dataset.animation
            
            if (animationType === 'title') {
              setAnimations(prev => ({ ...prev, title: true }))
              setTimeout(() => setAnimations(prev => ({ ...prev, subtitle: true })), 200)
            } else if (animationType === 'calculator') {
              setTimeout(() => setAnimations(prev => ({ ...prev, calculator: true })), 400)
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const titleElement = document.querySelector('[data-animation="title"]')
    const calculatorElement = document.querySelector('[data-animation="calculator"]')
    
    if (titleElement) observer.observe(titleElement)
    if (calculatorElement) observer.observe(calculatorElement)

    return () => {
      if (titleElement) observer.unobserve(titleElement)
      if (calculatorElement) observer.unobserve(calculatorElement)
    }
  }, [])

  const calculateSavings = () => {
    setIsLoading(true)
    const monthlyFee = parseFloat(formData.monthlyFee) || 0
    const feePercent = parseFloat(formData.feePercentage) || 0
    const monthlyRev = parseFloat(formData.monthlyRevenue) || 0
    
    const rezitPrice = 30000 // Pevná cena našeho systému
    
    // Roční náklady na konkurenční službu
    const annualCompetitorCosts = (monthlyFee * 12) + (monthlyRev * (feePercent / 100) * 12)
    
    // Roční úspora
    const annualSavings = annualCompetitorCosts - rezitPrice
    
    // Úspora za 5 let
    const fiveYearSavings = (annualSavings * 5) - rezitPrice
    
    // Doba návratnosti (měsíce)
    const monthlySavings = annualSavings / 12
    let paybackMonths
    let scenario = ""
    let showSavings = false
    let showFiveYearSavings = false
    let message = ""
    
    if (monthlySavings > 0) {
      // Zabookuj je levnější - ukážeme úspory
      paybackMonths = Math.ceil(rezitPrice / monthlySavings)
      scenario = "savings"
      showSavings = true
      showFiveYearSavings = true
      message = ""
    } else if (Math.abs(monthlySavings) < 1000) {
      // Přibližně stejná cena - ukážeme návratnost bez úspor
      const monthlyCost = Math.abs(monthlySavings)
      paybackMonths = Math.ceil(rezitPrice / monthlyCost)
      scenario = "break_even"
      showSavings = false
      showFiveYearSavings = false
      message = "Vaše investice se vám vrátí do X měsíců. Poté už systém používáte zdarma a bez poplatků."
    } else {
      // Konkurence je levnější - ukážeme jen návratnost
      const monthlyCost = Math.abs(monthlySavings)
      paybackMonths = Math.ceil(rezitPrice / monthlyCost)
      scenario = "payback_only"
      showSavings = false
      showFiveYearSavings = false
      message = "Vaše investice se vám vrátí do X měsíců. Od té doby už neplatíte žádné další poplatky."
    }
    
    // Omezení extrémních hodnot
    paybackMonths = Math.min(paybackMonths, 120) // Max 10 let
    
    const calculationResults = {
      annualCompetitorCosts,
      annualSavings: Math.max(annualSavings, 0),
      fiveYearSavings: Math.max(fiveYearSavings, 0),
      rezitPrice,
      paybackMonths,
      scenario,
      showSavings,
      showFiveYearSavings,
      message: message.replace('X', paybackMonths.toString())
    }
    
    // Simulate loading for better UX
    setTimeout(() => {
      setResults(calculationResults)
      setIsCalculated(true)
      setIsLoading(false)
    }, 800)
    
    // Uložit do databáze pro statistiky (běží na pozadí)
    saveCalculatorData({ formData, calculationResults })
      .then(result => {
        if (result.success) {
          console.log('Data úspěšně uložena do databáze')
        } else {
          console.warn('Chyba při ukládání dat:', result.error)
        }
      })
      .catch(error => {
        console.error('Neočekávaná chyba při ukládání:', error)
      })
  }

  return (
    <>
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
      <section id="calculator" className="section-padding relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0" style={{backgroundColor: '#eff6fe'}}>
        <div className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-[300px] h-[300px] bg-primary-300 rounded-full opacity-15 blur-3xl"></div>
      </div>
      
      <div className="container-max relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
           <h2 
             data-animation="title"
             className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 transition-all duration-500 ${
               animations.title ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
             }`}
           >
             Spočítejte si <span className="text-primary-500">Vaše úspory</span>
           </h2>
           <p 
             className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-500 ${
               animations.subtitle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
             }`}
           >
              Zjistěte, kolik s <span className="font-semibold">rezit</span> ušetříte oproti konkurenčním rezervačním systémům a za jak dlouho se Vám investice vrátí.
           </p>
        </div>

        {/* Calculator */}
        <div 
          data-animation="calculator"
          className={`max-w-6xl mx-auto transition-all duration-700 ${
            animations.calculator ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}
        >
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Input Form */}
            <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-8">
                Vaše současné náklady
              </h3>
              
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název Vašeho podniku (volitelné)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      onFocus={() => setFocusedField('businessName')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full px-4 py-4 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        focusedField === 'businessName' 
                          ? 'border-primary-500 bg-primary-50/50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Např. Black Rose Barber"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název používané služby (volitelné)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.serviceName}
                      onChange={(e) => handleInputChange('serviceName', e.target.value)}
                      onFocus={() => setFocusedField('serviceName')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full px-4 py-4 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        focusedField === 'serviceName' 
                          ? 'border-primary-500 bg-primary-50/50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Např. Reservio, SimplyBook"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                 <div className="relative">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Měsíční poplatek u konkurence (Kč) *
                   </label>
                   <div className="relative">
                     <input
                       type="number"
                       value={formData.monthlyFee}
                       onChange={(e) => handleInputChange('monthlyFee', e.target.value)}
                       onFocus={() => setFocusedField('monthlyFee')}
                       onBlur={() => setFocusedField('')}
                       className={`w-full px-4 py-4 pl-12 border-2 rounded-xl transition-all duration-300 ${
                         focusedField === 'monthlyFee' 
                           ? 'border-primary-500 bg-primary-50/50' 
                           : 'border-gray-200 hover:border-gray-300'
                       }`}
                       placeholder="Např. 2500"
                       required
                     />
                     <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                     </svg>
                   </div>
                 </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procentuální poplatek z plateb (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.feePercentage}
                      onChange={(e) => handleInputChange('feePercentage', e.target.value)}
                      onFocus={() => setFocusedField('feePercentage')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full px-4 py-4 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        focusedField === 'feePercentage' 
                          ? 'border-primary-500 bg-primary-50/50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Např. 2.9"
                      required
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Měsíční obrat přes rezervační systém (Kč) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.monthlyRevenue}
                      onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                      onFocus={() => setFocusedField('monthlyRevenue')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full px-4 py-4 pl-12 border-2 rounded-xl transition-all duration-300 ${
                        focusedField === 'monthlyRevenue' 
                          ? 'border-primary-500 bg-primary-50/50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Např. 50000"
                      required
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>


                 <button
                   onClick={calculateSavings}
                   disabled={isLoading || !isFormValid()}
                   className={`w-full text-lg py-4 font-semibold rounded-full transition-colors duration-200 ${
                     isLoading || !isFormValid()
                       ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                       : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                   }`}
                 >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Počítám...</span>
                    </div>
                  ) : !isFormValid() ? (
                    'Vyplňte všechna povinná pole'
                  ) : (
                    'Spočítat úsporu'
                  )}
                </button>
              </div>
            </div>

             {/* Results */}
             <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 min-h-fit">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-8">
                Výsledky výpočtu
              </h3>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Počítám vaše úspory...</p>
                </div>
               ) : isCalculated && results ? (
                 <div className="space-y-8">
                   {/* Hlavní výsledky - kompaktní layout */}
                   <div className="space-y-0">
                     {/* Návratnost */}
                     <div className="flex items-center justify-between py-4">
                       <div>
                         <p className="text-sm text-gray-600 mb-1">Návratnost investice</p>
                         <div className="text-2xl font-bold text-gray-900">
                           {results.paybackMonths} měsíců
                         </div>
                       </div>
                       <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                         <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                       </div>
                     </div>

                     {/* Separator */}
                     <div className="border-t border-gray-200"></div>

                     {/* Roční úspora - pouze pokud je pozitivní */}
                     {results.showSavings && (
                       <>
                         <div className="flex items-center justify-between py-4">
                           <div>
                             <p className="text-sm text-gray-600 mb-1">Roční úspora</p>
                             <div className="text-2xl font-bold text-gray-900">
                               {results.annualSavings.toLocaleString()} Kč
                             </div>
                           </div>
                           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                             <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                             </svg>
                           </div>
                         </div>
                         <div className="border-t border-gray-200"></div>
                       </>
                     )}

                     {/* Úspora za 5 let - pouze pokud je pozitivní */}
                     {results.showFiveYearSavings && (
                       <div className="flex items-center justify-between py-4">
                         <div>
                           <p className="text-sm text-gray-600 mb-1">Úspora za 5 let</p>
                           <div className="text-2xl font-bold text-gray-900">
                             {results.fiveYearSavings.toLocaleString()} Kč
                           </div>
                         </div>
                         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                           <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                           </svg>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Zpráva podle scénáře */}
                   {results.message && (
                     <div className="p-4 bg-gray-50 rounded-xl text-left">
                       <p className="text-gray-700 font-medium leading-relaxed">{results.message}</p>
                     </div>
                   )}

                   {/* CTA */}
                   <div className="pt-4">
                     <a 
                       href="#contact" 
                       className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-heading font-semibold py-2.5 px-5 rounded-full border border-gray-300 hover:border-primary-500 transition-all duration-300"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                       </svg>
                       Kontaktujte nás
                     </a>
                   </div>
                 </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Vyplňte formulář a výsledky se zobrazí automaticky</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

export default Calculator
