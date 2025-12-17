import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kmaphjllonhkprofophw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  is_deleted?: boolean
  is_favorite?: boolean
}
