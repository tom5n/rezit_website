import React from 'react'

interface SectionSeparatorProps {
  src: string
  alt?: string
  rotate?: boolean
  mirror?: boolean
}

const SectionSeparator = ({ src, alt = "Section separator", rotate = false, mirror = false }: SectionSeparatorProps) => {
  return (
    <div className="w-full h-16 sm:h-20 lg:h-24 overflow-hidden">
      <img 
        src={src} 
        alt={alt}
        className={`w-full h-full object-cover object-center ${rotate ? 'transform rotate-180' : ''} ${mirror ? 'transform scale-x-[-1]' : ''}`}
      />
    </div>
  )
}

export default SectionSeparator
