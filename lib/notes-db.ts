import { supabase } from './supabase'

export interface Note {
  id?: string
  created_at?: string
  updated_at?: string
  project_id: string
  content: string
  is_deleted?: boolean
}

export interface NoteFormData {
  project_id: string
  content: string
}

// Funkce pro získání všech poznámek podle project_id
export async function getNotesByProjectId(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Chyba při načítání poznámek:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání poznámek:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání poznámek', data: [] }
  }
}

// Funkce pro vytvoření nové poznámky
export async function createNote(data: NoteFormData): Promise<{ success: boolean; error?: string; data?: Note }> {
  try {
    const { data: insertedData, error } = await supabase
      .from('notes')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Chyba při vytváření poznámky:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: insertedData }
  } catch (error) {
    console.error('Neočekávaná chyba při vytváření poznámky:', error)
    return { success: false, error: 'Neočekávaná chyba při vytváření poznámky' }
  }
}

// Funkce pro aktualizaci poznámky
export async function updateNote(id: string, data: Partial<NoteFormData>): Promise<{ success: boolean; error?: string; data?: Note }> {
  try {
    const { data: updatedData, error } = await supabase
      .from('notes')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci poznámky:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedData }
  } catch (error) {
    console.error('Neočekávaná chyba při aktualizaci poznámky:', error)
    return { success: false, error: 'Neočekávaná chyba při aktualizaci poznámky' }
  }
}

// Funkce pro smazání poznámky (soft delete)
export async function deleteNote(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notes')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      console.error('Chyba při mazání poznámky:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při mazání poznámky:', error)
    return { success: false, error: 'Neočekávaná chyba při mazání poznámky' }
  }
}

