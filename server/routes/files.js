import express from 'express'
import multer from 'multer'
import { google } from 'googleapis'
import { Readable } from 'stream'
import File from '../models/File.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
})

// Helper to create Google Drive client
const createDriveClient = (accessToken) => {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth: oauth2Client })
}

// Upload file
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }
    
    const { title, description } = req.body
    const user = req.user
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }
    
    // Get user's Google access token from localStorage (sent via header or stored)
    const googleAccessToken = user.googleAccessToken || req.headers['x-google-token']
    
    if (!googleAccessToken) {
      return res.status(401).json({ message: 'Google Drive access required. Please re-login.' })
    }
    
    // Create Drive client
    const drive = createDriveClient(googleAccessToken)
    
    // Create a readable stream from buffer
    const bufferStream = new Readable()
    bufferStream.push(req.file.buffer)
    bufferStream.push(null)
    
    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: req.file.mimetype
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream
      },
      fields: 'id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink'
    })
    
    // Make file publicly accessible
    await drive.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })
    
    // Get the download URL
    const fileInfo = await drive.files.get({
      fileId: driveResponse.data.id,
      fields: 'webContentLink, webViewLink, thumbnailLink'
    })
    
    // Determine category
    const category = File.getCategoryFromFilename(req.file.originalname)
    
    // Get visibility settings
    const { visibility = 'public', classId = null } = req.body
    
    // Create file record in database
    const file = new File({
      title,
      description: description || '',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category,
      visibility,
      classId: visibility === 'class' ? classId : null,
      googleDriveId: driveResponse.data.id,
      downloadUrl: fileInfo.data.webContentLink || `https://drive.google.com/uc?export=download&id=${driveResponse.data.id}`,
      webViewLink: fileInfo.data.webViewLink,
      thumbnailUrl: fileInfo.data.thumbnailLink,
      uploadedBy: user._id
    })
    
    await file.save()
    await file.populate('uploadedBy', 'name username avatar')
    
    res.status(201).json(file)
  } catch (error) {
    console.error('Upload error:', error)
    
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({ message: 'Google Drive access expired. Please re-login.' })
    }
    
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
})

// Get recent files (only public files)
router.get('/recent', async (req, res) => {
  try {
    const files = await File.find({ visibility: 'public' })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('uploadedBy', 'name username avatar')
    
    res.json(files)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files', error: error.message })
  }
})

// Get popular files (only public files)
router.get('/popular', async (req, res) => {
  try {
    const files = await File.find({ visibility: 'public' })
      .sort({ downloads: -1 })
      .limit(8)
      .populate('uploadedBy', 'name username avatar')
    
    res.json(files)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files', error: error.message })
  }
})

// Get files by category
router.get('/category', async (req, res) => {
  try {
    const { category, sort = 'newest' } = req.query
    
    let query = {}
    if (category && category !== 'all') {
      query.category = category
    }
    
    let sortOption = { createdAt: -1 }
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'downloads':
        sortOption = { downloads: -1 }
        break
      case 'name':
        sortOption = { title: 1 }
        break
    }
    
    const files = await File.find(query)
      .sort(sortOption)
      .populate('uploadedBy', 'name username avatar')
    
    res.json(files)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files', error: error.message })
  }
})

// Get my files
router.get('/my-files', authenticate, async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name username avatar')
    
    const stats = {
      totalFiles: files.length,
      totalDownloads: files.reduce((sum, f) => sum + f.downloads, 0),
      totalViews: files.reduce((sum, f) => sum + f.views, 0)
    }
    
    res.json({ files, stats })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files', error: error.message })
  }
})

// Get user's Google Photos - MUST be before /:id route
router.get('/my-photos', authenticate, async (req, res) => {
  try {
    const googleAccessToken = req.user.googleAccessToken || req.headers['x-google-token']
    
    console.log('📸 My Photos request - Token exists:', !!googleAccessToken)
    
    if (!googleAccessToken) {
      return res.status(401).json({ message: 'Google Photos access required. Please re-login.' })
    }
    
    const { pageSize = 50, pageToken } = req.query
    
    console.log('📸 Fetching from Google Photos API...')
    
    // Fetch photos from Google Photos API
    const photosResponse = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${pageSize}${pageToken ? `&pageToken=${pageToken}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`
        }
      }
    )
    
    console.log('📸 Google Photos response status:', photosResponse.status)
    
    if (!photosResponse.ok) {
      const error = await photosResponse.json()
      console.error('📸 Google Photos API error:', JSON.stringify(error, null, 2))
      
      if (photosResponse.status === 401 || photosResponse.status === 403) {
        return res.status(401).json({ 
          message: 'Google Photos permission required. Please log out and log back in to grant access.',
          requiresReauth: true
        })
      }
      
      return res.status(photosResponse.status).json({ message: 'Failed to fetch photos' })
    }
    
    const data = await photosResponse.json()
    
    // Transform to useful format
    const photos = (data.mediaItems || []).map(item => ({
      id: item.id,
      filename: item.filename,
      mimeType: item.mimeType,
      description: item.description || '',
      creationTime: item.mediaMetadata?.creationTime,
      width: item.mediaMetadata?.width,
      height: item.mediaMetadata?.height,
      thumbnail: `${item.baseUrl}=w200-h200`,
      medium: `${item.baseUrl}=w600-h600`,
      full: `${item.baseUrl}=d`,
      isVideo: item.mimeType?.startsWith('video/'),
      videoDuration: item.mediaMetadata?.video?.processingStatus === 'READY' 
        ? item.mediaMetadata?.video?.fps 
        : null
    }))
    
    res.json({
      photos,
      nextPageToken: data.nextPageToken
    })
  } catch (error) {
    console.error('Photos fetch error:', error)
    res.status(500).json({ message: 'Failed to fetch photos', error: error.message })
  }
})

// Upload from Google Photos to share - MUST be before /:id route
router.post('/share-photo', authenticate, async (req, res) => {
  try {
    const { photoId, photoUrl, filename, mimeType, title, description, visibility, classCode } = req.body
    const googleAccessToken = req.user.googleAccessToken || req.headers['x-google-token']
    
    if (!googleAccessToken) {
      return res.status(401).json({ message: 'Google Drive access required. Please re-login.' })
    }
    
    // Download the photo from Google Photos
    const photoResponse = await fetch(photoUrl)
    const photoBuffer = await photoResponse.arrayBuffer()
    
    // Create Drive client
    const drive = createDriveClient(googleAccessToken)
    
    // Create a readable stream from buffer
    const bufferStream = new Readable()
    bufferStream.push(Buffer.from(photoBuffer))
    bufferStream.push(null)
    
    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: mimeType
      },
      media: {
        mimeType: mimeType,
        body: bufferStream
      },
      fields: 'id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink'
    })
    
    // Make file publicly accessible
    await drive.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })
    
    // Get the download URL
    const fileInfo = await drive.files.get({
      fileId: driveResponse.data.id,
      fields: 'webContentLink, webViewLink, thumbnailLink, size'
    })
    
    // Determine category
    const category = File.getCategoryFromFilename(filename)
    
    // Create file record in database
    const file = new File({
      title: title || filename.replace(/\.[^/.]+$/, ''),
      description: description || '',
      fileName: filename,
      fileSize: parseInt(fileInfo.data.size) || 0,
      mimeType: mimeType,
      category,
      visibility: visibility || 'public',
      classCode: visibility === 'class' ? classCode : '',
      googleDriveId: driveResponse.data.id,
      downloadUrl: fileInfo.data.webContentLink || `https://drive.google.com/uc?export=download&id=${driveResponse.data.id}`,
      webViewLink: fileInfo.data.webViewLink,
      thumbnailUrl: fileInfo.data.thumbnailLink,
      uploadedBy: req.user._id
    })
    
    await file.save()
    await file.populate('uploadedBy', 'name username avatar')
    
    res.status(201).json(file)
  } catch (error) {
    console.error('Share photo error:', error)
    res.status(500).json({ message: 'Failed to share photo', error: error.message })
  }
})

// Get single file
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('uploadedBy', 'name username avatar')
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }
    
    // Increment views
    file.views += 1
    await file.save()
    
    res.json(file)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch file', error: error.message })
  }
})

// Record download
router.post('/:id/download', async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }
    
    file.downloads += 1
    await file.save()
    
    res.json({ success: true, downloads: file.downloads })
  } catch (error) {
    res.status(500).json({ message: 'Failed to record download', error: error.message })
  }
})

// Delete file
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }
    
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this file' })
    }
    
    // Try to delete from Google Drive
    try {
      const googleAccessToken = req.user.googleAccessToken
      if (googleAccessToken) {
        const drive = createDriveClient(googleAccessToken)
        await drive.files.delete({ fileId: file.googleDriveId })
      }
    } catch (driveError) {
      console.error('Failed to delete from Google Drive:', driveError)
      // Continue with database deletion even if Drive deletion fails
    }
    
    await File.findByIdAndDelete(req.params.id)
    
    res.json({ message: 'File deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error: error.message })
  }
})

// ==================== LIKES ====================

// Like a file
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }
    
    const userId = req.user._id.toString()
    const alreadyLiked = file.likes.some(id => id.toString() === userId)
    
    if (alreadyLiked) {
      // Unlike
      file.likes = file.likes.filter(id => id.toString() !== userId)
      file.likeCount = Math.max(0, file.likeCount - 1)
    } else {
      // Like
      file.likes.push(req.user._id)
      file.likeCount = file.likes.length
    }
    
    await file.save()
    
    res.json({ 
      liked: !alreadyLiked, 
      likeCount: file.likeCount 
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update like', error: error.message })
  }
})

// Check if user liked a file
router.get('/:id/like-status', authenticate, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }
    
    const liked = file.likes.some(id => id.toString() === req.user._id.toString())
    
    res.json({ liked, likeCount: file.likeCount })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get like status', error: error.message })
  }
})

// ==================== COMMENTS ====================

// Get comments for a file
router.get('/:id/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    
    const comments = await Comment.find({ file: req.params.id })
      .populate('user', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    const total = await Comment.countDocuments({ file: req.params.id })
    
    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments', error: error.message })
  }
})

// Add a comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { text } = req.body
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' })
    }
    
    if (text.length > 500) {
      return res.status(400).json({ message: 'Comment must be 500 characters or less' })
    }
    
    const file = await File.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }
    
    const comment = new Comment({
      file: req.params.id,
      user: req.user._id,
      text: text.trim()
    })
    
    await comment.save()
    
    // Update comment count
    file.commentCount = await Comment.countDocuments({ file: req.params.id })
    await file.save()
    
    // Populate user for response
    await comment.populate('user', 'name username avatar')
    
    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message })
  }
})

// Delete a comment (own comment only)
router.delete('/comments/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }
    
    const fileId = comment.file
    await Comment.findByIdAndDelete(req.params.commentId)
    
    // Update comment count
    const file = await File.findById(fileId)
    if (file) {
      file.commentCount = await Comment.countDocuments({ file: fileId })
      await file.save()
    }
    
    res.json({ message: 'Comment deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment', error: error.message })
  }
})

export default router
