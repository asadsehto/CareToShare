import express from 'express'
import Class from '../models/Class.js'
import File from '../models/File.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Create a new class
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, visibility, thumbnail, password } = req.body
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Class name must be at least 2 characters' })
    }
    
    // Password required for private classes
    if (visibility === 'private' && !password) {
      return res.status(400).json({ message: 'Password is required for private classes' })
    }
    
    const classCode = await Class.generateClassCode()
    
    const newClass = new Class({
      name: name.trim(),
      description: description?.trim() || '',
      thumbnail: thumbnail || '',
      classCode,
      visibility: visibility || 'public',
      password: visibility === 'private' ? password : '',
      creator: req.user._id,
      members: [req.user._id] // Creator is automatically a member
    })
    
    await newClass.save()
    await newClass.populate('creator', 'name username avatar')
    
    res.status(201).json(newClass)
  } catch (error) {
    console.error('Create class error:', error)
    res.status(500).json({ message: 'Failed to create class', error: error.message })
  }
})

// Get all classes (for discovery) - public join directly, private need password
router.get('/discover', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query
    
    const query = {} // Show both public and private classes
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { classCode: { $regex: search, $options: 'i' } }
      ]
    }
    
    const classes = await Class.find(query)
      .select('-password') // Don't expose password
      .populate('creator', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    const total = await Class.countDocuments(query)
    
    res.json({
      classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch classes', error: error.message })
  }
})

// Get user's classes (member of or created)
router.get('/my', authenticate, async (req, res) => {
  try {
    const userId = req.user._id
    
    const classes = await Class.find({
      $or: [
        { creator: userId },
        { crs: userId },
        { members: userId }
      ]
    })
    .populate('creator', 'name username avatar')
    .populate('members', 'name username avatar')
    .sort({ updatedAt: -1 })
    
    // Separate into created and joined
    const created = classes.filter(c => c.creator._id.toString() === userId.toString())
    const joined = classes.filter(c => c.creator._id.toString() !== userId.toString())
    
    res.json({ created, joined, all: classes })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch classes', error: error.message })
  }
})

// Get class by code (for joining)
router.get('/code/:code', authenticate, async (req, res) => {
  try {
    const classData = await Class.findOne({ classCode: req.params.code.toUpperCase() })
      .populate('creator', 'name username avatar')
      .populate('members', 'name username avatar')
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    res.json(classData)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch class', error: error.message })
  }
})

// Get class by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('creator', 'name username avatar')
      .populate('crs', 'name username avatar')
      .populate('members', 'name username avatar')
      .populate('joinRequests.user', 'name username avatar')
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    // Check access for private classes
    if (classData.visibility === 'private' && !classData.isMember(req.user._id)) {
      return res.status(403).json({ message: 'This is a private class' })
    }
    
    // Get files for this class
    const files = await File.find({ 
      classId: classData._id,
      visibility: 'class'
    })
    .populate('uploadedBy', 'name username avatar')
    .sort({ createdAt: -1 })
    .limit(20)
    
    res.json({ ...classData.toObject(), files })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch class', error: error.message })
  }
})

// Join class directly (for public classes or private with password)
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    // Check if already a member
    if (classData.isMember(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this class' })
    }
    
    // For private classes, verify password
    if (classData.visibility === 'private') {
      const { password } = req.body
      
      if (!password) {
        return res.status(400).json({ message: 'Password required for private class', requiresPassword: true })
      }
      
      if (classData.password !== password) {
        return res.status(403).json({ message: 'Incorrect password' })
      }
    }
    
    // Join the class
    classData.members.push(req.user._id)
    await classData.save()
    
    res.json({ message: 'Joined class successfully', status: 'joined' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to join class', error: error.message })
  }
})

// Join class by code
router.post('/join-by-code', authenticate, async (req, res) => {
  try {
    const { code, password } = req.body
    
    if (!code) {
      return res.status(400).json({ message: 'Class code is required' })
    }
    
    const classData = await Class.findOne({ classCode: code.toUpperCase() })
    
    if (!classData) {
      return res.status(404).json({ message: 'Invalid class code' })
    }
    
    // Check if already a member
    if (classData.isMember(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this class' })
    }
    
    // For private classes, verify password
    if (classData.visibility === 'private') {
      if (!password) {
        return res.status(400).json({ 
          message: 'Password required for private class', 
          requiresPassword: true,
          className: classData.name,
          classId: classData._id
        })
      }
      
      if (classData.password !== password) {
        return res.status(403).json({ message: 'Incorrect password' })
      }
    }
    
    // Join the class
    classData.members.push(req.user._id)
    await classData.save()
    
    await classData.populate('creator', 'name username avatar')
    
    res.json({ message: 'Joined class successfully', class: classData })
  } catch (error) {
    res.status(500).json({ message: 'Failed to join class', error: error.message })
  }
})

// Approve join request (CR only)
router.post('/:id/approve/:userId', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (!classData.isCR(req.user._id)) {
      return res.status(403).json({ message: 'Only CRs can approve join requests' })
    }
    
    const requestIndex = classData.joinRequests.findIndex(
      jr => jr.user.toString() === req.params.userId
    )
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' })
    }
    
    // Remove from requests and add to members
    classData.joinRequests.splice(requestIndex, 1)
    classData.members.push(req.params.userId)
    await classData.save()
    
    res.json({ message: 'Join request approved' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve request', error: error.message })
  }
})

// Reject join request (CR only)
router.post('/:id/reject/:userId', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (!classData.isCR(req.user._id)) {
      return res.status(403).json({ message: 'Only CRs can reject join requests' })
    }
    
    classData.joinRequests = classData.joinRequests.filter(
      jr => jr.user.toString() !== req.params.userId
    )
    await classData.save()
    
    res.json({ message: 'Join request rejected' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request', error: error.message })
  }
})

// Add CR (creator only)
router.post('/:id/add-cr/:userId', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    // Only creator can add CRs
    if (classData.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the class creator can add CRs' })
    }
    
    // Check if user is a member
    if (!classData.isMember(req.params.userId)) {
      return res.status(400).json({ message: 'User must be a member first' })
    }
    
    // Check if already a CR
    if (classData.crs.some(cr => cr.toString() === req.params.userId)) {
      return res.status(400).json({ message: 'User is already a CR' })
    }
    
    classData.crs.push(req.params.userId)
    await classData.save()
    
    res.json({ message: 'CR added successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to add CR', error: error.message })
  }
})

// Remove CR (creator only)
router.post('/:id/remove-cr/:userId', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (classData.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the class creator can remove CRs' })
    }
    
    classData.crs = classData.crs.filter(cr => cr.toString() !== req.params.userId)
    await classData.save()
    
    res.json({ message: 'CR removed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove CR', error: error.message })
  }
})

// Remove member (CR only)
router.post('/:id/remove-member/:userId', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (!classData.isCR(req.user._id)) {
      return res.status(403).json({ message: 'Only CRs can remove members' })
    }
    
    // Can't remove the creator
    if (classData.creator.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the class creator' })
    }
    
    // Also remove from CRs if they were one
    classData.crs = classData.crs.filter(cr => cr.toString() !== req.params.userId)
    classData.members = classData.members.filter(m => m.toString() !== req.params.userId)
    await classData.save()
    
    res.json({ message: 'Member removed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message })
  }
})

// Leave class
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    // Creator can't leave (must delete class)
    if (classData.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave. Delete the class instead.' })
    }
    
    classData.crs = classData.crs.filter(cr => cr.toString() !== req.user._id.toString())
    classData.members = classData.members.filter(m => m.toString() !== req.user._id.toString())
    await classData.save()
    
    res.json({ message: 'Left class successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave class', error: error.message })
  }
})

// Update class (CR only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (!classData.isCR(req.user._id)) {
      return res.status(403).json({ message: 'Only CRs can update class' })
    }
    
    const { name, description, visibility, thumbnail } = req.body
    
    if (name) classData.name = name.trim()
    if (description !== undefined) classData.description = description.trim()
    if (visibility) classData.visibility = visibility
    if (thumbnail !== undefined) classData.thumbnail = thumbnail
    
    await classData.save()
    await classData.populate('creator', 'name username avatar')
    
    res.json(classData)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update class', error: error.message })
  }
})

// Delete class (creator only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (classData.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can delete the class' })
    }
    
    // Update all files in this class to public
    await File.updateMany(
      { classId: classData._id },
      { $set: { visibility: 'public', classId: null } }
    )
    
    await Class.findByIdAndDelete(req.params.id)
    
    res.json({ message: 'Class deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete class', error: error.message })
  }
})

// Get class files (members only)
router.get('/:id/files', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (!classData.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Only members can view class files' })
    }
    
    const files = await File.find({ classId: classData._id })
      .populate('uploadedBy', 'name username avatar')
      .sort({ createdAt: -1 })
    
    res.json(files)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files', error: error.message })
  }
})

export default router
