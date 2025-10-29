import React, { useState, useEffect } from 'react'
import { saveContactData } from '../lib/calculator-db'
import toast from 'react-hot-toast'
import { useMobileOptimization } from '../lib/useMobileOptimization'

const ContactSection = () => {
  const { isMobile } = useMobileOptimization()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessType: '',
    customBusinessType: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const [animations, setAnimations] = useState({
    title: false,
    subtitle: false,
    form: false,
    contact: false
  })

  // Intersection Observer for animations
  useEffect(() => {
    // Na mobilních zařízeních animace vůbec nespouštíme
    if (isMobile) {
      setAnimations({
        title: true,
        subtitle: true,
        form: true,
        contact: true
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const animationType = entry.target.getAttribute('data-animation')
            if (animationType && animationType in animations) {
              setAnimations(prev => ({
                ...prev,
                [animationType as keyof typeof animations]: true
              }))
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('[data-animation]')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [isMobile])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
        try {
          // Uložit do databáze
          const dataToSave = {
            ...formData,
            businessType: formData.businessType === 'Jiné' && formData.customBusinessType 
              ? formData.customBusinessType 
              : formData.businessType
          }
          
          const result = await saveContactData(dataToSave)
      
      if (result.success) {
        console.log('Kontaktní data úspěšně uložena do databáze')
        toast.success('Zpráva byla úspěšně odeslána! Ozveme se vám co nejdříve.')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          businessType: '',
          customBusinessType: '',
          subject: '',
          message: ''
        })
      } else {
        console.error('Chyba při ukládání:', result.error)
        toast.error('Chyba při odesílání zprávy. Zkuste to prosím znovu.')
      }
    } catch (error) {
      console.error('Neočekávaná chyba:', error)
      toast.error('Chyba při odesílání zprávy. Zkuste to prosím znovu.')
    }
    
    setIsSubmitting(false)
  }

  const businessTypes = [
    'Barbershop',
    'Kadeřnictví',
    'Kosmetika', 
    'Manikúra',
    'Masáže',
    'Jiné'
  ]

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 
            data-animation="title"
            className={`text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-heading font-bold text-gray-800 mb-6 transition-all duration-500 ${
              animations.title ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}
          >
            Pojďme spustit <span className="text-primary-500">Váš systém</span>
          </h2>
          <p 
            data-animation="subtitle"
            className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-500 ${
              animations.subtitle ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}
          >
            Kontaktujte nás ještě dnes a získejte vlastní rezervační systém během pár dní.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
              <div 
                data-animation="form"
                className={`transition-all duration-500 delay-300 ${
                  animations.form ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 lg:p-12 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-8">
                    Získejte nabídku na míru
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jméno *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                          focusedField === 'name' 
                            ? 'border-primary-500 ring-1 ring-primary-500' 
                            : 'border-gray-300 hover:border-gray-400 focus:border-primary-500'
                        }`}
                        placeholder="Vaše jméno"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                          focusedField === 'email' 
                            ? 'border-primary-500 ring-1 ring-primary-500' 
                            : 'border-gray-300 hover:border-gray-400 focus:border-primary-500'
                        }`}
                        placeholder="vas@email.cz"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typ podnikání (volitelné)
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      onFocus={() => setFocusedField('businessType')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        focusedField === 'businessType' 
                          ? 'border-primary-500 ring-1 ring-primary-500' 
                          : 'border-gray-300 hover:border-gray-400 focus:border-primary-500'
                      } ${formData.businessType === '' ? 'text-gray-500' : 'text-gray-800'}`}
                      style={{
                        color: formData.businessType === '' ? '#6B7280' : '#1F2937'
                      }}
                    >
                      <option value="" style={{ color: '#6B7280' }}>Vyberte typ podnikání</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type} style={{ color: '#1F2937' }}>{type}</option>
                      ))}
                    </select>
                    
                    {formData.businessType === 'Jiné' && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zadejte typ podnikání (volitelné)
                        </label>
                        <input
                          type="text"
                          value={formData.customBusinessType || ''}
                          onChange={(e) => handleInputChange('customBusinessType', e.target.value)}
                          onFocus={() => setFocusedField('customBusinessType')}
                          onBlur={() => setFocusedField('')}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                            focusedField === 'customBusinessType' 
                              ? 'border-primary-500 ring-1 ring-primary-500' 
                              : 'border-gray-300 hover:border-gray-400 focus:border-primary-500'
                          }`}
                          placeholder="Např. Fitness centrum, Restaurace, Autoškola..."
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Předmět (volitelné)
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        focusedField === 'subject' 
                          ? 'border-primary-500 ring-1 ring-primary-500' 
                          : 'border-gray-300 hover:border-gray-400 focus:border-primary-500'
                      }`}
                      placeholder="Rezervační systém, Cenová nabídka, Technická podpora"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zpráva *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField('')}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 resize-none ${
                        focusedField === 'message' 
                          ? 'border-primary-500 ring-1 ring-primary-500' 
                          : 'border-gray-300 hover:border-gray-400 focus:border-primary-500'
                      }`}
                      placeholder="Napište nám, co vás zajímá..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                    className={`w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                      isSubmitting || !formData.name || !formData.email || !formData.message
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:shadow-md'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Odesílám...
                      </span>
                    ) : (
                      'Odeslat zprávu'
                    )}
                  </button>
                </form>
              </div>
            </div>

          {/* Contact Info */}
          <div 
            data-animation="contact"
            className={`transition-all duration-500 delay-500 ${animations.contact ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
          >
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 lg:p-12 border border-gray-200">
                <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-8">
                  Kontaktní informace
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">info@rezit.cz</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Telefon</h4>
                      <p className="text-gray-600">+420 123 456 789</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Instagram</h4>
                      <p className="text-gray-600">@rezit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection