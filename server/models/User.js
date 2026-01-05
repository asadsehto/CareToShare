import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  avatar: {
    type: String
  },
  googleAccessToken: {
    type: String
  },
  googleRefreshToken: {
    type: String
  }
}, {
  timestamps: true
})

// Generate unique username from email or name
userSchema.statics.generateUsername = async function(email, name) {
  let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!baseUsername) {
    baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  }
  
  let username = baseUsername
  let counter = 1
  
  while (await this.findOne({ username })) {
    username = `${baseUsername}${counter}`
    counter++
  }
  
  return username
}

export default mongoose.model('User', userSchema)
