import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const Header = () => {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  // Detekce, jestli jsme na cookies nebo ochrana údajů stránce
  const isCookiesPage = router.pathname === '/cookies'
  const isOchranaUdajuPage = router.pathname === '/ochrana-udaju'
  const isSimpleHeaderPage = isCookiesPage || isOchranaUdajuPage

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
      
      // Auto-hide logic - pouze pro desktop (md a větší)
      const isDesktop = window.innerWidth >= 768
      if (isDesktop && scrollTop > lastScrollY && scrollTop > 100) {
        // Scrolling down & past 100px - hide header (pouze desktop)
        setIsHeaderVisible(false)
      } else {
        // Scrolling up OR mobile - show header
        setIsHeaderVisible(true)
      }
      
      setLastScrollY(scrollTop)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>
      {/* Desktop Header */}
      <header className={`hidden md:block fixed left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4 transition-all duration-300 ease-in-out ${
        isHeaderVisible ? 'top-4 opacity-100 translate-y-0' : 'top-4 opacity-0 -translate-y-full'
      }`}>
        <div className={`rounded-full transition-all duration-300 border ${
          isScrolled 
            ? 'bg-white/70 backdrop-blur-xl shadow-lg border-white/20' 
            : 'bg-transparent backdrop-blur-none shadow-none border-transparent'
        }`}>
          <div className="flex items-center py-3 px-6">
            {isSimpleHeaderPage ? (
              // Simple header - jen zpět tlačítko a logo
              <>
                {/* Zpět tlačítko */}
                <a 
                  href="/" 
                  className="flex items-center text-gray-900 hover:text-primary-500 font-sans transition-colors relative group text-base"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Zpět na hlavní stránku
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                </a>

                {/* Logo vpravo */}
                <div className="flex items-center ml-auto">
                  <a 
                    href="/" 
                    className="flex items-center hover:opacity-80 transition-opacity duration-200 relative group"
                  >
                    <div className="relative">
                      <img 
                        src="/images/rezit2.webp" 
                        alt="rezit" 
                        className="h-7 w-auto transition-opacity duration-500 group-hover:opacity-0"
                      />
                      <img 
                        src="/images/rezit1.webp" 
                        alt="rezit" 
                        className="h-7 w-auto absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </div>
                  </a>
                </div>
              </>
            ) : (
              // Normální header pro hlavní stránku
              <>
                {/* Logo */}
                <div className="flex items-center">
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center hover:opacity-80 transition-opacity duration-200 relative group"
                  >
                    <div className="relative">
                      <img 
                        src="/images/rezit2.webp" 
                        alt="rezit" 
                        className="h-7 w-auto transition-opacity duration-500 group-hover:opacity-0"
                      />
                      <img 
                        src="/images/rezit1.webp" 
                        alt="rezit" 
                        className="h-7 w-auto absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </div>
                  </a>
                </div>

                {/* Vertical separator */}
                <div className="h-6 w-px bg-gray-300 ml-6"></div>

                {/* Navigation - hned za logem */}
                <nav className="flex space-x-4 ml-6">
                  <a href="#features" className="text-gray-900 hover:text-primary-500 font-sans transition-colors relative group text-base" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    Funkce
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a href="#process" className="text-gray-900 hover:text-primary-500 font-sans transition-colors relative group text-base" onClick={(e) => { e.preventDefault(); document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    Jak to funguje
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a href="#showcase" className="text-gray-900 hover:text-primary-500 font-sans transition-colors relative group text-base" onClick={(e) => { e.preventDefault(); document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    Portfolio
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a href="#pricing" className="text-gray-900 hover:text-primary-500 font-sans transition-colors relative group text-base" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    Ceny
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a href="#faq" className="text-gray-900 hover:text-primary-500 font-sans transition-colors relative group text-base" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    FAQ
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </nav>

                {/* CTA Buttons - Desktop only */}
                <div className="flex items-center ml-auto space-x-3">
                  <a 
                    href="#calculator" 
                    className="bg-white hover:bg-gray-100 text-gray-800 font-heading font-semibold py-2.5 px-5 rounded-full border border-gray-300 hover:border-primary-500 transition-all duration-300 hover:scale-105 inline-block text-center"
                    onClick={(e) => { e.preventDefault(); document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Kolik ušetřím?
                  </a>
                  <button 
                    className="bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold py-2.5 px-5 rounded-full transition-all duration-300 hover:scale-105"
                    onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Kontaktujte nás
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 w-full">
        <div className={`transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white shadow-lg border-b border-gray-200' 
            : 'bg-transparent shadow-none border-b border-transparent'
        }`}>
          <div className="flex items-center justify-between py-3 px-4">
            {isSimpleHeaderPage ? (
              // Simple mobile header
              <>
                {/* Zpět tlačítko */}
                <a 
                  href="/" 
                  className="flex items-center text-gray-900 hover:text-primary-500 font-sans transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Zpět
                </a>

                {/* Logo vpravo */}
                <a 
                  href="/" 
                  className="flex items-center hover:opacity-80 transition-opacity duration-200 relative group"
                >
                  <div className="relative">
                    <img 
                      src="/images/rezit2.webp" 
                      alt="rezit" 
                      className="h-6 w-auto transition-opacity duration-500 group-hover:opacity-0"
                    />
                    <img 
                      src="/images/rezit1.webp" 
                      alt="rezit" 
                      className="h-6 w-auto absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </div>
                </a>
              </>
            ) : (
              // Normální mobile header
              <>
                {/* Logo */}
                <div className="flex items-center">
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center hover:opacity-80 transition-opacity duration-200 relative group"
                  >
                    <div className="relative">
                      <img 
                        src="/images/rezit2.webp" 
                        alt="rezit" 
                        className="h-6 w-auto transition-opacity duration-500 group-hover:opacity-0"
                      />
                      <img 
                        src="/images/rezit1.webp" 
                        alt="rezit" 
                        className="h-6 w-auto absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </div>
                  </a>
                </div>
                 
                {/* Mobile menu button */}
                <button 
                  onClick={() => {
                    console.log('Hamburger clicked!', isMobileMenuOpen)
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                  }}
                  className="p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-white/20 relative z-50"
                  type="button"
                >
                  <div className="w-5 h-5 relative">
                    {/* Hamburger lines */}
                    <span className={`absolute top-0.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-2' : ''}`}></span>
                    <span className={`absolute top-2 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`absolute top-3.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-2' : ''}`}></span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`fixed top-14 left-0 right-0 bottom-0 z-30 bg-white transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
            {/* Full screen menu */}
            <div className="h-full bg-white flex flex-col justify-between">
              {/* Main Navigation - Centered */}
              <div className="flex-1 flex items-center justify-center">
                <nav className="flex flex-col space-y-8 text-center">
                  <a 
                    href="#features" 
                    className="text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl"
                    onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
                  >
                    Funkce
                  </a>
                  <a 
                    href="#showcase" 
                    className="text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl"
                    onClick={(e) => { e.preventDefault(); document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
                  >
                    Portfolio
                  </a>
                  <a 
                    href="#pricing" 
                    className="text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl"
                    onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
                  >
                    Ceny
                  </a>
                  <a 
                    href="#faq" 
                    className="text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl"
                    onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
                  >
                    FAQ
                  </a>
                  <a 
                    href="#contact" 
                    className="text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl"
                    onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
                  >
                    Kontakt
                  </a>
                </nav>
              </div>
              
              {/* Social Links - Bottom */}
              <div className="pb-8 text-center">
                <div className="flex justify-center space-x-8 text-gray-500 text-sm">
                  <a href="https://instagram.com/rezit" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">Instagram</a>
                  <a href="mailto:info@rezit.cz" className="hover:text-primary-500 transition-colors">Email</a>
                </div>
              </div>
            </div>
        </div>
      </header>
    </>
  )
}

export default Header
