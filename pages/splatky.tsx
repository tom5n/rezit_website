import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import SEO from '@/components/SEO'
import { useMobileOptimization } from '@/lib/useMobileOptimization'

const packages = [
  { name: 'LITE', price: 7990 },
  { name: 'SMART', price: 14990, isNew: true },
  { name: 'PRO', price: 24990, isNew: true }
]

export default function Splatky() {
  const router = useRouter()
  const { baseDelay, threshold, rootMargin, supportsIntersectionObserver, isMobile } = useMobileOptimization()
  const [selectedPackage, setSelectedPackage] = useState(packages[0])
  const [monthlyPayment, setMonthlyPayment] = useState(449)
  const [months, setMonths] = useState(18)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null)
  const [faqShowAll, setFaqShowAll] = useState(false)
  const [faqAnimations, setFaqAnimations] = useState({
    title: false,
    subtitle: false,
    faqs: false,
    showMore: false
  })
  const [faqHasAnimated, setFaqHasAnimated] = useState(false)

  const faqs = [
    {
      id: 1,
      question: "Můžu to doplatit dřív?",
      answer: "Kdykoliv a bez jakýchkoliv poplatků. Jakmile doplatíte zbývající částku, systém přechází do Vašeho vlastnictví."
    },
    {
      id: 2,
      question: "Co se stane po poslední splátce?",
      answer: "Systém přechází do Vašeho vlastnictví a měsíční splátky automaticky končí. Od té chvíle už neplatíte nic."
    },
    {
      id: 3,
      question: "Kdy můžu začít systém používat?",
      answer: "Ihned po první splátce. Systém Vám spustíme a můžete ho začít používat, zatímco ho splácíte."
    },
    {
      id: 4,
      question: "Je kalkulačka přesná?",
      answer: "Kalkulačka je pouze orientační. Finální celková částka se může lišit, protože nezahrnuje částku za odvedenou práci, která se odvíjí od náročnosti projektu. Po konzultaci Vám stanovíme přesnou finální částku."
    },
    {
      id: 5,
      question: "Jsou nějaké skryté poplatky nebo úroky?",
      answer: "Ne, žádné. Jakmile je stanovena finální částka, nemění se bez ohledu na délku splácení. Nejsme banka, takže žádné úroky ani skryté poplatky. Cena je pevná a transparentní."
    },
    {
      id: 6,
      question: "Co když nebudu moci splácet?",
      answer: "Kontaktujte nás a domluvíme se na individuálním řešení. Vždy se snažíme najít způsob, jak Vám pomoci."
    },
    {
      id: 7,
      question: "Můžu změnit výši měsíční splátky během splácení?",
      answer: "Ano, můžete. Kontaktujte nás a upravíme splátkový kalendář podle Vašich aktuálních možností."
    }
  ]

  const toggleFAQ = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index)
  }

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push('/').then(() => {
      setTimeout(() => {
        const element = document.getElementById('contact')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    })
  }

  useEffect(() => {
    const calculatedMonths = Math.ceil(selectedPackage.price / monthlyPayment)
    setMonths(Math.min(Math.max(calculatedMonths, 6), 36))
  }, [selectedPackage.price, monthlyPayment])

  const handleMonthsChange = (newMonths: number) => {
    setMonths(newMonths)
    const newPayment = Math.ceil(selectedPackage.price / newMonths)
    setMonthlyPayment(newPayment)
  }

  useEffect(() => {
    const defaultPayment = Math.ceil(selectedPackage.price / 18)
    setMonthlyPayment(defaultPayment)
  }, [selectedPackage])

  const minPayment = Math.ceil(selectedPackage.price / 36)
  const maxPayment = Math.ceil(selectedPackage.price / 6)
  const totalPrice = selectedPackage.price
  const progress = Math.min((monthlyPayment * months) / totalPrice, 1)

  useEffect(() => {
    // Na mobilních zařízeních animace vůbec nespouštíme
    if (isMobile) {
      setFaqAnimations({
        title: true,
        subtitle: true,
        faqs: true,
        showMore: true
      })
      setFaqHasAnimated(true)
      return
    }

    if (!supportsIntersectionObserver) {
      // Fallback pro prohlížeče bez podpory IntersectionObserver
      setTimeout(() => {
        setFaqAnimations(prev => ({ ...prev, title: true }))
      }, baseDelay)
      
      setTimeout(() => {
        setFaqAnimations(prev => ({ ...prev, subtitle: true }))
      }, baseDelay * 3)
      
      setTimeout(() => {
        setFaqAnimations(prev => ({ ...prev, faqs: true }))
      }, baseDelay * 6)
      
      setTimeout(() => {
        setFaqAnimations(prev => ({ ...prev, showMore: true }))
      }, baseDelay * 9)
      
      setFaqHasAnimated(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !faqHasAnimated) {
          setTimeout(() => {
            setFaqAnimations(prev => ({ ...prev, title: true }))
          }, baseDelay)
          
          setTimeout(() => {
            setFaqAnimations(prev => ({ ...prev, subtitle: true }))
          }, baseDelay * 3)
          
          setTimeout(() => {
            setFaqAnimations(prev => ({ ...prev, faqs: true }))
          }, baseDelay * 6)
          
          setTimeout(() => {
            setFaqAnimations(prev => ({ ...prev, showMore: true }))
          }, baseDelay * 9)
          
          setFaqHasAnimated(true)
        }
      },
      { threshold, rootMargin }
    )

    const element = document.getElementById('splatky-faq')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [faqHasAnimated, baseDelay, threshold, rootMargin, supportsIntersectionObserver, isMobile])

  return (
    <>
      <SEO
        title="Chytré splátky | rezit"
        description="Vlastní rezervační systém za cenu jednoho střihu měsíčně. Rozjeďte svůj salon hned. Cenu si rozložte podle svých možností bez úroků, navýšení a bankovního papírování."
        keywords="splátky, rezervační systém, financování, bez úroků"
        url="https://rezit.cz/splatky"
      />
      <Layout>
        <section className="min-h-screen bg-white py-12 sm:py-16 lg:py-24">
          <div className="container-max px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-6xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6">
                Za cenu <span className="text-primary-500">jednoho střihu měsíčně</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-6xl mx-auto leading-relaxed">
                Rozjeďte svůj salon hned. Cenu si rozložte podle svých možností bez úroků, navýšení a bankovního papírování.
              </p>
            </div>

            <div className="max-w-6xl mx-auto mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Vyberte balíček</label>
                    <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1.5 shadow-inner w-full">
                      <div 
                        className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-white shadow-md transition-all duration-300 ease-out"
                        style={{ 
                          width: `calc(${100 / packages.length}% - 6px)`,
                          transform: `translateX(${(packages.findIndex(p => p.name === selectedPackage.name)) * 100}%)`
                        }}
                      />
                      {packages.map((pkg) => (
                        <button
                          key={pkg.name}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`relative z-10 flex-1 px-4 py-3 rounded-full font-heading font-semibold text-sm transition-colors duration-300 ${
                            selectedPackage.name === pkg.name
                              ? 'text-black'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          {pkg.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Měsíční splátka</label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="number"
                          value={monthlyPayment}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            const clamped = Math.min(Math.max(value, minPayment), maxPayment)
                            setMonthlyPayment(clamped)
                          }}
                          onBlur={() => setIsEditing(false)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setIsEditing(false)
                            }
                          }}
                          className="w-full text-6xl font-bold text-primary-500 text-center bg-transparent border-none outline-none focus:ring-0"
                          min={minPayment}
                          max={maxPayment}
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setIsEditing(true)
                            setTimeout(() => inputRef.current?.focus(), 0)
                          }}
                          className="text-6xl font-bold text-primary-500 text-center cursor-pointer hover:opacity-80 transition-opacity py-4"
                        >
                          {monthlyPayment.toLocaleString('cs-CZ')} Kč
                        </div>
                      )}
                    </div>

                    <input
                      type="range"
                      min={minPayment}
                      max={maxPayment}
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-6 slider"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((monthlyPayment - minPayment) / (maxPayment - minPayment)) * 100}%, #E5E7EB ${((monthlyPayment - minPayment) / (maxPayment - minPayment)) * 100}%, #E5E7EB 100%)`
                      }}
                    />

                    <div className="flex gap-3 mt-6">
                      {[6, 12, 18].map((m) => (
                        <button
                          key={m}
                          onClick={() => handleMonthsChange(m)}
                          className={`flex-1 px-4 py-2 rounded-full font-heading font-semibold text-sm transition-all duration-300 ${
                            months === m
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {m} měsíců
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-gray-800 mb-6 transition-all duration-300">
                      Systém bude Váš za <span className="text-primary-500">{months}</span> měsíců
                    </h2>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Celkem zaplatíte:</span>
                      <span className="text-2xl font-bold text-gray-800">{totalPrice.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Úrok:</span>
                      <span className="text-xl font-semibold text-green-600">0%</span>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Po splacení:</span>
                        <span className="text-xl font-bold text-primary-500">0 Kč / měsíčně navždy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-2xl mx-auto text-center">
              <a
                href="/"
                onClick={handleContactClick}
                className="btn-primary text-lg px-8 py-4 mb-4 inline-block"
              >
                Domluvme se
              </a>
            </div>
          </div>
        </section>

        <section id="splatky-faq" className="section-padding bg-white">
          <div className="container-max">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 ${
                faqAnimations.title ? 'animate-fade-in-up' : 'pre-animate-hidden'
              }`}>
                Často kladené <span className="text-primary-500">otázky</span> (FAQ)
              </h2>
              <p className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${
                faqAnimations.subtitle ? 'animate-fade-in-up' : 'pre-animate-hidden'
              }`}>
                Najděte odpovědi na nejčastější otázky o <span className="font-semibold">splátkách</span>.
              </p>
            </div>

            {/* FAQ Accordion */}
            <div className={`max-w-4xl mx-auto ${
              faqAnimations.faqs ? 'animate-fade-in-up' : 'pre-animate-hidden'
            }`}>
              <div className="space-y-6">
                {(faqShowAll ? faqs : faqs.slice(0, 3)).map((faq, index) => (
                  <div key={faq.id} className="border-b border-gray-200 pb-4">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full py-4 transition-all duration-200 flex items-center justify-between hover:text-primary-600 group"
                    >
                      <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 pr-4 text-left">
                        {faq.question}
                      </h3>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-all duration-200 group-hover:scale-125 group-hover:text-primary-500 ${
                          faqOpenIndex === index ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${
                      faqOpenIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="pb-4">
                        <p className="text-gray-600 leading-relaxed text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show More Button */}
              {!faqShowAll && (
                <div className={`text-center mt-8 ${
                  faqAnimations.showMore ? 'animate-fade-in-up' : 'pre-animate-hidden'
                }`}>
                  <button
                    onClick={() => setFaqShowAll(true)}
                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200 mx-auto"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3B82F6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3B82F6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </Layout>
    </>
  )
}

