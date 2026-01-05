import { 
  FileText, 
  Image, 
  Video, 
  Archive, 
  FileSpreadsheet, 
  File 
} from 'lucide-react'

export function getFileExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function getFileCategory(filename) {
  const ext = getFileExtension(filename)
  
  const categories = {
    documents: ['pdf', 'doc', 'docx', 'txt'],
    presentations: ['ppt', 'pptx'],
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
    videos: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv'],
    archives: ['zip', 'rar', '7z', 'tar', 'gz']
  }
  
  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(ext)) {
      return category
    }
  }
  
  return 'other'
}

export function getFileIcon(filename) {
  const category = getFileCategory(filename)
  
  const icons = {
    documents: FileText,
    presentations: FileSpreadsheet,
    images: Image,
    videos: Video,
    archives: Archive,
    other: File
  }
  
  return icons[category] || File
}

export function getFileColor(filename) {
  const category = getFileCategory(filename)
  
  const colors = {
    documents: 'text-blue-500',
    presentations: 'text-orange-500',
    images: 'text-green-500',
    videos: 'text-purple-500',
    archives: 'text-yellow-500',
    other: 'text-gray-500'
  }
  
  return colors[category] || 'text-gray-500'
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = bytes
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function getMimeType(filename) {
  const ext = getFileExtension(filename)
  
  const mimeTypes = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska'
  }
  
  return mimeTypes[ext] || 'application/octet-stream'
}
