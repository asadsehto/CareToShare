import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { ArrowLeft, File, Download, Eye } from 'lucide-react'
import FileCard from '../components/FileCard'

export default function UserProfile() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`)
      setProfile(response.data.user)
      setFiles(response.data.files)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">User not found</p>
        <Link to="/" className="text-primary-500 hover:underline mt-2 inline-block">
          Go back home
        </Link>
      </div>
    )
  }

  const totalDownloads = files.reduce((sum, f) => sum + f.downloads, 0)
  const totalViews = files.reduce((sum, f) => sum + f.views, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            <img
              src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=random&size=120`}
              alt={profile.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-slate-500">@{profile.username}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <File className="mx-auto text-blue-500 mb-1" size={20} />
              <p className="text-xl font-bold text-slate-900">{files.length}</p>
              <p className="text-sm text-slate-500">Files</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <Download className="mx-auto text-green-500 mb-1" size={20} />
              <p className="text-xl font-bold text-slate-900">{totalDownloads}</p>
              <p className="text-sm text-slate-500">Downloads</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <Eye className="mx-auto text-purple-500 mb-1" size={20} />
              <p className="text-xl font-bold text-slate-900">{totalViews}</p>
              <p className="text-sm text-slate-500">Views</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User's Files */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Files by {profile.name}
        </h2>
        
        {files.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <File size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">This user hasn't uploaded any files yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file, index) => (
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
        )}
      </div>
    </div>
  )
}
