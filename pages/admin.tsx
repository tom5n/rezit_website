import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCalculatorData, categorizeClients, getContactData } from '../lib/calculator-db'

interface CalculatorSubmission {
  id: string
  created_at: string
  business_name?: string
  service_name?: string
  monthly_fee: number
  fee_percentage: number
  monthly_revenue: number
  annual_competitor_costs: number
  annual_savings: number
  five_year_savings: number
  rezit_price: number
  payback_months: number
  scenario: string
  show_savings: boolean
  show_five_year_savings: boolean
  message?: string
}

interface ContactSubmission {
  id: string
  created_at: string
  name: string
  email: string
  business_type?: string
  subject?: string
  message: string
  ip_address?: string
  user_agent?: string
}

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<CalculatorSubmission[]>([])
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [activeSection, setActiveSection] = useState<'calculator' | 'contact'>('calculator')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<CalculatorSubmission | null>(null)
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Zkontrolovat, jestli je uživatel přihlášen
    if (typeof window !== 'undefined') {
      const isLoggedIn = document.cookie.includes('adminLoggedIn=true')
      if (!isLoggedIn) {
        router.push('/admin-login')
        return
      }
    }
    
    loadData()
  }, [router, activeSection])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    if (activeSection === 'calculator') {
      const result = await getCalculatorData()
      
      if (result.success) {
        setSubmissions(result.data)
      } else {
        setError(result.error || 'Chyba při načítání dat')
      }
    } else {
      const result = await getContactData()
      
      if (result.success) {
        setContactSubmissions(result.data)
      } else {
        setError(result.error || 'Chyba při načítání kontaktních dat')
      }
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'adminLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    router.push('/admin-login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount)
  }

  // Funkce pro správné sklonování
  const getPluralForm = (count: number, singular: string, plural: string, genitive: string) => {
    if (count === 1) return singular
    if (count >= 2 && count <= 4) return plural
    return genitive
  }

  // Funkce pro překlad scénáře do češtiny
  const getScenarioLabel = (scenario: string) => {
    switch (scenario) {
      case 'savings':
        return 'Úspora'
      case 'break_even':
        return 'Vyrovnaná cena'
      case 'payback_only':
        return 'Pouze návratnost'
      default:
        return scenario
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám data...</p>
        </div>
      </div>
    )
  }

  const categorizedClients = categorizeClients(submissions)
  
  // Funkce pro získání dat podle aktivního filtru
  const getFilteredClients = () => {
    switch (activeTab) {
      case 'all':
        return submissions
      case 'high':
        return categorizedClients.high
      case 'medium':
        return categorizedClients.medium
      case 'low':
        return categorizedClients.low
      default:
        return submissions
    }
  }
  
  const filteredClients = getFilteredClients()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 w-full bg-white" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center justify-between py-3 px-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/images/rezit2.webp" 
              alt="Rezit Logo" 
              className="h-6 w-auto"
            />
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 relative z-50"
            type="button"
          >
            <div className="w-5 h-5 relative">
              {/* Hamburger lines */}
              <span className={`absolute top-0.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-2' : ''}`}></span>
              <span className={`absolute top-2 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`absolute top-3.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed top-14 left-0 right-0 bottom-0 z-30 bg-white transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full bg-white flex flex-col justify-between">
          {/* Main Navigation - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <nav className="flex flex-col space-y-8 text-center">
              <button 
                onClick={() => {
                  setActiveSection('calculator')
                  setIsMobileMenuOpen(false)
                }}
                className={`text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl flex items-center gap-3 justify-center ${
                  activeSection === 'calculator' ? 'text-primary-500' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Kalkulačka úspor
              </button>
              
              <button 
                onClick={() => {
                  setActiveSection('contact')
                  setIsMobileMenuOpen(false)
                }}
                className={`text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl flex items-center gap-3 justify-center ${
                  activeSection === 'contact' ? 'text-primary-500' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Kontaktní formulář
              </button>
            </nav>
          </div>
          
          {/* Logout Button - Bottom */}
          <div className="pb-8 text-center">
            <button
              onClick={() => {
                handleLogout()
                setIsMobileMenuOpen(false)
              }}
              className="px-6 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-2 font-sans text-lg mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Odhlásit se
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - fixed */}
      <div className="hidden md:flex fixed left-0 top-0 w-64 bg-white shadow-lg flex-col h-screen z-10">
        <div className="p-6 border-b">
          <div className="flex items-center justify-center">
            <img 
              src="/images/rezit2.webp" 
              alt="Rezit Logo" 
              className="h-10 w-auto"
            />
          </div>
        </div>
        
        <nav className="flex-1 mt-6 overflow-y-auto">
          <div className="px-6 py-2">
            <h2 className="text-sm font-heading font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sekce
            </h2>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveSection('calculator')}
                className={`w-full text-left px-3 py-2 rounded-lg font-sans text-base transition-all duration-200 relative ${
                  activeSection === 'calculator' 
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Kalkulačka úspor
                </div>
              </button>
              
              <button 
                onClick={() => setActiveSection('contact')}
                className={`w-full text-left px-3 py-2 rounded-lg font-sans text-base transition-all duration-200 relative ${
                  activeSection === 'contact' 
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Kontaktní formulář
                </div>
              </button>
            </div>
          </div>
        </nav>

        <div className="p-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center gap-2 font-sans text-base hover:border-l-4 hover:border-red-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Odhlásit se
          </button>
        </div>
      </div>

      {/* Main Content - scrollable */}
      <div className="md:ml-64 pt-14 md:pt-0 h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          {activeSection === 'calculator' && (
            <div className="mb-6">
              <div className="flex flex-row justify-between items-start mb-4 gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">Kalkulačka úspor</h2>
                  <p className="text-base md:text-lg text-gray-600 font-sans">
                    {filteredClients.length} {activeTab === 'all' 
                      ? getPluralForm(filteredClients.length, 'klient celkem', 'klienti celkem', 'klientů celkem')
                      : `klientů v kategorii "${activeTab === 'high' ? 'Vysoký' : activeTab === 'medium' ? 'Střední' : 'Nízký'} potenciál"`
                    }
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0"
                  title="Obnovit data"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              {/* Filtry potenciálu */}
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-8 px-8 md:mx-0 md:px-0 md:overflow-x-visible">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'all' 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📊 Vše ({submissions.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('high')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'high' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  🟢 Vysoký potenciál ({categorizedClients.high.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('medium')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'medium' 
                      ? 'bg-primary-400 text-white' 
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  🟡 Střední potenciál ({categorizedClients.medium.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('low')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'low' 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ⚪ Nízký potenciál ({categorizedClients.low.length})
                </button>
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Chyba: {error}</p>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {filteredClients.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Žádní klienti v této kategorii</p>
                    </div>
                  ) : (
                    filteredClients.map((client) => {
                      const getPotentialLabel = () => {
                        if (activeTab === 'all') {
                          return categorizedClients.high.includes(client) ? 'Vysoký' :
                                 categorizedClients.medium.includes(client) ? 'Střední' : 'Nízký'
                        }
                        return activeTab === 'high' ? 'Vysoký' : activeTab === 'medium' ? 'Střední' : 'Nízký'
                      }
                      
                      const getPotentialClass = () => {
                        if (activeTab === 'all') {
                          return categorizedClients.high.includes(client) ? 'bg-primary-100 text-primary-700' :
                                 categorizedClients.medium.includes(client) ? 'bg-primary-50 text-primary-600' :
                                 'bg-gray-100 text-gray-600'
                        }
                        return activeTab === 'high' ? 'bg-primary-100 text-primary-700' :
                               activeTab === 'medium' ? 'bg-primary-50 text-primary-600' :
                               'bg-gray-100 text-gray-600'
                      }

                      return (
                        <div key={client.id}>
                          {/* Mobile Card - Compact */}
                          <div 
                            onClick={() => setSelectedClient(client)}
                            className="md:hidden bg-white rounded-lg shadow p-4 cursor-pointer active:scale-[0.98] transition-transform"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">
                                  {client.business_name || 'Neznámý podnik'}
                                </h3>
                                <p className="text-sm text-gray-600 font-sans">
                                  {client.service_name || 'Neznámá služba'}
                                </p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-sans font-semibold ${getPotentialClass()}`}>
                                {getPotentialLabel()} potenciál
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{client.created_at ? formatDate(client.created_at) : 'Neznámé datum'}</span>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {/* Desktop Card - Full */}
                          <div key={client.id} className="hidden md:block bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-xl font-heading font-semibold text-gray-800">
                                  {client.business_name || 'Neznámý podnik'}
                                </h3>
                                <p className="text-base text-gray-600 font-sans">
                                  {client.service_name || 'Neznámá služba'} • {client.created_at ? formatDate(client.created_at) : 'Neznámé datum'}
                                  {client.scenario && (
                                    <> • <span className="text-primary-600 font-semibold">{getScenarioLabel(client.scenario)}</span></>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`px-4 py-2 rounded-full text-sm font-sans font-semibold ${getPotentialClass()}`}>
                                  {getPotentialLabel()} potenciál
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <p className="text-sm text-gray-600 font-sans mb-1">Měsíční obrat</p>
                                <p className="text-lg font-heading font-semibold text-gray-800">{formatCurrency(client.monthly_revenue)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-sans mb-1">Roční úspora</p>
                                <p className="text-lg font-heading font-semibold text-gray-800">
                                  {client.show_savings ? formatCurrency(client.annual_savings) : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-sans mb-1">Návratnost</p>
                                <p className="text-lg font-heading font-semibold text-gray-800">{client.payback_months} měsíců</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-sans mb-1">Poplatek</p>
                                <p className="text-lg font-heading font-semibold text-gray-800">{formatCurrency(client.monthly_fee)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="mb-6">
              <div className="flex flex-row justify-between items-start mb-4 gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">Kontaktní formulář</h2>
                  <p className="text-base md:text-lg text-gray-600 font-sans">
                    {contactSubmissions.length} {getPluralForm(contactSubmissions.length, 'přijatá zpráva', 'přijaté zprávy', 'přijatých zpráv')}
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0"
                  title="Obnovit data"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Chyba: {error}</p>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {contactSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Žádné kontaktní zprávy</p>
                    </div>
                  ) : (
                    contactSubmissions.map((contact) => (
                      <div key={contact.id}>
                        {/* Mobile Card - Compact */}
                        <div 
                          onClick={() => setSelectedContact(contact)}
                          className="md:hidden bg-white rounded-lg shadow p-4 cursor-pointer active:scale-[0.98] transition-transform"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">
                                {contact.name}
                              </h3>
                              <p className="text-sm text-gray-600 font-sans">
                                {contact.email}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-sans font-semibold ${
                              contact.business_type ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {contact.business_type || 'Neznámý typ'}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{contact.created_at ? formatDate(contact.created_at) : 'Neznámé datum'}</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        {/* Desktop Card - Full */}
                        <div className="hidden md:block bg-white rounded-lg shadow p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-xl font-heading font-semibold text-gray-800">
                                {contact.name} ({contact.email})
                              </h3>
                              <p className="text-base text-gray-600 font-sans">
                                {contact.subject || 'Bez předmětu'} • {contact.created_at ? formatDate(contact.created_at) : 'Neznámé datum'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`px-4 py-2 rounded-full text-sm font-sans font-semibold ${
                                contact.business_type ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {contact.business_type || 'Neznámý typ podnikání'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 font-sans mb-1">Zpráva:</p>
                            <p className="text-base text-gray-800 font-sans">{contact.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Client Detail Modal */}
      {selectedClient && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end animate-fade-in"
          onClick={() => setSelectedClient(null)}
        >
          <div 
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-heading font-bold text-gray-800">
                {selectedClient.business_name || 'Neznámý podnik'}
              </h3>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-1">Služba</p>
                    <p className="text-base font-sans text-gray-800">{selectedClient.service_name || 'Neznámá služba'}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-sans font-semibold ${
                    activeTab === 'all' ? (
                      categorizedClients.high.includes(selectedClient) ? 'bg-primary-100 text-primary-700' :
                      categorizedClients.medium.includes(selectedClient) ? 'bg-primary-50 text-primary-600' :
                      'bg-gray-100 text-gray-600'
                    ) : (
                      activeTab === 'high' ? 'bg-primary-100 text-primary-700' :
                      activeTab === 'medium' ? 'bg-primary-50 text-primary-600' :
                      'bg-gray-100 text-gray-600'
                    )
                  }`}>
                    {activeTab === 'all' ? (
                      categorizedClients.high.includes(selectedClient) ? 'Vysoký' :
                      categorizedClients.medium.includes(selectedClient) ? 'Střední' :
                      'Nízký'
                    ) : (
                      activeTab === 'high' ? 'Vysoký' : activeTab === 'medium' ? 'Střední' : 'Nízký'
                    )} potenciál
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-sans mb-1">Datum</p>
                  <p className="text-base font-sans text-gray-800">
                    {selectedClient.created_at ? formatDate(selectedClient.created_at) : 'Neznámé datum'}
                  </p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Měsíční obrat</p>
                  <p className="text-lg font-heading font-semibold text-gray-800">
                    {formatCurrency(selectedClient.monthly_revenue)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Měsíční poplatek</p>
                  <p className="text-lg font-heading font-semibold text-gray-800">
                    {formatCurrency(selectedClient.monthly_fee)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Roční úspora</p>
                  <p className="text-lg font-heading font-semibold text-gray-800">
                    {selectedClient.show_savings ? formatCurrency(selectedClient.annual_savings) : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Návratnost</p>
                  <p className="text-lg font-heading font-semibold text-gray-800">
                    {selectedClient.payback_months} měsíců
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-sans mb-2">Procentní poplatek</p>
                  <p className="text-base font-sans text-gray-800">{selectedClient.fee_percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-sans mb-2">Roční náklady konkurence</p>
                  <p className="text-base font-sans text-gray-800">
                    {formatCurrency(selectedClient.annual_competitor_costs)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-sans mb-2">Cena Rezit</p>
                  <p className="text-base font-sans text-gray-800">
                    {formatCurrency(selectedClient.rezit_price)}
                  </p>
                </div>
                {selectedClient.show_five_year_savings && (
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-2">Úspora za 5 let</p>
                    <p className="text-base font-sans text-gray-800">
                      {formatCurrency(selectedClient.five_year_savings)}
                    </p>
                  </div>
                )}
                {selectedClient.scenario && (
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-2">Scénář</p>
                    <p className="text-base font-sans text-gray-800">{getScenarioLabel(selectedClient.scenario)}</p>
                  </div>
                )}
                {selectedClient.message && (
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-2">Zpráva</p>
                    <p className="text-base font-sans text-gray-800">{selectedClient.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Contact Detail Modal */}
      {selectedContact && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end animate-fade-in"
          onClick={() => setSelectedContact(null)}
        >
          <div 
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-heading font-bold text-gray-800">
                {selectedContact.name}
              </h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 font-sans mb-1">Email</p>
                  <p className="text-base font-sans text-gray-800">{selectedContact.email}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 font-sans mb-1">Datum</p>
                  <p className="text-base font-sans text-gray-800">
                    {selectedContact.created_at ? formatDate(selectedContact.created_at) : 'Neznámé datum'}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 font-sans mb-1">Obor podnikání</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-sans font-semibold inline-block ${
                    selectedContact.business_type ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedContact.business_type || 'Neznámý typ podnikání'}
                  </div>
                </div>
                {selectedContact.subject && (
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-1">Předmět</p>
                    <p className="text-base font-sans text-gray-800">{selectedContact.subject}</p>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 font-sans mb-2">Zpráva</p>
                <p className="text-base font-sans text-gray-800 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              {/* Additional Info */}
              {(selectedContact.ip_address || selectedContact.user_agent) && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  {selectedContact.ip_address && (
                    <div>
                      <p className="text-xs text-gray-500 font-sans mb-1">IP adresa</p>
                      <p className="text-sm font-sans text-gray-600">{selectedContact.ip_address}</p>
                    </div>
                  )}
                  {selectedContact.user_agent && (
                    <div>
                      <p className="text-xs text-gray-500 font-sans mb-1">User Agent</p>
                      <p className="text-sm font-sans text-gray-600 break-all">{selectedContact.user_agent}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard