import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const PricingSection = () => {
  const { baseDelay, threshold, rootMargin, isMobile } = useMobileOptimization()
  const [paymentType, setPaymentType] = useState<'jednorazove' | 'splatky'>('jednorazove')
  const firstButtonRef = useRef<HTMLButtonElement>(null)
  const secondButtonRef = useRef<HTMLButtonElement>(null)
  const [sliderStyle, setSliderStyle] = useState({ width: 0, transform: 'translateX(0)' })
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    toggle: false,
    basic: false,
    premium: false,
    addons: false,
    cta: false
  })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Na mobilních zařízeních animace vůbec nespouštíme
    if (isMobile) {
      setAnimations({
        title: true,
        subtitle: true,
        toggle: true,
        basic: true,
        premium: true,
        addons: true,
        cta: true
      })
      setHasAnimated(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Nadpis
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, title: true }))
          }, baseDelay)
          
          // Podnadpis
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, subtitle: true }))
          }, baseDelay * 3)
          
          // Přepínač
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, toggle: true }))
          }, baseDelay * 5)
          
          // Pricing karty postupně
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, basic: true }))
          }, baseDelay * 7)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, premium: true }))
          }, baseDelay * 10)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, addons: true }))
          }, baseDelay * 13)
          
          // CTA tlačítko
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, cta: true }))
          }, baseDelay * 16)
          
          setHasAnimated(true)
        }
      },
      { threshold, rootMargin }
    )

    const element = document.getElementById('pricing')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [hasAnimated, baseDelay, threshold, rootMargin, isMobile])

  // Aktualizace pozice slideru při změně paymentType nebo velikosti okna
  useEffect(() => {
    const updateSliderPosition = () => {
      if (firstButtonRef.current && secondButtonRef.current) {
        const activeButton = paymentType === 'jednorazove' 
          ? firstButtonRef.current 
          : secondButtonRef.current
        const firstButton = firstButtonRef.current
        
        const width = activeButton.offsetWidth
        const transform = paymentType === 'jednorazove' 
          ? 'translateX(0)' 
          : `translateX(${firstButton.offsetWidth}px)`
        setSliderStyle({ width, transform })
      }
    }

    // Malé zpoždění, aby se DOM stihl vykreslit
    const timeoutId = setTimeout(updateSliderPosition, 10)
    window.addEventListener('resize', updateSliderPosition)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateSliderPosition)
    }
  }, [paymentType])
  return (
    <section id="pricing" className="section-padding bg-white dark:bg-[#1f1f23]">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 dark:text-white mb-6 transition-all duration-500 ${
            animations.title ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            <span className="text-primary-500">Jednoduché a férové</span> ceny
          </h2>
          <p className={`text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-500 ${
            animations.subtitle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Žádné měsíční poplatky ani skryté náklady. Platíte jen jednou – a systém je váš.
          </p>
        </div>

        {/* Payment Type Toggle */}
        <div className={`flex justify-center mb-12 transition-all duration-500 ${
          animations.toggle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          <div className="relative inline-flex items-center bg-gray-100 dark:bg-white/10 rounded-full p-1.5 shadow-inner">
            {/* Animated Background */}
            <div 
              className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-white dark:bg-white/10 dark:backdrop-blur-sm shadow-md transition-all duration-300 ease-out"
              style={{ 
                width: sliderStyle.width || 'auto',
                transform: sliderStyle.transform,
                willChange: 'transform, width'
              }}
            />
            
            {/* Options */}
            <button
              ref={firstButtonRef}
              onClick={() => setPaymentType('jednorazove')}
              className={`relative z-10 px-6 py-3 rounded-full font-heading font-semibold text-sm sm:text-base transition-colors duration-300 ${
                paymentType === 'jednorazove'
                  ? 'text-black dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              Jednorázově
            </button>
            <button
              ref={secondButtonRef}
              onClick={() => setPaymentType('splatky')}
              className={`relative z-10 px-6 py-3 rounded-full font-heading font-semibold text-sm sm:text-base transition-colors duration-300 ${
                paymentType === 'splatky'
                  ? 'text-black dark:text-white'
                  : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              Chytré splátky
              <span className={`absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-0.5 rounded-full transition-all duration-150 ease-out ${
                paymentType === 'splatky' 
                  ? 'opacity-0 scale-95 pointer-events-none' 
                  : 'opacity-100 scale-100'
              }`}>
                NOVINKA
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {/* Basic Package */}
          <div className={`bg-gradient-to-br from-gray-50 to-white dark:from-white/10 dark:to-white/10 dark:backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-white/20 hover:shadow-lg transition-all duration-300 ${
            animations.basic ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="text-left">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 dark:text-white mb-4">
                Lite
              </h3>
              <div className="mb-6">
                {paymentType === 'jednorazove' ? (
                  <>
                    <span className="text-4xl font-bold text-primary-500">od 7 990</span>
                    <span className="text-lg text-gray-600 dark:text-gray-300 ml-2">Kč</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-primary-500">od 449</span>
                    <span className="text-lg text-gray-600 dark:text-gray-300 ml-2">Kč / měsíc <span className="text-base">(18 měsíců)</span></span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Pro ty, kteří chtějí jednoduchý start.</p>
              <button 
                className="btn-primary w-full mb-3"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Chci vědět víc
              </button>
              {paymentType === 'splatky' && (
                <Link 
                  href="/splatky"
                  className="block text-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 underline transition-colors duration-300 mb-6"
                >
                  Chci splátky na míru
                </Link>
              )}
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Online rezervace
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Kalendář služeb
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Přehled rezervací
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Upozornění e-mailem
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Základní správa klientů
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Package */}
          <div className={`bg-gradient-to-br from-primary-50 to-white dark:from-white/10 dark:to-white/10 dark:backdrop-blur-sm p-6 lg:p-8 rounded-2xl border-2 border-primary-200 dark:border-white/20 hover:shadow-lg transition-all duration-300 relative ${
            animations.premium ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-500 dark:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Nejoblíbenější
              </span>
            </div>
            
            <div className="text-left">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 dark:text-white mb-4">
                Smart
              </h3>
              <div className="mb-6">
                {paymentType === 'jednorazove' ? (
                  <>
                    <span className="text-4xl font-bold text-primary-500">od 14 990</span>
                    <span className="text-lg text-gray-600 dark:text-gray-300 ml-2">Kč</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-primary-500">od 890</span>
                    <span className="text-lg text-gray-600 dark:text-gray-300 ml-2">Kč / měsíc <span className="text-base">(18 měsíců)</span></span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Pro ty, kteří chtějí mít systém pod kontrolou.</p>
              <button 
                className="btn-primary w-full mb-3"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Chci vědět víc
              </button>
              {paymentType === 'splatky' && (
                <Link 
                  href="/splatky"
                  className="block text-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 underline transition-colors duration-300 mb-6"
                >
                  Chci splátky na míru
                </Link>
              )}
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Vše z Lite +
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Nastavení služeb a cen
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  E-mailové notifikace s přizpůsobením
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Reporty o výkonnosti
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Jednoduchá správa personálu
                </li>
              </ul>
            </div>
          </div>

          {/* Add-ons Package */}
          <div className={`bg-gradient-to-br from-gray-50 to-white dark:from-white/10 dark:to-white/10 dark:backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-white/20 hover:shadow-lg transition-all duration-300 ${
            animations.addons ? 'animate-slide-in-right' : 'opacity-0 translate-x-8'
          }`}>
            <div className="text-left">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 dark:text-white mb-4">
                Pro
              </h3>
              <div className="mb-6">
                {paymentType === 'jednorazove' ? (
                  <>
                    <span className="text-4xl font-bold text-primary-500">od 24 990</span>
                    <span className="text-lg text-gray-600 dark:text-gray-300 ml-2">Kč</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-primary-500">od 1 490</span>
                    <span className="text-lg text-gray-600 dark:text-gray-300 ml-2">Kč / měsíc <span className="text-base">(18 měsíců)</span></span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Pro ty, kteří chtějí plně vybavený systém.</p>
              <button 
                className="btn-primary w-full mb-3"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Chci vědět víc
              </button>
              {paymentType === 'splatky' && (
                <Link 
                  href="/splatky"
                  className="block text-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 underline transition-colors duration-300 mb-6"
                >
                  Chci splátky na míru
                </Link>
              )}
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Vše ze Smart +
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Správa zaměstnanců a rozvrhů
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  SMS připomínky klientům
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Pokročilá analytika a statistiky
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Prioritní podpora a zákaznický servis
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default PricingSection
