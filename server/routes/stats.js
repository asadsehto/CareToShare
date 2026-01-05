import express from 'express'
import User from '../models/User.js'
import File from '../models/File.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const totalFiles = await File.countDocuments()
    const totalUsers = await User.countDocuments()
    
    const downloadStats = await File.aggregate([
      { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
    ])
    
    const totalDownloads = downloadStats[0]?.totalDownloads || 0
    
    res.json({
      totalFiles,
      totalDownloads,
      totalUsers
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message })
  }
})

export default router
