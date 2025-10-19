import React, { useState, useEffect } from 'react'

const WhyChooseUs = () => {
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    box1: false,
    box2: false,
    box3: false,
    box4: false,
    box5: false,
    cta: false
  })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Nadpis
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, title: true }))
          }, 50)
          
          // Podnadpis
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, subtitle: true }))
          }, 200)
          
          // 1. a 3. box zároveň
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, box1: true, box3: true }))
          }, 400)
          
          // 2. box později
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, box2: true }))
          }, 700)
          
          // Spodní 2 boxy zároveň
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, box4: true, box5: true }))
          }, 1000)
          
          // CTA tlačítka
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, cta: true }))
          }, 1300)
          
          setHasAnimated(true)
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
    )

    const element = document.getElementById('features')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const benefits = [
    {
      id: 1,
      title: "Bez měsíčních poplatků",
      description: "Ušetříte tisíce ročně. Zaplatíte jednorázově a systém je Váš napořád.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Rychlá implementace",
      description: "Váš rezervační systém spustíme už do 3–5 dnů. Nemusíte čekat týdny na spuštění.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Žádné univerzální šablony",
      description: "Nevytváříme systémy ze šablon. Každý rezervační systém je navržen přesně podle potřeb Vašeho podniku.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "Bezpečnost a spolehlivost",
      description: "Vaše data jsou v bezpečí. Systém běží stabilně bez výpadků a problémů.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 5,
      title: "Jedinečný vzhled",
      description: "Každý systém má svůj vlastní design. Žádné kopie nebo šablony - jen Vaše představy.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  return (
    <section id="features" className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 transition-all duration-500 ${
            animations.title ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Proč je <span className="text-primary-500">rezit</span> lepší než ostatní?
          </h2>
          <p className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-500 ${
            animations.subtitle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Na rozdíl od jiných rezervačních systémů platíte jen jednou – a systém je Váš. 
            Bez měsíčních poplatků, bez skrytých nákladů.
          </p>
        </div>

        {/* Benefits Grid - 3+2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
          {/* První řada - 3 karty */}
          {benefits.slice(0, 3).map((benefit, index) => {
            let animationClass = '';
            if (index === 0) {
              animationClass = animations.box1 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8';
            } else if (index === 1) {
              animationClass = animations.box2 ? 'animate-fade-in-up' : 'opacity-0 translate-y-8';
            } else if (index === 2) {
              animationClass = animations.box3 ? 'animate-slide-in-right' : 'opacity-0 translate-x-8';
            }
            
            return (
            <div
              key={benefit.id}
              className={`bg-white rounded-xl border border-primary-100 p-6 hover:shadow-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-500 ${animationClass}`}
            >
              {/* Ikona */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 text-primary-600">
                {benefit.icon}
              </div>
              
              {/* Obsah */}
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
            );
          })}
        </div>
        
        {/* Druhá řada - 2 karty stejně široké jako 3 nahoře */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
          {benefits.slice(3, 5).map((benefit, index) => {
            let animationClass = '';
            if (index === 0) {
              animationClass = animations.box4 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8';
            } else if (index === 1) {
              animationClass = animations.box5 ? 'animate-slide-in-right' : 'opacity-0 translate-x-8';
            }
            
            return (
            <div
              key={benefit.id}
              className={`bg-white rounded-xl border border-primary-100 p-6 hover:shadow-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-500 ${animationClass}`}
            >
              {/* Ikona */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 text-primary-600">
                {benefit.icon}
              </div>
              
              {/* Obsah */}
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className={`flex flex-row gap-3 sm:gap-6 justify-center items-center transition-all duration-500 ${
          animations.cta ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          <button 
            className="btn-primary text-sm sm:text-lg lg:text-xl px-4 sm:px-10 lg:px-12 py-2.5 sm:py-4 lg:py-5 whitespace-nowrap font-semibold hover:scale-105 transition-transform duration-300"
            onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
          >
            Kontaktujte nás
          </button>
          <a 
            href="#showcase" 
            className="btn-secondary text-sm sm:text-lg lg:text-xl px-4 sm:px-10 lg:px-12 py-2.5 sm:py-4 lg:py-5 whitespace-nowrap font-semibold inline-block text-center hover:scale-105 transition-transform duration-300"
            onClick={(e) => { e.preventDefault(); document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' }); }}
          >
            Prohlédnout Portfolio
          </a>
        </div>
      </div>

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
    </section>
  )
}

export default WhyChooseUs
