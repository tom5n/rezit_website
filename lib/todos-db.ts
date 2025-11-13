import { supabase } from './supabase'

export interface Todo {
  id?: string
  created_at?: string
  updated_at?: string
  project_id: string
  title: string
  description?: string
  is_completed?: boolean
  is_deleted?: boolean
}

export interface TodoFormData {
  project_id: string
  title: string
  description?: string
}

// Funkce pro získání všech todos podle project_id
export async function getTodosByProjectId(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('is_completed', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Chyba při načítání todos:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání todos:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání todos', data: [] }
  }
}

// Funkce pro vytvoření nového todo
export async function createTodo(data: TodoFormData): Promise<{ success: boolean; error?: string; data?: Todo }> {
  try {
    const { data: insertedData, error } = await supabase
      .from('todos')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Chyba při vytváření todo:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: insertedData }
  } catch (error) {
    console.error('Neočekávaná chyba při vytváření todo:', error)
    return { success: false, error: 'Neočekávaná chyba při vytváření todo' }
  }
}

// Funkce pro aktualizaci todo
export async function updateTodo(id: string, data: Partial<TodoFormData & { is_completed?: boolean }>): Promise<{ success: boolean; error?: string; data?: Todo }> {
  try {
    const { data: updatedData, error } = await supabase
      .from('todos')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci todo:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedData }
  } catch (error) {
    console.error('Neočekávaná chyba při aktualizaci todo:', error)
    return { success: false, error: 'Neočekávaná chyba při aktualizaci todo' }
  }
}

// Funkce pro smazání todo (soft delete)
export async function deleteTodo(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('todos')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      console.error('Chyba při mazání todo:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při mazání todo:', error)
    return { success: false, error: 'Neočekávaná chyba při mazání todo' }
  }
}

// Funkce pro počítání todos podle project_id
export async function countTodosByProjectId(projectId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('is_deleted', false)

    if (error) {
      console.error('Chyba při počítání todos podle projektu:', error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('Neočekávaná chyba při počítání todos podle projektu:', error)
    return { success: false, error: 'Neočekávaná chyba při počítání todos' }
  }
}

