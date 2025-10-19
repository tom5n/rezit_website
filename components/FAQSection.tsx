import React, { useState, useEffect } from 'react'

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    faqs: false,
    showMore: false
  })
  const [hasAnimated, setHasAnimated] = useState(false)

  const faqs = [
    {
      id: 1,
      question: "Kolik systémy rezit stojí?",
      answer: "Za rezit zaplatíte jednorázovou částku – žádné měsíční poplatky ani provize z plateb. Investice se Vám často vrátí už během pár měsíců používání."
    },
    {
      id: 2,
      question: "Jak rychle můžu mít svůj rezervační systém spuštěný?",
      answer: "Obvykle do 3–5 pracovních dnů od dodání potřebných informací. Nemusíte čekat týdny – Váš podnik může začít přijímat rezervace prakticky okamžitě."
    },
    {
      id: 3,
      question: "Je možné systém upravit přesně na míru mému podnikání?",
      answer: "Určitě! Systémy rezit nejsou univerzální šablony, ale flexibilní řešení na míru. Přizpůsobíme je přesně Vašim potřebám – ať už jde o barbershop, masáže, kosmetiku nebo jiné služby."
    },
    {
      id: 4,
      question: "Můžou se moji zákazníci rezervovat i přes mobil?",
      answer: "Samozřejmě. Rezervační systém je plně responzivní a funguje skvěle na počítačích, tabletech i mobilních telefonech."
    },
    {
      id: 5,
      question: "Nabízíte technickou podporu?",
      answer: "Ano. Součástí je základní podpora v ceně. Pokud chcete dlouhodobou technickou správu a aktualizace, nabízíme i prémiovou podporu formou měsíčního paušálu."
    },
    {
      id: 6,
      question: "Co když už používám jiný rezervační systém?",
      answer: "Žádný problém. Pomůžeme Vám s přechodem a navíc si díky kalkulačce úspor můžete snadno spočítat, za jak dlouho se Vám investice do rezit vrátí."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, title: true }))
          }, 100)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, subtitle: true }))
          }, 300)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, faqs: true }))
          }, 600)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, showMore: true }))
          }, 900)
          
          setHasAnimated(true)
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
    )

    const element = document.getElementById('faq')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 transition-all duration-500 ${
            animations.title ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Často kladené <span className="text-primary-500">otázky</span> (FAQ)
          </h2>
          <p className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-500 ${
            animations.subtitle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Najděte odpovědi na nejčastější otázky o systémech <span className="font-semibold">rezit</span>.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className={`max-w-4xl mx-auto transition-all duration-500 ${
          animations.faqs ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-6">
            {(showAll ? faqs : faqs.slice(0, 3)).map((faq, index) => (
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
                      openIndex === index ? 'rotate-180' : ''
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
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
          {!showAll && (
            <div className={`text-center mt-8 transition-all duration-500 ${
              animations.showMore ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}>
              <button
                onClick={() => setShowAll(true)}
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
  )
}

export default FAQSection
