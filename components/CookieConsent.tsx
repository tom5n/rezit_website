import React, { useState, useEffect } from 'react'

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Kontrola dark mode při mount
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()

    // Sledování změn dark mode
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto z-50 max-w-md">
      <div className="bg-white/70 dark:bg-[#1f1f23]/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-5">
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-heading font-bold text-gray-800 dark:text-white mb-2">
              Používáme cookies! 🍪
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-sans">
              Používáme cookies k zajištění nejlepšího zážitku na našich stránkách. 
              Některé jsou nezbytné pro fungování webu, jiné nám pomáhají zlepšovat služby.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRejectAll}
              className="btn-secondary flex-1 px-4 py-2.5 text-sm"
            >
              Odmítnout
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2.5 text-sm font-heading font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-full transition-all duration-300 hover:scale-105"
            >
              Přijmout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
