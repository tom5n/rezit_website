import { supabase } from './supabase'

export interface Finance {
  id?: string
  created_at?: string
  updated_at?: string
  project_id: string
  description: string // Za co (např. "Web design", "Vývoj funkcí")
  amount?: number // Kolik (v Kč)
  hours?: number // Odpracované hodiny
  notes?: string // Poznámka (volitelné)
  is_deleted?: boolean
}

export interface FinanceFormData {
  project_id: string
  description: string
  amount?: number
  hours?: number
  notes?: string
}

// Funkce pro získání všech finančních záznamů podle project_id
export async function getFinancesByProjectId(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Chyba při načítání finančních záznamů:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání finančních záznamů:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání finančních záznamů', data: [] }
  }
}

// Funkce pro vytvoření nového finančního záznamu
export async function createFinance(data: FinanceFormData): Promise<{ success: boolean; error?: string; data?: Finance }> {
  try {
    // Explicitně vytvořit objekt pouze s povolenými poli (pro kompatibilitu s migrací)
    const dataToInsert: any = {
      project_id: data.project_id,
      description: data.description,
    }
    
    // Přidat pouze pokud jsou definované
    if (data.amount !== undefined && data.amount !== null) {
      dataToInsert.amount = data.amount
    }
    if (data.hours !== undefined && data.hours !== null) {
      dataToInsert.hours = data.hours
    }
    // Přidat poznámku pokud existuje
    if (data.notes !== undefined && data.notes !== null && data.notes.trim() !== '') {
      dataToInsert.notes = data.notes.trim()
    }
    
    console.log('Vytváření finančního záznamu s daty:', JSON.stringify(dataToInsert, null, 2))
    
    const { data: insertedData, error } = await supabase
      .from('finances')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) {
      console.error('Chyba při vytváření finančního záznamu:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: insertedData }
  } catch (error) {
    console.error('Neočekávaná chyba při vytváření finančního záznamu:', error)
    return { success: false, error: 'Neočekávaná chyba při vytváření finančního záznamu' }
  }
}

// Funkce pro aktualizaci finančního záznamu
export async function updateFinance(id: string, data: Partial<FinanceFormData>): Promise<{ success: boolean; error?: string; data?: Finance }> {
  try {
    // Explicitně vytvořit objekt pouze s povolenými poli (pro kompatibilitu s migrací)
    const dataToUpdate: any = {}
    
    if (data.description !== undefined) {
      dataToUpdate.description = data.description
    }
    if (data.amount !== undefined && data.amount !== null) {
      dataToUpdate.amount = data.amount
    } else if (data.amount === null) {
      dataToUpdate.amount = null
    }
    if (data.hours !== undefined && data.hours !== null) {
      dataToUpdate.hours = data.hours
    } else if (data.hours === null) {
      dataToUpdate.hours = null
    }
    // Přidat poznámku pokud existuje
    if (data.notes !== undefined) {
      if (data.notes !== null && data.notes.trim() !== '') {
        dataToUpdate.notes = data.notes.trim()
      } else {
        dataToUpdate.notes = null
      }
    }
    
    console.log('Aktualizace finančního záznamu s daty:', JSON.stringify(dataToUpdate, null, 2))
    
    const { data: updatedData, error } = await supabase
      .from('finances')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci finančního záznamu:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedData }
  } catch (error) {
    console.error('Neočekávaná chyba při aktualizaci finančního záznamu:', error)
    return { success: false, error: 'Neočekávaná chyba při aktualizaci finančního záznamu' }
  }
}

// Funkce pro smazání finančního záznamu (soft delete)
export async function deleteFinance(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('finances')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      console.error('Chyba při mazání finančního záznamu:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při mazání finančního záznamu:', error)
    return { success: false, error: 'Neočekávaná chyba při mazání finančního záznamu' }
  }
}

