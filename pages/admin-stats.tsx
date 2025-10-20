import React, { useState, useEffect } from 'react'
import { getCalculatorData } from '../lib/calculator-db'

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

const AdminStats = () => {
  const [submissions, setSubmissions] = useState<CalculatorSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    
    const result = await getCalculatorData()
    
    if (result.success && result.data) {
      setSubmissions(result.data)
    } else {
      setError(result.error || 'Chyba při načítání dat')
    }
    
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Načítám statistiky...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Chyba: {error}</p>
          <button 
            onClick={loadStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Statistiky kalkulačky</h1>
        <p className="text-gray-600">Celkem výpočtů: {submissions.length}</p>
      </div>

      {/* Přehledné statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Průměrná měsíční úspora</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(
              submissions.reduce((sum, sub) => sum + (sub.annual_savings / 12), 0) / submissions.length || 0
            )}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Průměrná návratnost</h3>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(
              submissions.reduce((sum, sub) => sum + sub.payback_months, 0) / submissions.length || 0
            )} měsíců
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Pozitivní úspory</h3>
          <p className="text-2xl font-bold text-primary-600">
            {submissions.filter(sub => sub.show_savings).length} / {submissions.length}
          </p>
        </div>
      </div>

      {/* Detailní seznam */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Detailní přehled</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Podnik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Měsíční obrat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roční úspora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Návratnost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scénář
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(submission.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.business_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(submission.monthly_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.show_savings ? formatCurrency(submission.annual_savings) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.payback_months} měsíců
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.scenario === 'savings' 
                        ? 'bg-green-100 text-green-800'
                        : submission.scenario === 'break_even'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.scenario === 'savings' ? 'Úspory' : 
                       submission.scenario === 'break_even' ? 'Vyrovnané' : 'Návratnost'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminStats
