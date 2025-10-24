import React, { useState, useEffect } from 'react'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const ProcessSteps = () => {
  const { baseDelay, threshold, rootMargin } = useMobileOptimization()
  const [animations, setAnimations] = useState({
    title: false,
    step1: false,
    step2: false,
    step3: false
  })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Nadpis
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, title: true }))
          }, baseDelay)
          
          // Kroky postupně
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, step1: true }))
          }, baseDelay * 4)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, step2: true }))
          }, baseDelay * 7)
          
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, step3: true }))
          }, baseDelay * 10)
          
          setHasAnimated(true)
        }
      },
      { threshold, rootMargin }
    )

    const element = document.getElementById('process')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [hasAnimated, baseDelay, threshold, rootMargin])
  return (
    <section id="process" className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 ${
            animations.title ? 'animate-fade-in-up' : 'pre-animate-hidden'
          }`}>
            Jednoduchý proces, <span className="text-primary-500">rychlé výsledky</span>
          </h2>
        </div>

        {/* Steps - Design s ikony + čísla */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className={`group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 ${
            animations.step1 ? 'animate-slide-in-left' : 'pre-animate-hidden-left'
          }`}>
            {/* Velké číslo v pozadí */}
            <div className="absolute top-4 right-4 text-8xl font-bold text-primary-200 group-hover:text-primary-600 transition-colors duration-500">
              01
            </div>

            {/* Ikona */}
            <div className="relative z-10 w-20 h-20 mb-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            {/* Obsah */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-6 group-hover:text-primary-600 transition-colors duration-300">
                Domluvíme
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                Probereme Vaše služby, pracovní dobu a specifické požadavky pro Váš rezervační systém.
              </p>
              
              {/* Accent line */}
              <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 ${
            animations.step2 ? 'animate-fade-in-up' : 'pre-animate-hidden'
          }`}>
            {/* Velké číslo v pozadí */}
            <div className="absolute top-4 right-4 text-8xl font-bold text-primary-200 group-hover:text-primary-600 transition-colors duration-500">
              02
            </div>

            {/* Ikona */}
            <div className="relative z-10 w-20 h-20 mb-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>

            {/* Obsah */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-6 group-hover:text-primary-600 transition-colors duration-300">
                Vytvoříme
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                Vytvoříme rezervační systém šitý na míru Vašemu podnikání během 3-5 dnů.
              </p>
              
              {/* Accent line */}
              <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 ${
            animations.step3 ? 'animate-slide-in-right' : 'pre-animate-hidden-right'
          }`}>
            {/* Velké číslo v pozadí */}
            <div className="absolute top-4 right-4 text-8xl font-bold text-primary-200 group-hover:text-primary-600 transition-colors duration-500">
              03
            </div>

            {/* Ikona */}
            <div className="relative z-10 w-20 h-20 mb-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Obsah */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-6 group-hover:text-primary-600 transition-colors duration-300">
                Spustíme
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                Začnete přijímat rezervace okamžitě a ušetříte tisíce korun ročně.
              </p>
              
              {/* Accent line */}
              <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProcessSteps
