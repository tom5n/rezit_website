import React, { useState, useEffect, useRef } from 'react'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const ConfiguratorSection = () => {
  const { baseDelay, threshold, rootMargin, isMobile, isIOS } = useMobileOptimization()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    image: false,
    cta: false
  })
  const [hasAnimated, setHasAnimated] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // Lazy loading videa - načte se až když je sekce viditelná
  // A také pause/play podle viditelnosti pro úsporu baterie a dat
  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!shouldLoadVideo) {
            setShouldLoadVideo(true)
          }
          // Spustit video když je viditelné
          if (videoRef.current && shouldLoadVideo) {
            videoRef.current.play().catch(() => {
              // Autoplay může být zablokováno, to je OK
            })
          }
        } else {
          // Pozastavit video když není viditelné (šetří baterii a data)
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause()
          }
        }
      },
      { threshold: 0.25, rootMargin: '50px' }
    )

    const element = document.getElementById('configurator')
    if (element) {
      videoObserver.observe(element)
    }

    return () => {
      if (element) {
        videoObserver.unobserve(element)
      }
    }
  }, [shouldLoadVideo])

  // Spuštění videa až když je načtené a viditelné
  useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      const video = videoRef.current
      
      // Pro iOS potřebujeme explicitní play() call
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay selhalo, ale to je OK - uživatel může kliknout
          console.log('Video autoplay was prevented')
        })
      }
    }
  }, [shouldLoadVideo])

  useEffect(() => {
    // Na mobilních zařízeních animace vůbec nespouštíme
    if (isMobile) {
      setAnimations({
        title: true,
        subtitle: true,
        image: true,
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
          
          // Video
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, image: true }))
          }, baseDelay * 6)
          
          // CTA
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, cta: true }))
          }, baseDelay * 9)
          
          setHasAnimated(true)
        }
      },
      { threshold, rootMargin }
    )

    const element = document.getElementById('configurator')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [hasAnimated, baseDelay, threshold, rootMargin, isMobile])

  return (
    <section id="configurator" className="section-padding bg-gradient-to-b from-white to-gray-50 dark:from-[#1f1f23] dark:to-[#1f1f23]">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 dark:text-white mb-6 ${
            animations.title ? 'animate-fade-in-up' : 'pre-animate-hidden'
          }`}>
            Vyzkoušejte si <span className="text-primary-500">konfigurátor</span>
          </h2>
          <p className={`text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed ${
            animations.subtitle ? 'animate-fade-in-up' : 'pre-animate-hidden'
          }`}>
            Nakonfigurujte si svůj rezervační systém přesně podle svých představ. 
            Vyberte barvy, rozložení a funkce, které potřebujete.
          </p>
        </div>

        {/* Main Content - Video + CTA */}
        <div className="max-w-5xl mx-auto">
          {/* Video Container */}
          <div className={`relative mb-12 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all duration-500 ${
            animations.image ? 'animate-fade-in-up' : 'pre-animate-hidden'
          }`}>
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900">
              {shouldLoadVideo && !videoError ? (
                <video 
                  ref={videoRef}
                  src="/videos/konfigurator.mp4" 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => setVideoError(true)}
                  style={{
                    // Optimalizace pro lepší výkon
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                    willChange: 'auto'
                  }}
                />
              ) : videoError ? (
                // Fallback pokud video selže
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-800 dark:to-gray-900">
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300">Video se načítá...</p>
                  </div>
                </div>
              ) : (
                // Placeholder před načtením
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-300 dark:border-gray-600 border-t-primary-500 dark:border-t-primary-400 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* CTA Button */}
          <div className={`text-center ${
            animations.cta ? 'animate-fade-in-up' : 'pre-animate-hidden'
          }`}>
            <a
              href="https://konfigurator.rezit.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <span className="flex items-center justify-center gap-3">
                <span>Vyzkoušet konfigurátor</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </a>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
              Otevře se v novém okně
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ConfiguratorSection

