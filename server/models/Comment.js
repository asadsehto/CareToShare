import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  // For reply support (optional - future feature)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }
}, {
  timestamps: true
})

// Index for faster queries
commentSchema.index({ file: 1, createdAt: -1 })
commentSchema.index({ user: 1 })

export default mongoose.model('Comment', commentSchema)
