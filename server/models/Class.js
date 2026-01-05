import mongoose from 'mongoose'

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  thumbnail: {
    type: String,
    default: ''
  },
  classCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  // Password for private classes
  password: {
    type: String,
    default: ''
  },
  // Creator - main CR
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Additional CRs who can manage the class
  crs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Class members
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Pending join requests
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Stats
  fileCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Generate unique class code
classSchema.statics.generateClassCode = async function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code
  let isUnique = false
  
  while (!isUnique) {
    code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const existing = await this.findOne({ classCode: code })
    if (!existing) isUnique = true
  }
  
  return code
}

// Check if user is a CR (creator or additional CR)
classSchema.methods.isCR = function(userId) {
  const userIdStr = userId.toString()
  const creatorId = this.creator._id ? this.creator._id.toString() : this.creator.toString()
  return creatorId === userIdStr || 
         this.crs.some(cr => {
           const crId = cr._id ? cr._id.toString() : cr.toString()
           return crId === userIdStr
         })
}

// Check if user is a member
classSchema.methods.isMember = function(userId) {
  const userIdStr = userId.toString()
  // Handle both populated objects and ObjectIds
  return this.members.some(m => {
    const memberId = m._id ? m._id.toString() : m.toString()
    return memberId === userIdStr
  }) || this.isCR(userId)
}

// Index for faster queries
classSchema.index({ classCode: 1 })
classSchema.index({ creator: 1 })
classSchema.index({ members: 1 })
classSchema.index({ visibility: 1 })

const Class = mongoose.model('Class', classSchema)

export default Class
