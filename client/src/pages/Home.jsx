import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Image, 
  Video, 
  Archive, 
  File,
  Download,
  TrendingUp,
  Clock,
  Star,
  Upload,
  Search,
  Users,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Zap,
  Eye
} from 'lucide-react'
import FileCard from '../components/FileCard'

export default function Home() {
  const [recentFiles, setRecentFiles] = useState([])
  const [popularFiles, setPopularFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('recent')
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

  const categories = [
    { name: 'Documents', icon: FileText, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', path: 'documents' },
    { name: 'Presentations', icon: FolderOpen, color: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50', path: 'presentations' },
    { name: 'Images', icon: Image, color: 'from-green-500 to-green-600', bgLight: 'bg-green-50', path: 'images' },
    { name: 'Videos', icon: Video, color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50', path: 'videos' },
    { name: 'Archives', icon: Archive, color: 'from-yellow-500 to-yellow-600', bgLight: 'bg-yellow-50', path: 'archives' },
  ]

  const statCards = [
    { label: 'Files Shared', value: stats.totalFiles, icon: File, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Downloads', value: stats.totalDownloads, icon: Download, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Users', value: stats.totalUsers, icon: Users, gradient: 'from-purple-500 to-pink-500' },
  ]

  // Smooth animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  }

  const displayFiles = activeTab === 'recent' ? recentFiles : popularFiles

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div 
          className="relative"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-primary-500/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="text-white" size={32} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8 pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Compact Hero Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white"
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20"
            >
              <Zap size={16} className="text-yellow-400" />
              <span className="text-sm font-medium">Quick Access to Class Materials</span>
            </motion.div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome to <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">CareToShare</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-lg">
              Browse shared files from your classmates or upload your own study materials.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all"
              >
                <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Categories Row */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen size={22} className="text-primary-500" />
            Categories
          </h2>
          <Link 
            to="/category/all" 
            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 group"
          >
            View All
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="flex-shrink-0"
            >
              <Link
                to={`/category/${category.path}`}
                className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-slate-200"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <category.icon size={20} className="text-white" />
                </div>
                <span className="font-semibold text-slate-700">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Main Content Area with Tabs */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'recent'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock size={18} />
              Recent
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'popular'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp size={18} />
              Trending
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              to="/search"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
            >
              <Search size={18} />
              Search
            </Link>
            <Link
              to="/upload"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all font-medium text-sm"
            >
              <Upload size={18} />
              Upload
            </Link>
          </div>
        </div>
        
        {/* Files Grid */}
        <AnimatePresence mode="wait">
          {displayFiles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200"
            >
              <motion.div 
                className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <File size={40} className="text-slate-300" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No files yet</h3>
              <p className="text-slate-500 mb-6">Be the first to share study materials with your classmates!</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-primary-500/30 transition-all"
              >
                <Upload size={20} />
                Upload Now
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {displayFiles.map((file, index) => (
                <motion.div
                  key={file._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <FileCard file={file} showDownloads={activeTab === 'popular'} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View All Link */}
        {displayFiles.length > 0 && (
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              to="/category/all" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium group"
            >
              Browse All Files
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </motion.section>

      {/* Quick Upload CTA (shown only if there are files) */}
      {displayFiles.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-6 border border-primary-200/50"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Sparkles size={28} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Have something to share?</h3>
                <p className="text-slate-600 text-sm">Help your classmates by uploading study materials</p>
              </div>
            </div>
            <Link
              to="/upload"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-primary-500/30 transition-all whitespace-nowrap"
            >
              <Upload size={20} />
              Upload File
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
