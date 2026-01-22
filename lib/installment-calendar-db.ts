import { supabase } from './supabase'

export interface InstallmentCalendar {
  id?: string
  created_at?: string
  updated_at?: string
  project_id: string
  client_name: string
  client_email?: string
  client_phone?: string
  total_amount: number
  monthly_amount: number
  months_count: number
  start_date: string // YYYY-MM-DD
  notes?: string
  is_deleted?: boolean
}

export interface InstallmentPayment {
  id?: string
  created_at?: string
  updated_at?: string
  calendar_id: string
  month_number: number
  due_date: string // YYYY-MM-DD
  amount: number
  is_paid: boolean
  paid_date?: string // YYYY-MM-DD
  notes?: string
}

export interface InstallmentCalendarFormData {
  project_id: string
  client_name: string
  client_email?: string
  client_phone?: string
  total_amount: number
  monthly_amount: number
  months_count: number
  start_date: string
  notes?: string
}

// Funkce pro získání všech splátkových kalendářů
export async function getAllInstallmentCalendars() {
  try {
    const { data, error } = await supabase
      .from('installment_calendars')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Chyba při načítání splátkových kalendářů:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání splátkových kalendářů:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání splátkových kalendářů', data: [] }
  }
}

// Funkce pro získání splátkových kalendářů podle project_id
export async function getInstallmentCalendarsByProjectId(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('installment_calendars')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Chyba při načítání splátkových kalendářů:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání splátkových kalendářů:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání splátkových kalendářů', data: [] }
  }
}

// Funkce pro získání jednoho splátkového kalendáře s jeho splátkami
export async function getInstallmentCalendarById(calendarId: string) {
  try {
    // Načtení kalendáře
    const { data: calendar, error: calendarError } = await supabase
      .from('installment_calendars')
      .select('*')
      .eq('id', calendarId)
      .eq('is_deleted', false)
      .single()

    if (calendarError) {
      console.error('Chyba při načítání splátkového kalendáře:', calendarError)
      return { success: false, error: calendarError.message }
    }

    // Načtení splátek
    const { data: payments, error: paymentsError } = await supabase
      .from('installment_payments')
      .select('*')
      .eq('calendar_id', calendarId)
      .order('month_number', { ascending: true })

    if (paymentsError) {
      console.error('Chyba při načítání splátek:', paymentsError)
      return { success: false, error: paymentsError.message }
    }

    return { 
      success: true, 
      data: {
        calendar,
        payments: payments || []
      }
    }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání splátkového kalendáře:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání splátkového kalendáře' }
  }
}

// Funkce pro vytvoření nového splátkového kalendáře s automatickým vytvořením splátek
export async function createInstallmentCalendar(data: InstallmentCalendarFormData): Promise<{ success: boolean; error?: string; data?: InstallmentCalendar }> {
  try {
    // Vytvoření kalendáře
    const { data: calendar, error: calendarError } = await supabase
      .from('installment_calendars')
      .insert([{
        project_id: data.project_id,
        client_name: data.client_name,
        client_email: data.client_email || null,
        client_phone: data.client_phone || null,
        total_amount: data.total_amount,
        monthly_amount: data.monthly_amount,
        months_count: data.months_count,
        start_date: data.start_date,
        notes: data.notes || null
      }])
      .select()
      .single()

    if (calendarError) {
      console.error('Chyba při vytváření splátkového kalendáře:', calendarError)
      return { success: false, error: calendarError.message }
    }

    // Vytvoření splátek
    const payments = []
    const startDate = new Date(data.start_date)
    
    for (let i = 0; i < data.months_count; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i)
      
      payments.push({
        calendar_id: calendar.id,
        month_number: i + 1,
        due_date: dueDate.toISOString().split('T')[0],
        amount: data.monthly_amount,
        is_paid: false
      })
    }

    const { error: paymentsError } = await supabase
      .from('installment_payments')
      .insert(payments)

    if (paymentsError) {
      console.error('Chyba při vytváření splátek:', paymentsError)
      // Pokusíme se smazat kalendář, pokud se nepodařilo vytvořit splátky
      await supabase.from('installment_calendars').delete().eq('id', calendar.id)
      return { success: false, error: paymentsError.message }
    }

    return { success: true, data: calendar }
  } catch (error) {
    console.error('Neočekávaná chyba při vytváření splátkového kalendáře:', error)
    return { success: false, error: 'Neočekávaná chyba při vytváření splátkového kalendáře' }
  }
}

// Funkce pro aktualizaci splátkového kalendáře
export async function updateInstallmentCalendar(id: string, data: Partial<InstallmentCalendarFormData>): Promise<{ success: boolean; error?: string; data?: InstallmentCalendar }> {
  try {
    const dataToUpdate: any = {}
    
    if (data.client_name !== undefined) dataToUpdate.client_name = data.client_name
    if (data.client_email !== undefined) dataToUpdate.client_email = data.client_email || null
    if (data.client_phone !== undefined) dataToUpdate.client_phone = data.client_phone || null
    if (data.total_amount !== undefined) dataToUpdate.total_amount = data.total_amount
    if (data.monthly_amount !== undefined) dataToUpdate.monthly_amount = data.monthly_amount
    if (data.months_count !== undefined) dataToUpdate.months_count = data.months_count
    if (data.start_date !== undefined) dataToUpdate.start_date = data.start_date
    if (data.notes !== undefined) dataToUpdate.notes = data.notes || null
    
    const { data: updatedData, error } = await supabase
      .from('installment_calendars')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci splátkového kalendáře:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedData }
  } catch (error) {
    console.error('Neočekávaná chyba při aktualizaci splátkového kalendáře:', error)
    return { success: false, error: 'Neočekávaná chyba při aktualizaci splátkového kalendáře' }
  }
}

// Funkce pro aktualizaci stavu splátky (zaplaceno/nezaplaceno)
export async function updateInstallmentPayment(paymentId: string, isPaid: boolean, paidDate?: string): Promise<{ success: boolean; error?: string; data?: InstallmentPayment }> {
  try {
    const dataToUpdate: any = {
      is_paid: isPaid
    }
    
    if (isPaid && paidDate) {
      dataToUpdate.paid_date = paidDate
    } else if (!isPaid) {
      dataToUpdate.paid_date = null
    }
    
    const { data: updatedData, error } = await supabase
      .from('installment_payments')
      .update(dataToUpdate)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci splátky:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedData }
  } catch (error) {
    console.error('Neočekávaná chyba při aktualizaci splátky:', error)
    return { success: false, error: 'Neočekávaná chyba při aktualizaci splátky' }
  }
}

// Funkce pro smazání splátkového kalendáře (soft delete)
export async function deleteInstallmentCalendar(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('installment_calendars')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      console.error('Chyba při mazání splátkového kalendáře:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při mazání splátkového kalendáře:', error)
    return { success: false, error: 'Neočekávaná chyba při mazání splátkového kalendáře' }
  }
}
