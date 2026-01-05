import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Search as SearchIcon, File, User, Filter } from 'lucide-react'
import FileCard from '../components/FileCard'
import UserCard from '../components/UserCard'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [searchType, setSearchType] = useState('all')
  const [results, setResults] = useState({ files: [], users: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query, searchType])

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/search', {
        params: { q: query, type: searchType }
      })
      setResults(response.data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'all', label: 'All', icon: SearchIcon },
    { id: 'files', label: 'Files', icon: File },
    { id: 'users', label: 'Users', icon: User },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Search Results for "{query}"
        </h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchType(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${searchType === tab.id 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Files Results */}
          {(searchType === 'all' || searchType === 'files') && results.files.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <File size={20} className="text-primary-500" />
                Files ({results.files.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.files.map((file, index) => (
                  <motion.div
                    key={file._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FileCard file={file} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Users Results */}
          {(searchType === 'all' || searchType === 'users') && results.users.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-purple-500" />
                Users ({results.users.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UserCard user={user} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {results.files.length === 0 && results.users.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No results found for "{query}"</p>
              <p className="text-sm text-slate-400 mt-2">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
