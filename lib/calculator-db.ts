import { supabase, CalculatorSubmission } from './supabase'

export interface CalculatorData {
  formData: {
    businessName: string
    serviceName: string
    monthlyFee: string
    feePercentage: string
    monthlyRevenue: string
  }
  calculationResults: {
    annualCompetitorCosts: number
    annualSavings: number
    fiveYearSavings: number
    rezitPrice: number
    paybackMonths: number
    scenario: string
    showSavings: boolean
    showFiveYearSavings: boolean
    message: string
  }
}

export interface ContactData {
  name: string
  email: string
  businessType: string
  subject: string
  message: string
}

export interface ContactSubmission {
  id?: string
  created_at?: string
  name: string
  email: string
  business_type?: string
  subject?: string
  message: string
  ip_address?: string
  user_agent?: string
}

export async function saveCalculatorData(data: CalculatorData): Promise<{ success: boolean; error?: string }> {
  try {
    const submission: Omit<CalculatorSubmission, 'id' | 'created_at'> = {
      business_name: data.formData.businessName || null,
      service_name: data.formData.serviceName || null,
      monthly_fee: parseFloat(data.formData.monthlyFee),
      fee_percentage: parseFloat(data.formData.feePercentage),
      monthly_revenue: parseFloat(data.formData.monthlyRevenue),
      annual_competitor_costs: data.calculationResults.annualCompetitorCosts,
      annual_savings: data.calculationResults.annualSavings,
      five_year_savings: data.calculationResults.fiveYearSavings,
      rezit_price: data.calculationResults.rezitPrice,
      payback_months: data.calculationResults.paybackMonths,
      scenario: data.calculationResults.scenario,
      show_savings: data.calculationResults.showSavings,
      show_five_year_savings: data.calculationResults.showFiveYearSavings,
      message: data.calculationResults.message || null,
      ip_address: null, // Můžeme přidat později pokud bude potřeba
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
    }

    const { error } = await supabase
      .from('calculator_submissions')
      .insert([submission])

    if (error) {
      console.error('Chyba při ukládání dat:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při ukládání:', error)
    return { success: false, error: 'Neočekávaná chyba při ukládání dat' }
  }
}

// Funkce pro získání dat z kalkulačky (pro admin účely)
export async function getCalculatorData() {
  try {
    const { data, error } = await supabase
      .from('calculator_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Chyba při načítání dat:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání dat:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání dat', data: [] }
  }
}

// Funkce pro kategorizaci klientů podle potenciálu
export function categorizeClients(submissions: CalculatorSubmission[]) {
  const highPotential = submissions.filter(sub => 
    sub.show_savings && sub.annual_savings > 50000 && sub.payback_months < 12
  )
  
  const mediumPotential = submissions.filter(sub => 
    sub.show_savings && sub.annual_savings > 20000 && sub.payback_months < 24
  )
  
  const lowPotential = submissions.filter(sub => 
    !sub.show_savings || sub.annual_savings <= 20000 || sub.payback_months >= 24
  )

  return {
    high: highPotential,
    medium: mediumPotential,
    low: lowPotential
  }
}

// Funkce pro ukládání kontaktních dat
export async function saveContactData(data: ContactData): Promise<{ success: boolean; error?: string }> {
  try {
    const submission = {
      name: data.name,
      email: data.email,
      business_type: data.businessType || null,
      subject: data.subject || null,
      message: data.message,
      ip_address: null, // Můžeme přidat později pokud bude potřeba
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
    }

    const { error } = await supabase
      .from('contact_submissions')
      .insert([submission])

    if (error) {
      console.error('Chyba při ukládání kontaktních dat:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při ukládání kontaktních dat:', error)
    return { success: false, error: 'Neočekávaná chyba při ukládání dat' }
  }
}

// Funkce pro získání kontaktních dat (pro admin účely)
export async function getContactData() {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Chyba při načítání kontaktních dat:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání kontaktních dat:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání dat', data: [] }
  }
}
