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
    // Dočasně zakázáno kvůli problémům s deployem
    console.log('Calculator data (dočasně zakázáno):', data)
    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při ukládání:', error)
    return { success: false, error: 'Neočekávaná chyba při ukládání dat' }
  }
}

// Funkce pro získání dat z kalkulačky (pro admin účely)
export async function getCalculatorData() {
  try {
    // Dočasně zakázáno kvůli problémům s deployem
    return { success: true, data: [] }
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
    // Dočasně zakázáno kvůli problémům s deployem
    console.log('Contact data (dočasně zakázáno):', data)
    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při ukládání kontaktních dat:', error)
    return { success: false, error: 'Neočekávaná chyba při ukládání dat' }
  }
}

// Funkce pro získání kontaktních dat (pro admin účely)
export async function getContactData() {
  try {
    // Dočasně zakázáno kvůli problémům s deployem
    return { success: true, data: [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání kontaktních dat:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání dat', data: [] }
  }
}
