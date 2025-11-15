import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCalculatorData, categorizeClients, getContactData, markAsDeleted, toggleFavorite, markContactAsDeleted, toggleContactResolved, recoverContact, ContactSubmission } from '../lib/calculator-db'
import { getPasswordsByProjectId, createPassword, updatePassword, deletePassword, PasswordEntry, PasswordFormData, countPasswordsByProjectId } from '../lib/passwords-db'
import { getProjects, createProject, updateProject, deleteProject, Project, ProjectFormData } from '../lib/projects-db'
import { getTodosByProjectId, createTodo, updateTodo, deleteTodo, countTodosByProjectId, Todo, TodoFormData } from '../lib/todos-db'
import { getNotesByProjectId, createNote, updateNote, deleteNote, Note, NoteFormData } from '../lib/notes-db'
import { getFinancesByProjectId, createFinance, updateFinance, deleteFinance, Finance, FinanceFormData } from '../lib/finances-db'
import { CalculatorSubmission } from '../lib/supabase'

// Admin dashboard component

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<CalculatorSubmission[]>([])
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low' | 'deleted' | 'favorite'>('all')
  const [activeContactTab, setActiveContactTab] = useState<'all' | 'resolved' | 'deleted'>('all')
  const [activeSection, setActiveSection] = useState<'calculator' | 'contact' | 'projects'>('calculator')
  const [activeProjectFilter, setActiveProjectFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [projectPasswordCounts, setProjectPasswordCounts] = useState<{ [key: string]: number }>({})
  const [projectTodoCounts, setProjectTodoCounts] = useState<{ [key: string]: number }>({})
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<Project | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectPasswords, setProjectPasswords] = useState<PasswordEntry[]>([])
  const [projectTodos, setProjectTodos] = useState<Todo[]>([])
  const [projectNotes, setProjectNotes] = useState<Note[]>([])
  const [projectFinances, setProjectFinances] = useState<Finance[]>([])
  const [activeProjectTab, setActiveProjectTab] = useState<'todos' | 'passwords' | 'notes' | 'finances'>('todos')
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false)
  const [todoFormData, setTodoFormData] = useState<TodoFormData>({
    project_id: '',
    title: '',
    description: ''
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<CalculatorSubmission | null>(null)
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null)
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedFinance, setSelectedFinance] = useState<Finance | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState<{ [key: string]: boolean }>({})
  const [expandedPasswords, setExpandedPasswords] = useState<{ [key: string]: boolean }>({})
  const [copyToast, setCopyToast] = useState(false)
  const [passwordSearchQuery, setPasswordSearchQuery] = useState('')
  const [todoSearchQuery, setTodoSearchQuery] = useState('')
  const [noteSearchQuery, setNoteSearchQuery] = useState('')
  const [financeSearchQuery, setFinanceSearchQuery] = useState('')
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    project_id: '',
    service_name: '',
    username: '',
    password: '',
    notes: '',
    url: ''
  })
  const [noteFormData, setNoteFormData] = useState<NoteFormData>({
    project_id: '',
    content: ''
  })
  const [financeFormData, setFinanceFormData] = useState<FinanceFormData>({
    project_id: '',
    description: '',
    amount: undefined,
    hours: undefined,
    notes: ''
  })
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    name: '',
    display_name: '',
    description: '',
    status: 'active',
    deadline: '',
    contact_methods: []
  })
  const [newContactMethod, setNewContactMethod] = useState<{ method: string; value: string }>({ method: '', value: '' })
  const router = useRouter()

  useEffect(() => {
    // Zkontrolovat, jestli je uživatel přihlášen
    if (typeof window !== 'undefined') {
      const isLoggedIn = document.cookie.includes('adminLoggedIn=true')
      if (!isLoggedIn) {
        router.push('/admin-login')
        return
      }
    }
    
    loadData()
  }, [router, activeSection])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    if (activeSection === 'calculator') {
      const result = await getCalculatorData()
      
      if (result.success) {
        setSubmissions(result.data)
      } else {
        setError(result.error || 'Chyba při načítání dat')
      }
    } else if (activeSection === 'contact') {
      const result = await getContactData()
      
      if (result.success) {
        setContactSubmissions(result.data)
      } else {
        setError(result.error || 'Chyba při načítání kontaktních dat')
      }
    } else if (activeSection === 'projects') {
      const result = await getProjects()
      
      if (result.success) {
        setProjects(result.data)
        // Načíst počty hesel a todos pro všechny projekty
        if (result.data) {
          const passwordCounts: { [key: string]: number } = {}
          const todoCounts: { [key: string]: number } = {}
          for (const project of result.data) {
            if (project.id) {
              const passwordCountResult = await countPasswordsByProjectId(project.id)
              if (passwordCountResult.success) {
                passwordCounts[project.id] = passwordCountResult.count || 0
              }
              const todoCountResult = await countTodosByProjectId(project.id)
              if (todoCountResult.success) {
                todoCounts[project.id] = todoCountResult.count || 0
              }
            }
          }
          setProjectPasswordCounts(passwordCounts)
          setProjectTodoCounts(todoCounts)
        }
        // Pokud je otevřený detail projektu, načíst jeho hesla
        if (selectedProjectDetail?.id) {
          loadProjectPasswords(selectedProjectDetail.id)
          loadProjectTodos(selectedProjectDetail.id)
        }
      } else {
        setError(result.error || 'Chyba při načítání projektů')
      }
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'adminLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    router.push('/admin-login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ')
  }

  // Funkce pro výpočet zbývajících dní do deadline
  const getDaysUntilDeadline = (deadline: string): number => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Funkce pro formátování zbývajícího času do deadline
  const formatTimeUntilDeadline = (deadline: string): string => {
    const days = getDaysUntilDeadline(deadline)
    
    if (days < 0) {
      return `Přes ${Math.abs(days)} ${getPluralForm(Math.abs(days), 'den', 'dny', 'dní')}`
    }
    
    if (days === 0) {
      return 'Dnes'
    }
    
    if (days === 1) {
      return 'Zítra'
    }
    
    if (days < 7) {
      return `Za ${days} ${getPluralForm(days, 'den', 'dny', 'dní')}`
    }
    
    if (days < 30) {
      const weeks = Math.floor(days / 7)
      const remainingDays = days % 7
      if (remainingDays === 0) {
        return `Za ${weeks} ${getPluralForm(weeks, 'týden', 'týdny', 'týdnů')}`
      }
      return `Za ${weeks} ${getPluralForm(weeks, 'týden', 'týdny', 'týdnů')} a ${remainingDays} ${getPluralForm(remainingDays, 'den', 'dny', 'dní')}`
    }
    
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    if (remainingDays === 0) {
      return `Za ${months} ${getPluralForm(months, 'měsíc', 'měsíce', 'měsíců')}`
    }
    return `Za ${months} ${getPluralForm(months, 'měsíc', 'měsíce', 'měsíců')} a ${remainingDays} ${getPluralForm(remainingDays, 'den', 'dny', 'dní')}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount)
  }

  // Funkce pro správné sklonování
  const getPluralForm = (count: number, singular: string, plural: string, genitive: string) => {
    if (count === 1) return singular
    if (count >= 2 && count <= 4) return plural
    return genitive
  }

  // Funkce pro překlad scénáře do češtiny
  const getScenarioLabel = (scenario: string) => {
    switch (scenario) {
      case 'savings':
        return 'Úspora'
      case 'break_even':
        return 'Vyrovnaná cena'
      case 'payback_only':
        return 'Pouze návratnost'
      default:
        return scenario
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám data...</p>
        </div>
      </div>
    )
  }

  // Všechny nesmazané záznamy (pro zobrazení počtu ve filtru "Vše")
  const allActiveSubmissions = submissions.filter(sub => !sub.is_deleted)
  
  // Kategorizace ze všech nesmazaných záznamů (pro zobrazení počtů v tagech)
  const allCategorizedClients = categorizeClients(allActiveSubmissions)
  
  // Všechny oblíbené nesmazané záznamy (pro zobrazení počtu ve filtru "Oblíbené")
  const allFavoriteSubmissions = submissions.filter(sub => !sub.is_deleted && sub.is_favorite)
  
  // Všechny smazané záznamy (pro zobrazení počtu ve filtru "Smazané")
  const allDeletedSubmissions = submissions.filter(sub => sub.is_deleted)

  // Filtrování smazaných záznamů (pokud není vybrán filtr "deleted")
  const activeSubmissions = activeTab === 'deleted' 
    ? submissions.filter(sub => sub.is_deleted)
    : activeTab === 'favorite'
    ? submissions.filter(sub => !sub.is_deleted && sub.is_favorite)
    : submissions.filter(sub => !sub.is_deleted)

  const categorizedClients = categorizeClients(activeSubmissions)
  
  // Funkce pro získání dat podle aktivního filtru
  const getFilteredClients = () => {
    switch (activeTab) {
      case 'all':
        return activeSubmissions
      case 'high':
        return categorizedClients.high
      case 'medium':
        return categorizedClients.medium
      case 'low':
        return categorizedClients.low
      case 'deleted':
        return activeSubmissions
      case 'favorite':
        return activeSubmissions
      default:
        return activeSubmissions
    }
  }
  
  const filteredClients = getFilteredClients()

  // Funkce pro označení jako smazané
  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento záznam?')) {
      return
    }

    const result = await markAsDeleted(id)
    
    if (result.success) {
      // Aktualizovat lokální stav
      setSubmissions(prev => prev.map(sub => 
        sub.id === id ? { ...sub, is_deleted: true } : sub
      ))
      // Pokud je vybraný klient, zavřít modal
      if (selectedClient?.id === id) {
        setSelectedClient(null)
      }
    } else {
      alert('Chyba při mazání záznamu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro přepnutí oblíbeného
  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    const result = await toggleFavorite(id, !currentFavorite)
    
    if (result.success) {
      // Aktualizovat lokální stav
      setSubmissions(prev => prev.map(sub => 
        sub.id === id ? { ...sub, is_favorite: !currentFavorite } : sub
      ))
      // Aktualizovat vybraný klient v modalu
      if (selectedClient?.id === id) {
        setSelectedClient(prev => prev ? { ...prev, is_favorite: !currentFavorite } : null)
      }
    } else {
      alert('Chyba při změně oblíbeného: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Filtrování kontaktních záznamů
  const activeContacts = activeContactTab === 'deleted'
    ? contactSubmissions.filter(contact => contact.is_deleted)
    : activeContactTab === 'resolved'
    ? contactSubmissions.filter(contact => !contact.is_deleted && contact.is_resolved)
    : contactSubmissions.filter(contact => !contact.is_deleted)

  // Všechny nesmazané kontakty (pro zobrazení počtu ve filtru "Vše")
  const allActiveContacts = contactSubmissions.filter(contact => !contact.is_deleted)
  
  // Všechny vyřešené nesmazané kontakty (pro zobrazení počtu ve filtru "Vyřešené")
  const allResolvedContacts = contactSubmissions.filter(contact => !contact.is_deleted && contact.is_resolved)
  
  // Všechny smazané kontakty (pro zobrazení počtu ve filtru "Smazané")
  const allDeletedContacts = contactSubmissions.filter(contact => contact.is_deleted)

  // Funkce pro označení kontaktu jako smazaného
  const handleContactDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento kontakt?')) {
      return
    }

    const result = await markContactAsDeleted(id)
    
    if (result.success) {
      // Aktualizovat lokální stav
      setContactSubmissions(prev => prev.map(contact => 
        contact.id === id ? { ...contact, is_deleted: true } : contact
      ))
      // Pokud je vybraný kontakt, zavřít modal
      if (selectedContact?.id === id) {
        setSelectedContact(null)
      }
    } else {
      alert('Chyba při mazání kontaktu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro přepnutí stavu vyřešení kontaktu
  const handleToggleContactResolved = async (id: string, currentResolved: boolean) => {
    const result = await toggleContactResolved(id, !currentResolved)
    
    if (result.success) {
      // Aktualizovat lokální stav
      setContactSubmissions(prev => prev.map(contact => 
        contact.id === id ? { ...contact, is_resolved: !currentResolved } : contact
      ))
      // Aktualizovat vybraný kontakt v modalu
      if (selectedContact?.id === id) {
        setSelectedContact(prev => prev ? { ...prev, is_resolved: !currentResolved } : null)
      }
    } else {
      alert('Chyba při změně stavu vyřešení: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro obnovení smazaného kontaktu
  const handleRecoverContact = async (id: string) => {
    const result = await recoverContact(id)
    
    if (result.success) {
      // Aktualizovat lokální stav
      setContactSubmissions(prev => prev.map(contact => 
        contact.id === id ? { ...contact, is_deleted: false } : contact
      ))
      // Pokud je vybraný kontakt, zavřít modal
      if (selectedContact?.id === id) {
        setSelectedContact(null)
      }
    } else {
      alert('Chyba při obnovování kontaktu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // ==================== FUNKCE PRO SPRÁVU HESEL ====================
  
  // Funkce pro přepnutí viditelnosti hesla
  const togglePasswordVisibility = (id: string) => {
    setIsPasswordVisible(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Funkce pro kopírování hesla do schránky
  const copyPasswordToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password)
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 2000) // Skrýt toast po 2 sekundách
    } catch (err) {
      console.error('Chyba při kopírování hesla:', err)
      alert('Chyba při kopírování hesla')
    }
  }

  // Funkce pro otevření modalu pro přidání/editaci hesla
  const openPasswordModal = (password?: PasswordEntry) => {
    if (password) {
      setSelectedPassword(password)
      setPasswordFormData({
        project_id: password.project_id || '',
        service_name: password.service_name,
        username: password.username || '',
        password: password.password,
        notes: password.notes || '',
        url: password.url || ''
      })
    } else {
      setSelectedPassword(null)
      setPasswordFormData({
        project_id: selectedProjectDetail?.id || '',
        service_name: '',
        username: '',
        password: '',
        notes: '',
        url: ''
      })
    }
    setIsPasswordModalOpen(true)
  }

  // Funkce pro zavření modalu
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setSelectedPassword(null)
    setPasswordFormData({
      project_id: '',
      service_name: '',
      username: '',
      password: '',
      notes: '',
      url: ''
    })
  }

  // Funkce pro uložení hesla (vytvoření nebo aktualizace)
  const handleSavePassword = async () => {
    if (!passwordFormData.project_id || !passwordFormData.service_name || !passwordFormData.password) {
      alert('Prosím vyplňte všechny povinné pole (Název služby, Heslo)')
      return
    }

    let result
    if (selectedPassword?.id) {
      // Aktualizace existujícího hesla
      result = await updatePassword(selectedPassword.id, passwordFormData)
    } else {
      // Vytvoření nového hesla
      result = await createPassword(passwordFormData)
    }

    if (result.success) {
      closePasswordModal()
      if (selectedProjectDetail?.id) {
        await loadProjectPasswords(selectedProjectDetail.id)
        // Aktualizovat počet hesel
        const countResult = await countPasswordsByProjectId(selectedProjectDetail.id)
        if (countResult.success) {
          setProjectPasswordCounts(prev => ({
            ...prev,
            [selectedProjectDetail.id!]: countResult.count || 0
          }))
        }
      }
    } else {
      alert('Chyba při ukládání hesla: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro smazání hesla
  const handleDeletePassword = async (id: string) => {
    if (!confirm('Opravdu chcete smazat toto heslo?')) {
      return
    }

    const result = await deletePassword(id)
    
    if (result.success) {
      setProjectPasswords(prev => prev.filter(p => p.id !== id))
      if (selectedPassword?.id === id) {
        setSelectedPassword(null)
      }
      // Aktualizovat počet hesel
      if (selectedProjectDetail?.id) {
        const countResult = await countPasswordsByProjectId(selectedProjectDetail.id)
        if (countResult.success) {
          setProjectPasswordCounts(prev => ({
            ...prev,
            [selectedProjectDetail.id!]: countResult.count || 0
          }))
        }
      }
    } else {
      alert('Chyba při mazání hesla: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro otevření modalu pro přidání/editaci projektu
  const openProjectModal = (project?: Project) => {
    if (project) {
      setSelectedProject(project)
      setProjectFormData({
        name: project.name,
        display_name: project.display_name,
        description: project.description || '',
        status: project.status || 'active',
        deadline: project.deadline || '',
        contact_methods: project.contact_methods || []
      })
      setNewContactMethod({ method: '', value: '' })
    } else {
      setSelectedProject(null)
      setProjectFormData({
        name: '',
        display_name: '',
        description: '',
        status: 'active',
        deadline: '',
        contact_methods: []
      })
      setNewContactMethod({ method: '', value: '' })
    }
    setIsProjectModalOpen(true)
  }

  // Funkce pro zavření modalu projektu
  const closeProjectModal = () => {
    setIsProjectModalOpen(false)
    setSelectedProject(null)
    setProjectFormData({
      name: '',
      display_name: '',
      description: '',
      status: 'active',
      deadline: '',
      contact_methods: []
    })
  }

  // Funkce pro uložení projektu
  const handleSaveProject = async () => {
    if (!projectFormData.name || !projectFormData.display_name) {
      alert('Prosím vyplňte název a zobrazované jméno projektu')
      return
    }

    // Připravit data pro uložení - pokud je deadline prázdný string, poslat null pro smazání
    const dataToSave: any = {
      name: projectFormData.name,
      display_name: projectFormData.display_name,
      description: projectFormData.description || undefined,
      status: projectFormData.status || 'active',
      contact_methods: projectFormData.contact_methods && projectFormData.contact_methods.length > 0 
        ? projectFormData.contact_methods 
        : null
    }
    
    // Explicitně nastavit deadline - buď hodnotu nebo null pro smazání
    if (projectFormData.deadline && projectFormData.deadline.trim() !== '') {
      dataToSave.deadline = projectFormData.deadline
    } else {
      // Pokud je deadline prázdný, poslat null pro smazání
      dataToSave.deadline = null
    }

    // Debug: zobrazit data před odesláním
    console.log('Data k uložení:', JSON.stringify(dataToSave, null, 2))

    let result
    if (selectedProject?.id) {
      // Editace existujícího projektu
      result = await updateProject(selectedProject.id, dataToSave)
    } else {
      // Vytvoření nového projektu
      result = await createProject(dataToSave)
    }

    if (result.success) {
      closeProjectModal()
      loadData()
    } else {
      console.error('Chyba při ukládání projektu:', result.error)
      alert('Chyba při ukládání projektu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro přepnutí hlavního projektu
  const handleToggleProjectFavorite = async (id: string, currentFavorite: boolean) => {
    const result = await updateProject(id, { is_favorite: !currentFavorite })
    
    if (result.success) {
      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, is_favorite: !currentFavorite } : project
      ))
    } else {
      alert('Chyba při aktualizaci projektu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro smazání projektu
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento projekt?')) {
      return
    }

    const result = await deleteProject(id)
    
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== id))
      if (selectedProjectDetail?.id === id) {
        closeProjectDetail()
      }
      loadData()
    } else {
      alert('Chyba při mazání projektu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Filtrování projektů podle statusu
  const filteredProjects = activeProjectFilter === 'all'
    ? [...projects].sort((a, b) => {
        // Nejdřív hlavní projekty (is_favorite)
        const aFavorite = a.is_favorite ? 1 : 0
        const bFavorite = b.is_favorite ? 1 : 0
        if (aFavorite !== bFavorite) {
          return bFavorite - aFavorite // Hlavní projekty nahoře
        }
        // Pak podle statusu - nejdřív čekající (active), pak dokončené (completed)
        const aStatus = a.status || 'active'
        const bStatus = b.status || 'active'
        if (aStatus === 'active' && bStatus === 'completed') return -1
        if (aStatus === 'completed' && bStatus === 'active') return 1
        // Pak podle počtu nedokončených todos - více todos = výše
        const aTodoCount = a.id ? (projectTodoCounts[a.id] || 0) : 0
        const bTodoCount = b.id ? (projectTodoCounts[b.id] || 0) : 0
        if (aTodoCount !== bTodoCount) {
          return bTodoCount - aTodoCount // Více todos nahoře
        }
        return 0
      })
    : activeProjectFilter === 'active'
    ? projects.filter(p => p.status === 'active' || !p.status).sort((a, b) => {
        // Hlavní projekty nahoře i v sekci "Probíhající"
        const aFavorite = a.is_favorite ? 1 : 0
        const bFavorite = b.is_favorite ? 1 : 0
        if (aFavorite !== bFavorite) {
          return bFavorite - aFavorite
        }
        // Pak podle počtu nedokončených todos - více todos = výše
        const aTodoCount = a.id ? (projectTodoCounts[a.id] || 0) : 0
        const bTodoCount = b.id ? (projectTodoCounts[b.id] || 0) : 0
        if (aTodoCount !== bTodoCount) {
          return bTodoCount - aTodoCount // Více todos nahoře
        }
        return 0
      })
    : projects.filter(p => p.status === 'completed').sort((a, b) => {
        // Hlavní projekty nahoře i v sekci "Dokončené"
        const aFavorite = a.is_favorite ? 1 : 0
        const bFavorite = b.is_favorite ? 1 : 0
        if (aFavorite !== bFavorite) {
          return bFavorite - aFavorite
        }
        // Pak podle počtu nedokončených todos - více todos = výše
        const aTodoCount = a.id ? (projectTodoCounts[a.id] || 0) : 0
        const bTodoCount = b.id ? (projectTodoCounts[b.id] || 0) : 0
        if (aTodoCount !== bTodoCount) {
          return bTodoCount - aTodoCount // Více todos nahoře
        }
        return 0
      })

  // Funkce pro načtení hesel projektu
  const loadProjectPasswords = async (projectId: string) => {
    const result = await getPasswordsByProjectId(projectId)
    if (result.success) {
      setProjectPasswords(result.data)
    }
  }

  // Funkce pro načtení todos projektu
  const loadProjectTodos = async (projectId: string) => {
    const result = await getTodosByProjectId(projectId)
    if (result.success) {
      setProjectTodos(result.data)
    }
  }

  // Funkce pro načtení poznámek projektu
  const loadProjectNotes = async (projectId: string) => {
    const result = await getNotesByProjectId(projectId)
    if (result.success) {
      setProjectNotes(result.data)
    }
  }

  // Funkce pro načtení finančních záznamů projektu
  const loadProjectFinances = async (projectId: string) => {
    const result = await getFinancesByProjectId(projectId)
    if (result.success) {
      setProjectFinances(result.data)
    }
  }

  // Funkce pro otevření detailu projektu
  const openProjectDetail = async (project: Project) => {
    setSelectedProjectDetail(project)
    if (project.id) {
      await loadProjectPasswords(project.id)
      await loadProjectTodos(project.id)
      await loadProjectNotes(project.id)
      await loadProjectFinances(project.id)
    }
  }

  // Funkce pro zavření detailu projektu
  const closeProjectDetail = () => {
    setSelectedProjectDetail(null)
    setProjectPasswords([])
    setProjectTodos([])
    setProjectNotes([])
    setProjectFinances([])
  }

  // ==================== FUNKCE PRO SPRÁVU POZNÁMEK ====================

  // Funkce pro otevření modalu pro přidání/editaci poznámky
  const openNoteModal = (note?: Note) => {
    if (note) {
      setSelectedNote(note)
      setNoteFormData({
        project_id: note.project_id,
        content: note.content
      })
    } else {
      setSelectedNote(null)
      setNoteFormData({
        project_id: selectedProjectDetail?.id || '',
        content: ''
      })
    }
    setIsNoteModalOpen(true)
  }

  // Funkce pro zavření modalu poznámky
  const closeNoteModal = () => {
    setIsNoteModalOpen(false)
    setSelectedNote(null)
    setNoteFormData({
      project_id: '',
      content: ''
    })
  }

  // Funkce pro uložení poznámky (vytvoření nebo aktualizace)
  const handleSaveNote = async () => {
    if (!noteFormData.project_id || !noteFormData.content.trim()) {
      alert('Prosím vyplňte obsah poznámky')
      return
    }

    let result
    if (selectedNote?.id) {
      // Editace existující poznámky
      result = await updateNote(selectedNote.id, noteFormData)
    } else {
      // Vytvoření nové poznámky
      result = await createNote(noteFormData)
    }

    if (result.success) {
      closeNoteModal()
      if (selectedProjectDetail?.id) {
        await loadProjectNotes(selectedProjectDetail.id)
      }
    } else {
      alert('Chyba při ukládání poznámky: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro smazání poznámky
  const handleDeleteNote = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto poznámku?')) {
      return
    }

    const result = await deleteNote(id)
    
    if (result.success) {
      setProjectNotes(prev => prev.filter(n => n.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(null)
      }
    } else {
      alert('Chyba při mazání poznámky: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // ==================== FUNKCE PRO SPRÁVU FINANCÍ ====================

  // Funkce pro otevření modalu pro přidání/editaci finančního záznamu
  const openFinanceModal = (finance?: Finance) => {
    if (finance) {
      setSelectedFinance(finance)
      setFinanceFormData({
        project_id: finance.project_id,
        description: finance.description,
        amount: finance.amount,
        hours: finance.hours,
        notes: finance.notes || ''
      })
    } else {
      setSelectedFinance(null)
      setFinanceFormData({
        project_id: selectedProjectDetail?.id || '',
        description: '',
        amount: undefined,
        hours: undefined,
        notes: ''
      })
    }
    setIsFinanceModalOpen(true)
  }

  // Funkce pro zavření modalu finančního záznamu
  const closeFinanceModal = () => {
    setIsFinanceModalOpen(false)
    setSelectedFinance(null)
    setFinanceFormData({
      project_id: '',
      description: '',
      amount: undefined,
      hours: undefined,
      notes: ''
    })
  }

  // Funkce pro uložení finančního záznamu
  const handleSaveFinance = async () => {
    if (!financeFormData.project_id || !financeFormData.description.trim()) {
      alert('Prosím vyplňte popis')
      return
    }

    // Připravit data - převést prázdné stringy na undefined
    const dataToSave: FinanceFormData = {
      project_id: financeFormData.project_id,
      description: financeFormData.description.trim(),
      amount: financeFormData.amount && financeFormData.amount > 0 ? financeFormData.amount : undefined,
      hours: financeFormData.hours && financeFormData.hours > 0 ? financeFormData.hours : undefined,
      notes: financeFormData.notes && financeFormData.notes.trim() !== '' ? financeFormData.notes.trim() : undefined
    }

    let result
    if (selectedFinance?.id) {
      // Editace existujícího finančního záznamu
      result = await updateFinance(selectedFinance.id, dataToSave)
    } else {
      // Vytvoření nového finančního záznamu
      result = await createFinance(dataToSave)
    }

    if (result.success) {
      closeFinanceModal()
      if (selectedProjectDetail?.id) {
        await loadProjectFinances(selectedProjectDetail.id)
      }
    } else {
      alert('Chyba při ukládání finančního záznamu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro smazání finančního záznamu
  const handleDeleteFinance = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento finanční záznam?')) {
      return
    }

    const result = await deleteFinance(id)
    if (result.success) {
      if (selectedProjectDetail?.id) {
        await loadProjectFinances(selectedProjectDetail.id)
      }
    } else {
      alert('Chyba při mazání finančního záznamu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // ==================== FUNKCE PRO SPRÁVU TODOS ====================

  // Funkce pro otevření modalu pro přidání/editaci todo
  const openTodoModal = (todo?: Todo) => {
    if (todo) {
      setSelectedTodo(todo)
      setTodoFormData({
        project_id: todo.project_id,
        title: todo.title,
        description: todo.description || ''
      })
    } else {
      setSelectedTodo(null)
      setTodoFormData({
        project_id: selectedProjectDetail?.id || '',
        title: '',
        description: ''
      })
    }
    setIsTodoModalOpen(true)
  }

  // Funkce pro zavření modalu todo
  const closeTodoModal = () => {
    setIsTodoModalOpen(false)
    setSelectedTodo(null)
    setTodoFormData({
      project_id: '',
      title: '',
      description: ''
    })
  }

  // Funkce pro uložení todo (vytvoření nebo aktualizace)
  const handleSaveTodo = async () => {
    if (!todoFormData.title || !todoFormData.project_id) {
      alert('Prosím vyplňte název úkolu')
      return
    }

    let result
    if (selectedTodo?.id) {
      // Aktualizace existujícího todo
      result = await updateTodo(selectedTodo.id, todoFormData)
    } else {
      // Vytvoření nového todo
      result = await createTodo(todoFormData)
    }

    if (result.success) {
      closeTodoModal()
      if (selectedProjectDetail?.id) {
        await loadProjectTodos(selectedProjectDetail.id)
        // Aktualizovat počet todos
        const countResult = await countTodosByProjectId(selectedProjectDetail.id)
        if (countResult.success) {
          setProjectTodoCounts(prev => ({
            ...prev,
            [selectedProjectDetail.id!]: countResult.count || 0
          }))
        }
      }
    } else {
      alert('Chyba při ukládání úkolu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro přepnutí stavu dokončení todo
  const handleToggleTodoComplete = async (id: string, currentStatus: boolean) => {
    const result = await updateTodo(id, { is_completed: !currentStatus })
    
    if (result.success) {
      setProjectTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, is_completed: !currentStatus } : todo
      ))
      // Aktualizovat počet todos pro projekt
      if (selectedProjectDetail?.id) {
        const countResult = await countTodosByProjectId(selectedProjectDetail.id)
        if (countResult.success) {
          setProjectTodoCounts(prev => ({
            ...prev,
            [selectedProjectDetail.id!]: countResult.count || 0
          }))
        }
      }
    } else {
      alert('Chyba při aktualizaci úkolu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro přepnutí priority todo
  const handleToggleTodoPriority = async (id: string, currentPriority: boolean) => {
    const result = await updateTodo(id, { is_important: !currentPriority })
    
    if (result.success) {
      setProjectTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, is_important: !currentPriority } : todo
      ))
    } else {
      alert('Chyba při aktualizaci priority úkolu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  // Funkce pro aktualizaci pořadí todo při drag and drop
  const handleTodoReorder = async (draggedId: string, newIndex: number) => {
    const todos = [...projectTodos]
    const draggedIndex = todos.findIndex(t => t.id === draggedId)
    
    if (draggedIndex === -1) return
    
    // Přesunout úkol na novou pozici
    const [draggedTodo] = todos.splice(draggedIndex, 1)
    todos.splice(newIndex, 0, draggedTodo)
    
    // Aktualizovat pořadí všech úkolů
    const updates = todos.map((todo, index) => ({
      id: todo.id!,
      order: index
    }))
    
    // Aktualizovat lokální state okamžitě pro lepší UX
    setProjectTodos(todos.map((todo, index) => ({ ...todo, order: index })))
    
    // Uložit do databáze
    try {
      await Promise.all(
        updates.map(update => updateTodo(update.id, { order: update.order }))
      )
    } catch (error) {
      console.error('Chyba při ukládání pořadí:', error)
      // V případě chyby obnovit původní stav
      if (selectedProjectDetail?.id) {
        await loadProjectTodos(selectedProjectDetail.id)
      }
    }
  }

  // Funkce pro smazání todo
  const handleDeleteTodo = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento úkol?')) {
      return
    }

    const result = await deleteTodo(id)
    
    if (result.success) {
      setProjectTodos(prev => prev.filter(t => t.id !== id))
      if (selectedTodo?.id === id) {
        setSelectedTodo(null)
      }
      // Aktualizovat počet todos
      if (selectedProjectDetail?.id) {
        const countResult = await countTodosByProjectId(selectedProjectDetail.id)
        if (countResult.success) {
          setProjectTodoCounts(prev => ({
            ...prev,
            [selectedProjectDetail.id!]: countResult.count || 0
          }))
        }
      }
    } else {
      alert('Chyba při mazání úkolu: ' + (result.error || 'Neznámá chyba'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 w-full bg-white" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center justify-between py-3 px-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/images/rezit2.webp" 
              alt="Rezit Logo" 
              className="h-6 w-auto"
            />
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 relative z-50"
            type="button"
          >
            <div className="w-5 h-5 relative">
              {/* Hamburger lines */}
              <span className={`absolute top-0.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-2' : ''}`}></span>
              <span className={`absolute top-2 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`absolute top-3.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed top-14 left-0 right-0 bottom-0 z-30 bg-white transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full bg-white flex flex-col justify-between">
          {/* Main Navigation - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <nav className="flex flex-col space-y-8 text-center">
              {/* Projekty - bez nadpisu */}
              <button 
                onClick={() => {
                  setActiveSection('projects')
                  setIsMobileMenuOpen(false)
                }}
                className={`text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl flex items-center gap-3 justify-center ${
                  activeSection === 'projects' ? 'text-primary-500' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Projekty
              </button>
              
              <button 
                onClick={() => {
                  setActiveSection('calculator')
                  setIsMobileMenuOpen(false)
                }}
                className={`text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl flex items-center gap-3 justify-center ${
                  activeSection === 'calculator' ? 'text-primary-500' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Kalkulačka úspor
              </button>
              
              <button 
                onClick={() => {
                  setActiveSection('contact')
                  setIsMobileMenuOpen(false)
                }}
                className={`text-gray-900 hover:text-primary-500 font-sans transition-colors text-2xl flex items-center gap-3 justify-center ${
                  activeSection === 'contact' ? 'text-primary-500' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Kontaktní formulář
              </button>
            </nav>
          </div>
          
          {/* Logout Button - Bottom */}
          <div className="pb-8 text-center">
            <button
              onClick={() => {
                handleLogout()
                setIsMobileMenuOpen(false)
              }}
              className="px-6 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-2 font-sans text-lg mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Odhlásit se
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - fixed */}
      <div className="hidden md:flex fixed left-0 top-0 w-64 bg-white shadow-lg flex-col h-screen z-10">
        <div className="p-6 border-b">
          <div className="flex items-center justify-center">
            <img 
              src="/images/rezit2.webp" 
              alt="Rezit Logo" 
              className="h-10 w-auto"
            />
          </div>
        </div>
        
        <nav className="flex-1 mt-6 overflow-y-auto">
          <div className="px-6 py-2">
            {/* Projekty - bez nadpisu */}
            <div className="space-y-2 mb-6">
              <button 
                onClick={() => setActiveSection('projects')}
                className={`w-full text-left px-3 py-2 rounded-lg font-sans text-base transition-all duration-200 relative ${
                  activeSection === 'projects' 
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Projekty
                </div>
              </button>
            </div>

            {/* KLIENTI sekce */}
            <div className="space-y-2">
              <h2 className="text-sm font-heading font-semibold text-gray-500 uppercase tracking-wider mb-3">
                KLIENTI
              </h2>
              <button 
                onClick={() => setActiveSection('calculator')}
                className={`w-full text-left px-3 py-2 rounded-lg font-sans text-base transition-all duration-200 relative ${
                  activeSection === 'calculator' 
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Kalkulačka úspor
                </div>
              </button>
              
              <button 
                onClick={() => setActiveSection('contact')}
                className={`w-full text-left px-3 py-2 rounded-lg font-sans text-base transition-all duration-200 relative ${
                  activeSection === 'contact' 
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:border-l-4 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Kontaktní formulář
                </div>
              </button>
            </div>
          </div>
        </nav>

        <div className="p-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center gap-2 font-sans text-base hover:border-l-4 hover:border-red-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Odhlásit se
          </button>
        </div>
      </div>

      {/* Main Content - scrollable */}
      <div className="md:ml-64 pt-14 md:pt-0 h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          {activeSection === 'calculator' && (
            <div className="mb-6">
              <div className="flex flex-row justify-between items-center md:items-start mb-4 gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">Kalkulačka úspor</h2>
                  <p className="text-base md:text-lg text-gray-600 font-sans">
                    {filteredClients.length} {activeTab === 'all' 
                      ? getPluralForm(filteredClients.length, 'klient celkem', 'klienti celkem', 'klientů celkem')
                      : activeTab === 'deleted'
                      ? getPluralForm(filteredClients.length, 'smazaný záznam', 'smazané záznamy', 'smazaných záznamů')
                      : activeTab === 'favorite'
                      ? getPluralForm(filteredClients.length, 'oblíbený záznam', 'oblíbené záznamy', 'oblíbených záznamů')
                      : `klientů v kategorii "${activeTab === 'high' ? 'Vysoký' : activeTab === 'medium' ? 'Střední' : 'Nízký'} potenciál"`
                    }
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0 self-center md:self-start"
                  title="Obnovit data"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              {/* Filtry potenciálu */}
              <div className="w-full overflow-x-hidden md:overflow-x-visible">
                <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:px-0 md:overflow-x-visible scrollbar-hide">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeTab === 'all' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  📊 Vše ({allActiveSubmissions.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('favorite')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeTab === 'favorite' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  ⭐ Oblíbené ({allFavoriteSubmissions.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('high')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeTab === 'high' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  🟢 Vysoký potenciál ({allCategorizedClients.high.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('medium')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeTab === 'medium' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  🟡 Střední potenciál ({allCategorizedClients.medium.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('low')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeTab === 'low' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  ⚪ Nízký potenciál ({allCategorizedClients.low.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('deleted')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeTab === 'deleted' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  🗑️ Smazané ({allDeletedSubmissions.length})
                </button>
                </div>
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Chyba: {error}</p>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {filteredClients.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Žádní klienti v této kategorii</p>
                    </div>
                  ) : (
                    filteredClients.map((client) => {
                      const getPotentialLabel = () => {
                        if (activeTab === 'all') {
                          return categorizedClients.high.includes(client) ? 'Vysoký' :
                                 categorizedClients.medium.includes(client) ? 'Střední' : 'Nízký'
                        }
                        return activeTab === 'high' ? 'Vysoký' : activeTab === 'medium' ? 'Střední' : 'Nízký'
                      }
                      
                      const getPotentialClass = () => {
                        if (activeTab === 'all') {
                          return categorizedClients.high.includes(client) ? 'bg-primary-100 text-primary-700' :
                                 categorizedClients.medium.includes(client) ? 'bg-primary-50 text-primary-600' :
                                 'bg-gray-100 text-gray-600'
                        }
                        return activeTab === 'high' ? 'bg-primary-100 text-primary-700' :
                               activeTab === 'medium' ? 'bg-primary-50 text-primary-600' :
                               'bg-gray-100 text-gray-600'
                      }

                      return (
                        <div key={client.id || 'unknown'}>
                          {/* Mobile Card - Compact */}
                          <div 
                            onClick={() => setSelectedClient(client)}
                            className="md:hidden bg-white rounded-lg shadow p-4 cursor-pointer active:scale-[0.98] transition-transform"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">
                                  {client.business_name || 'Neznámý podnik'}
                                </h3>
                                <p className="text-sm text-gray-600 font-sans">
                                  {client.service_name || 'Neznámá služba'}
                                </p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-sans font-semibold ${getPotentialClass()}`}>
                                {getPotentialLabel()} potenciál
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{client.created_at ? formatDate(client.created_at) : 'Neznámé datum'}</span>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {/* Desktop Card - Full */}
                          <div key={client.id || 'unknown'} className="hidden md:block bg-white rounded-lg shadow p-6 relative">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-xl font-heading font-semibold text-gray-800">
                                  {client.business_name || 'Neznámý podnik'}
                                </h3>
                                <p className="text-base text-gray-600 font-sans">
                                  {client.service_name || 'Neznámá služba'} • {client.created_at ? formatDate(client.created_at) : 'Neznámé datum'}
                                  {client.scenario && (
                                    <> • <span className="text-primary-600 font-semibold">{getScenarioLabel(client.scenario)}</span></>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`px-4 py-2 rounded-full text-sm font-sans font-semibold ${getPotentialClass()}`}>
                                  {getPotentialLabel()} potenciál
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <p className="text-sm text-gray-600 font-sans mb-1">Měsíční obrat</p>
                                <p className="text-lg font-heading font-semibold text-gray-800">{formatCurrency(client.monthly_revenue)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-sans mb-1">Roční úspora</p>
                                <p className="text-lg font-heading font-semibold text-gray-800">
                                  {client.show_savings ? formatCurrency(client.annual_savings) : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-sans mb-1">Návratnost</p>
                                <p className="text-lg font-heading font-semibold text-gray-800">{client.payback_months} měsíců</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-sans mb-1">Poplatek</p>
                                <p className="text-lg font-heading font-semibold text-gray-800">{formatCurrency(client.monthly_fee)}</p>
                              </div>
                            </div>

                            {/* Action Buttons - Desktop */}
                            {!client.is_deleted && (
                              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                 {/* Favorite Button - Desktop */}
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     if (client.id) {
                                       handleToggleFavorite(client.id, !!client.is_favorite)
                                     }
                                   }}
                                   className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
                                   title={client.is_favorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
                                 >
                                   <svg 
                                     className={`w-5 h-5 transition-colors ${client.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
                                     fill={client.is_favorite ? 'currentColor' : 'none'} 
                                     stroke="currentColor" 
                                     viewBox="0 0 24 24"
                                   >
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                   </svg>
                                 </button>
                                 {/* Delete Button - Desktop */}
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     if (client.id) {
                                       handleDelete(client.id)
                                     }
                                   }}
                                   className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                   title="Smazat záznam"
                                 >
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                   </svg>
                                 </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="mb-6">
              <div className="flex flex-row justify-between items-center md:items-start mb-4 gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">Kontaktní formulář</h2>
                  <p className="text-base md:text-lg text-gray-600 font-sans">
                    {activeContacts.length} {activeContactTab === 'all' 
                      ? getPluralForm(activeContacts.length, 'přijatá zpráva', 'přijaté zprávy', 'přijatých zpráv')
                      : activeContactTab === 'resolved'
                      ? getPluralForm(activeContacts.length, 'vyřešená zpráva', 'vyřešené zprávy', 'vyřešených zpráv')
                      : getPluralForm(activeContacts.length, 'smazaná zpráva', 'smazané zprávy', 'smazaných zpráv')
                    }
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0 self-center md:self-start"
                  title="Obnovit data"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Filtry kontaktů */}
              <div className="w-full overflow-x-hidden md:overflow-x-visible mb-6">
                <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:px-0 md:overflow-x-visible scrollbar-hide">
                <button
                  onClick={() => setActiveContactTab('all')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeContactTab === 'all' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  📊 Vše ({allActiveContacts.length})
                </button>
                
                <button
                  onClick={() => setActiveContactTab('resolved')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeContactTab === 'resolved' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  ✅ Vyřešené ({allResolvedContacts.length})
                </button>
                
                <button
                  onClick={() => setActiveContactTab('deleted')}
                  className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                    activeContactTab === 'deleted' 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  🗑️ Smazané ({allDeletedContacts.length})
                </button>
                </div>
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Chyba: {error}</p>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {activeContacts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Žádné kontaktní zprávy</p>
                    </div>
                  ) : (
                    activeContacts.map((contact) => (
                      <div key={contact.id || 'unknown'}>
                        {/* Mobile Card - Compact */}
                        <div 
                          onClick={() => setSelectedContact(contact)}
                          className="md:hidden bg-white rounded-lg shadow p-4 cursor-pointer active:scale-[0.98] transition-transform"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">
                                {contact.name}
                              </h3>
                              <p className="text-sm text-gray-600 font-sans">
                                {contact.email}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {contact.is_resolved && (
                                <div className="px-3 py-1 rounded-full text-xs font-sans font-semibold bg-green-100 text-green-700">
                                  ✅ Vyřešené
                                </div>
                              )}
                              <div className={`px-3 py-1 rounded-full text-xs font-sans font-semibold ${
                                contact.business_type ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {contact.business_type || 'Neznámý typ'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{contact.created_at ? formatDate(contact.created_at) : 'Neznámé datum'}</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        {/* Desktop Card - Full */}
                        <div className="hidden md:block bg-white rounded-lg shadow p-6 relative">
                          {/* Action Buttons - Desktop */}
                          {contact.is_deleted ? (
                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                              {/* Recover Button - Desktop */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (contact.id) {
                                    handleRecoverContact(contact.id)
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                title="Obnovit záznam"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                              {/* Resolved Button - Desktop */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (contact.id) {
                                    handleToggleContactResolved(contact.id, !!contact.is_resolved)
                                  }
                                }}
                                className={`p-2 rounded-full transition-colors ${
                                  contact.is_resolved 
                                    ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                }`}
                                title={contact.is_resolved ? 'Označit jako nevyřešené' : 'Označit jako vyřešené'}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              {/* Delete Button - Desktop */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (contact.id) {
                                    handleContactDelete(contact.id)
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Smazat záznam"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-xl font-heading font-semibold text-gray-800">
                                {contact.name} ({contact.email})
                              </h3>
                              <p className="text-base text-gray-600 font-sans">
                                {contact.subject || 'Bez předmětu'} • {contact.created_at ? formatDate(contact.created_at) : 'Neznámé datum'}
                              </p>
                            </div>
                            <div className="text-right flex gap-2">
                              {contact.is_resolved && (
                                <div className="px-4 py-2 rounded-full text-sm font-sans font-semibold bg-green-100 text-green-700">
                                  ✅ Vyřešené
                                </div>
                              )}
                              <div className={`px-4 py-2 rounded-full text-sm font-sans font-semibold ${
                                contact.business_type ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {contact.business_type || 'Neznámý typ podnikání'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 font-sans mb-1">Zpráva:</p>
                            <p className="text-base text-gray-800 font-sans">{contact.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'projects' && !selectedProjectDetail && (
            <div className="mb-6">
              <div className="flex flex-row justify-between items-center md:items-start mb-4 gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">Projekty</h2>
                  <p className="text-base md:text-lg text-gray-600 font-sans">
                    {filteredProjects.length} {activeProjectFilter === 'all' 
                      ? getPluralForm(filteredProjects.length, 'projekt', 'projekty', 'projektů')
                      : activeProjectFilter === 'active'
                      ? getPluralForm(filteredProjects.length, 'probíhající projekt', 'probíhající projekty', 'probíhajících projektů')
                      : getPluralForm(filteredProjects.length, 'dokončený projekt', 'dokončené projekty', 'dokončených projektů')
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadData}
                    className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0 self-center md:self-start"
                    title="Obnovit data"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openProjectModal()}
                    className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0"
                    title="Přidat projekt"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filtry projektů */}
              <div className="w-full overflow-x-hidden md:overflow-x-visible mb-6">
                <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:px-0 md:overflow-x-visible scrollbar-hide">
                  <button
                    onClick={() => setActiveProjectFilter('all')}
                    className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                      activeProjectFilter === 'all' 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    📊 Vše ({projects.length})
                  </button>
                  
                  <button
                    onClick={() => setActiveProjectFilter('active')}
                    className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                      activeProjectFilter === 'active' 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    ⏳ Probíhající ({projects.filter(p => p.status === 'active' || !p.status).length})
                  </button>
                  
                  <button
                    onClick={() => setActiveProjectFilter('completed')}
                    className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                      activeProjectFilter === 'completed' 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    ✅ Dokončené ({projects.filter(p => p.status === 'completed').length})
                  </button>
                </div>
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Chyba: {error}</p>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Žádné projekty v této kategorii</p>
                    </div>
                  ) : (
                    filteredProjects.map((project) => {
                      const passwordCount = project.id ? (projectPasswordCounts[project.id] || 0) : 0
                      const todoCount = project.id ? (projectTodoCounts[project.id] || 0) : 0
                      
                      return (
                        <div key={project.id || 'unknown'}>
                          {/* Mobile Card */}
                          <div 
                            onClick={() => openProjectDetail(project)}
                            className={`md:hidden bg-white rounded-lg shadow p-4 cursor-pointer active:scale-[0.98] transition-transform border-2 ${
                              project.is_favorite ? 'border-primary-500' : 'border-transparent'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-heading font-semibold text-gray-800">
                                    {project.display_name}
                                  </h3>
                                  {project.status === 'completed' ? (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                      ✓ Dokončeno
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                                      ⏳ Probíhající
                                    </span>
                                  )}
                                </div>
                                {/* Contact Methods Icons - Mobile */}
                                {project.contact_methods && project.contact_methods.length > 0 && (
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {project.contact_methods.map((contactMethod, index) => {
                                      const icons: { [key: string]: JSX.Element } = {
                                        instagram: (
                                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                          </svg>
                                        ),
                                        facebook: (
                                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                          </svg>
                                        ),
                                        email: (
                                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                        ),
                                        whatsapp: (
                                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                          </svg>
                                        ),
                                        phone: (
                                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                        ),
                                        messenger: (
                                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.373 0 0 4.925 0 11c0 2.153.741 4.241 2.107 5.945L.08 23.644c-.133.59.424 1.062 1.014.928l5.49-1.686A11.93 11.93 0 0012 22c6.627 0 12-4.925 12-11S18.627 0 12 0zm0 19.76a10.88 10.88 0 01-5.103-1.23l-.354-.143-3.604.99.966-3.18-.24-.38A10.87 10.87 0 011.24 11c0-5.18 4.32-9.38 9.64-9.38S20.88 5.82 20.88 11c0 5.18-4.32 9.38-9.64 9.38z"/>
                                          </svg>
                                        )
                                      }
                                      return (
                                        <div 
                                          key={index} 
                                          className="flex items-center gap-1.5 flex-shrink-0" 
                                          title={`${contactMethod.method.charAt(0).toUpperCase() + contactMethod.method.slice(1)}: ${contactMethod.value}`}
                                        >
                                          {icons[contactMethod.method] || null}
                                          <span className="text-xs text-gray-600 max-w-[120px] truncate">
                                            {contactMethod.value}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span className="font-semibold">{todoCount}</span>
                                  <span className="text-gray-500">{getPluralForm(todoCount, 'úkol', 'úkoly', 'úkolů')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="font-semibold">{passwordCount}</span>
                                  <span className="text-gray-500">{getPluralForm(passwordCount, 'heslo', 'hesla', 'hesel')}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Favorite Button - Mobile */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (project.id) {
                                      handleToggleProjectFavorite(project.id, !!project.is_favorite)
                                    }
                                  }}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    project.is_favorite
                                      ? 'text-yellow-500'
                                      : 'text-gray-400'
                                  }`}
                                  title={project.is_favorite ? 'Odebrat z hlavních' : 'Označit jako hlavní'}
                                >
                                  <svg className="w-4 h-4" fill={project.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                                {/* Deadline v mobilní kartě */}
                                {project.deadline && (
                                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                                    getDaysUntilDeadline(project.deadline) <= 5
                                      ? 'bg-red-100 text-red-700'
                                      : getDaysUntilDeadline(project.deadline) <= 14
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{formatTimeUntilDeadline(project.deadline)}</span>
                                  </div>
                                )}
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Card */}
                          <div 
                            onClick={() => openProjectDetail(project)}
                            className={`hidden md:block bg-white rounded-lg shadow p-5 relative cursor-pointer hover:shadow-lg border-2 transition-all duration-200 ${
                              project.is_favorite
                                ? 'border-primary-500'
                                : project.deadline && getDaysUntilDeadline(project.deadline) <= 5
                                ? 'hover:border-red-200 border-red-200'
                                : 'hover:border-primary-200 border-transparent'
                            }`}
                          >
                            {/* Top Section */}
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h3 className="text-lg font-heading font-semibold text-gray-800">
                                    {project.display_name}
                                  </h3>
                                  {project.status === 'completed' ? (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                      ✓ Dokončeno
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                                      ⏳ Probíhající
                                    </span>
                                  )}
                                </div>
                                {/* Contact Methods Icons */}
                                {project.contact_methods && project.contact_methods.length > 0 && (
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {project.contact_methods.map((contactMethod, index) => {
                                      const icons: { [key: string]: JSX.Element } = {
                                        instagram: (
                                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                          </svg>
                                        ),
                                        facebook: (
                                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                          </svg>
                                        ),
                                        email: (
                                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                        ),
                                        whatsapp: (
                                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                          </svg>
                                        ),
                                        phone: (
                                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                        ),
                                        messenger: (
                                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.373 0 0 4.925 0 11c0 2.153.741 4.241 2.107 5.945L.08 23.644c-.133.59.424 1.062 1.014.928l5.49-1.686A11.93 11.93 0 0012 22c6.627 0 12-4.925 12-11S18.627 0 12 0zm0 19.76a10.88 10.88 0 01-5.103-1.23l-.354-.143-3.604.99.966-3.18-.24-.38A10.87 10.87 0 011.24 11c0-5.18 4.32-9.38 9.64-9.38S20.88 5.82 20.88 11c0 5.18-4.32 9.38-9.64 9.38z"/>
                                          </svg>
                                        )
                                      }
                                      return (
                                        <div 
                                          key={index} 
                                          className="flex items-center gap-1.5 flex-shrink-0" 
                                          title={`${contactMethod.method.charAt(0).toUpperCase() + contactMethod.method.slice(1)}: ${contactMethod.value}`}
                                        >
                                          {icons[contactMethod.method] || null}
                                          <span className="text-xs text-gray-600 max-w-[120px] truncate">
                                            {contactMethod.value}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                              
                              {/* Deadline nebo Datum v pravém horním rohu */}
                              {project.deadline ? (
                                <div className={`flex items-center gap-1.5 text-xs ml-4 flex-shrink-0 font-semibold px-2 py-1 rounded-full ${
                                  getDaysUntilDeadline(project.deadline) <= 5
                                    ? 'bg-red-100 text-red-700'
                                    : getDaysUntilDeadline(project.deadline) <= 14
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{formatTimeUntilDeadline(project.deadline)}</span>
                                </div>
                              ) : project.created_at && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-4 flex-shrink-0">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{formatDate(project.created_at)}</span>
                                </div>
                              )}
                            </div>

                            {/* Bottom Section - Počet todos a hesel vlevo a tlačítka vpravo */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              {/* Počet todos a hesel vlevo */}
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span className="font-medium text-gray-700">
                                    {todoCount} {getPluralForm(todoCount, 'úkol', 'úkoly', 'úkolů')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="font-medium text-gray-700">
                                    {passwordCount} {getPluralForm(passwordCount, 'heslo', 'hesla', 'hesel')}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Action Buttons vpravo */}
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {/* Favorite Button */}
                                <button
                                  onClick={() => {
                                    if (project.id) {
                                      handleToggleProjectFavorite(project.id, !!project.is_favorite)
                                    }
                                  }}
                                  className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                                    project.is_favorite
                                      ? 'text-yellow-500 hover:bg-yellow-50'
                                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                  }`}
                                  title={project.is_favorite ? 'Odebrat z hlavních' : 'Označit jako hlavní'}
                                >
                                  <svg className="w-4 h-4" fill={project.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                                {/* Edit Button */}
                                <button
                                  onClick={() => openProjectModal(project)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
                                  title="Upravit projekt"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                {/* Toggle Status Button */}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    if (project.id) {
                                      const newStatus = project.status === 'completed' ? 'active' : 'completed'
                                      const result = await updateProject(project.id, { status: newStatus })
                                      if (result.success) {
                                        setProjects(prev => prev.map(p => 
                                          p.id === project.id ? { ...p, status: newStatus } : p
                                        ))
                                      }
                                    }
                                  }}
                                  className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                                    project.status === 'completed'
                                      ? 'text-green-600 hover:bg-green-50'
                                      : 'text-gray-400 hover:bg-gray-50'
                                  }`}
                                  title={project.status === 'completed' ? 'Označit jako čekající' : 'Označit jako dokončené'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                                
                                {/* Delete Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (project.id) {
                                      handleDeleteProject(project.id)
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                  title="Smazat projekt"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Detail projektu */}
          {activeSection === 'projects' && selectedProjectDetail && (
            <div className="mb-6">
              <div className="flex flex-row justify-between items-center md:items-start mb-4 gap-4">
                <div className="flex-1">
                  <button
                    onClick={closeProjectDetail}
                    className="mb-2 text-primary-600 hover:text-primary-700 flex items-center gap-2 font-sans text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Zpět na projekty
                  </button>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">{selectedProjectDetail.display_name}</h2>
                  <p className="text-base md:text-lg text-gray-600 font-sans">
                    {selectedProjectDetail.name} {selectedProjectDetail.description && `• ${selectedProjectDetail.description}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (selectedProjectDetail.id) {
                        await loadProjectPasswords(selectedProjectDetail.id)
                        await loadProjectTodos(selectedProjectDetail.id)
                        await loadProjectNotes(selectedProjectDetail.id)
                        await loadProjectFinances(selectedProjectDetail.id)
                      }
                    }}
                    className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0 self-center md:self-start"
                    title="Obnovit data"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  {activeProjectTab === 'passwords' && (
                    <button
                      onClick={() => openPasswordModal()}
                      className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0"
                      title="Přidat heslo"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                  {activeProjectTab === 'todos' && (
                    <button
                      onClick={() => openTodoModal()}
                      className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0"
                      title="Přidat úkol"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                  {activeProjectTab === 'notes' && (
                    <button
                      onClick={() => openNoteModal()}
                      className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0"
                      title="Přidat poznámku"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                  {activeProjectTab === 'finances' && (
                    <button
                      onClick={() => openFinanceModal()}
                      className="p-2 md:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0"
                      title="Přidat finanční záznam"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Taby a Searchbar */}
              <div className="w-full overflow-x-hidden md:overflow-x-visible mb-6">
                <div className="flex gap-3 items-center overflow-x-auto pb-2 px-4 md:px-0 md:overflow-x-visible scrollbar-hide">
                  <button
                    onClick={() => setActiveProjectTab('todos')}
                    className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                      activeProjectTab === 'todos' 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    ✅ To-Do ({projectTodos.length})
                  </button>
                  <button
                    onClick={() => setActiveProjectTab('passwords')}
                    className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                      activeProjectTab === 'passwords' 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    🔐 Hesla ({projectPasswords.length})
                  </button>
                  <button
                    onClick={() => setActiveProjectTab('notes')}
                    className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                      activeProjectTab === 'notes' 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    📝 Poznámky ({projectNotes.length})
                  </button>
                  <button
                    onClick={() => setActiveProjectTab('finances')}
                    className={`px-5 py-3 rounded-full text-sm font-sans font-semibold transition-colors whitespace-nowrap flex-shrink-0 border ${
                      activeProjectTab === 'finances' 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    💰 Finance ({projectFinances.length})
                  </button>
                  
                  {/* Searchbar */}
                  <div className="relative ml-auto flex-shrink-0">
                    <input
                      type="text"
                      value={activeProjectTab === 'passwords' ? passwordSearchQuery : activeProjectTab === 'notes' ? noteSearchQuery : activeProjectTab === 'finances' ? financeSearchQuery : todoSearchQuery}
                      onChange={(e) => {
                        if (activeProjectTab === 'passwords') {
                          setPasswordSearchQuery(e.target.value)
                        } else if (activeProjectTab === 'notes') {
                          setNoteSearchQuery(e.target.value)
                        } else if (activeProjectTab === 'finances') {
                          setFinanceSearchQuery(e.target.value)
                        } else {
                          setTodoSearchQuery(e.target.value)
                        }
                      }}
                      placeholder={activeProjectTab === 'passwords' ? 'Vyhledat heslo...' : activeProjectTab === 'notes' ? 'Vyhledat poznámku...' : activeProjectTab === 'finances' ? 'Vyhledat finanční záznam...' : 'Vyhledat úkol...'}
                      className="px-4 py-3 pl-11 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans text-sm w-64"
                    />
                    <svg 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {(activeProjectTab === 'passwords' ? passwordSearchQuery : activeProjectTab === 'notes' ? noteSearchQuery : activeProjectTab === 'finances' ? financeSearchQuery : todoSearchQuery) && (
                      <button
                        onClick={() => {
                          if (activeProjectTab === 'passwords') {
                            setPasswordSearchQuery('')
                          } else if (activeProjectTab === 'notes') {
                            setNoteSearchQuery('')
                          } else if (activeProjectTab === 'finances') {
                            setFinanceSearchQuery('')
                          } else {
                            setTodoSearchQuery('')
                          }
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        title="Vymazat vyhledávání"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Obsah podle aktivního tabu */}
              {activeProjectTab === 'passwords' && (
                <div>
                  {/* Toast notifikace pro kopírování */}
                  {copyToast && (
                    <div className="fixed bottom-4 right-4 z-50 bg-primary-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-sans font-semibold">Heslo zkopírováno!</span>
                    </div>
                  )}

                  {(() => {
                    // Filtrování hesel podle search query
                    const filteredPasswords = passwordSearchQuery
                      ? projectPasswords.filter(p => 
                          p.service_name.toLowerCase().includes(passwordSearchQuery.toLowerCase()) ||
                          p.username?.toLowerCase().includes(passwordSearchQuery.toLowerCase()) ||
                          p.url?.toLowerCase().includes(passwordSearchQuery.toLowerCase()) ||
                          p.notes?.toLowerCase().includes(passwordSearchQuery.toLowerCase())
                        )
                      : projectPasswords

                    if (filteredPasswords.length === 0) {
                      return (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                          <p className="text-gray-500">
                            {passwordSearchQuery ? 'Žádná hesla neodpovídají vyhledávání' : 'Žádná hesla pro tento projekt'}
                          </p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-4">
                        {filteredPasswords.map((password) => {
                        const passwordId = password.id || 'unknown'
                        const isVisible = isPasswordVisible[passwordId] || false
                        const isExpanded = expandedPasswords[passwordId] || false

                        return (
                          <div key={passwordId} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                            {/* Header - Název služby a tlačítka - klikatelné pro rozbalení */}
                            <div 
                              onClick={() => {
                                setExpandedPasswords(prev => ({
                                  ...prev,
                                  [passwordId]: !prev[passwordId]
                                }))
                              }}
                              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <svg 
                                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <h3 className="text-lg font-heading font-semibold text-gray-800">
                                  {password.service_name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openPasswordModal(password)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Upravit heslo"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    if (password.id) {
                                      handleDeletePassword(password.id)
                                    }
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title="Smazat heslo"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Rozbalený obsah */}
                            {isExpanded && (
                              <div className="px-4 pb-6 pt-2 border-t border-gray-100">
                                {/* Hlavní obsah - Grid layout */}
                                {password.username ? (
                                  <>
                                    {/* Pokud je uživatelské jméno: Username a Password na jednom řádku */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                      {/* Uživatelské jméno */}
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-sans">
                                          Uživatelské jméno
                                        </label>
                                        <div className="bg-gray-50 rounded-lg px-4 py-3">
                                          <p className="text-base font-sans text-gray-800 break-all">
                                            {password.username}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Heslo */}
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-sans">
                                          Heslo
                                        </label>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                                          <p className="flex-1 text-base font-sans text-gray-800 font-mono break-all">
                                            {isVisible ? password.password : '••••••••'}
                                          </p>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Tlačítko pro kopírování - zobrazí se pouze když je heslo viditelné */}
                                            {isVisible && (
                                              <button
                                                onClick={() => copyPasswordToClipboard(password.password)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Kopírovat heslo"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                              </button>
                                            )}
                                            <button
                                              onClick={() => togglePasswordVisibility(passwordId)}
                                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                              title={isVisible ? 'Skrýt heslo' : 'Zobrazit heslo'}
                                            >
                                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isVisible ? (
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                ) : (
                                                  <>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                                                  </>
                                                )}
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* URL a Poznámky na druhém řádku (pokud existují) */}
                                    {(password.url || password.notes) && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* URL */}
                                        {password.url ? (
                                          <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-sans">
                                              URL
                                            </label>
                                            <div className="bg-gray-50 rounded-lg px-4 py-3">
                                              <a 
                                                href={password.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-base font-sans text-primary-600 hover:text-primary-700 underline break-all"
                                              >
                                                {password.url}
                                              </a>
                                            </div>
                                          </div>
                                        ) : null}

                                        {/* Poznámky */}
                                        {password.notes ? (
                                          <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-sans">
                                              Poznámky
                                            </label>
                                            <div className="bg-gray-50 rounded-lg px-4 py-3">
                                              <p className="text-base font-sans text-gray-800 whitespace-pre-wrap break-words">{password.notes}</p>
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {/* Pokud není uživatelské jméno: Password a URL/Poznámky vedle sebe */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Heslo */}
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-sans">
                                          Heslo
                                        </label>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                                          <p className="flex-1 text-base font-sans text-gray-800 font-mono break-all">
                                            {isVisible ? password.password : '••••••••'}
                                          </p>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Tlačítko pro kopírování - zobrazí se pouze když je heslo viditelné */}
                                            {isVisible && (
                                              <button
                                                onClick={() => copyPasswordToClipboard(password.password)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Kopírovat heslo"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                              </button>
                                            )}
                                            <button
                                              onClick={() => togglePasswordVisibility(passwordId)}
                                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                              title={isVisible ? 'Skrýt heslo' : 'Zobrazit heslo'}
                                            >
                                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isVisible ? (
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                ) : (
                                                  <>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                                                  </>
                                                )}
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* URL nebo Poznámky */}
                                      {password.url ? (
                                        <div>
                                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-sans">
                                            URL
                                          </label>
                                          <div className="bg-gray-50 rounded-lg px-4 py-3">
                                            <a 
                                              href={password.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-base font-sans text-primary-600 hover:text-primary-700 underline break-all"
                                            >
                                              {password.url}
                                            </a>
                                          </div>
                                        </div>
                                      ) : password.notes ? (
                                        <div>
                                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-sans">
                                            Poznámky
                                          </label>
                                          <div className="bg-gray-50 rounded-lg px-4 py-3">
                                            <p className="text-base font-sans text-gray-800 whitespace-pre-wrap break-words">{password.notes}</p>
                                          </div>
                                        </div>
                                      ) : (
                                        <div></div>
                                      )}
                                    </div>

                                    {/* Pokud je URL i Poznámky, zobrazit poznámky pod heslem */}
                                    {password.url && password.notes && (
                                      <div className="mt-6">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-sans">
                                          Poznámky
                                        </label>
                                        <div className="bg-gray-50 rounded-lg px-4 py-3">
                                          <p className="text-base font-sans text-gray-800 whitespace-pre-wrap break-words">{password.notes}</p>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )
                        })}
                      </div>
                    )
                  })()}
                </div>
              )}

              {activeProjectTab === 'todos' && (
                <div>
                  {(() => {
                    // Filtrování todos podle search query
                    const filteredTodos = (todoSearchQuery
                      ? projectTodos.filter(t => 
                          t.title.toLowerCase().includes(todoSearchQuery.toLowerCase()) ||
                          t.description?.toLowerCase().includes(todoSearchQuery.toLowerCase())
                        )
                      : projectTodos
                    ).sort((a, b) => {
                      // Nejdřív podle dokončení (nehotové nahoře)
                      const aCompleted = a.is_completed ? 1 : 0
                      const bCompleted = b.is_completed ? 1 : 0
                      if (aCompleted !== bCompleted) {
                        return aCompleted - bCompleted
                      }
                      
                      // Pak podle vlastního pořadí (pokud je nastaveno) - ale jen pro úkoly se stejným stavem dokončení
                      const aHasOrder = a.order !== undefined && a.order !== null
                      const bHasOrder = b.order !== undefined && b.order !== null
                      
                      if (aHasOrder && bHasOrder) {
                        return a.order! - b.order!
                      }
                      if (aHasOrder && !bHasOrder) return -1
                      if (!aHasOrder && bHasOrder) return 1
                      
                      // Pak podle priority (důležité nahoře)
                      const aImportant = a.is_important ? 1 : 0
                      const bImportant = b.is_important ? 1 : 0
                      if (aImportant !== bImportant) {
                        return bImportant - aImportant
                      }
                      
                      return 0
                    })

                    if (filteredTodos.length === 0) {
                      return (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                          <p className="text-gray-500">
                            {todoSearchQuery ? 'Žádné úkoly neodpovídají vyhledávání' : 'Žádné úkoly pro tento projekt'}
                          </p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-3">
                        {filteredTodos.map((todo, index) => (
                          <div
                            key={todo.id || 'unknown'}
                            onDragOver={(e) => {
                              e.preventDefault()
                              if (draggedTodoId) {
                                e.dataTransfer.dropEffect = 'move'
                                setDragOverIndex(index)
                              }
                            }}
                            onDragLeave={() => {
                              setDragOverIndex(null)
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              if (draggedTodoId && draggedTodoId !== todo.id) {
                                handleTodoReorder(draggedTodoId, index)
                              }
                              setDraggedTodoId(null)
                              setDragOverIndex(null)
                            }}
                            onClick={(e) => {
                              // Pokud klikneme na drag handle nebo action buttons, neoznačuj jako hotové
                              const target = e.target as HTMLElement
                              if (target.closest('button') || target.closest('.drag-handle')) {
                                return
                              }
                              if (todo.id) {
                                handleToggleTodoComplete(todo.id, !!todo.is_completed)
                              }
                            }}
                            className={`bg-white rounded-lg shadow hover:shadow-md transition-all overflow-hidden p-4 border-l-4 cursor-pointer ${
                              todo.is_completed 
                                ? 'border-green-500 opacity-75' 
                                : todo.is_important
                                ? 'border-yellow-500'
                                : 'border-primary-500'
                            } ${
                              dragOverIndex === index ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              {/* Drag Handle */}
                              <div 
                                className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 drag-handle" 
                                draggable
                                onDragStart={(e) => {
                                  setDraggedTodoId(todo.id || null)
                                  e.dataTransfer.effectAllowed = 'move'
                                  e.dataTransfer.setData('text/html', '')
                                }}
                                onDragEnd={() => {
                                  setDraggedTodoId(null)
                                  setDragOverIndex(null)
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>
                              
                              {/* Checkbox - kolečko */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    todo.is_completed
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {todo.is_completed && (
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>

                                {/* Obsah */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className={`text-lg font-heading font-semibold ${
                                      todo.is_completed 
                                        ? 'text-gray-500 line-through' 
                                        : 'text-gray-800'
                                    }`}>
                                      {todo.title}
                                    </h3>
                                  </div>
                                  {todo.description && (
                                    <p className={`text-sm font-sans mt-1 ${
                                      todo.is_completed 
                                        ? 'text-gray-400 line-through' 
                                        : 'text-gray-600'
                                    }`}>
                                      {todo.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                {/* Priority Button - Hvězdička */}
                                <button
                                  onClick={() => {
                                    if (todo.id) {
                                      handleToggleTodoPriority(todo.id, !!todo.is_important)
                                    }
                                  }}
                                  className={`p-2 rounded-full transition-colors ${
                                    todo.is_important
                                      ? 'text-yellow-500 hover:bg-yellow-50'
                                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                  }`}
                                  title={todo.is_important ? 'Odebrat prioritu' : 'Označit jako důležité'}
                                >
                                  <svg className="w-5 h-5" fill={todo.is_important ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => openTodoModal(todo)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Upravit úkol"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    if (todo.id) {
                                      handleDeleteTodo(todo.id)
                                    }
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title="Smazat úkol"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}

              {activeProjectTab === 'notes' && (
                <div>
                  {(() => {
                    // Filtrování poznámek podle search query
                    const filteredNotes = noteSearchQuery
                      ? projectNotes.filter(n => 
                          n.content.toLowerCase().includes(noteSearchQuery.toLowerCase())
                        )
                      : projectNotes

                    if (filteredNotes.length === 0) {
                      return (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                          <p className="text-gray-500">
                            {noteSearchQuery ? 'Žádné poznámky neodpovídají vyhledávání' : 'Žádné poznámky pro tento projekt'}
                          </p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-3">
                        {filteredNotes.map((note) => (
                          <div
                            key={note.id || 'unknown'}
                            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden p-4 border-l-4 border-primary-500"
                          >
                            <div className="flex items-center justify-between gap-4">
                              {/* Obsah */}
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-sans text-gray-800 whitespace-pre-wrap break-words">
                                  {note.content}
                                </p>
                                {note.created_at && (
                                  <p className="text-xs text-gray-400 mt-2 font-sans">
                                    {formatDate(note.created_at)}
                                  </p>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => openNoteModal(note)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Upravit poznámku"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    if (note.id) {
                                      handleDeleteNote(note.id)
                                    }
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title="Smazat poznámku"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}

              {activeProjectTab === 'finances' && (
                <div>
                  {(() => {
                    // Filtrování finančních záznamů podle search query
                    const filteredFinances = financeSearchQuery
                      ? projectFinances.filter(f => 
                          f.description.toLowerCase().includes(financeSearchQuery.toLowerCase()) ||
                          (f.amount && f.amount.toString().includes(financeSearchQuery))
                        )
                      : projectFinances

                    // Výpočet celkových částek a hodin
                    const totalAmount = filteredFinances.reduce((sum, f) => sum + (f.amount || 0), 0)
                    const totalHours = filteredFinances.reduce((sum, f) => sum + (f.hours || 0), 0)

                    if (filteredFinances.length === 0) {
                      return (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                          <p className="text-gray-500">
                            {financeSearchQuery ? 'Žádné finanční záznamy neodpovídají vyhledávání' : 'Žádné finanční záznamy pro tento projekt'}
                          </p>
                        </div>
                      )
                    }

                    return (
                      <div>
                        {/* Souhrn */}
                        {(totalAmount > 0 || totalHours > 0) && (
                          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 mb-4 border border-primary-200">
                            <div className="flex flex-wrap gap-4 justify-between items-center">
                              {totalAmount > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 font-sans">Celkem naúčtováno</p>
                                  <p className="text-2xl font-bold text-primary-700 font-sans">{totalAmount.toLocaleString('cs-CZ')} Kč</p>
                                </div>
                              )}
                              {totalHours > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 font-sans">Celkem hodin</p>
                                  <p className="text-2xl font-bold text-primary-700 font-sans">{totalHours.toFixed(1)} h</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Seznam záznamů */}
                        <div className="space-y-3">
                          {filteredFinances.map((finance) => (
                            <div
                              key={finance.id || 'unknown'}
                              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden p-4 border-l-4 border-primary-500"
                            >
                              <div className="flex items-center justify-between gap-4">
                                {/* Obsah */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-sans font-semibold text-gray-800">
                                    {finance.description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 mt-2">
                                    {finance.amount && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm text-gray-600 font-sans">Částka:</span>
                                        <span className="text-sm font-semibold text-primary-600 font-sans">{finance.amount.toLocaleString('cs-CZ')} Kč</span>
                                      </div>
                                    )}
                                    {finance.hours && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm text-gray-600 font-sans">Hodiny:</span>
                                        <span className="text-sm font-semibold text-primary-600 font-sans">{finance.hours.toFixed(1)} h</span>
                                      </div>
                                    )}
                                    {finance.notes && (
                                      <div className="w-full mt-2">
                                        <span className="text-sm text-gray-600 font-sans">Poznámka:</span>
                                        <p className="text-sm text-gray-700 font-sans mt-1 whitespace-pre-wrap">{finance.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => openFinanceModal(finance)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Upravit finanční záznam"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (finance.id) {
                                        handleDeleteFinance(finance.id)
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Smazat finanční záznam"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Client Detail Modal */}
      {selectedClient && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end animate-fade-in"
          onClick={() => setSelectedClient(null)}
        >
          <div 
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-heading font-bold text-gray-800">
                {selectedClient.business_name || 'Neznámý podnik'}
              </h3>
              <div className="flex items-center gap-2">
                {/* Favorite Button - Mobile Modal */}
                {!selectedClient.is_deleted && selectedClient.id && (
                  <button
                    onClick={() => handleToggleFavorite(selectedClient.id!, !!selectedClient.is_favorite)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title={selectedClient.is_favorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
                  >
                    <svg 
                      className={`w-6 h-6 transition-colors ${selectedClient.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
                      fill={selectedClient.is_favorite ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-1">Služba</p>
                    <p className="text-base font-sans text-gray-800">{selectedClient.service_name || 'Neznámá služba'}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-sans font-semibold ${
                    activeTab === 'all' ? (
                      categorizedClients.high.includes(selectedClient) ? 'bg-primary-100 text-primary-700' :
                      categorizedClients.medium.includes(selectedClient) ? 'bg-primary-50 text-primary-600' :
                      'bg-gray-100 text-gray-600'
                    ) : (
                      activeTab === 'high' ? 'bg-primary-100 text-primary-700' :
                      activeTab === 'medium' ? 'bg-primary-50 text-primary-600' :
                      'bg-gray-100 text-gray-600'
                    )
                  }`}>
                    {activeTab === 'all' ? (
                      categorizedClients.high.includes(selectedClient) ? 'Vysoký' :
                      categorizedClients.medium.includes(selectedClient) ? 'Střední' :
                      'Nízký'
                    ) : (
                      activeTab === 'high' ? 'Vysoký' : activeTab === 'medium' ? 'Střední' : 'Nízký'
                    )} potenciál
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-sans mb-1">Datum</p>
                  <p className="text-base font-sans text-gray-800">
                    {selectedClient.created_at ? formatDate(selectedClient.created_at) : 'Neznámé datum'}
                  </p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Měsíční obrat</p>
                  <p className="text-lg font-heading font-semibold text-gray-800">
                    {formatCurrency(selectedClient.monthly_revenue)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Měsíční poplatek</p>
                  <p className="text-lg font-heading font-semibold text-gray-800">
                    {formatCurrency(selectedClient.monthly_fee)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Roční úspora</p>
                  <p className="text-lg font-heading font-semibold text-gray-800">
                    {selectedClient.show_savings ? formatCurrency(selectedClient.annual_savings) : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Návratnost</p>
                  <p className="text-lg font-heading font-semibold text-gray-800">
                    {selectedClient.payback_months} měsíců
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-sans mb-2">Procentní poplatek</p>
                  <p className="text-base font-sans text-gray-800">{selectedClient.fee_percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-sans mb-2">Roční náklady konkurence</p>
                  <p className="text-base font-sans text-gray-800">
                    {formatCurrency(selectedClient.annual_competitor_costs)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-sans mb-2">Cena Rezit</p>
                  <p className="text-base font-sans text-gray-800">
                    {formatCurrency(selectedClient.rezit_price)}
                  </p>
                </div>
                {selectedClient.show_five_year_savings && (
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-2">Úspora za 5 let</p>
                    <p className="text-base font-sans text-gray-800">
                      {formatCurrency(selectedClient.five_year_savings)}
                    </p>
                  </div>
                )}
                {selectedClient.scenario && (
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-2">Scénář</p>
                    <p className="text-base font-sans text-gray-800">{getScenarioLabel(selectedClient.scenario)}</p>
                  </div>
                )}
                {selectedClient.message && (
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-2">Zpráva</p>
                    <p className="text-base font-sans text-gray-800">{selectedClient.message}</p>
                  </div>
                )}
              </div>

               {/* Delete Button - Mobile */}
               {!selectedClient.is_deleted && selectedClient.id && (
                 <div className="pt-4 border-t border-gray-200">
                   <button
                     onClick={() => handleDelete(selectedClient.id!)}
                     className="w-full px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2 font-sans font-semibold"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                     Smazat záznam
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Contact Detail Modal */}
      {selectedContact && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end animate-fade-in"
          onClick={() => setSelectedContact(null)}
        >
          <div 
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-heading font-bold text-gray-800">
                {selectedContact.name}
              </h3>
              <div className="flex items-center gap-2">
                {/* Resolved Button - Mobile Modal */}
                {!selectedContact.is_deleted && selectedContact.id && (
                  <button
                    onClick={() => handleToggleContactResolved(selectedContact.id!, !!selectedContact.is_resolved)}
                    className={`p-2 rounded-full transition-colors ${
                      selectedContact.is_resolved 
                        ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={selectedContact.is_resolved ? 'Označit jako nevyřešené' : 'Označit jako vyřešené'}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 font-sans mb-1">Email</p>
                  <p className="text-base font-sans text-gray-800">{selectedContact.email}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 font-sans mb-1">Datum</p>
                  <p className="text-base font-sans text-gray-800">
                    {selectedContact.created_at ? formatDate(selectedContact.created_at) : 'Neznámé datum'}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 font-sans mb-1">Obor podnikání</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-sans font-semibold inline-block ${
                    selectedContact.business_type ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedContact.business_type || 'Neznámý typ podnikání'}
                  </div>
                </div>
                {selectedContact.subject && (
                  <div>
                    <p className="text-sm text-gray-500 font-sans mb-1">Předmět</p>
                    <p className="text-base font-sans text-gray-800">{selectedContact.subject}</p>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 font-sans mb-2">Zpráva</p>
                <p className="text-base font-sans text-gray-800 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              {/* Additional Info */}
              {(selectedContact.ip_address || selectedContact.user_agent) && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  {selectedContact.ip_address && (
                    <div>
                      <p className="text-xs text-gray-500 font-sans mb-1">IP adresa</p>
                      <p className="text-sm font-sans text-gray-600">{selectedContact.ip_address}</p>
                    </div>
                  )}
                  {selectedContact.user_agent && (
                    <div>
                      <p className="text-xs text-gray-500 font-sans mb-1">User Agent</p>
                      <p className="text-sm font-sans text-gray-600 break-all">{selectedContact.user_agent}</p>
                    </div>
                  )}
                </div>
              )}

               {/* Action Buttons - Mobile */}
               {selectedContact.id && (selectedContact.is_deleted ? (
                 <div className="pt-4 border-t border-gray-200">
                   <button
                     onClick={() => handleRecoverContact(selectedContact.id!)}
                     className="w-full px-4 py-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center gap-2 font-sans font-semibold"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     Obnovit záznam
                   </button>
                 </div>
               ) : (
                 <div className="pt-4 border-t border-gray-200">
                   <button
                     onClick={() => handleContactDelete(selectedContact.id!)}
                     className="w-full px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2 font-sans font-semibold"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                     Smazat záznam
                   </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Password Modal - Add/Edit */}
      {isPasswordModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={closePasswordModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-heading font-bold text-gray-800">
                {selectedPassword ? 'Upravit heslo' : 'Přidat nové heslo'}
              </h3>
              <button
                onClick={closePasswordModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Service Name */}
              <div>
                <label htmlFor="service_name" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Název služby/účtu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="service_name"
                  value={passwordFormData.service_name}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, service_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Např. Admin panel, Supabase, Vercel..."
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Uživatelské jméno
                </label>
                <input
                  type="text"
                  id="username"
                  value={passwordFormData.username}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Uživatelské jméno (volitelné)"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Heslo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="password"
                  value={passwordFormData.password}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans font-mono"
                  placeholder="Heslo"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={passwordFormData.url}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="https://..."
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Poznámky
                </label>
                <textarea
                  id="notes"
                  value={passwordFormData.notes}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Další informace k heslu..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-sans font-semibold"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSavePassword}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors font-sans font-semibold"
                >
                  {selectedPassword ? 'Uložit změny' : 'Přidat heslo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal - Add/Edit */}
      {isProjectModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={closeProjectModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-heading font-bold text-gray-800">
                {selectedProject ? 'Upravit projekt' : 'Přidat nový projekt'}
              </h3>
              <button
                onClick={closeProjectModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Project Name */}
              <div>
                <label htmlFor="project_name" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Název projektu (ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="project_name"
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="např. blackrosebarber, msstudio..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Malými písmeny, bez mezer (použije se jako ID)</p>
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="display_name" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Zobrazované jméno <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="display_name"
                  value={projectFormData.display_name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, display_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="např. Black Rose Barber, MS Studio Hair..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Popis
                </label>
                <textarea
                  id="description"
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Popis projektu..."
                  rows={3}
                />
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Deadline (volitelné)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    id="deadline"
                    value={projectFormData.deadline || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, deadline: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  />
                  {projectFormData.deadline && (
                    <button
                      type="button"
                      onClick={() => setProjectFormData({ ...projectFormData, deadline: '' })}
                      className="px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-sans font-medium text-sm whitespace-nowrap"
                      title="Odebrat deadline"
                    >
                      Odebrat
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Methods */}
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Způsoby kontaktování (volitelné, max 6)
                </label>
                
                {/* Přidání nového způsobu */}
                <div className="flex gap-2 mb-3">
                  <select
                    value={newContactMethod.method}
                    onChange={(e) => setNewContactMethod({ ...newContactMethod, method: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  >
                    <option value="">Vyberte způsob...</option>
                    <option value="instagram">📷 Instagram</option>
                    <option value="facebook">👤 Facebook</option>
                    <option value="email">✉️ Email</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="phone">📞 Telefon</option>
                    <option value="messenger">💭 Messenger</option>
                  </select>
                  <input
                    type="text"
                    value={newContactMethod.value}
                    onChange={(e) => setNewContactMethod({ ...newContactMethod, value: e.target.value })}
                    placeholder="Username, email, telefon..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                    disabled={!newContactMethod.method}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newContactMethod.method && newContactMethod.value.trim() && (projectFormData.contact_methods?.length || 0) < 6) {
                        const currentMethods = projectFormData.contact_methods || []
                        // Zkontrolovat, jestli už není tento způsob přidaný
                        if (!currentMethods.some(m => m.method === newContactMethod.method)) {
                          setProjectFormData({
                            ...projectFormData,
                            contact_methods: [...currentMethods, {
                              method: newContactMethod.method as 'instagram' | 'facebook' | 'email' | 'whatsapp' | 'phone' | 'messenger',
                              value: newContactMethod.value.trim()
                            }]
                          })
                          setNewContactMethod({ method: '', value: '' })
                        } else {
                          alert('Tento způsob kontaktování už je přidaný')
                        }
                      }
                    }}
                    disabled={!newContactMethod.method || !newContactMethod.value.trim() || (projectFormData.contact_methods?.length || 0) >= 6}
                    className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-sans font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Přidat
                  </button>
                </div>

                {/* Seznam přidaných způsobů */}
                {projectFormData.contact_methods && projectFormData.contact_methods.length > 0 && (
                  <div className="space-y-2">
                    {projectFormData.contact_methods.map((contactMethod, index) => {
                      const methodLabels: { [key: string]: string } = {
                        instagram: '📷 Instagram',
                        facebook: '👤 Facebook',
                        email: '✉️ Email',
                        whatsapp: '💬 WhatsApp',
                        phone: '📞 Telefon',
                        messenger: '💭 Messenger'
                      }
                      return (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 min-w-[120px]">
                            {methodLabels[contactMethod.method] || contactMethod.method}
                          </span>
                          <input
                            type="text"
                            value={contactMethod.value}
                            onChange={(e) => {
                              const updatedMethods = [...(projectFormData.contact_methods || [])]
                              updatedMethods[index] = { ...contactMethod, value: e.target.value }
                              setProjectFormData({ ...projectFormData, contact_methods: updatedMethods })
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans text-sm"
                            placeholder="Username, email, telefon..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedMethods = projectFormData.contact_methods?.filter((_, i) => i !== index) || []
                              setProjectFormData({ ...projectFormData, contact_methods: updatedMethods })
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Odebrat"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {projectFormData.contact_methods && projectFormData.contact_methods.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Přidáno: {projectFormData.contact_methods.length} / 6
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Status projektu
                </label>
                <select
                  id="status"
                  value={projectFormData.status || 'active'}
                  onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value as 'active' | 'completed' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                >
                  <option value="active">⏳ Probíhající</option>
                  <option value="completed">✅ Dokončené</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeProjectModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-sans font-semibold"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSaveProject}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors font-sans font-semibold"
                >
                  {selectedProject ? 'Uložit změny' : 'Přidat projekt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Todo Modal - Add/Edit */}
      {isTodoModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={closeTodoModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-heading font-bold text-gray-800">
                {selectedTodo ? 'Upravit úkol' : 'Přidat nový úkol'}
              </h3>
              <button
                onClick={closeTodoModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="todo_title" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Název úkolu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="todo_title"
                  value={todoFormData.title}
                  onChange={(e) => setTodoFormData({ ...todoFormData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Např. Dokončit design..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="todo_description" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Popis
                </label>
                <textarea
                  id="todo_description"
                  value={todoFormData.description}
                  onChange={(e) => setTodoFormData({ ...todoFormData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Detailnější popis úkolu..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeTodoModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-sans font-semibold"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSaveTodo}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors font-sans font-semibold"
                >
                  {selectedTodo ? 'Uložit změny' : 'Přidat úkol'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finance Modal - Add/Edit */}
      {isFinanceModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={closeFinanceModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-gray-800">
                {selectedFinance ? 'Upravit finanční záznam' : 'Přidat finanční záznam'}
              </h2>
              <button
                onClick={closeFinanceModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label htmlFor="finance-description" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Popis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="finance-description"
                  value={financeFormData.description}
                  onChange={(e) => setFinanceFormData({ ...financeFormData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Za co (např. Web design, Vývoj funkcí...)"
                />
              </div>

              {/* Amount and Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label htmlFor="finance-amount" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Částka (Kč)
                  </label>
                  <input
                    type="number"
                    id="finance-amount"
                    value={financeFormData.amount || ''}
                    onChange={(e) => setFinanceFormData({ ...financeFormData, amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Hours */}
                <div>
                  <label htmlFor="finance-hours" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Odpracované hodiny
                  </label>
                  <input
                    type="number"
                    id="finance-hours"
                    value={financeFormData.hours || ''}
                    onChange={(e) => setFinanceFormData({ ...financeFormData, hours: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="finance-notes" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Poznámka (volitelné)
                </label>
                <textarea
                  id="finance-notes"
                  value={financeFormData.notes || ''}
                  onChange={(e) => setFinanceFormData({ ...financeFormData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Další informace k finančnímu záznamu..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeFinanceModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-sans font-semibold"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSaveFinance}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors font-sans font-semibold"
                >
                  {selectedFinance ? 'Uložit změny' : 'Přidat finanční záznam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal - Add/Edit */}
      {isNoteModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={closeNoteModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-heading font-bold text-gray-800">
                {selectedNote ? 'Upravit poznámku' : 'Přidat novou poznámku'}
              </h3>
              <button
                onClick={closeNoteModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Content */}
              <div>
                <label htmlFor="note_content" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Obsah poznámky <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="note_content"
                  value={noteFormData.content}
                  onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                  placeholder="Zde napište poznámku k projektu..."
                  rows={8}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeNoteModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-sans font-semibold"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSaveNote}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors font-sans font-semibold"
                >
                  {selectedNote ? 'Uložit změny' : 'Přidat poznámku'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard