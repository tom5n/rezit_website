// Dočasně zakázáno kvůli problémům s deployem
export const supabase = null

export const getSupabaseClient = () => {
  throw new Error('Supabase dočasně zakázáno')
}

// Typy pro TypeScript
export interface CalculatorSubmission {
  id?: string
  created_at?: string
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
  ip_address?: string
  user_agent?: string
}