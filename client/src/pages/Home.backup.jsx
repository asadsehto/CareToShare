import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { 
  FileText, 
  Image, 
  Video, 
  Archive, 
  FileSpreadsheet, 
  File,
  Download,
  Eye,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'
import FileCard from '../components/FileCard'

export default function Home() {
  const [recentFiles, setRecentFiles] = useState([])
  const [popularFiles, setPopularFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalDownloads: 0,
    totalUsers: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [recentRes, popularRes, statsRes] = await Promise.all([
        axios.get('/api/files/recent'),
        axios.get('/api/files/popular'),
        axios.get('/api/stats')
      ])
      
      setRecentFiles(recentRes.data)
      setPopularFiles(popularRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Files', value: stats.totalFiles, icon: File, color: 'bg-blue-500' },
    { label: 'Downloads', value: stats.totalDownloads, icon: Download, color: 'bg-green-500' },
    { label: 'Users', value: stats.totalUsers, icon: Star, color: 'bg-purple-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 md:p-8 text-white"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to CareToShare! 👋</h1>
        <p className="text-white/80 mb-4">
          Share study materials and resources with your classmates easily.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-white/90 transition-colors"
        >
          <FileText size={20} />
          Upload Your First File
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Files */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock size={24} className="text-primary-500" />
            Recent Uploads
          </h2>
          <Link to="/category/all" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        {recentFiles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
            <File size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No files uploaded yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentFiles.map((file, index) => (
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
      </section>

      {/* Popular Files */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={24} className="text-green-500" />
            Popular Files
          </h2>
        </div>
        
        {popularFiles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
            <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No popular files yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularFiles.map((file, index) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FileCard file={file} showDownloads />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
