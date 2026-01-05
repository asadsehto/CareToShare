import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import FileCard from '../components/FileCard'
import { 
  Users, 
  Lock, 
  Globe, 
  Copy, 
  Check, 
  Settings,
  UserPlus,
  UserMinus,
  Crown,
  LogOut,
  Trash2,
  Upload,
  FileText,
  ChevronRight,
  Shield,
  Edit2,
  X
} from 'lucide-react'

export default function ClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [classData, setClassData] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', visibility: 'public' })

  const isCR = classData?.creator?._id === user?._id || 
               classData?.crs?.some(cr => cr._id === user?._id)
  const isCreator = classData?.creator?._id === user?._id
  const isMember = classData?.members?.some(m => m._id === user?._id) || isCR

  useEffect(() => {
    fetchClassData()
  }, [classId])

  const fetchClassData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/classes/${classId}`)
      setClassData(res.data)
      setFiles(res.data.files || [])
      setEditForm({
        name: res.data.name,
        description: res.data.description || '',
        visibility: res.data.visibility
      })
    } catch (error) {
      console.error('Failed to fetch class:', error)
      if (error.response?.status === 404) {
        toast.error('Class not found')
        navigate('/classes')
      } else if (error.response?.status === 403) {
        toast.error('This is a private class')
        navigate('/classes')
      } else {
        toast.error('Failed to load class')
      }
    } finally {
      setLoading(false)
    }
  }

  const copyClassCode = () => {
    navigator.clipboard.writeText(classData.classCode)
    setCopiedCode(true)
    toast.success('Class code copied!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleLeaveClass = async () => {
    if (!confirm('Are you sure you want to leave this class?')) return

    try {
      await axios.post(`/api/classes/${classId}/leave`)
      toast.success('Left class successfully')
      navigate('/classes')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave class')
    }
  }

  const handleDeleteClass = async () => {
    if (!confirm('Are you sure you want to DELETE this class? All members will be removed and files will become public.')) return

    try {
      await axios.delete(`/api/classes/${classId}`)
      toast.success('Class deleted successfully')
      navigate('/classes')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete class')
    }
  }

  const handleApproveRequest = async (userId) => {
    try {
      await axios.post(`/api/classes/${classId}/approve/${userId}`)
      toast.success('Request approved')
      fetchClassData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve')
    }
  }

  const handleRejectRequest = async (userId) => {
    try {
      await axios.post(`/api/classes/${classId}/reject/${userId}`)
      toast.success('Request rejected')
      fetchClassData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject')
    }
  }

  const handleAddCR = async (userId) => {
    try {
      await axios.post(`/api/classes/${classId}/add-cr/${userId}`)
      toast.success('CR added successfully')
      fetchClassData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add CR')
    }
  }

  const handleRemoveCR = async (userId) => {
    try {
      await axios.post(`/api/classes/${classId}/remove-cr/${userId}`)
      toast.success('CR removed')
      fetchClassData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove CR')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the class?')) return

    try {
      await axios.post(`/api/classes/${classId}/remove-member/${userId}`)
      toast.success('Member removed')
      fetchClassData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleUpdateClass = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/api/classes/${classId}`, editForm)
      toast.success('Class updated')
      setShowEditModal(false)
      fetchClassData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update class')
    }
  }

  const handleJoinClass = async () => {
    try {
      const res = await axios.post(`/api/classes/${classId}/join`)
      toast.success(res.data.message)
      fetchClassData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join class')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!classData) return null

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className={`rounded-2xl p-6 mb-6 bg-gradient-to-br ${
        classData.visibility === 'private'
          ? 'from-orange-400 to-red-500'
          : 'from-primary-400 to-purple-500'
      } text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {classData.visibility === 'private' ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    <Lock size={12} /> Private Class
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    <Globe size={12} /> Public Class
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
              <p className="text-white/80 max-w-xl">{classData.description || 'No description'}</p>
            </div>

            {/* Class Code */}
            <button
              onClick={copyClassCode}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
            >
              <span className="font-mono text-lg tracking-wider">{classData.classCode}</span>
              {copiedCode ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>{classData.members?.length || 0} members</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <span>{files.length} files</span>
            </div>
            <div className="flex items-center gap-2">
              <img 
                src={classData.creator?.avatar} 
                alt={classData.creator?.name}
                className="w-6 h-6 rounded-full border-2 border-white/30"
              />
              <span>Created by {classData.creator?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {isMember ? (
            <>
              <Link
                to={`/upload?classId=${classId}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-medium transition-colors"
              >
                <Upload size={18} />
                Upload to Class
              </Link>
              {isCR && (
                <button
                  onClick={() => setShowManageModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
                >
                  <Settings size={18} />
                  Manage
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleJoinClass}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-medium transition-colors"
            >
              <UserPlus size={18} />
              {classData.visibility === 'private' ? 'Request to Join' : 'Join Class'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCR && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
            >
              <Edit2 size={18} />
              Edit
            </button>
          )}
          {isMember && !isCreator && (
            <button
              onClick={handleLeaveClass}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl font-medium text-red-600 transition-colors"
            >
              <LogOut size={18} />
              Leave
            </button>
          )}
          {isCreator && (
            <button
              onClick={handleDeleteClass}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl font-medium text-red-600 transition-colors"
            >
              <Trash2 size={18} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Members Preview */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700">Members</h3>
          {isCR && (
            <button
              onClick={() => setShowManageModal(true)}
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              View all <ChevronRight size={14} className="inline" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Creator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full border border-yellow-200">
            <img 
              src={classData.creator?.avatar} 
              alt={classData.creator?.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium text-yellow-800">{classData.creator?.name}</span>
            <Crown size={12} className="text-yellow-600" />
          </div>
          
          {/* CRs */}
          {classData.crs?.map(cr => (
            <div key={cr._id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
              <img src={cr.avatar} alt={cr.name} className="w-6 h-6 rounded-full" />
              <span className="text-sm font-medium text-blue-800">{cr.name}</span>
              <Shield size={12} className="text-blue-600" />
            </div>
          ))}
          
          {/* Regular Members */}
          {classData.members?.slice(0, 8).filter(m => 
            m._id !== classData.creator?._id && !classData.crs?.some(cr => cr._id === m._id)
          ).map(member => (
            <div key={member._id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
              <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
              <span className="text-sm font-medium text-slate-700">{member.name}</span>
            </div>
          ))}
          
          {classData.members?.length > 10 && (
            <div className="flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-500">
              +{classData.members.length - 10} more
            </div>
          )}
        </div>
      </div>

      {/* Pending Join Requests (CR only) */}
      {isCR && classData.joinRequests?.length > 0 && (
        <div className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <UserPlus size={18} />
            Pending Requests ({classData.joinRequests.length})
          </h3>
          <div className="space-y-2">
            {classData.joinRequests.map(request => (
              <div key={request.user._id} className="flex items-center justify-between bg-white p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <img src={request.user.avatar} alt={request.user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium text-slate-800">{request.user.name}</p>
                    <p className="text-sm text-slate-500">@{request.user.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveRequest(request.user._id)}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.user._id)}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 text-sm font-medium transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Class Files</h2>
        {isMember ? (
          files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <FileCard key={file._id} file={file} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <FileText size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No files shared yet</p>
              <Link
                to={`/upload?classId=${classId}`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-medium transition-colors"
              >
                <Upload size={18} />
                Upload First File
              </Link>
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <Lock size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Join the class to see files</p>
          </div>
        )}
      </div>

      {/* Manage Members Modal */}
      <AnimatePresence>
        {showManageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowManageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Manage Members</h2>
                <button onClick={() => setShowManageModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Creator */}
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <img src={classData.creator?.avatar} alt={classData.creator?.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-slate-800">{classData.creator?.name}</p>
                      <p className="text-xs text-yellow-600 flex items-center gap-1">
                        <Crown size={12} /> Creator
                      </p>
                    </div>
                  </div>
                </div>

                {/* CRs */}
                {classData.crs?.map(cr => (
                  <div key={cr._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <img src={cr.avatar} alt={cr.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium text-slate-800">{cr.name}</p>
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <Shield size={12} /> CR
                        </p>
                      </div>
                    </div>
                    {isCreator && (
                      <button
                        onClick={() => handleRemoveCR(cr._id)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 text-sm font-medium transition-colors"
                      >
                        Remove CR
                      </button>
                    )}
                  </div>
                ))}

                {/* Regular Members */}
                {classData.members?.filter(m => 
                  m._id !== classData.creator?._id && !classData.crs?.some(cr => cr._id === m._id)
                ).map(member => (
                  <div key={member._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-500">@{member.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isCreator && (
                        <button
                          onClick={() => handleAddCR(member._id)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 text-sm font-medium transition-colors"
                        >
                          Make CR
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 text-sm font-medium transition-colors"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Class Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-4">Edit Class</h2>
              <form onSubmit={handleUpdateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Visibility</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, visibility: 'public' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                        editForm.visibility === 'public'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Globe size={18} /> Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, visibility: 'private' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                        editForm.visibility === 'private'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Lock size={18} /> Private
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium text-white transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
