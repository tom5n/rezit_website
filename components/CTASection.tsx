import React from 'react'

const CTASection = () => {
  return (
    <section id="cta" className="section-padding" style={{backgroundColor: '#f0f7ff'}}>
      <div className="container-max">
        <div className="text-center">
          {/* Header */}
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-800 mb-6">
            Začněte přijímat rezervace <span className="text-primary-500">bez poplatků</span> už tento týden
          </h2>
          
          {/* CTA Button */}
          <div className="mt-12">
            <button className="btn-primary text-xl px-12 py-6 font-semibold">
              Kontaktujte nás
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
