import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCalculatorData, categorizeClients, getContactData, markAsDeleted, toggleFavorite, markContactAsDeleted, toggleContactResolved, recoverContact, ContactSubmission } from '../lib/calculator-db'
import { getPasswordsByProjectId, createPassword, updatePassword, deletePassword, PasswordEntry, PasswordFormData, countPasswordsByProjectId } from '../lib/passwords-db'
import { getProjects, createProject, updateProject, deleteProject, Project, ProjectFormData } from '../lib/projects-db'
import { getTodosByProjectId, createTodo, updateTodo, deleteTodo, countTodosByProjectId, Todo, TodoFormData } from '../lib/todos-db'
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
  const [activeProjectTab, setActiveProjectTab] = useState<'todos' | 'passwords'>('todos')
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState<{ [key: string]: boolean }>({})
  const [expandedPasswords, setExpandedPasswords] = useState<{ [key: string]: boolean }>({})
  const [copyToast, setCopyToast] = useState(false)
  const [passwordSearchQuery, setPasswordSearchQuery] = useState('')
  const [todoSearchQuery, setTodoSearchQuery] = useState('')
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    project_id: '',
    service_name: '',
    username: '',
    password: '',
    notes: '',
    url: ''
  })
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    name: '',
    display_name: '',
    description: '',
    status: 'active'
  })
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
        status: project.status || 'active'
      })
    } else {
      setSelectedProject(null)
      setProjectFormData({
        name: '',
        display_name: '',
        description: '',
        status: 'active'
      })
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
      status: 'active'
    })
  }

  // Funkce pro uložení projektu
  const handleSaveProject = async () => {
    if (!projectFormData.name || !projectFormData.display_name) {
      alert('Prosím vyplňte název a zobrazované jméno projektu')
      return
    }

    let result
    if (selectedProject?.id) {
      // Editace existujícího projektu
      result = await updateProject(selectedProject.id, projectFormData)
    } else {
      // Vytvoření nového projektu
      result = await createProject(projectFormData)
    }

    if (result.success) {
      closeProjectModal()
      loadData()
    } else {
      alert('Chyba při ukládání projektu: ' + (result.error || 'Neznámá chyba'))
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
    ? projects
    : activeProjectFilter === 'active'
    ? projects.filter(p => p.status === 'active' || !p.status)
    : projects.filter(p => p.status === 'completed')

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

  // Funkce pro otevření detailu projektu
  const openProjectDetail = async (project: Project) => {
    setSelectedProjectDetail(project)
    if (project.id) {
      await loadProjectPasswords(project.id)
      await loadProjectTodos(project.id)
    }
  }

  // Funkce pro zavření detailu projektu
  const closeProjectDetail = () => {
    setSelectedProjectDetail(null)
    setProjectPasswords([])
    setProjectTodos([])
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
    } else {
      alert('Chyba při aktualizaci úkolu: ' + (result.error || 'Neznámá chyba'))
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
            <h2 className="text-sm font-heading font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sekce
            </h2>
            <div className="space-y-2">
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
                      ? getPluralForm(filteredProjects.length, 'čekající projekt', 'čekající projekty', 'čekajících projektů')
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
                    ⏳ Čekající ({projects.filter(p => p.status === 'active' || !p.status).length})
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
                            className="md:hidden bg-white rounded-lg shadow p-4 cursor-pointer active:scale-[0.98] transition-transform"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-heading font-semibold text-gray-800 mb-1">
                                  {project.display_name}
                                </h3>
                                <p className="text-sm text-gray-600 font-sans">
                                  {project.name}
                                </p>
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
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {/* Desktop Card */}
                          <div 
                            onClick={() => openProjectDetail(project)}
                            className="hidden md:block bg-white rounded-lg shadow p-5 relative cursor-pointer hover:shadow-lg hover:border-primary-200 border-2 border-transparent transition-all duration-200"
                          >
                            {/* Top Section */}
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h3 className="text-lg font-heading font-semibold text-gray-800">
                                    {project.display_name}
                                  </h3>
                                  {project.status === 'completed' && (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                      ✓ Dokončeno
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 font-sans">
                                  {project.name}
                                </p>
                              </div>
                              
                              {/* Datum v pravém horním rohu */}
                              {project.created_at && (
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
                              <div className="flex items-center gap-2">
                                {/* Edit Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openProjectModal(project)
                                  }}
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
                    onClick={() => {
                      if (selectedProjectDetail.id) {
                        loadProjectPasswords(selectedProjectDetail.id)
                        loadProjectTodos(selectedProjectDetail.id)
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
                  
                  {/* Searchbar */}
                  <div className="relative ml-auto flex-shrink-0">
                    <input
                      type="text"
                      value={activeProjectTab === 'passwords' ? passwordSearchQuery : todoSearchQuery}
                      onChange={(e) => {
                        if (activeProjectTab === 'passwords') {
                          setPasswordSearchQuery(e.target.value)
                        } else {
                          setTodoSearchQuery(e.target.value)
                        }
                      }}
                      placeholder={activeProjectTab === 'passwords' ? 'Vyhledat heslo...' : 'Vyhledat úkol...'}
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
                    {(activeProjectTab === 'passwords' ? passwordSearchQuery : todoSearchQuery) && (
                      <button
                        onClick={() => {
                          if (activeProjectTab === 'passwords') {
                            setPasswordSearchQuery('')
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
                    const filteredTodos = todoSearchQuery
                      ? projectTodos.filter(t => 
                          t.title.toLowerCase().includes(todoSearchQuery.toLowerCase()) ||
                          t.description?.toLowerCase().includes(todoSearchQuery.toLowerCase())
                        )
                      : projectTodos

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
                        {filteredTodos.map((todo) => (
                          <div
                            key={todo.id || 'unknown'}
                            onClick={() => {
                              if (todo.id) {
                                handleToggleTodoComplete(todo.id, !!todo.is_completed)
                              }
                            }}
                            className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden p-4 border-l-4 cursor-pointer ${
                              todo.is_completed 
                                ? 'border-green-500 opacity-75' 
                                : 'border-primary-500'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
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
                                  <h3 className={`text-lg font-heading font-semibold ${
                                    todo.is_completed 
                                      ? 'text-gray-500 line-through' 
                                      : 'text-gray-800'
                                  }`}>
                                    {todo.title}
                                  </h3>
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
                  <option value="active">⏳ Čekající / Aktivní</option>
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
    </div>
  )
}

export default AdminDashboard