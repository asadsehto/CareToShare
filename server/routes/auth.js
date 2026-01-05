import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Login/Register with Google OAuth token
router.post('/google/token', async (req, res) => {
  try {
    const { accessToken, userInfo } = req.body
    
    if (!accessToken || !userInfo) {
      return res.status(400).json({ message: 'Access token and user info required' })
    }
    
    const { sub: googleId, email, name, picture } = userInfo
    
    // Find or create user
    let user = await User.findOne({ googleId })
    
    if (!user) {
      // Generate unique username
      const username = await User.generateUsername(email, name)
      
      user = new User({
        googleId,
        email,
        name,
        username,
        avatar: picture,
        googleAccessToken: accessToken
      })
      
      await user.save()
    } else {
      // Update access token
      user.googleAccessToken = accessToken
      if (picture) user.avatar = picture
      await user.save()
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ message: 'Authentication failed', error: error.message })
  }
})

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

export default router
