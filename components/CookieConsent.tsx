import React, { useState, useEffect } from 'react'

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false)

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
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5">
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-heading font-bold text-gray-800 mb-2">
              Používáme cookies! 🍪
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed font-sans">
              Používáme cookies k zajištění nejlepšího zážitku na našich stránkách. 
              Některé jsou nezbytné pro fungování webu, jiné nám pomáhají zlepšovat služby.
            </p>
          </div>
          <div className="flex gap-3">
                         <button
               onClick={handleRejectAll}
               className="flex-1 px-4 py-2.5 text-sm font-heading font-medium text-gray-700 bg-white/80 border border-gray-300/50 hover:bg-gray-50/80 rounded-full transition-colors"
             >
               Odmítnout
             </button>
             <button
               onClick={handleAcceptAll}
               className="flex-1 px-4 py-2.5 text-sm font-heading font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
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
