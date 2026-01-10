import React, { useState, useEffect, useRef } from 'react'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const ClientLogos = () => {
  const { isMobile } = useMobileOptimization()
  const [isVisible, setIsVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const clientLogos = [
    {
      name: "BlackRoseBarber",
      logo: "/images/clients/blackrosebarber.png",
      url: "https://blackrosebarber.cz/"
    },
    {
      name: "Ava Barber",
      logo: "/images/clients/avabarber.png",
      url: "https://avabarber.cz/"
    },
    {
      name: "MS Studio Hair",
      logo: "/images/clients/msstudiohair.png",
      url: "https://msstudiohair.cz/"
    },
    {
      name: "Nastřiženo Barber",
      logo: "/images/clients/nastrizenobarber.png",
      url: "https://nastrizeno.cz/"
    },
    {
      name: "Ivana Jiráková",
      logo: "/images/clients/ivanajirakova.png",
      url: "https://jirakovaiva.cz/"
    }
  ]

  useEffect(() => {
    // Na mobilních zařízeních animace vůbec nespouštíme
    if (isMobile) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
    )

    const element = document.getElementById('clients')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [isMobile])

  // Infinite scroll animation
  useEffect(() => {
    if (!isVisible || !scrollRef.current) return

    let animationId: number
    let position = 0
    const speed = window.innerWidth <= 768 ? 0.5 : 0.6 // Rychlejší na mobilech i desktopu
    let singleSetWidth = 0
    let isCalculating = false

    // Vypočítáme šířku jedné sady log (5 log)
    const calculateSingleSetWidth = () => {
      if (!scrollRef.current || isCalculating) return singleSetWidth
      isCalculating = true
      
      let width = 0
      // Projdeme prvních N log (kde N je počet log v jedné sadě)
      for (let i = 0; i < clientLogos.length; i++) {
        const child = scrollRef.current.children[i] as HTMLElement
        if (child) {
          const rect = child.getBoundingClientRect()
          width += rect.width
        }
      }
      
      isCalculating = false
      return width
    }

    // Inicializace šířky - počkáme na načtení obrázků
    const initWidth = () => {
      // Počkáme na načtení DOM a obrázků
      const checkWidth = () => {
        const calculatedWidth = calculateSingleSetWidth()
        if (calculatedWidth > 0) {
          singleSetWidth = calculatedWidth
        } else {
          // Pokud ještě není šířka, zkusíme znovu za 50ms
          setTimeout(checkWidth, 50)
        }
      }
      
      // Počkáme trochu déle, aby se načetly obrázky
      setTimeout(checkWidth, 200)
    }
    initWidth()

    // Přepočítáme šířku při změně velikosti okna
    const handleResize = () => {
      singleSetWidth = calculateSingleSetWidth()
      // Resetujeme pozici, aby nedošlo k "skoku"
      if (singleSetWidth > 0) {
        position = position % singleSetWidth
      }
    }
    window.addEventListener('resize', handleResize)

    const animate = () => {
      // Přepočítáme šířku, pokud ještě není nastavená
      if (singleSetWidth === 0) {
        singleSetWidth = calculateSingleSetWidth()
      }
      
      position += speed
      
      // Pokud jsme projeli jednu sadu, resetujeme pozici
      // Tím vytvoříme nekonečnou smyčku
      if (singleSetWidth > 0 && position >= singleSetWidth) {
        position = position % singleSetWidth
      }
      
      if (scrollRef.current) {
        scrollRef.current.style.transform = `translateX(-${position}px)`
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [isVisible, clientLogos.length])
  return (
    <section id="clients" className="py-24 bg-[#e0efff] dark:bg-[#18181c]">
      {/* Infinite Carousel - Full Width */}
      <div className={`w-full overflow-hidden transition-all duration-1000 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
      }`}>
          <div ref={scrollRef} className="flex">
            {/* Skutečně nekonečná smyčka - duplikujeme loga */}
            {[...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos].map((client, index) => (
              <a 
                key={`${client.name}-${index}`}
                href={client.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-20 md:h-32 mx-6 md:mx-12 flex-shrink-0"
              >
                <img 
                  src={client.logo} 
                  alt={`Logo klienta ${client.name} - rezervační systém rezit`} 
                  className="max-h-20 md:max-h-28 max-w-40 md:max-w-64 object-contain opacity-50 dark:invert transition-all duration-300 hover:opacity-100 hover:scale-110"
                />
              </a>
            ))}
          </div>
      </div>
    </section>
  )
}

export default ClientLogos

