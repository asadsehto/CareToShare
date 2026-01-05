import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import fileRoutes from './routes/files.js'
import userRoutes from './routes/users.js'
import searchRoutes from './routes/search.js'
import statsRoutes from './routes/stats.js'
import classRoutes from './routes/classes.js'
import deviceSyncRoutes from './routes/deviceSync.js'

dotenv.config()

const app = express()

// Trust proxy for Vercel
app.set('trust proxy', 1)

// Rate limiting for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased for mobile sync
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increased for thumbnails
app.use('/api/', limiter)

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/caretoshare'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/device-sync', deviceSyncRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!', error: err.message })
})

const PORT = process.env.PORT || 5000

// Export for Vercel
export default app

// Only start server if not on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}
