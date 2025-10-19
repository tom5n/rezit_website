import React, { useState, useEffect, useRef } from 'react'

const ClientLogos = () => {
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
  }, [])

  // Infinite scroll animation
  useEffect(() => {
    if (!isVisible || !scrollRef.current) return

    let animationId: number
    let position = 0
    const speed = window.innerWidth <= 768 ? 0.5 : 0.6 // Rychlejší na mobilech i desktopu

    const animate = () => {
      position += speed
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
    }
  }, [isVisible])
  return (
    <section id="clients" className="py-24" style={{backgroundColor: '#e0efff'}}>
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
                  alt={client.name} 
                  className="max-h-20 md:max-h-28 max-w-40 md:max-w-64 object-contain opacity-50 transition-all duration-300 hover:opacity-100 hover:scale-110"
                />
              </a>
            ))}
          </div>
      </div>
    </section>
  )
}

export default ClientLogos

