import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Users, 
  Lock, 
  Globe, 
  Search, 
  Copy, 
  Check,
  BookOpen,
  UserPlus,
  Crown,
  ArrowRight
} from 'lucide-react'

export default function Classes() {
  const navigate = useNavigate()
  const [myClasses, setMyClasses] = useState({ created: [], joined: [] })
  const [publicClasses, setPublicClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)

  // Create class form
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    visibility: 'public',
    password: ''
  })
  const [creating, setCreating] = useState(false)

  // Join class form
  const [joinCode, setJoinCode] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [passwordClassName, setPasswordClassName] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const [myRes, publicRes] = await Promise.all([
        axios.get('/api/classes/my'),
        axios.get('/api/classes/discover')
      ])
      setMyClasses(myRes.data)
      setPublicClasses(publicRes.data.classes)
    } catch (error) {
      console.error('Failed to fetch classes:', error)
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    if (!newClass.name.trim()) {
      toast.error('Please enter a class name')
      return
    }
    
    if (newClass.visibility === 'private' && !newClass.password.trim()) {
      toast.error('Please enter a password for private class')
      return
    }

    setCreating(true)
    try {
      const res = await axios.post('/api/classes', newClass)
      toast.success('Class created successfully!')
      setShowCreateModal(false)
      setNewClass({ name: '', description: '', visibility: 'public', password: '' })
      navigate(`/class/${res.data._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create class')
    } finally {
      setCreating(false)
    }
  }

  const handleJoinByCode = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) {
      toast.error('Please enter a class code')
      return
    }

    setJoining(true)
    try {
      const res = await axios.post('/api/classes/join-by-code', { 
        code: joinCode,
        password: joinPassword 
      })
      toast.success('Joined class successfully!')
      setShowJoinModal(false)
      setJoinCode('')
      setJoinPassword('')
      setNeedsPassword(false)
      navigate(`/class/${res.data.class._id}`)
    } catch (error) {
      if (error.response?.data?.requiresPassword) {
        setNeedsPassword(true)
        setPasswordClassName(error.response.data.className || 'this class')
        toast.error('This is a private class - enter the password')
      } else {
        toast.error(error.response?.data?.message || 'Failed to join class')
      }
    } finally {
      setJoining(false)
    }
  }

  const [passwordModalClass, setPasswordModalClass] = useState(null)
  const [classJoinPassword, setClassJoinPassword] = useState('')

  const handleJoinPublicClass = async (classId, isPrivate = false) => {
    if (isPrivate) {
      const classData = publicClasses.find(c => c._id === classId)
      setPasswordModalClass(classData)
      setClassJoinPassword('')
      return
    }
    
    try {
      await axios.post(`/api/classes/${classId}/join`)
      toast.success('Joined class successfully!')
      fetchClasses()
    } catch (error) {
      if (error.response?.data?.requiresPassword) {
        const classData = publicClasses.find(c => c._id === classId)
        setPasswordModalClass(classData)
        setClassJoinPassword('')
      } else {
        toast.error(error.response?.data?.message || 'Failed to join class')
      }
    }
  }

  const handleJoinWithPassword = async () => {
    if (!classJoinPassword.trim()) {
      toast.error('Please enter the password')
      return
    }
    
    try {
      await axios.post(`/api/classes/${passwordModalClass._id}/join`, { 
        password: classJoinPassword 
      })
      toast.success('Joined class successfully!')
      setPasswordModalClass(null)
      setClassJoinPassword('')
      fetchClasses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join class')
    }
  }

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Class code copied!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredPublicClasses = publicClasses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.classCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ClassCard = ({ classData, showJoinButton = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Thumbnail/Header */}
      <div className={`h-24 bg-gradient-to-br ${
        classData.visibility === 'private' 
          ? 'from-orange-400 to-red-500' 
          : 'from-primary-400 to-purple-500'
      } relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 right-3">
          {classData.visibility === 'private' ? (
            <span className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
              <Lock size={12} /> Private
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
              <Globe size={12} /> Public
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-4">
          <h3 className="text-white font-bold text-lg truncate max-w-[200px]">{classData.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-slate-600 text-sm line-clamp-2 mb-3 min-h-[40px]">
          {classData.description || 'No description'}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users size={14} />
            <span>{classData.members?.length || 0} members</span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); copyClassCode(classData.classCode) }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-500 transition-colors"
          >
            {copiedCode === classData.classCode ? <Check size={12} /> : <Copy size={12} />}
            {classData.classCode}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {classData.creator?.avatar && (
            <img 
              src={classData.creator.avatar} 
              alt={classData.creator.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-xs text-slate-500">
            by {classData.creator?.name || 'Unknown'}
          </span>
          {classData.isCR && (
            <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              <Crown size={10} /> CR
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/class/${classData._id}`}
            className="flex-1 py-2 text-center bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
          >
            View Class
          </Link>
          {showJoinButton && (
            <button
              onClick={() => handleJoinPublicClass(classData._id, classData.visibility === 'private')}
              className={`flex-1 py-2 text-center rounded-xl text-sm font-medium text-white transition-colors ${
                classData.visibility === 'private' 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {classData.visibility === 'private' ? 'Join with Password' : 'Join'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Classes</h1>
          <p className="text-slate-500 mt-1">Create or join classes to share files privately</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
          >
            <UserPlus size={18} />
            Join Class
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium text-white transition-colors"
          >
            <Plus size={18} />
            Create Class
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'my', label: 'My Classes', icon: BookOpen },
          { id: 'discover', label: 'Discover', icon: Search }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Classes Tab */}
      {activeTab === 'my' && (
        <div className="space-y-8">
          {/* Created Classes */}
          {myClasses.created.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Crown className="text-yellow-500" size={20} />
                Classes You Created
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myClasses.created.map(c => (
                  <ClassCard key={c._id} classData={{ ...c, isCR: true }} />
                ))}
              </div>
            </div>
          )}

          {/* Joined Classes */}
          {myClasses.joined.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                Classes You Joined
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myClasses.joined.map(c => (
                  <ClassCard key={c._id} classData={c} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {myClasses.created.length === 0 && myClasses.joined.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <BookOpen size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Classes Yet</h3>
              <p className="text-slate-500 mb-6">Create a class or join one with a code</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
                >
                  <UserPlus size={18} />
                  Join with Code
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium text-white transition-colors"
                >
                  <Plus size={18} />
                  Create Class
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search public classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Public Classes Grid */}
          {filteredPublicClasses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPublicClasses.map(c => (
                <ClassCard 
                  key={c._id} 
                  classData={c} 
                  showJoinButton={!myClasses.all?.some(mc => mc._id === c._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Public Classes</h3>
              <p className="text-slate-500">Be the first to create a public class!</p>
            </div>
          )}
        </div>
      )}

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Class</h2>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    placeholder="e.g. CS-101 Fall 2026"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    placeholder="What's this class about?"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Visibility
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNewClass({ ...newClass, visibility: 'public', password: '' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                        newClass.visibility === 'public'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Globe size={18} />
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewClass({ ...newClass, visibility: 'private' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                        newClass.visibility === 'private'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Lock size={18} />
                      Private
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {newClass.visibility === 'public' 
                      ? 'Anyone can find and join this class'
                      : 'People need the password to join'}
                  </p>
                </div>

                {/* Password field for private classes */}
                {newClass.visibility === 'private' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Class Password *
                    </label>
                    <input
                      type="text"
                      value={newClass.password}
                      onChange={(e) => setNewClass({ ...newClass, password: e.target.value })}
                      placeholder="Enter a password for joining"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required={newClass.visibility === 'private'}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Share this password with people you want to join
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Create <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Class Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-4">Join Class</h2>
              <form onSubmit={handleJoinByCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Class Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase())
                      setNeedsPassword(false)
                    }}
                    placeholder="Enter 6-character code"
                    maxLength={6}
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Get this code from your classmate or CR
                  </p>
                </div>

                {/* Password field for private classes */}
                {needsPassword && (
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      🔒 Password Required for "{passwordClassName}"
                    </label>
                    <input
                      type="password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      placeholder="Enter class password"
                      className="w-full px-4 py-2 border border-orange-200 bg-orange-50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={joining || joinCode.length < 6}
                    className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {joining ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Join <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal for Private Class Join */}
      <AnimatePresence>
        {passwordModalClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPasswordModalClass(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                  <Lock size={28} className="text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Private Class</h2>
                <p className="text-slate-500 mt-1">Enter password to join "{passwordModalClass.name}"</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="password"
                  value={classJoinPassword}
                  onChange={(e) => setClassJoinPassword(e.target.value)}
                  placeholder="Enter class password"
                  className="w-full px-4 py-3 text-center border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPasswordModalClass(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinWithPassword}
                    disabled={!classJoinPassword.trim()}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join Class
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
