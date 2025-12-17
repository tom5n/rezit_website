import { supabase } from './supabase'

export interface ContactMethod {
  method: 'instagram' | 'facebook' | 'email' | 'whatsapp' | 'phone' | 'messenger'
  value: string // Username, email, telefonní číslo atd.
}

export interface Project {
  id?: string
  created_at?: string
  updated_at?: string
  name: string // blackrosebarber, msstudio, atd.
  display_name: string // Black Rose Barber, MS Studio Hair, atd.
  description?: string
  status?: 'active' | 'completed' // active = čekající/aktivní, completed = dokončené
  deadline?: string // Datum deadline projektu
  contact_methods?: ContactMethod[] // Způsoby kontaktování s hodnotami
  is_favorite?: boolean // Hlavní projekt (zobrazí se nahoře)
  is_deleted?: boolean
}

export interface ProjectFormData {
  name: string
  display_name: string
  description?: string
  status?: 'active' | 'completed'
  deadline?: string
  contact_methods?: ContactMethod[]
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

    // Debug: zkontrolovat strukturu contact_methods
    if (data) {
      data.forEach((project: any) => {
        if (project.contact_methods) {
          console.log(`Projekt ${project.display_name} - contact_methods:`, project.contact_methods, typeof project.contact_methods)
          // Pokud je contact_methods string, parsovat ho
          if (typeof project.contact_methods === 'string') {
            try {
              project.contact_methods = JSON.parse(project.contact_methods)
            } catch (e) {
              console.error('Chyba při parsování contact_methods:', e)
              project.contact_methods = null
            }
          }
        }
      })
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
    // Připravit data - zajistit, že contact_methods je správně serializováno
    const dataToInsert: any = { ...data }
    if (dataToInsert.contact_methods && Array.isArray(dataToInsert.contact_methods)) {
      // Supabase automaticky serializuje pole objektů do JSONB
      dataToInsert.contact_methods = dataToInsert.contact_methods
    } else if (dataToInsert.contact_methods === null || dataToInsert.contact_methods === undefined) {
      dataToInsert.contact_methods = null
    }

    console.log('Vytváření projektu s daty:', JSON.stringify(dataToInsert, null, 2))

    const { data: insertedData, error } = await supabase
      .from('projects')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) {
      console.error('Chyba při vytváření projektu:', error)
      console.error('Detail chyby:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    return { success: true, data: insertedData }
  } catch (error) {
    console.error('Neočekávaná chyba při vytváření projektu:', error)
    return { success: false, error: 'Neočekávaná chyba při vytváření projektu' }
  }
}

// Funkce pro aktualizaci projektu
export async function updateProject(id: string, data: Partial<ProjectFormData & { is_favorite?: boolean; contact_methods?: ContactMethod[] }>): Promise<{ success: boolean; error?: string; data?: Project }> {
  try {
    // Připravit data - zajistit, že contact_methods je správně serializováno
    const dataToUpdate: any = { ...data }
    if (dataToUpdate.contact_methods && Array.isArray(dataToUpdate.contact_methods)) {
      // Supabase automaticky serializuje pole objektů do JSONB
      dataToUpdate.contact_methods = dataToUpdate.contact_methods
    } else if (dataToUpdate.contact_methods === null || dataToUpdate.contact_methods === undefined) {
      dataToUpdate.contact_methods = null
    }

    console.log('Aktualizace projektu s daty:', JSON.stringify(dataToUpdate, null, 2))

    const { data: updatedData, error } = await supabase
      .from('projects')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci projektu:', error)
      console.error('Detail chyby:', JSON.stringify(error, null, 2))
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

