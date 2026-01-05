import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  Image, 
  Video, 
  ArrowLeft, 
  Loader2, 
  Share2, 
  Download,
  X,
  Check,
  Globe,
  Lock,
  Users,
  RefreshCw,
  ImageOff
} from 'lucide-react'

export default function MyPhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [nextPageToken, setNextPageToken] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [shareTitle, setShareTitle] = useState('')
  const [shareDesc, setShareDesc] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [classCode, setClassCode] = useState('')
  const [needsReauth, setNeedsReauth] = useState(false)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async (pageToken = null) => {
    try {
      if (pageToken) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      // Get Google token from localStorage
      const googleToken = localStorage.getItem('googleAccessToken')
      
      const response = await axios.get('/api/files/my-photos', {
        params: { pageSize: 30, pageToken },
        headers: googleToken ? { 'X-Google-Token': googleToken } : {}
      })

      if (pageToken) {
        setPhotos(prev => [...prev, ...response.data.photos])
      } else {
        setPhotos(response.data.photos)
      }
      setNextPageToken(response.data.nextPageToken)
    } catch (error) {
      console.error('Error fetching photos:', error)
      const errorMsg = error.response?.data?.message || error.message
      console.error('Error details:', errorMsg)
      
      if (error.response?.status === 401 || error.response?.data?.requiresReauth) {
        setNeedsReauth(true)
        toast.error('Please log out and log back in to grant Google Photos access')
      } else {
        toast.error(`Failed to load photos: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleShare = async () => {
    if (!selectedPhoto || !shareTitle.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (visibility === 'class' && !classCode.trim()) {
      toast.error('Please enter a class code')
      return
    }

    setSharing(true)
    try {
      // Get Google token from localStorage
      const googleToken = localStorage.getItem('googleAccessToken')
      
      await axios.post('/api/files/share-photo', {
        photoId: selectedPhoto.id,
        photoUrl: selectedPhoto.full,
        filename: selectedPhoto.filename,
        mimeType: selectedPhoto.mimeType,
        title: shareTitle,
        description: shareDesc,
        visibility,
        classCode
      }, {
        headers: googleToken ? { 'X-Google-Token': googleToken } : {}
      })

      toast.success('Photo shared successfully!')
      setSelectedPhoto(null)
      setShareTitle('')
      setShareDesc('')
      setVisibility('public')
      setClassCode('')
    } catch (error) {
      console.error('Share error:', error)
      toast.error(error.response?.data?.message || 'Failed to share photo')
    } finally {
      setSharing(false)
    }
  }

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: Globe, color: 'text-green-500 bg-green-50 border-green-300' },
    { value: 'class', label: 'Class', icon: Users, color: 'text-blue-500 bg-blue-50 border-blue-300' },
    { value: 'private', label: 'Private', icon: Lock, color: 'text-orange-500 bg-orange-50 border-orange-300' },
  ]

  if (needsReauth) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
            <ImageOff size={40} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Google Photos Access Required</h2>
          <p className="text-slate-600 mb-6">
            To access your Google Photos, you need to grant permission. 
            Please log out and log back in, then accept the Google Photos permission when prompted.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Go to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={40} className="text-primary-500" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Image size={20} className="text-white" />
              </div>
              My Google Photos
            </h1>
            <p className="text-slate-500 text-sm mt-1">Select photos to share with your classmates</p>
          </div>
        </div>
        <button
          onClick={() => fetchPhotos()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </motion.div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200"
        >
          <ImageOff size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No photos found</h3>
          <p className="text-slate-500">Your Google Photos library appears to be empty</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => {
                  setSelectedPhoto(photo)
                  setShareTitle(photo.filename.replace(/\.[^/.]+$/, ''))
                }}
                className="relative group cursor-pointer aspect-square rounded-xl overflow-hidden bg-slate-100 hover:ring-4 hover:ring-primary-500/50 transition-all"
              >
                <img
                  src={photo.thumbnail}
                  alt={photo.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {photo.isVideo && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-lg text-white text-xs flex items-center gap-1">
                    <Video size={12} />
                    Video
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <span className="text-white text-sm font-medium flex items-center gap-1">
                    <Share2 size={14} />
                    Share
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {nextPageToken && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchPhotos(nextPageToken)}
                disabled={loadingMore}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Load More Photos'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              {/* Preview */}
              <div className="relative h-48 bg-slate-100">
                <img
                  src={selectedPhoto.medium}
                  alt={selectedPhoto.filename}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Share this photo</h3>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder="Enter a title"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={shareDesc}
                    onChange={(e) => setShareDesc(e.target.value)}
                    placeholder="Add a description (optional)"
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Visibility</label>
                  <div className="flex gap-2">
                    {visibilityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setVisibility(option.value)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          visibility === option.value ? option.color : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <option.icon size={18} className={visibility === option.value ? '' : 'text-slate-400'} />
                        <p className="text-sm font-medium mt-1">{option.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {visibility === 'class' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Class Code *</label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      placeholder="e.g., CS101"
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                      maxLength={20}
                    />
                  </div>
                )}

                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {sharing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 size={20} />
                      Share Photo
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
