import express from 'express'
import User from '../models/User.js'
import File from '../models/File.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query
    
    if (!q) {
      return res.json({ files: [], users: [] })
    }
    
    const searchRegex = new RegExp(q, 'i')
    let files = []
    let users = []
    
    if (type === 'all' || type === 'files') {
      files = await File.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { fileName: searchRegex }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('uploadedBy', 'name username avatar')
    }
    
    if (type === 'all' || type === 'users') {
      const userResults = await User.find({
        $or: [
          { name: searchRegex },
          { username: searchRegex }
        ]
      })
        .select('_id name username avatar')
        .limit(10)
      
      // Get file count and download stats for each user
      users = await Promise.all(userResults.map(async (user) => {
        const userFiles = await File.find({ uploadedBy: user._id })
        return {
          _id: user._id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          fileCount: userFiles.length,
          totalDownloads: userFiles.reduce((sum, f) => sum + f.downloads, 0)
        }
      }))
    }
    
    res.json({ files, users })
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message })
  }
})

export default router
