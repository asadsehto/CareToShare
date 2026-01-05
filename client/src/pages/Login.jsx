import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Share2, Users, Cloud, Shield, Image, Sparkles } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { loginWithToken, user } = useAuth()

  // Redirect if already logged in
  if (user) {
    navigate('/')
    return null
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const userInfo = await userInfoResponse.json()
        
        await loginWithToken(tokenResponse.access_token, userInfo)
        toast.success('Welcome to CareToShare!')
        navigate('/')
      } catch (error) {
        console.error('Login failed:', error)
        toast.error('Login failed. Please try again.')
      }
    },
    onError: () => {
      toast.error('Login failed. Please try again.')
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
  })

  const features = [
    { icon: Share2, title: 'Easy Sharing', desc: 'Share files with your classmates instantly' },
    { icon: Cloud, title: 'Cloud Storage', desc: 'Files stored securely in Google Drive' },
    { icon: Users, title: 'Class Groups', desc: 'Share privately with your class only' },
    { icon: Shield, title: 'Privacy Control', desc: 'Public, private, or class-only sharing' },
  ]

  // Animation variants for stagger effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  }

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating shapes */}
      <motion.div 
        className="absolute top-32 right-32 w-4 h-4 bg-purple-400 rounded-full"
        animate={floatingAnimation}
      />
      <motion.div 
        className="absolute bottom-32 left-32 w-6 h-6 bg-blue-400 rounded-lg rotate-45"
        animate={{ ...floatingAnimation, y: [10, -10, 10] }}
      />
      <motion.div 
        className="absolute top-1/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full"
        animate={{ ...floatingAnimation, y: [5, -15, 5] }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-4xl w-full"
      >
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2">
            {/* Left side - Features */}
            <motion.div 
              className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-8 md:p-12 text-white relative overflow-hidden"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Decorative circles */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl" />
              
              <motion.div 
                className="flex items-center gap-3 mb-8 relative z-10"
                variants={itemVariants}
              >
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="text-white font-bold text-2xl">C</span>
                </motion.div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  CareToShare
                </span>
              </motion.div>
              
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                variants={itemVariants}
              >
                Share Files with{' '}
                <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  Your Class
                </span>
              </motion.h2>
              
              <motion.p 
                className="text-slate-400 mb-8 text-lg"
                variants={itemVariants}
              >
                The easiest way to share study materials, notes, and resources with your classmates.
              </motion.p>

              <motion.div className="space-y-5" variants={containerVariants}>
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-4 group"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:bg-white/20 group-hover:border-primary-400/50 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <feature.icon size={22} className="text-primary-400" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold mb-1 text-white group-hover:text-primary-300 transition-colors">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right side - Login */}
            <motion.div 
              className="p-8 md:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-full mb-4 border border-primary-400/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                >
                  <Sparkles size={16} className="text-primary-400" />
                  <span className="text-sm font-medium text-primary-300">Free to use</span>
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
                <p className="text-slate-400">Sign in to start sharing files with your class</p>
              </motion.div>

              <motion.button
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-2xl hover:bg-gray-50 transition-all group shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-primary-500/20"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-slate-700 font-semibold text-lg group-hover:text-slate-900 transition-colors">
                  Continue with Google
                </span>
              </motion.button>

              <motion.p 
                className="mt-6 text-center text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                By signing in, you agree to our Terms of Service and Privacy Policy
              </motion.p>

              <motion.div 
                className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-400/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-sm text-blue-300">
                  <strong className="text-blue-200">� Classes:</strong> Create or join classes to share files with your classmates privately!
                </p>
              </motion.div>

              <motion.div 
                className="mt-4 p-4 bg-green-500/10 rounded-2xl border border-green-400/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-sm text-green-300">
                  <strong className="text-green-200">🔒 Privacy:</strong> Choose who sees your files - public, private, or class-only.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
