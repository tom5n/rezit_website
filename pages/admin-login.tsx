import React, { useState } from 'react'
import { useRouter } from 'next/router'

const AdminLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Jednoduché přihlášení - v produkci by mělo být v environment proměnných
    if (username === 'vision' && password === 'tomasfilip') {
      // Uložit cookie že je uživatel přihlášen
      document.cookie = 'adminLoggedIn=true; path=/; max-age=86400' // 24 hodin
      router.push('/admin')
    } else {
      setError('Nesprávné přihlašovací údaje')
    }
    
    setLoading(false)
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/images/loginbackground.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Tmavý overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="max-w-md w-full relative z-10">
        {/* Login Box */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo uvnitř boxu */}
          <div className="text-center mb-8">
            <img 
              src="/images/rezit2.webp" 
              alt="Rezit Logo" 
              className="h-12 w-auto mx-auto mb-6"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Uživatelské jméno
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                placeholder="Zadejte uživatelské jméno"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Heslo
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sans"
                placeholder="Zadejte heslo"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-sans">{error}</p>
              </div>
            )}

             <button
               type="submit"
               disabled={loading}
               className={`w-full py-3 px-4 rounded-full font-sans font-semibold transition-colors ${
                 loading
                   ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                   : 'bg-primary-500 hover:bg-primary-600 text-white'
               }`}
             >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Přihlašuji...
                </div>
              ) : (
                'Přihlásit se'
              )}
            </button>
          </form>

          <div className="mt-6 text-left">
            <a 
              href="/" 
              className="text-sm text-gray-500 hover:text-primary-500 transition-colors font-sans relative group"
            >
              ← Zpět na hlavní stránku
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

