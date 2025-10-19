import React, { useState } from 'react'

const ProblemSolution = () => {
  const [formData, setFormData] = useState({
    serviceName: '',
    monthlySubscription: '',
    feePercentage: '',
    monthlyRevenue: '',
    comparisonYears: '3'
  })
  
  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateSavings = () => {
    const {
      monthlySubscription,
      feePercentage,
      monthlyRevenue,
      comparisonYears
    } = formData

    // Check if all required fields are filled
    if (!monthlySubscription || !feePercentage || !monthlyRevenue || !comparisonYears) {
      alert('Prosím vyplňte všechna povinná pole (měsíční předplatné, poplatek z plateb, měsíční obrat a dobu srovnání).');
      return;
    }

    const monthlySub = parseFloat(monthlySubscription) || 0
    const fee = parseFloat(feePercentage) || 0
    const revenue = parseFloat(monthlyRevenue) || 0
    const years = parseInt(comparisonYears) || 3

    // Zabookuj jednorázová investice
    const rezitInvestment = 40000

    // Výpočty pro 3rd-party službu
    const yearlySubscription = monthlySub * 12
    const yearlyFees = (revenue * fee / 100) * 12
    const yearlyThirdPartyCost = yearlySubscription + yearlyFees
    const totalThirdPartyCost = yearlyThirdPartyCost * years

    // Celková úspora
    const totalSavings = totalThirdPartyCost - rezitInvestment

    // Doba návratnosti (v měsících)
    const monthlySavings = yearlyThirdPartyCost / 12
    const paybackMonths = Math.ceil(rezitInvestment / monthlySavings)

    setResults({
      yearlyThirdPartyCost,
      totalThirdPartyCost,
      rezitInvestment,
      totalSavings,
      paybackMonths,
      monthlySavings
    })
    setShowResults(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }


  return (
    <section id="calculator" className="section-padding bg-gray-50">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-800 mb-4">
            Proč platit každý měsíc, když můžete zaplatit jednou?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
            Srovnání s běžnými rezervačními systémy. Spočítejte si, kolik ušetříte 
            s jednorázovou investicí do Zabookuj.
          </p>
        </div>



        {/* Interactive Savings Calculator */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-heading font-bold text-gray-800 mb-4">
              Kalkulačka úspor
            </h3>
            <p className="text-lg text-gray-600 font-sans max-w-2xl mx-auto">
              Spočítejte si, kolik ušetříte s jednorázovou investicí do Zabookuj oproti měsíčním poplatkům
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Calculator Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form */}
              <div>
                <h4 className="text-xl font-heading font-semibold text-gray-800 mb-8">
                  Vaše současné náklady
                </h4>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-heading font-semibold text-gray-700">
                      Název služby <span className="text-gray-500 font-normal">(volitelné)</span>
                    </label>
                    <input
                      type="text"
                      name="serviceName"
                      value={formData.serviceName}
                      onChange={handleInputChange}
                      placeholder="např. Reservio, Bookio..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-heading font-semibold text-gray-700">
                      Měsíční předplatné <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="monthlySubscription"
                        value={formData.monthlySubscription}
                        onChange={handleInputChange}
                        placeholder="1200"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-sans">Kč</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-heading font-semibold text-gray-700">
                      Poplatek z plateb <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="feePercentage"
                        value={formData.feePercentage}
                        onChange={handleInputChange}
                        placeholder="2.5"
                        step="0.1"
                        className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-sans">%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-heading font-semibold text-gray-700">
                      Měsíční obrat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="monthlyRevenue"
                        value={formData.monthlyRevenue}
                        onChange={handleInputChange}
                        placeholder="50000"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-sans">Kč</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-heading font-semibold text-gray-700">
                      Doba srovnání <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="comparisonYears"
                      value={formData.comparisonYears}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans"
                    >
                      <option value="1">1 rok</option>
                      <option value="2">2 roky</option>
                      <option value="3">3 roky</option>
                      <option value="4">4 roky</option>
                      <option value="5">5 let</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={calculateSavings}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold py-4 px-6 rounded-lg transition-colors"
                  >
                    Spočítat úsporu
                  </button>
                </div>
              </div>

              {/* Results */}
              {showResults && results ? (
                <div>
                  <h4 className="text-xl font-heading font-semibold text-gray-800 mb-8">
                    Výsledky srovnání
                  </h4>
                  
                  <div className="space-y-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h5 className="font-heading font-semibold text-gray-800 mb-4">3rd-party služba</h5>
                      <div className="space-y-3 text-sm font-sans">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Roční náklady:</span>
                          <span className="font-semibold text-gray-800">{formatCurrency(results.yearlyThirdPartyCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Celkem za {formData.comparisonYears} let:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(results.totalThirdPartyCost)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h5 className="font-heading font-semibold text-gray-800 mb-4">Zabookuj</h5>
                      <div className="space-y-3 text-sm font-sans">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Jednorázová investice:</span>
                          <span className="font-semibold text-primary-600">{formatCurrency(results.rezitInvestment)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Roční náklady:</span>
                          <span className="font-semibold text-green-600">0 Kč</span>
                        </div>
                      </div>
          </div>
        </div>

                  <div className="bg-green-500 rounded-lg p-6 mb-8 text-white text-center">
                    <h5 className="font-heading font-bold text-xl mb-2">
                      Ušetříte {formatCurrency(results.totalSavings)}
                    </h5>
                    <p className="font-sans opacity-90">
                      Investice se vám vrátí za {results.paybackMonths} měsíců
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <button className="bg-white hover:bg-gray-50 text-green-600 font-heading font-semibold py-3 px-6 rounded-lg border-2 border-green-500 transition-colors">
                      Chci ušetřit – kontaktujte nás
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <h4 className="font-heading font-semibold text-gray-600 mb-2">
                      Výsledky se zobrazí zde
                    </h4>
                    <p className="font-sans text-sm">
                      Vyplňte formulář a klikněte na "Spočítat úsporu"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
                         <h3 className="text-lg font-heading font-semibold text-gray-800 mb-2">
               Ušetříte tisíce ročně
             </h3>
            <p className="text-gray-600 font-sans">
              Žádné měsíční poplatky ani provize z plateb. 
              Vaše investice se vrátí už během prvního roku.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
                         <h3 className="text-lg font-heading font-semibold text-gray-800 mb-2">
               Přizpůsobení na míru
             </h3>
            <p className="text-gray-600 font-sans">
              Systém navrhneme přesně podle vašich potřeb. 
              Žádné zbytečné funkce, jen to, co skutečně používáte.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
                         <h3 className="text-lg font-heading font-semibold text-gray-800 mb-2">
               Vlastní data
             </h3>
            <p className="text-gray-600 font-sans">
              Všechna vaše data zůstávají u vás. Žádné riziko ztráty 
              nebo omezení přístupu k vašim informacím.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <h3 className="text-2xl font-heading font-bold text-gray-800 mb-4">
            Připraveni začít šetřit?
          </h3>
          <p className="text-gray-600 mb-8 font-sans">
            Kontaktujte nás a spočítejme si přesnou úsporu pro váš podnik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Spočítat úsporu
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Domluvit schůzku
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemSolution
