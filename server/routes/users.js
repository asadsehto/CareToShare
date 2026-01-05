import express from 'express'
import User from '../models/User.js'
import File from '../models/File.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, username } = req.body
    const user = req.user
    
    if (!name || !username) {
      return res.status(400).json({ message: 'Name and username are required' })
    }
    
    // Check if username is taken by another user
    const existingUser = await User.findOne({ 
      username: username.toLowerCase(), 
      _id: { $ne: user._id } 
    })
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' })
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' })
    }
    
    user.name = name
    user.username = username.toLowerCase()
    await user.save()
    
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message })
  }
})

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-googleAccessToken -googleRefreshToken')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    const files = await File.find({ uploadedBy: user._id })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name username avatar')
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      files
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message })
  }
})

export default router
