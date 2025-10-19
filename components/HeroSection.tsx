import React, { useState, useEffect } from 'react'

const HeroSection = () => {
  const [animations, setAnimations] = useState({
    title1: false,
    title2: false,
    description: false,
    trust1: false,
    trust2: false,
    trust3: false,
    image: false,
    button1: false,
    button2: false
  })
  const [imageEnlarged, setImageEnlarged] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimations(prev => ({ ...prev, title1: true })), 100),
      setTimeout(() => setAnimations(prev => ({ ...prev, title2: true })), 300),
      setTimeout(() => setAnimations(prev => ({ ...prev, description: true })), 500),
      setTimeout(() => setAnimations(prev => ({ ...prev, image: true })), 600),   // Obrázek dřív!
      setTimeout(() => setAnimations(prev => ({ ...prev, trust1: true })), 700),  // První trust
      setTimeout(() => setAnimations(prev => ({ ...prev, trust2: true })), 800),  // Druhý trust
      setTimeout(() => setAnimations(prev => ({ ...prev, trust3: true })), 900),  // Třetí trust
      setTimeout(() => setAnimations(prev => ({ ...prev, button1: true })), 1200),
      setTimeout(() => setAnimations(prev => ({ ...prev, button2: true })), 1400),
      // Zvětšení obrázku po dokončení všech animací
      setTimeout(() => setImageEnlarged(true), 1800)
    ]

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [])
  return (
    <section id="home" className="min-h-[80vh] flex items-center relative overflow-hidden pt-16 md:pt-0">
      {/* Gradient background with circular effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-white">
        <div className="absolute top-1/4 -right-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-primary-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] bg-primary-100 rounded-full opacity-25 blur-3xl"></div>
      </div>
      <div className="container-max relative z-10 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left px-6 sm:px-8 md:px-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 leading-tight mb-6 sm:mb-8 text-left">
              <span className={`inline-block whitespace-nowrap transition-all duration-1000 ${
                animations.title1 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-12'
              }`}>
                Rezervační systém
              </span>
              <br />
              <span className={`inline-block transition-all duration-1000 ${
                animations.title2 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-12'
              }`}>
                <span className="text-primary-500">bez měsíčních poplatků</span>
              </span>
            </h1>
            
            <p className={`text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-0 font-sans leading-relaxed text-left transition-all duration-1000 ${
              animations.description ? 'animate-slide-in-left' : 'opacity-0 -translate-x-12'
            }`}>
              Ušetřete tisíce ročně a mějte řešení šité na míru Vašemu podnikání.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-2 sm:gap-6 justify-center lg:justify-start mb-12 sm:mb-16 w-full">
              <div className={`transition-all duration-600 ${
                animations.button1 ? 'animate-quick-popup' : 'opacity-0 scale-30 translate-y-8'
              }`}>
                <button 
                  className="btn-primary text-base sm:text-lg lg:text-xl px-4 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 w-full whitespace-nowrap font-semibold lg:font-semibold hover:scale-105 transition-transform duration-300"
                  onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                >
                  Kontaktujte nás
                </button>
              </div>
              <div className={`transition-all duration-600 ${
                animations.button2 ? 'animate-quick-popup' : 'opacity-0 scale-30 translate-y-8'
              }`}>
                <a 
                  href="#calculator" 
                  className="btn-secondary text-base sm:text-lg lg:text-xl px-4 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 w-full whitespace-nowrap inline-block text-center font-semibold lg:font-semibold hover:scale-105 transition-transform duration-300"
                >
                  Kolik ušetřím?
                </a>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 lg:flex lg:flex-row lg:flex-nowrap items-center justify-center lg:justify-start gap-2 sm:gap-4 lg:gap-8 text-xs sm:text-base text-gray-500">
              <div className={`flex items-center gap-2 sm:gap-3 whitespace-nowrap transition-all duration-600 ${
                animations.trust1 ? 'animate-bounce-in' : 'opacity-0 scale-50'
              }`}>
                <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Žádné měsíční poplatky
              </div>
              <div className={`flex items-center gap-2 sm:gap-3 whitespace-nowrap transition-all duration-600 ${
                animations.trust2 ? 'animate-bounce-in' : 'opacity-0 scale-50'
              }`}>
                <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Na míru vašim službám
              </div>
              <div className={`flex items-center gap-2 sm:gap-3 whitespace-nowrap col-span-2 lg:col-span-1 justify-center lg:justify-start transition-all duration-600 ${
                animations.trust3 ? 'animate-bounce-in' : 'opacity-0 scale-50'
              }`}>
                <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Okamžitá implementace
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className={`relative transition-all duration-1000 ${
            animations.image ? 'animate-slide-in-right' : 'opacity-0 translate-x-12'
          }`}>
            <img 
              src="/images/heroimg_rezit.webp" 
              alt="Zabookuj - Rezervační systém" 
              className={`w-full h-auto mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl transition-transform duration-1000 ${
                imageEnlarged ? 'scale-105' : 'scale-100'
              } hover:scale-110`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

// CSS pro animace
const styles = `
  @keyframes slide-in-left {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slide-in-right {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes quick-popup {
    0% {
      opacity: 0;
      transform: scale(0.3) translateY(30px);
    }
    60% {
      opacity: 1;
      transform: scale(1.1) translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-slide-in-left {
    animation: slide-in-left 0.8s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.8s ease-out forwards;
  }
  
  .animate-quick-popup {
    animation: quick-popup 0.6s ease-out forwards;
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.6s ease-out forwards;
  }
`

// Přidáme styly do head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
