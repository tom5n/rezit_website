import React, { useState, useEffect } from 'react'

interface SectionSeparatorProps {
  src: string
  alt?: string
  rotate?: boolean
  mirror?: boolean
}

const SectionSeparator = ({ src, alt = "Section separator", rotate = false, mirror = false }: SectionSeparatorProps) => {
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

  // Pokud je dark mode, použij dark variantu SVG
  let imageSrc = src
  let shouldRotate = rotate
  if (isDarkMode) {
    if (src === '/images/assets/1.svg') {
      imageSrc = '/images/assets/dark1.svg'
    } else if (src === '/images/assets/2.svg') {
      imageSrc = '/images/assets/dark2.svg'
      // dark2.svg už má správnou orientaci, nepotřebuje rotaci
      shouldRotate = false
    } else if (src === '/images/assets/3.svg') {
      imageSrc = '/images/assets/dark3.svg'
    } else if (src === '/images/assets/4.svg') {
      imageSrc = '/images/assets/dark4.svg'
      // dark4.svg potřebuje rotaci vzhůru nohama
      shouldRotate = true
    }
  }

  return (
    <div className="w-full h-16 sm:h-20 lg:h-24 overflow-hidden">
      <img 
        src={imageSrc} 
        alt={alt}
        className={`w-full h-full object-cover object-center ${shouldRotate ? 'transform rotate-180' : ''} ${mirror ? 'transform scale-x-[-1]' : ''}`}
      />
    </div>
  )
}

export default SectionSeparator
