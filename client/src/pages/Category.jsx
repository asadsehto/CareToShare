import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Image, 
  Video, 
  Archive, 
  FileSpreadsheet, 
  File,
  Filter
} from 'lucide-react'
import FileCard from '../components/FileCard'

const categoryConfig = {
  documents: {
    title: 'Documents',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    extensions: ['pdf', 'doc', 'docx', 'txt']
  },
  presentations: {
    title: 'Presentations',
    icon: FileSpreadsheet,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    extensions: ['ppt', 'pptx']
  },
  images: {
    title: 'Images',
    icon: Image,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  videos: {
    title: 'Videos',
    icon: Video,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    extensions: ['mp4', 'mov', 'avi', 'mkv']
  },
  archives: {
    title: 'Archives',
    icon: Archive,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    extensions: ['zip', 'rar', '7z']
  },
  other: {
    title: 'Other Files',
    icon: File,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    extensions: []
  },
  all: {
    title: 'All Files',
    icon: File,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    extensions: []
  }
}

export default function Category() {
  const { category } = useParams()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')

  const config = categoryConfig[category] || categoryConfig.all

  useEffect(() => {
    fetchFiles()
  }, [category, sortBy])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/files/category', {
        params: { category, sort: sortBy }
      })
      setFiles(response.data)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <Icon size={28} className={config.color} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
            <p className="text-slate-500">{files.length} files</p>
          </div>
          
          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="downloads">Most Downloads</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <Icon size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No files in this category yet</p>
          <Link 
            to="/upload" 
            className="inline-block mt-4 text-primary-500 hover:text-primary-600 font-medium"
          >
            Upload the first one →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <motion.div
              key={file._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <FileCard file={file} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
