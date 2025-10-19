import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo a popis */}
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6">
                <img 
                  src="/images/rezitlogo2.svg" 
                  alt="Zabookuj" 
                  className="h-7 w-auto"
                />
              </div>
              <div className="w-full max-w-sm h-px bg-gray-200 mb-4"></div>
              <p className="text-gray-600 mb-4 max-w-md font-sans">
                Rezervační systém bez měsíčních poplatků pro barbershopy, masérny a kosmetické salony.
              </p>
              <div className="flex space-x-4">
                <a href="https://instagram.com/rezit" className="w-6 h-6 bg-gray-600 hover:bg-primary-500 transition-colors duration-300 mask-instagram" target="_blank" rel="noopener noreferrer" style={{
                  WebkitMask: 'url(/images/assets/instagram.svg) no-repeat center',
                  mask: 'url(/images/assets/instagram.svg) no-repeat center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}>
                </a>
                <a href="mailto:info@rezit.cz" className="w-6 h-6 bg-gray-600 hover:bg-primary-500 transition-colors duration-300 mask-email" style={{
                  WebkitMask: 'url(/images/assets/email.svg) no-repeat center',
                  mask: 'url(/images/assets/email.svg) no-repeat center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}>
                </a>
              </div>
            </div>

            {/* Produkt */}
            <div>
              <h3 className="text-sm font-heading font-semibold text-gray-800 uppercase tracking-wider mb-4">
                Produkt
              </h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#features" 
                    className="text-gray-600 hover:text-primary-500 transition-colors font-sans relative group"
                    onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Funkce
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#process" 
                    className="text-gray-600 hover:text-primary-500 transition-colors font-sans relative group"
                    onClick={(e) => { e.preventDefault(); document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Jak to funguje
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#showcase" 
                    className="text-gray-600 hover:text-primary-500 transition-colors font-sans relative group"
                    onClick={(e) => { e.preventDefault(); document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Portfolio
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#pricing" 
                    className="text-gray-600 hover:text-primary-500 transition-colors font-sans relative group"
                    onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Ceny
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Podpora */}
            <div>
              <h3 className="text-sm font-heading font-semibold text-gray-800 uppercase tracking-wider mb-4">
                Podpora
              </h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#contact" 
                    className="text-gray-600 hover:text-primary-500 transition-colors font-sans relative group"
                    onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Kontakt
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#faq" 
                    className="text-gray-600 hover:text-primary-500 transition-colors font-sans relative group"
                    onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    FAQ
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#calculator" 
                    className="text-gray-600 hover:text-primary-500 transition-colors font-sans relative group"
                    onClick={(e) => { e.preventDefault(); document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Kalkulačka úspor
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#testimonials" 
                    className="text-gray-600 hover:text-primary-500 transition-colors font-sans relative group"
                    onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Recenze
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm font-sans flex items-center">
                © 2025 <a href="https://rezit.cz" className="text-gray-500 hover:text-primary-500 transition-colors relative group ml-1 font-semibold inline-block" target="_blank" rel="noopener noreferrer">rezit<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span></a>
                <span className="h-4 w-px bg-gray-300 mx-2"></span>
                Všechna práva vyhrazena.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/ochrana-udaju" className="text-gray-500 hover:text-primary-500 text-sm transition-colors font-sans relative group">
                  Ochrana údajů
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/cookies" className="text-gray-500 hover:text-primary-500 text-sm transition-colors font-sans relative group">
                  Cookies
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
