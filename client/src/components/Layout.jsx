import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  Home, 
  Upload, 
  User, 
  Users,
  Search, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Image,
  Video,
  FileSpreadsheet,
  Archive,
  File,
  ImageIcon
} from 'lucide-react'

const categories = [
  { name: 'Documents', icon: FileText, path: '/category/documents', color: 'text-blue-500' },
  { name: 'Presentations', icon: FileSpreadsheet, path: '/category/presentations', color: 'text-orange-500' },
  { name: 'Images', icon: Image, path: '/category/images', color: 'text-green-500' },
  { name: 'Videos', icon: Video, path: '/category/videos', color: 'text-purple-500' },
  { name: 'Archives', icon: Archive, path: '/category/archives', color: 'text-yellow-500' },
  { name: 'Other', icon: File, path: '/category/other', color: 'text-gray-500' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Classes', icon: Users, path: '/classes' },
    { name: 'Upload', icon: Upload, path: '/upload' },
    { name: 'Profile', icon: User, path: '/profile' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto
      `}>
        <div className="flex flex-col min-h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold gradient-text">CareToShare</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                      : 'text-slate-600 hover:bg-slate-100'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}

            {/* Categories */}
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Categories
              </h3>
              {categories.map((cat) => {
                const Icon = cat.icon
                const isActive = location.pathname === cat.path
                return (
                  <Link
                    key={cat.path}
                    to={cat.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all
                      ${isActive 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    <Icon size={18} className={cat.color} />
                    <span className="text-sm">{cat.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b">
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files, users..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Quick upload button */}
            <Link
              to="/upload"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
            >
              <Upload size={18} />
              <span className="font-medium">Upload</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
