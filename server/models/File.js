import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['documents', 'presentations', 'images', 'videos', 'archives', 'other'],
    default: 'other'
  },
  visibility: {
    type: String,
    enum: ['public', 'class', 'private'],
    default: 'public'
  },
  // Reference to Class model (for class visibility)
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  // Legacy field - keeping for backward compatibility
  classCode: {
    type: String,
    default: ''
  },
  googleDriveId: {
    type: String,
    required: true
  },
  downloadUrl: {
    type: String,
    required: true
  },
  webViewLink: {
    type: String
  },
  thumbnailUrl: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  // Likes
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  // Comment count (actual comments in separate collection)
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Add text index for search
fileSchema.index({ title: 'text', description: 'text', fileName: 'text' })

// Static method to get file category from extension
fileSchema.statics.getCategoryFromFilename = function(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
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

export default mongoose.model('File', fileSchema)
