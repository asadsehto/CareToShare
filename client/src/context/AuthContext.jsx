import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setAccessToken(storedToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setLoading(false)
  }, [])

  const login = async (googleResponse) => {
    try {
      const response = await axios.post('/api/auth/google', {
        credential: googleResponse.credential,
        accessToken: googleResponse.access_token
      })
      
      const { user: userData, token } = response.data
      
      setUser(userData)
      setAccessToken(token)
      
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('accessToken', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      return userData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const loginWithToken = async (accessToken, userInfo) => {
    try {
      const response = await axios.post('/api/auth/google/token', {
        accessToken,
        userInfo
      })
      
      const { user: userData, token } = response.data
      
      setUser(userData)
      setAccessToken(token)
      
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('accessToken', token)
      localStorage.setItem('googleAccessToken', accessToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      return userData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('googleAccessToken')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      accessToken,
      login, 
      loginWithToken,
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
