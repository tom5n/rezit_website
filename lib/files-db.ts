import { supabase } from './supabase'

export interface ProjectFile {
  id?: string
  created_at?: string
  updated_at?: string
  project_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type?: string
  file_extension?: string
  description?: string
  category?: string
  is_deleted?: boolean
}

export interface ProjectFileFormData {
  project_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type?: string
  file_extension?: string
  description?: string
  category?: string
}

// Funkce pro získání všech souborů projektu
export async function getFilesByProjectId(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Chyba při načítání souborů:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání souborů:', error)
    return { success: false, error: 'Neočekávaná chyba při načítání souborů', data: [] }
  }
}

// Funkce pro vytvoření záznamu o souboru v databázi
export async function createFileRecord(data: ProjectFileFormData): Promise<{ success: boolean; error?: string; data?: ProjectFile }> {
  try {
    const { data: insertedData, error } = await supabase
      .from('project_files')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Chyba při vytváření záznamu o souboru:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: insertedData }
  } catch (error) {
    console.error('Neočekávaná chyba při vytváření záznamu o souboru:', error)
    return { success: false, error: 'Neočekávaná chyba při vytváření záznamu o souboru' }
  }
}

// Funkce pro aktualizaci záznamu o souboru
export async function updateFileRecord(id: string, data: Partial<ProjectFileFormData>): Promise<{ success: boolean; error?: string; data?: ProjectFile }> {
  try {
    const { data: updatedData, error } = await supabase
      .from('project_files')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Chyba při aktualizaci záznamu o souboru:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedData }
  } catch (error) {
    console.error('Neočekávaná chyba při aktualizaci záznamu o souboru:', error)
    return { success: false, error: 'Neočekávaná chyba při aktualizaci záznamu o souboru' }
  }
}

// Funkce pro smazání záznamu o souboru (soft delete)
export async function deleteFileRecord(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('project_files')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      console.error('Chyba při mazání záznamu o souboru:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba při mazání záznamu o souboru:', error)
    return { success: false, error: 'Neočekávaná chyba při mazání záznamu o souboru' }
  }
}

// Funkce pro zajištění existence bucketu
// POZNÁMKA: S anon key nemůžeme spolehlivě zkontrolovat existenci bucketu,
// takže tuto funkci přeskočíme a necháme upload selhat s jasnou chybou
async function ensureBucketExists(bucketName: string = 'project-files'): Promise<{ success: boolean; error?: string }> {
  // Přeskočit kontrolu - zkusit přímo upload a nechat to selhat s jasnou chybou
  // Kontrola bucketu s anon key je nespolehlivá
  return { success: true }
}

// Funkce pro nahrání souboru do Supabase Storage
export async function uploadFileToStorage(
  file: File,
  projectId: string,
  bucketName: string = 'project-files'
): Promise<{ success: boolean; error?: string; path?: string }> {
  try {
    // Generovat unikátní název souboru
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${projectId}/${fileName}`

    // Nahrát soubor - zkusit přímo upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Chyba při nahrávání souboru:', error)
      console.error('Detail chyby:', JSON.stringify(error, null, 2))
      
      // Zpracovat různé typy chyb
      const errorMessage = error.message || error.toString()
      
      // Bucket neexistuje
      if (errorMessage.includes('not found') || errorMessage.includes('Bucket not found') || errorMessage.includes('does not exist') || errorMessage.includes('The resource was not found')) {
        return { 
          success: false, 
          error: `❌ Bucket "${bucketName}" neexistuje nebo není přístupný!\n\n📋 Řešení:\n1. Ověřte v Supabase Dashboard → Storage, že bucket "${bucketName}" existuje\n2. Zkontrolujte název bucketu (musí být přesně "${bucketName}")\n3. Pokud bucket existuje, zkontrolujte Storage Policies (RLS)\n4. Možná potřebujete nastavit bucket jako public nebo přidat správné policies\n\n📖 Podrobné instrukce: CREATE_BUCKET.md` 
        }
      }
      
      // RLS policy chyba
      if (errorMessage.includes('row-level security') || errorMessage.includes('RLS') || errorMessage.includes('policy') || errorMessage.includes('permission denied')) {
        return { 
          success: false, 
          error: `❌ Chyba oprávnění (RLS Policy)!\n\nBucket "${bucketName}" existuje, ale nemáte oprávnění k nahrávání.\n\n📋 Řešení:\n1. V Supabase Dashboard → Storage → Policies\n2. Vytvořte policy pro INSERT:\n\nCREATE POLICY "Allow upload to project-files"\nON storage.objects FOR INSERT\nTO anon\nWITH CHECK (bucket_id = 'project-files');\n\n📖 Více v CREATE_BUCKET.md` 
        }
      }
      
      // Jiná chyba - zobrazit původní zprávu
      return { 
        success: false, 
        error: `Chyba při nahrávání: ${errorMessage}\n\nPokud bucket existuje, zkontrolujte Storage Policies v Supabase Dashboard.` 
      }
    }

    return { success: true, path: data.path }
  } catch (error: any) {
    console.error('Neočekávaná chyba při nahrávání souboru:', error)
    return { success: false, error: error.message || 'Neočekávaná chyba při nahrávání souboru' }
  }
}

// Funkce pro získání URL souboru (public URL nebo signed URL)
export async function getFileUrl(
  filePath: string,
  bucketName: string = 'project-files',
  expiresIn: number = 3600
): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    console.log('Získávání URL pro soubor:', { filePath, bucketName })
    
    // Zkusit získat signed URL
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Chyba při získávání signed URL:', error)
      console.error('Detail chyby:', JSON.stringify(error, null, 2))
      
      const errorMessage = error.message || error.toString()
      
      // Pokud je chyba "Object not found", zkusit zkontrolovat, jestli soubor existuje
      if (errorMessage.includes('not found') || errorMessage.includes('Object not found') || errorMessage.includes('does not exist')) {
        // Zkusit zkontrolovat, jestli soubor existuje
        const { data: files, error: listError } = await supabase.storage
          .from(bucketName)
          .list(filePath.split('/').slice(0, -1).join('/'))
        
        if (listError) {
          console.error('Chyba při listování souborů:', listError)
        } else {
          console.log('Soubory v adresáři:', files)
        }
        
        return { 
          success: false, 
          error: `Soubor nebyl nalezen na cestě: ${filePath}\n\nMožné příčiny:\n1. Soubor byl smazán ze Storage\n2. Cesta k souboru je nesprávná\n3. Chybí oprávnění pro čtení (zkontrolujte Storage Policies)\n\nZkuste zkontrolovat v Supabase Dashboard → Storage → project-files, jestli soubor existuje.` 
        }
      }
      
      // RLS policy chyba
      if (errorMessage.includes('row-level security') || errorMessage.includes('RLS') || errorMessage.includes('policy') || errorMessage.includes('permission denied')) {
        return { 
          success: false, 
          error: `Chyba oprávnění (RLS Policy)!\n\nBucket "${bucketName}" existuje, ale nemáte oprávnění ke čtení souborů.\n\n📋 Řešení:\n1. V Supabase Dashboard → Storage → Policies\n2. Zkontrolujte, že máte policy pro SELECT:\n\nCREATE POLICY "Allow read from project-files"\nON storage.objects FOR SELECT\nTO anon\nUSING (bucket_id = 'project-files');\n\n📖 Více v create-storage-policies.sql` 
        }
      }
      
      return { success: false, error: errorMessage }
    }

    if (!data || !data.signedUrl) {
      return { success: false, error: 'Nepodařilo se získat URL souboru' }
    }

    console.log('Signed URL úspěšně vytvořena')
    return { success: true, url: data.signedUrl }
  } catch (error: any) {
    console.error('Neočekávaná chyba při získávání URL souboru:', error)
    return { success: false, error: error.message || 'Neočekávaná chyba při získávání URL souboru' }
  }
}

// Funkce pro smazání souboru ze Storage
export async function deleteFileFromStorage(
  filePath: string,
  bucketName: string = 'project-files'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (error) {
      console.error('Chyba při mazání souboru ze Storage:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Neočekávaná chyba při mazání souboru ze Storage:', error)
    return { success: false, error: error.message || 'Neočekávaná chyba při mazání souboru ze Storage' }
  }
}

// Funkce pro kompletní nahrání souboru (Storage + DB záznam)
export async function uploadFile(
  file: File,
  projectId: string,
  description?: string,
  category?: string
): Promise<{ success: boolean; error?: string; data?: ProjectFile }> {
  try {
    // 1. Nahrát soubor do Storage
    const uploadResult = await uploadFileToStorage(file, projectId)
    if (!uploadResult.success || !uploadResult.path) {
      return { success: false, error: uploadResult.error || 'Chyba při nahrávání souboru' }
    }

    // 2. Vytvořit záznam v databázi
    const fileExt = file.name.split('.').pop() || ''
    const fileRecord: ProjectFileFormData = {
      project_id: projectId,
      file_name: file.name,
      file_path: uploadResult.path,
      file_size: file.size,
      file_type: file.type || undefined,
      file_extension: fileExt,
      description: description || undefined,
      category: category || undefined
    }

    const dbResult = await createFileRecord(fileRecord)
    if (!dbResult.success) {
      // Pokud se nepodařilo vytvořit záznam, smazat soubor ze Storage
      await deleteFileFromStorage(uploadResult.path)
      return { success: false, error: dbResult.error || 'Chyba při vytváření záznamu o souboru' }
    }

    return { success: true, data: dbResult.data }
  } catch (error: any) {
    console.error('Neočekávaná chyba při nahrávání souboru:', error)
    return { success: false, error: error.message || 'Neočekávaná chyba při nahrávání souboru' }
  }
}

// Funkce pro kompletní smazání souboru (Storage + DB)
export async function deleteFile(id: string, filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Smazat záznam z databáze (soft delete)
    const dbResult = await deleteFileRecord(id)
    if (!dbResult.success) {
      return { success: false, error: dbResult.error }
    }

    // 2. Smazat soubor ze Storage
    const storageResult = await deleteFileFromStorage(filePath)
    if (!storageResult.success) {
      // Pokud se nepodařilo smazat ze Storage, alespoň máme soft delete v DB
      console.warn('Soubor byl smazán z databáze, ale nepodařilo se smazat ze Storage:', storageResult.error)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Neočekávaná chyba při mazání souboru:', error)
    return { success: false, error: error.message || 'Neočekávaná chyba při mazání souboru' }
  }
}

// Pomocná funkce pro formátování velikosti souboru
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Pomocná funkce pro získání ikony podle typu souboru
export function getFileIcon(fileType?: string, extension?: string): string {
  if (!fileType && !extension) return '📄'
  
  const ext = extension?.toLowerCase() || ''
  const type = fileType?.toLowerCase() || ''

  // Obrázky
  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return '🖼️'
  }
  // PDF
  if (type === 'application/pdf' || ext === 'pdf') {
    return '📕'
  }
  // Dokumenty
  if (type.includes('word') || ['doc', 'docx'].includes(ext)) {
    return '📝'
  }
  // Excel
  if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx'].includes(ext)) {
    return '📊'
  }
  // Archívy
  if (type.includes('zip') || type.includes('archive') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return '📦'
  }
  // Video
  if (type.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(ext)) {
    return '🎥'
  }
  // Audio
  if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext)) {
    return '🎵'
  }

  return '📄'
}


