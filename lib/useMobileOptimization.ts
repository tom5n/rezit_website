import { useState, useEffect } from 'react'

export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [supportsIntersectionObserver, setSupportsIntersectionObserver] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent
      const isMobileDevice = window.innerWidth <= 768
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || 
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      
      setIsMobile(isMobileDevice)
      setIsIOS(isIOSDevice)
      
      // Kontrola podpory IntersectionObserver
      setSupportsIntersectionObserver('IntersectionObserver' in window)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return {
    isMobile,
    isIOS,
    supportsIntersectionObserver,
    baseDelay: isMobile ? 50 : 100,
    threshold: isMobile ? 0.05 : 0.1, // Nižší threshold - spustí se dříve
    rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px' // Menší rootMargin - spustí se dříve
  }
}
