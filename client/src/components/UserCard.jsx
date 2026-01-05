import { Link } from 'react-router-dom'
import { File, Download } from 'lucide-react'

export default function UserCard({ user }) {
  return (
    <Link 
      to={`/user/${user._id}`}
      className="block bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all card-hover p-4"
    >
      <div className="flex items-center gap-3">
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=48`}
          alt={user.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{user.name}</h3>
          <p className="text-sm text-slate-500">@{user.username}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <File size={16} className="text-blue-500" />
          {user.fileCount || 0} files
        </span>
        <span className="flex items-center gap-1">
          <Download size={16} className="text-green-500" />
          {user.totalDownloads || 0} downloads
        </span>
      </div>
    </Link>
  )
}
