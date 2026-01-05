import { useState, useCallback, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  Upload as UploadIcon, 
  FileText, 
  Image, 
  Video, 
  Archive, 
  File,
  X,
  Check,
  Loader2,
  Globe,
  Lock,
  Users,
  Eye,
  ArrowLeft
} from 'lucide-react'
import { getFileIcon, getFileColor, formatFileSize } from '../utils/fileUtils'

export default function Upload() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const classIdFromUrl = searchParams.get('classId')
  
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState(classIdFromUrl ? 'class' : 'public')
  const [selectedClassId, setSelectedClassId] = useState(classIdFromUrl || '')
  const [myClasses, setMyClasses] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Fetch user's classes for class visibility option
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/api/classes/my')
        setMyClasses(res.data.all || [])
      } catch (error) {
        console.error('Failed to fetch classes:', error)
      }
    }
    fetchClasses()
  }, [])

  // Generate preview for images/videos
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
    }
  })

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    setTitle('')
    setDescription('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (visibility === 'class' && !selectedClassId) {
      toast.error('Please select a class')
      return
    }
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('description', description)
    formData.append('visibility', visibility)
    if (visibility === 'class') {
      formData.append('classId', selectedClassId)
    }

    try {
      const response = await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })
      toast.success('File uploaded successfully!')
      if (visibility === 'class' && selectedClassId) {
        navigate(`/class/${selectedClassId}`)
      } else {
        navigate(`/file/${response.data._id}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const FileIcon = file ? getFileIcon(file.name) : File
  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: Globe, desc: 'Everyone', color: 'text-green-500 bg-green-50 border-green-300' },
    { value: 'class', label: 'Class', icon: Users, desc: 'Classmates', color: 'text-blue-500 bg-blue-50 border-blue-300' },
    { value: 'private', label: 'Private', icon: Lock, desc: 'Only you', color: 'text-orange-500 bg-orange-50 border-orange-300' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={18} /><span>Back to Home</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-primary-500/5 to-purple-500/5">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UploadIcon size={20} className="text-white" />
            </div>
            Upload File
          </h1>
          <p className="text-slate-500 mt-1">Share files with your classmates</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dropzone */}
          <div {...getRootProps()} className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'} ${file ? 'bg-green-50 border-green-300' : ''}`}>
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div key="file-selected" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-4">
                  {preview && (
                    <div className="relative w-full max-w-[200px] mx-auto rounded-xl overflow-hidden shadow-lg">
                      {file.type.startsWith('video/') ? (
                        <video src={preview} className="w-full h-32 object-cover" muted />
                      ) : (
                        <img src={preview} alt="Preview" className="w-full h-32 object-cover" />
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-lg text-white text-xs flex items-center gap-1">
                        <Eye size={12} />Preview
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-4">
                    {!preview && (
                      <div className={`w-16 h-16 rounded-xl ${getFileColor(file.name).replace('text-', 'bg-').replace('500', '100')} flex items-center justify-center`}>
                        <FileIcon size={32} className={getFileColor(file.name)} />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <motion.button type="button" onClick={(e) => { e.stopPropagation(); removeFile() }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <X size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center" animate={{ y: isDragActive ? -5 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
                    <UploadIcon size={36} className="text-primary-500" />
                  </motion.div>
                  <p className="text-lg font-medium text-slate-900 mb-1">{isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}</p>
                  <p className="text-sm text-slate-500">or click to browse • PDF, DOC, PPT, Images, Videos & more</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title for your file" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description (optional)" rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none" />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Who can see this file?</label>
            <div className="grid grid-cols-3 gap-3">
              {visibilityOptions.map((option) => (
                <motion.button key={option.value} type="button" onClick={() => setVisibility(option.value)} className={`p-4 rounded-xl border-2 transition-all text-left ${visibility === option.value ? option.color : 'border-slate-200 hover:border-slate-300 bg-white'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <option.icon size={22} className={visibility === option.value ? '' : 'text-slate-400'} />
                  <p className="font-semibold text-sm mt-2">{option.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Class Code */}
          <AnimatePresence>
            {visibility === 'class' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Class *</label>
                {myClasses.length > 0 ? (
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-blue-50"
                  >
                    <option value="">Select a class...</option>
                    {myClasses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.classCode})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-sm text-slate-600 mb-2">You haven't joined any classes yet</p>
                    <Link to="/classes" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                      Join or create a class →
                    </Link>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">Only members of this class can see the file</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress */}
          <AnimatePresence>
            {uploading && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Uploading to Google Drive...</span>
                  <span className="font-bold text-primary-600">{uploadProgress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button type="submit" disabled={uploading || !file} className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${uploading || !file ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.01]'}`} whileTap={!uploading && file ? { scale: 0.98 } : {}}>
            {uploading ? (<><Loader2 size={20} className="animate-spin" />Uploading...</>) : (<><UploadIcon size={20} />Upload File</>)}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
