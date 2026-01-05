import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Download, Eye, Trash2, Lock, Users, Globe, Play, Heart, MessageCircle } from 'lucide-react'
import { getFileIcon, getFileColor, formatFileSize } from '../utils/fileUtils'

export default function FileCard({ file, showDownloads = false, showDelete = false, onDelete }) {
  const FileIcon = getFileIcon(file.fileName)
  const colorClass = getFileColor(file.fileName)
  const isImage = file.mimeType?.startsWith('image/')
  const isVideo = file.mimeType?.startsWith('video/')
  const hasThumbnail = (isImage || isVideo) && file.thumbnailUrl

  const visibilityIcons = {
    public: { icon: Globe, color: 'text-green-500', bg: 'bg-green-100' },
    class: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    private: { icon: Lock, color: 'text-orange-500', bg: 'bg-orange-100' },
  }
  const vis = visibilityIcons[file.visibility] || visibilityIcons.public
  const VisIcon = vis.icon

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <Link to={`/file/${file._id}`} className="block">
        {/* Thumbnail for images/videos */}
        {hasThumbnail ? (
          <div className="relative h-36 bg-slate-100 overflow-hidden">
            <img 
              src={file.thumbnailUrl} 
              alt={file.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={24} className="text-white ml-1" fill="white" />
                </div>
              </div>
            )}
            {/* Visibility Badge */}
            <div className={`absolute top-2 right-2 p-1.5 ${vis.bg} rounded-lg`}>
              <VisIcon size={14} className={vis.color} />
            </div>
          </div>
        ) : (
          <div className="relative h-24 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-xl ${colorClass.replace('text-', 'bg-').replace('500', '100')} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <FileIcon size={28} className={colorClass} />
            </div>
            {/* Visibility Badge */}
            <div className={`absolute top-2 right-2 p-1.5 ${vis.bg} rounded-lg`}>
              <VisIcon size={14} className={vis.color} />
            </div>
          </div>
        )}

        <div className="p-4">
          {/* File Info */}
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{file.title}</h3>
          <p className="text-sm text-slate-500 truncate">{file.fileName}</p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span>{formatFileSize(file.fileSize)}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
          </div>

          {/* Description Preview */}
          {file.description && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {file.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <img
                src={file.uploadedBy?.avatar || `https://ui-avatars.com/api/?name=${file.uploadedBy?.name}&background=random&size=24`}
                alt={file.uploadedBy?.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-xs text-slate-500 truncate max-w-[80px]">
                {file.uploadedBy?.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Heart size={14} className={file.likeCount > 0 ? 'text-red-400' : ''} />
                {file.likeCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {file.commentCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Download size={14} />
                {file.downloads}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Delete Button */}
      {showDelete && (
        <div className="px-4 pb-4">
          <button
            onClick={(e) => { e.preventDefault(); onDelete?.() }}
            className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
