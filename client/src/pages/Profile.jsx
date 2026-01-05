import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { User, Mail, Save, File, Download, Eye } from 'lucide-react'
import FileCard from '../components/FileCard'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [saving, setSaving] = useState(false)
  const [myFiles, setMyFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalDownloads: 0,
    totalViews: 0
  })

  useEffect(() => {
    fetchMyFiles()
  }, [])

  const fetchMyFiles = async () => {
    try {
      const response = await axios.get('/api/files/my-files')
      setMyFiles(response.data.files)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    
    if (!username.trim()) {
      toast.error('Username is required')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores')
      return
    }

    setSaving(true)
    try {
      const response = await axios.put('/api/users/profile', { name, username })
      updateUser(response.data)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    
    try {
      await axios.delete(`/api/files/${fileId}`)
      setMyFiles(myFiles.filter(f => f._id !== fileId))
      toast.success('File deleted successfully')
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your profile settings</p>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random&size=150`}
                alt={user?.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <p className="mt-3 text-sm text-slate-500">
                Avatar from Google
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <File className="mx-auto text-blue-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900">{stats.totalFiles}</p>
          <p className="text-sm text-slate-500">Files</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <Download className="mx-auto text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900">{stats.totalDownloads}</p>
          <p className="text-sm text-slate-500">Downloads</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <Eye className="mx-auto text-purple-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900">{stats.totalViews}</p>
          <p className="text-sm text-slate-500">Views</p>
        </div>
      </div>

      {/* My Files */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">My Files</h2>
          <p className="text-slate-500 mt-1">Files you've uploaded</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : myFiles.length === 0 ? (
            <div className="text-center py-12">
              <File size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">You haven't uploaded any files yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myFiles.map((file) => (
                <FileCard 
                  key={file._id} 
                  file={file} 
                  showDelete 
                  onDelete={() => handleDeleteFile(file._id)}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
