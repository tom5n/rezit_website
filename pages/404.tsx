import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const Custom404 = () => {
  const { baseDelay, isMobile } = useMobileOptimization()
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    illustration: false,
    buttons: false
  })

  useEffect(() => {
    if (isMobile) {
      setAnimations({
        title: true,
        subtitle: true,
        illustration: true,
        buttons: true
      })
      return
    }

    const timers = [
      setTimeout(() => setAnimations(prev => ({ ...prev, title: true })), baseDelay),
      setTimeout(() => setAnimations(prev => ({ ...prev, subtitle: true })), baseDelay * 2),
      setTimeout(() => setAnimations(prev => ({ ...prev, illustration: true })), baseDelay * 3),
      setTimeout(() => setAnimations(prev => ({ ...prev, buttons: true })), baseDelay * 4)
    ]

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [baseDelay, isMobile])

  return (
    <>
      <Head>
        <title>404 - Stránka nenalezena | rezit</title>
        <meta name="description" content="Stránka, kterou hledáte, nebyla nalezena. Vraťte se na hlavní stránku rezit." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-white flex items-center justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 -right-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] bg-primary-100 rounded-full opacity-25 blur-3xl"></div>
        
        <div className="container-max relative z-10 text-center px-4">
          {/* 404 Illustration */}
          <div className={`mb-8 ${animations.illustration ? 'animate-bounce-in' : 'pre-animate-hidden-scale'}`}>
            <div className="relative inline-block">
              {/* Large 404 text */}
              <div className="text-[120px] sm:text-[160px] lg:text-[200px] font-heading font-bold text-primary-500 opacity-20 select-none">
                404
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-primary-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-2xl mx-auto">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-gray-800 mb-6 ${
              animations.title ? 'animate-fade-in-up' : 'pre-animate-hidden'
            }`}>
              Stránka, kterou hledáte, <span className="text-primary-500">neexistuje</span>
            </h1>
            
            <p className={`text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed ${
              animations.subtitle ? 'animate-fade-in-up' : 'pre-animate-hidden'
            }`}>
              Možná byla odstraněna, přejmenována nebo jste zadali špatnou adresu.
            </p>

            {/* Action button */}
            <div className={`flex justify-center ${
              animations.buttons ? 'animate-fade-in-up' : 'pre-animate-hidden'
            }`}>
              <Link href="/" className="btn-primary">
                Zpět na hlavní stránku
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Custom404
