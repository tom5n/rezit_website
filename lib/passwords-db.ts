import { supabase } from './supabase'

export interface PasswordEntry {
  id?: string
  created_at?: string
  updated_at?: string
  project_id?: string // ID projektu z tabulky projects
  project?: string // Starý textový formát pro zpětnou kompatibilitu
  service_name: string
  username?: string
  password: string
  notes?: string
  url?: string
  is_deleted?: boolean
}

export interface PasswordFormData {
  project_id: string // ID projektu
  service_name: string
  username?: string
  password: string
  notes?: string
  url?: string
}

// Funkce pro získání hesel podle project_id
export async function getPasswordsByProjectId(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('service_name', { ascending: true })

    if (error) {
      console.error('Chyba při načítání hesel podle projektu:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání hesel podle projektu:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání hesel', data: [] }
  }
}

// Funkce pro počítání hesel podle project_id
export async function countPasswordsByProjectId(projectId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('passwords')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('is_deleted', false)

    if (error) {
      console.error('Chyba při počítání hesel podle projektu:', error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('Neočekávaná chyba při počítání hesel podle projektu:', error)
    return { success: false, error: 'Neočekávaná chyba při počítání hesel' }
  }
}

// Funkce pro vytvoření nového hesla
export async function createPassword(data: PasswordFormData): Promise<{ success: boolean; error?: string; data?: PasswordEntry }> {
  try {
    // Získat název projektu z project_id pro zpětnou kompatibilitu
    let projectName: string | undefined
    if (data.project_id) {
      const { data: projectData } = await supabase
        .from('projects')
        .select('name')
        .eq('id', data.project_id)
        .single()
      
      if (projectData) {
        projectName = projectData.name
      }
    }

    const insertData = {
      ...data,
      project: projectName || '' // Pro zpětnou kompatibilitu
    }

    const { data: insertedData, error } = await supabase
      .from('passwords')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Chyba při vytváření hesla:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: insertedData }
  } catch (error) {
    console.error('Neočekávaná chyba při vytváření hesla:', error)
    return { success: false, error: 'Neočekávaná chyba při vytváření hesla' }
  }
}

// Funkce pro aktualizaci hesla
export async function updatePassword(id: string, data: Partial<PasswordFormData>): Promise<{ success: boolean; error?: string; data?: PasswordEntry }> {
  try {
    // Získat název projektu z project_id pro zpětnou kompatibilitu (pokud se project_id mění)
    let projectName: string | undefined
    if (data.project_id) {
      const { data: projectData } = await supabase
        .from('projects')
        .select('name')
        .eq('id', data.project_id)
        .single()
      
      if (projectData) {
        projectName = projectData.name
      }
    }

    const updateData = {
      ...data,
      ...(projectName && { project: projectName }) // Přidat project pouze pokud máme project_id
    }

    const { data: updatedData, error } = await supabase
      .from('passwords')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci hesla:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedData }
  } catch (error) {
    console.error('Neočekávaná chyba při aktualizaci hesla:', error)
    return { success: false, error: 'Neočekávaná chyba při aktualizaci hesla' }
  }
}

// Funkce pro smazání hesla (soft delete)
export async function deletePassword(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('passwords')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      console.error('Chyba při mazání hesla:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při mazání hesla:', error)
    return { success: false, error: 'Neočekávaná chyba při mazání hesla' }
  }
}

// Funkce pro obnovení smazaného hesla
export async function recoverPassword(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('passwords')
      .update({ is_deleted: false })
      .eq('id', id)

    if (error) {
      console.error('Chyba při obnovování hesla:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při obnovování hesla:', error)
    return { success: false, error: 'Neočekávaná chyba při obnovování hesla' }
  }
}

