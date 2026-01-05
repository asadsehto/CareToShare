import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { 
  Download, 
  Eye, 
  Calendar, 
  User, 
  ArrowLeft,
  ExternalLink,
  Share2,
  Heart,
  MessageCircle,
  Send,
  Trash2
} from 'lucide-react'
import { getFileIcon, getFileColor, formatFileSize, getFileCategory } from '../utils/fileUtils'

export default function FileDetails() {
  const { fileId } = useParams()
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  
  // Likes state
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    fetchFile()
    fetchComments()
    if (user) {
      checkLikeStatus()
    }
  }, [fileId, user])

  const fetchFile = async () => {
    try {
      const response = await axios.get(`/api/files/${fileId}`)
      setFile(response.data)
      setLikeCount(response.data.likeCount || 0)
    } catch (error) {
      console.error('Error fetching file:', error)
      toast.error('File not found')
    } finally {
      setLoading(false)
    }
  }

  const checkLikeStatus = async () => {
    try {
      const response = await axios.get(`/api/files/${fileId}/like-status`)
      setLiked(response.data.liked)
      setLikeCount(response.data.likeCount)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const fetchComments = async () => {
    try {
      setLoadingComments(true)
      const response = await axios.get(`/api/files/${fileId}/comments`)
      setComments(response.data.comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like')
      return
    }
    
    setLiking(true)
    try {
      const response = await axios.post(`/api/files/${fileId}/like`)
      setLiked(response.data.liked)
      setLikeCount(response.data.likeCount)
    } catch (error) {
      toast.error('Failed to update like')
    } finally {
      setLiking(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to comment')
      return
    }
    if (!newComment.trim()) return
    
    setSubmittingComment(true)
    try {
      const response = await axios.post(`/api/files/${fileId}/comments`, { text: newComment })
      setComments([response.data, ...comments])
      setNewComment('')
      setFile(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }))
      toast.success('Comment added!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/files/comments/${commentId}`)
      setComments(comments.filter(c => c._id !== commentId))
      setFile(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }))
      toast.success('Comment deleted')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Record download
      await axios.post(`/api/files/${fileId}/download`)
      
      // Open Google Drive download link
      window.open(file.downloadUrl, '_blank')
      
      // Update local state
      setFile(prev => ({ ...prev, downloads: prev.downloads + 1 }))
      toast.success('Download started!')
    } catch (error) {
      toast.error('Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">File not found</p>
        <Link to="/" className="text-primary-500 hover:underline mt-2 inline-block">
          Go back home
        </Link>
      </div>
    )
  }

  const FileIcon = getFileIcon(file.fileName)
  const category = getFileCategory(file.fileName)

  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft size={18} />
        Back to files
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-xl ${getFileColor(file.fileName).replace('text-', 'bg-').replace('500', '100')} flex items-center justify-center flex-shrink-0`}>
              <FileIcon size={32} className={getFileColor(file.fileName)} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{file.title}</h1>
              <p className="text-slate-500 text-sm">{file.fileName}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {file.description && (
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-medium text-slate-900 mb-2">Description</h3>
            <p className="text-slate-600 whitespace-pre-wrap">{file.description}</p>
          </div>
        )}

        {/* File Info */}
        <div className="p-6 border-b border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Size</p>
              <p className="font-medium text-slate-900">{formatFileSize(file.fileSize)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Type</p>
              <p className="font-medium text-slate-900 capitalize">{category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Downloads</p>
              <p className="font-medium text-slate-900">{file.downloads}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Views</p>
              <p className="font-medium text-slate-900">{file.views}</p>
            </div>
          </div>
        </div>

        {/* Uploader Info */}
        <div className="p-6 border-b border-slate-100">
          <Link 
            to={`/user/${file.uploadedBy._id}`}
            className="flex items-center gap-3 hover:bg-slate-50 -m-3 p-3 rounded-xl transition-colors"
          >
            <img
              src={file.uploadedBy.avatar || `https://ui-avatars.com/api/?name=${file.uploadedBy.name}&background=random`}
              alt={file.uploadedBy.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-slate-900">{file.uploadedBy.name}</p>
              <p className="text-sm text-slate-500">@{file.uploadedBy.username}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">Uploaded</p>
              <p className="text-sm text-slate-600">
                {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 font-semibold"
          >
            <Download size={20} />
            {downloading ? 'Downloading...' : 'Download'}
          </button>
          
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={`px-4 py-4 rounded-xl transition-all flex items-center gap-2 ${
              liked 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={20} className={liked ? 'fill-current' : ''} />
            <span className="font-medium">{likeCount}</span>
          </button>
          
          {/* Comment Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`px-4 py-4 rounded-xl transition-all flex items-center gap-2 ${
              showComments 
                ? 'bg-primary-100 text-primary-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Comments"
          >
            <MessageCircle size={20} />
            <span className="font-medium">{file.commentCount || 0}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="px-4 py-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            title="Share"
          >
            <Share2 size={20} />
          </button>
          {file.webViewLink && (
            <a
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              title="View in Google Drive"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </motion.div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageCircle size={20} />
                Comments ({file.commentCount || 0})
              </h3>
            </div>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="p-4 border-b border-slate-100">
                <div className="flex gap-3">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={2}
                      maxLength={500}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{newComment.length}/500</span>
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {submittingComment ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={16} />
                            Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-4 border-b border-slate-100 text-center">
                <p className="text-slate-500 text-sm">
                  <Link to="/login" className="text-primary-500 hover:underline">Login</Link> to leave a comment
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="max-h-96 overflow-y-auto">
              {loadingComments ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : comments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {comments.map(comment => (
                    <div key={comment._id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-3">
                        <Link to={`/user/${comment.user._id}`}>
                          <img
                            src={comment.user.avatar || `https://ui-avatars.com/api/?name=${comment.user.name}&background=random`}
                            alt={comment.user.name}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link to={`/user/${comment.user._id}`} className="font-medium text-slate-900 text-sm hover:text-primary-600">
                              {comment.user.name}
                            </Link>
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                            {user && comment.user._id === user._id && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete comment"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm mt-1 whitespace-pre-wrap break-words">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm">No comments yet. Be the first!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
