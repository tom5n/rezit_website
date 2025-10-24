import React, { useState, useEffect } from 'react'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const ModernApp = () => {
  const { baseDelay, threshold, rootMargin, isMobile } = useMobileOptimization()
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    gallery: false
  })
  const [hasAnimated, setHasAnimated] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImages, setModalImages] = useState<string[]>([])
  const [modalTitle, setModalTitle] = useState('')
  const [modalClient, setModalClient] = useState('')
  const [currentModalImage, setCurrentModalImage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isModalAnimating, setIsModalAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const systems = [
    {
      id: 1,
      title: "Barbershop systém",
      client: "Black Rose Barber",
      description: "Moderní rezervační systém pro barbershopy s mobilní aplikací a pokročilými funkcemi.",
      image: "/images/portfolio/blackrose_port.png",
      images: [
        "/images/portfolio/blackrose_port.png",
        "/images/screenshots/blackrose/blackrose1.png",
        "/images/screenshots/blackrose/blackrose2.png",
        "/images/screenshots/blackrose/blackrose3.png",
        "/images/screenshots/blackrose/blackrose4.png",
        "/images/screenshots/blackrose/blackrose5.png",
        "/images/screenshots/blackrose/blackrose6.png",
        "/images/screenshots/blackrose/blackrose7.png",
        "/images/screenshots/blackrose/blackrose8.png",
        "/images/screenshots/blackrose/blackrose9.png"
      ],
      features: ["Rezervace online", "Mobilní app", "Správa zaměstnanců"]
    },
    {
      id: 2,
      title: "Kadeřnický salon",
      client: "MS Studio Hair",
      description: "Rezervační systém na míru pro kadeřnický salon se správou klientů a služeb.",
      image: "/images/portfolio/msstudio_port.png",
      images: [
        "/images/portfolio/msstudio_port.png",
        "/images/screenshots/msstudio/ms1.png",
        "/images/screenshots/msstudio/ms2.png",
        "/images/screenshots/msstudio/ms3.png",
        "/images/screenshots/msstudio/ms4.png"
      ],
      features: ["Rezervace na míru", "Správa klientů", "Správa služeb"]
    },
    {
      id: 3,
      title: "Barbershop systém",
      client: "Nastřiženo",
      description: "Jednoduchý systém pro barbershop s přehledem statistik a kalendářem rezervací.",
      image: "/images/portfolio/nastrizeno_port.png",
      images: [
        "/images/portfolio/nastrizeno_port.png",
        "/images/screenshots/nastrizeno/nastrizeno1.png",
        "/images/screenshots/nastrizeno/nastrizeno2.png",
        "/images/screenshots/nastrizeno/nastrizeno3.png",
        "/images/screenshots/nastrizeno/nastrizeno4.png"
      ],
      features: ["Přehled statistik", "Kalendář rezervací", "Správa klientů"]
    },
    {
      id: 4,
      title: "Barbershop systém",
      client: "AVA BARBER",
      description: "Rezervační systém na míru pro barbershop se správou klientů a služeb.",
      image: "/images/portfolio/ava_port.png",
      images: [
        "/images/portfolio/ava_port.png",
        "/images/screenshots/avabarber/ava1.jpg",
        "/images/screenshots/avabarber/ava2.jpg",
        "/images/screenshots/avabarber/ava3.jpg",
        "/images/screenshots/avabarber/ava4.jpg",
        "/images/screenshots/avabarber/ava5.jpg"
      ],
      features: ["Rezervace na míru", "Správa klientů", "Správa služeb"]
    },
    {
      id: 5,
      title: "Mentoring platforma",
      client: "Ivana Jiráková",
      description: "Kompletní systém pro správu rezervací mentoringu a správa novinek na webu.",
      image: "/images/portfolio/jirakova_port.png",
      images: [
        "/images/portfolio/jirakova_port.png",
        "/images/screenshots/jirakova/jirakovarezervace.webp",
        "/images/screenshots/jirakova/jirakovanovinky.webp",
        "/images/screenshots/jirakova/jirakovadashboard.webp",
        "/images/screenshots/jirakova/jirakovakeschvaleni.webp"
      ],
      features: ["Rezervace mentoringu", "Správa novinek", "Správa událostí"]
    }
  ]

  useEffect(() => {
    // Na mobilních zařízeních animace vůbec nespouštíme
    if (isMobile) {
      setAnimations({
        title: true,
        subtitle: true,
        gallery: true
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
          
          // Galerie
          setTimeout(() => {
            setAnimations(prev => ({ ...prev, gallery: true }))
          }, baseDelay * 6)
          
          setHasAnimated(true)
        }
      },
      { threshold, rootMargin }
    )

    const element = document.getElementById('showcase')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [hasAnimated, baseDelay, threshold, rootMargin, isMobile])

  // Auto-rotate slides (paused on hover)
  useEffect(() => {
    if (isHovered) return // Pause when hovered
    
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % systems.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isHovered])

  // Modal functions
  const openModal = (system: any) => {
    // Odstraníme první obrázek (úvodní) z galerie
    setModalImages(system.images.slice(1))
    setModalTitle(system.title)
    setModalClient(system.client)
    setCurrentModalImage(0)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
    
    // Spustíme animaci
    setTimeout(() => {
      setIsModalAnimating(true)
    }, 10)
  }

  const closeModal = () => {
    setIsModalAnimating(false)
    setTimeout(() => {
      setIsModalOpen(false)
      document.body.style.overflow = 'unset'
    }, 300) // Čekáme na konec animace
  }

  const nextModalImage = () => {
    setCurrentModalImage((prev) => (prev + 1) % modalImages.length)
  }

  const prevModalImage = () => {
    setCurrentModalImage((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1))
  }

  // Touch handling pro hlavní carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isModalOpen) return // Zamrazíme carousel když je otevřená galerie
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      // Swipe left = další slide
      nextSlide()
    }
    if (isRightSwipe) {
      // Swipe right = předchozí slide
      prevSlide()
    }
  }

  const nextSlide = () => {
    if (isModalOpen) return // Zamrazíme carousel když je otevřená galerie
    setActiveSlide(activeSlide === systems.length - 1 ? 0 : activeSlide + 1)
  }

  const prevSlide = () => {
    if (isModalOpen) return // Zamrazíme carousel když je otevřená galerie
    setActiveSlide(activeSlide === 0 ? systems.length - 1 : activeSlide - 1)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return
      
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') nextModalImage()
      if (e.key === 'ArrowLeft') prevModalImage()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])
  return (
    <section id="showcase" className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 transition-all duration-500 ${
            animations.title ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Naše <span className="text-primary-500">hotové systémy</span> v praxi
          </h2>
          <p className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-500 ${
            animations.subtitle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            Podívejte se na skutečné rezervační systémy, které jsme vytvořili pro naše klienty.
          </p>
        </div>

         {/* Gallery */}
           <div 
             className={`relative transition-all duration-700 ${
               animations.gallery ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
             }`}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}
           >
           {/* Main showcase */}
           <div className={`relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg transition-all duration-300 ${
             isHovered ? 'border-primary-300 shadow-xl' : ''
           }`}>
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-transparent"></div>
            
            {/* Hover fade overlay */}
            <div className={`absolute inset-0 bg-primary-500/5 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {systems.map((system, index) => (
                  <div key={system.id} className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* Screenshot */}
                    <div className="relative order-1 lg:order-1">
                      <div 
                        className="aspect-[4/3] lg:aspect-square overflow-hidden cursor-pointer group"
                        onClick={() => openModal(system)}
                      >
                        <img 
                          src={system.image} 
                          alt={system.title}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+U2NyZWVuc2hvdCBjb21pbmcgc29vbjwvdGV4dD4KPC9zdmc+'
                          }}
                        />
                         {/* Hover overlay */}
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                           <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                             <div className="flex items-center gap-2 text-gray-800 font-medium">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                               </svg>
                               <span>Zobrazit více</span>
                             </div>
                           </div>
                         </div>
                      </div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                      {/* Zabookuj badge */}
                      <div className="absolute top-6 right-6 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20">
                          <img 
                            src="/images/rezit2.webp" 
                            alt="rezit" 
                            className="h-4 w-auto"
                          />
                        </div>
                      </div>
                    </div>

                     {/* Content */}
                     <div className="order-2 lg:order-2 p-6 lg:p-12 flex flex-col justify-center bg-white">
                       <div className="max-w-md">
                         {/* Client */}
                         <div className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-6">
                           {system.client}
                         </div>

                         {/* Title */}
                         <h3 className="text-2xl lg:text-4xl font-heading font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                           {system.title}
                         </h3>

                         {/* Description */}
                         <p className="text-gray-600 text-base lg:text-lg mb-8 lg:mb-10 leading-relaxed">
                           {system.description}
                         </p>
                         
                         {/* Features */}
                         <div className="mb-8 lg:mb-10">
                           {system.features.map((feature, featureIndex) => (
                             <div key={featureIndex} className="flex items-start gap-3 mb-3 lg:mb-4 last:mb-0">
                               <div className="w-5 h-5 lg:w-6 lg:h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                 <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                 </svg>
                               </div>
                               <span className="text-gray-700 text-base lg:text-lg">{feature}</span>
                             </div>
                           ))}
                         </div>

                         {/* CTA */}
                         <div className="flex gap-3 items-center">
                           <button className="bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold py-2.5 px-5 rounded-full transition-colors duration-300">
                             Chci vlastní řešení
                           </button>
                           <button 
                             onClick={() => openModal(system)}
                             className="w-12 h-12 bg-white border border-gray-300 hover:bg-gray-100 hover:border-primary-500 text-gray-600 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg"
                             title="Zobrazit galerii"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                           </button>
                         </div>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modern navigation */}
          <div className="flex items-center justify-center mt-12 gap-6">
            {/* Previous button */}
            <button
              onClick={prevSlide}
              className="w-12 h-12 bg-white border border-gray-300 hover:border-primary-500 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

              {/* Dots */}
              <div className="flex gap-3">
                {systems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (isModalOpen) return // Zamrazíme carousel když je otevřená galerie
                      setActiveSlide(index)
                    }}
                    className={`transition-all duration-300 ${
                      index === activeSlide 
                        ? 'w-8 h-3 bg-primary-500 rounded-full' 
                        : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

            {/* Next button */}
            <button
              onClick={nextSlide}
              className="w-12 h-12 bg-white border border-gray-300 hover:border-primary-500 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div 
            className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
              isModalAnimating ? 'bg-black/90 opacity-100' : 'bg-black/0 opacity-0'
            }`}
            onClick={closeModal}
          >
            <div 
              className={`relative w-full h-full max-w-7xl max-h-[90vh] p-4 transition-all duration-300 ${
                isModalAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
                  <h3 className="text-white text-xl font-bold mb-1">{modalTitle}</h3>
                  <p className="text-white/80 text-sm">{modalClient}</p>
                </div>
              </div>

              {/* Main image */}
              <div className="w-full h-full flex items-center justify-center px-20">
                <div className="relative w-full h-full overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentModalImage * 100}%)` }}
                  >
                    {modalImages.map((image, index) => (
                      <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                        <img
                          src={image}
                          alt={`${modalTitle} - ${index + 1}`}
                          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+U2NyZWVuc2hvdCBjb21pbmcgc29vbjwvdGV4dD4KPC9zdmc+'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation arrows */}
              {modalImages.length > 1 && (
                <>
                  <button
                    onClick={prevModalImage}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextModalImage}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Thumbnails */}
              {modalImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3">
                    {modalImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentModalImage(index)}
                        className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                          index === currentModalImage 
                            ? 'ring-2 ring-white scale-110' 
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image counter */}
              {modalImages.length > 1 && (
                <div className="absolute bottom-6 right-6">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                    <span className="text-white text-sm font-medium">
                      {currentModalImage + 1} / {modalImages.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ModernApp
