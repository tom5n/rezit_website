import React, { useState } from 'react'

const ProductShowcase = () => {
  const [activeSlide, setActiveSlide] = useState(0)

  const screenshots = [
    {
      id: 1,
      title: "Rezervační systém pro kadeřnictví",
      description: "Moderní kalendář s přehledným rozhraním pro kadeřnické salóny",
      image: "/images/showcase/hair-salon-dashboard.jpg",
      client: "MS Studio Hair",
      category: "Kadeřnictví",
      mockup: "calendar"
    },
    {
      id: 2,
      title: "Barbershop rezervace",
      description: "Jednoduché rezervace pro barbershopy s mobilní aplikací",
      image: "/images/showcase/barbershop-mobile.jpg",
      client: "Nastříženo Barber",
      category: "Barbershop",
      mockup: "mobile"
    },
    {
      id: 3,
      title: "Wellness centrum",
      description: "Komplexní systém pro wellness a masáže s online platbami",
      image: "/images/showcase/wellness-calendar.jpg",
      client: "Wellness Centrum",
      category: "Wellness",
      mockup: "calendar"
    },
    {
      id: 4,
      title: "Restaurační rezervace",
      description: "Stylový systém pro restaurace s možností výběru stolů",
      image: "/images/showcase/restaurant-booking.jpg",
      client: "Restaurace U Nováků",
      category: "Restaurace",
      mockup: "desktop"
    },
    {
      id: 5,
      title: "Fitness studio",
      description: "Rezervace lekcí a trenérů s automatickými připomínkami",
      image: "/images/showcase/fitness-classes.jpg",
      client: "FitZone Studio",
      category: "Fitness",
      mockup: "calendar"
    }
  ]

  const renderMockup = (type: string) => {
    switch (type) {
      case 'calendar':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                             <h4 className="font-heading font-semibold text-gray-800">Leden 2024</h4>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(day => (
                <div key={day} className="text-center text-gray-500 py-2">{day}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => (
                <div key={i} className={`text-center py-2 rounded ${
                  i === 15 ? 'bg-primary-100 text-primary-600 font-heading font-semibold' : 
                  i < 5 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'clients':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                             <h4 className="font-heading font-semibold text-gray-800">Klienti</h4>
              <button className="text-primary-600 text-sm">+ Přidat</button>
            </div>
            <div className="space-y-3">
              {[
                { name: "Jan Novák", visits: 12, last: "15.1.2024" },
                { name: "Marie Svobodová", visits: 8, last: "12.1.2024" },
                { name: "Petr Dvořák", visits: 5, last: "10.1.2024" }
              ].map((client, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-heading font-medium text-sm">{client.name}</div>
                    <div className="text-xs text-gray-500">{client.visits} návštěv</div>
                  </div>
                  <div className="text-xs text-gray-500">{client.last}</div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'reports':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm">
                         <h4 className="font-heading font-semibold text-gray-800 mb-4">Finanční přehled</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dnešní příjmy</span>
                <span className="font-heading font-semibold text-green-600">8 450 Kč</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tento měsíc</span>
                <span className="font-heading font-semibold text-gray-900">45 230 Kč</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Průměrná návštěva</span>
                                 <span className="font-heading font-semibold text-primary-500">650 Kč</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        )
      
      case 'mobile':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="w-32 h-48 bg-gray-900 rounded-2xl mx-auto p-2">
              <div className="w-full h-full bg-white rounded-xl p-3">
                <div className="text-center mb-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full mx-auto mb-2"></div>
                  <div className="text-xs font-heading font-semibold">Zabookuj</div>
                </div>
                <div className="space-y-2">
                  <div className="bg-primary-100 rounded p-2">
                    <div className="text-xs font-heading font-semibold">Nová rezervace</div>
                    <div className="text-xs text-gray-600">15.1. 14:00</div>
                  </div>
                  <div className="bg-gray-100 rounded p-2">
                    <div className="text-xs font-heading font-semibold">Moje rezervace</div>
                    <div className="text-xs text-gray-600">2 aktivní</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'settings':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm">
                         <h4 className="font-heading font-semibold text-gray-800 mb-4">Služby</h4>
            <div className="space-y-3">
              {[
                { name: "Stříhání", price: "400 Kč", duration: "45 min" },
                { name: "Barvení", price: "800 Kč", duration: "90 min" },
                { name: "Masáž", price: "600 Kč", duration: "60 min" }
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-heading font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-gray-500">{service.duration}</div>
                  </div>
                  <div className="font-heading font-semibold text-sm">{service.price}</div>
                </div>
              ))}
            </div>
          </div>
        )
      
      default:
        return <div className="bg-gray-100 rounded-lg h-32"></div>
    }
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-800 mb-3 sm:mb-4">
            Podívejte se, jak Zabookuj vypadá v praxi
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-sans px-4">
            Jednoduché, přehledné a na míru vašim službám. Každá funkce je navržena tak, 
            aby vám ušetřila čas a zvýšila efektivitu.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Main showcase */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Content */}
              <div className="order-2 lg:order-1">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-800 mb-3 sm:mb-4">
                  {screenshots[activeSlide].title}
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 font-sans text-sm sm:text-base">
                  {screenshots[activeSlide].description}
                </p>
                <button className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                  Vyzkoušet tuto funkci
                </button>
              </div>

              {/* Mockup */}
              <div className="flex justify-center order-1 lg:order-2">
                <div className="w-full max-w-xs sm:max-w-sm">
                  {renderMockup(screenshots[activeSlide].mockup)}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeSlide ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => setActiveSlide(activeSlide === 0 ? screenshots.length - 1 : activeSlide - 1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setActiveSlide(activeSlide === screenshots.length - 1 ? 0 : activeSlide + 1)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "📅",
              title: "Inteligentní kalendář",
              description: "Automatické plánování s respektováním vašich preferencí"
            },
            {
              icon: "📱",
              title: "Mobilní aplikace",
              description: "Plně funkční aplikace pro iOS i Android"
            },
            {
              icon: "💰",
              title: "Finanční přehledy",
              description: "Detailní reporty a analýzy vašich příjmů"
            }
          ].map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">{feature.icon}</div>
                             <h3 className="text-lg font-heading font-semibold text-gray-800 mb-2">
                 {feature.title}
               </h3>
              <p className="text-gray-600 font-sans">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase
