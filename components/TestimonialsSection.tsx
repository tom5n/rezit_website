import React, { useState, useEffect } from 'react'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const TestimonialsSection = () => {
  const { baseDelay, threshold, rootMargin, isMobile } = useMobileOptimization()
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    testimonial: false,
    statsLeft: false,
    statsCenter: false,
    statsRight: false
  })
  const [hasAnimated, setHasAnimated] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Ivana Jiráková",
      business: "Podnikatelka & mentorka",
      quote: "S rezervačním systémem jsem maximálně spokojená. Všechno od prvního kontaktu až po finální nastavení proběhlo rychle, hladce a s úžasně lidským přístupem. Systém je přehledný, intuitivní a přesně odpovídá tomu, co moje podnikání potřebuje. Za mě skvělá spolupráce a můžu jen doporučit.",
      avatar: "/images/testimonials/jirakova.jpg",
      logo: "/images/clients/ivanajirakova.png"
    },
    {
      id: 2,
      name: "Suzi Pu",
      business: "Black Rose Barber",
      quote: "Nechala jsem si vytvořit rezervační systém na míru a jsem maximálně spokojená. Vše proběhlo rychle, profesionálně a přesně podle mých potřeb. Systém je přehledný, jednoduchý a klienti ho milují. Skvělá domluva, lidský přístup a perfektní výsledek. Doporučuju!",
      avatar: "/images/testimonials/suzipu.jpg",
      logo: "/images/clients/blackrosebarber.png"
    },
    {
      id: 3,
      name: "Markéta Starobová",
      business: "MS Studio Svítkov",
      quote: "Potřebovala jsem funkční a jednoduchý rezervační systém a výsledek předčil moje očekávání. Systém je krásně přehledný, snadno se ovládá a moji klienti si ho okamžitě oblíbili. Díky rezervačnímu systému jsem navíc získala mnoho nových klientů. Oceňuji profesionální jednání, skvělou komunikaci a ochotu vše vysvětlit. Jsem opravdu nadšená a doporučuji všemi deseti.",
      avatar: "/images/testimonials/marketa.jpg",
      logo: "/images/clients/msstudiohair.png"
    },
    {
      id: 4,
      name: "Patrik",
      business: "Nastřiženo Barber",
      quote: "Skvělá práce! Rezervační systém, který mi vytvořili, je moderní, přehledný a přesně podle mého stylu. Navíc mi ušetřili spoustu času i peněz, protože všechno běží automaticky a zákazníci si mohou rezervace vytvářet sami. Doporučuju všemi deseti!",
      avatar: "/images/testimonials/nastrizeno.jpg",
      logo: "/images/clients/nastrizenobarber.png"
    }
  ]

  // Intersection Observer for animations
  useEffect(() => {
    // Na mobilních zařízeních animace vůbec nespouštíme
    if (isMobile) {
      setAnimations({
        title: true,
        subtitle: true,
        testimonial: true,
        statsLeft: true,
        statsCenter: true,
        statsRight: true
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
          
          // Testimonials
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, testimonial: true }))
          }, baseDelay * 6)
          
          // Stats - Left (zleva)
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, statsLeft: true }))
          }, baseDelay * 9)
          
          // Stats - Center (zdola)
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, statsCenter: true }))
          }, baseDelay * 10)
          
          // Stats - Right (zprava)
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, statsRight: true }))
          }, baseDelay * 11)
          
          setHasAnimated(true)
        }
      },
      { threshold, rootMargin }
    )

    const element = document.getElementById('testimonials')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [hasAnimated, baseDelay, threshold, rootMargin, isMobile])

  return (
    <section id="testimonials" className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 transition-all duration-500 ${
            animations.title ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Co o nás říkají <span className="text-primary-500">naši klienti</span>?
          </h2>
          <p className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-500 ${
            animations.subtitle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Podívejte se, jak <span className="font-semibold">rezit</span> pomáhá podnikům šetřit peníze a čas.
          </p>
        </div>

        {/* Testimonials Slideshow */}
        <div className={`mb-16 transition-all duration-500 ${
          animations.testimonial ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          {/* Desktop Carousel */}
          <div className="hidden md:block max-w-4xl mx-auto relative px-16">
            {/* Left Arrow */}
            <button
              onClick={() => setCurrentTestimonial(currentTestimonial === 0 ? testimonials.length - 1 : currentTestimonial - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-gray-300 hover:border-primary-500 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-300 shadow-lg z-10"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => setCurrentTestimonial(currentTestimonial === testimonials.length - 1 ? 0 : currentTestimonial + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-gray-300 hover:border-primary-500 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-300 shadow-lg z-10"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 p-8 border border-gray-100 rounded-xl bg-white/50 flex flex-col min-h-[300px]">
                    {/* Quote */}
                    <blockquote className="text-2xl text-gray-800 leading-relaxed mb-8 italic font-light text-left flex-grow">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    {/* Author & Logo - Always at bottom */}
                    <div className="flex items-center justify-between mt-auto">
                      {/* Left - Author */}
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <h4 className="font-heading font-bold text-gray-900 text-lg">
                            {testimonial.name}
                          </h4>
                          <p className="text-primary-600 font-medium">
                            {testimonial.business}
                          </p>
                        </div>
                      </div>
                      
                      {/* Right - Logo */}
                      <div className="w-28 h-16 flex items-center justify-center">
                        <img 
                          src={testimonial.logo} 
                          alt={`${testimonial.business} logo`}
                          className="max-w-full max-h-full object-contain opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Simple Layout - All 3 visible */}
          <div className="md:hidden space-y-6">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="p-6 border border-gray-100 rounded-xl bg-white/50 flex flex-col min-h-[200px]">
                {/* Quote */}
                <blockquote className="text-lg text-gray-800 leading-relaxed mb-6 italic font-light text-left flex-grow">
                  "{testimonial.quote}"
                </blockquote>
                
                {/* Author - Always at bottom */}
                <div className="flex items-center space-x-3 mt-auto">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-heading font-bold text-gray-900 text-base">
                      {testimonial.name}
                    </h4>
                    <p className="text-primary-600 font-medium text-sm">
                      {testimonial.business}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Dots - Desktop only */}
          <div className="hidden md:flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'w-8 h-3 bg-primary-500 rounded-full' 
                    : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="text-center">
          {/* Desktop Stats */}
          <div className="hidden md:flex justify-center items-center space-x-12 text-gray-600">
            {/* První statistika - zleva */}
            <div className={`transition-all duration-500 ${
              animations.statsLeft ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8'
            }`}>
              <div className="text-2xl font-bold text-primary-500">10+</div>
              <p className="text-sm">Spokojených klientů</p>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            {/* Prostřední statistika - zdola */}
            <div className={`transition-all duration-500 ${
              animations.statsCenter ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-2xl font-bold text-primary-500">50tis+</div>
              <p className="text-sm">Ušetřených korun</p>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            {/* Třetí statistika - zprava */}
            <div className={`transition-all duration-500 ${
              animations.statsRight ? 'animate-slide-in-right' : 'opacity-0 translate-x-8'
            }`}>
              <div className="text-2xl font-bold text-primary-500">100%</div>
              <p className="text-sm">Spokojenost klientů</p>
            </div>
          </div>

          {/* Mobile Stats - Simple Grid */}
          <div className="md:hidden grid grid-cols-3 gap-4 text-gray-600">
            {/* První statistika - zleva */}
            <div className={`text-center transition-all duration-500 ${
              animations.statsLeft ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8'
            }`}>
              <div className="text-lg font-bold text-primary-500">10+</div>
              <p className="text-xs">Klientů</p>
            </div>
            {/* Prostřední statistika - zdola */}
            <div className={`text-center transition-all duration-500 ${
              animations.statsCenter ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-lg font-bold text-primary-500">50tis+</div>
              <p className="text-xs">Ušetřeno</p>
            </div>
            {/* Třetí statistika - zprava */}
            <div className={`text-center transition-all duration-500 ${
              animations.statsRight ? 'animate-slide-in-right' : 'opacity-0 translate-x-8'
            }`}>
              <div className="text-lg font-bold text-primary-500">100%</div>
              <p className="text-xs">Spokojenost</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection