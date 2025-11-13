import { supabase } from './supabase'

export interface Project {
  id?: string
  created_at?: string
  updated_at?: string
  name: string // blackrosebarber, msstudio, atd.
  display_name: string // Black Rose Barber, MS Studio Hair, atd.
  description?: string
  status?: 'active' | 'completed' // active = čekající/aktivní, completed = dokončené
  is_deleted?: boolean
}

export interface ProjectFormData {
  name: string
  display_name: string
  description?: string
  status?: 'active' | 'completed'
}

// Funkce pro získání všech projektů
export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_deleted', false)
      .order('display_name', { ascending: true })

    if (error) {
      console.error('Chyba při načítání projektů:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání projektů:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání projektů', data: [] }
  }
}

// Funkce pro získání jednoho projektu
export async function getProject(id: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) {
      console.error('Chyba při načítání projektu:', error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, data: data }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání projektu:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání projektu', data: null }
  }
}

// Funkce pro vytvoření nového projektu
export async function createProject(data: ProjectFormData): Promise<{ success: boolean; error?: string; data?: Project }> {
  try {
    const { data: insertedData, error } = await supabase
      .from('projects')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Chyba při vytváření projektu:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: insertedData }
  } catch (error) {
    console.error('Neočekávaná chyba při vytváření projektu:', error)
    return { success: false, error: 'Neočekávaná chyba při vytváření projektu' }
  }
}

// Funkce pro aktualizaci projektu
export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<{ success: boolean; error?: string; data?: Project }> {
  try {
    const { data: updatedData, error } = await supabase
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci projektu:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedData }
  } catch (error) {
    console.error('Neočekávaná chyba při aktualizaci projektu:', error)
    return { success: false, error: 'Neočekávaná chyba při aktualizaci projektu' }
  }
}

// Funkce pro smazání projektu (soft delete)
export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      console.error('Chyba při mazání projektu:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při mazání projektu:', error)
    return { success: false, error: 'Neočekávaná chyba při mazání projektu' }
  }
}

