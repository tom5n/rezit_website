import React, { useState, useEffect } from 'react'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const PricingSection = () => {
  const { baseDelay, threshold, rootMargin, isMobile } = useMobileOptimization()
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
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
          
          // Pricing karty postupně
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, basic: true }))
          }, baseDelay * 6)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, premium: true }))
          }, baseDelay * 9)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, addons: true }))
          }, baseDelay * 12)
          
          // CTA tlačítko
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, cta: true }))
          }, baseDelay * 15)
          
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
  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 transition-all duration-500 ${
            animations.title ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            <span className="text-primary-500">Jednoduché a férové</span> ceny
          </h2>
          <p className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-500 ${
            animations.subtitle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Žádné měsíční poplatky ani skryté náklady. Platíte jen jednou – a systém je váš.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {/* Basic Package */}
          <div className={`bg-gradient-to-br from-gray-50 to-white p-6 lg:p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 ${
            animations.basic ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="text-left">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-4">
                Lite
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary-500">od 8 000</span>
                <span className="text-lg text-gray-600 ml-2">Kč</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">Pro ty, kteří chtějí jednoduchý start.</p>
              <button className="btn-primary w-full mb-6">
                Chci vědět víc
              </button>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Online rezervace
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Kalendář služeb
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Přehled rezervací
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Upozornění e-mailem
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Základní správa klientů
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Package */}
          <div className={`bg-gradient-to-br from-primary-50 to-white p-6 lg:p-8 rounded-2xl border-2 border-primary-200 hover:shadow-lg transition-all duration-300 relative ${
            animations.premium ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Nejoblíbenější
              </span>
            </div>
            
            <div className="text-left">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-4">
                Smart
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary-500">od 15 000</span>
                <span className="text-lg text-gray-600 ml-2">Kč</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">Pro ty, kteří chtějí mít systém pod kontrolou.</p>
              <button className="btn-primary w-full mb-6">
                Chci vědět víc
              </button>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Vše z Lite +
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Nastavení služeb a cen
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  E-mailové notifikace s přizpůsobením
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Reporty o výkonnosti
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Jednoduchá správa personálu
                </li>
              </ul>
            </div>
          </div>

          {/* Add-ons Package */}
          <div className={`bg-gradient-to-br from-gray-50 to-white p-6 lg:p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 ${
            animations.addons ? 'animate-slide-in-right' : 'opacity-0 translate-x-8'
          }`}>
            <div className="text-left">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-4">
                Pro
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary-500">od 25 000</span>
                <span className="text-lg text-gray-600 ml-2">Kč</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">Pro ty, kteří chtějí plně vybavený systém.</p>
              <button className="btn-primary w-full mb-6">
                Chci vědět víc
              </button>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Vše ze Smart +
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Správa zaměstnanců a rozvrhů
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  SMS připomínky klientům
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Pokročilá analytika a statistiky
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Integrace platebních metod
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
