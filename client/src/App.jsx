import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Profile from './pages/Profile'
import FileDetails from './pages/FileDetails'
import Search from './pages/Search'
import Category from './pages/Category'
import UserProfile from './pages/UserProfile'
import Classes from './pages/Classes'
import ClassDetail from './pages/ClassDetail'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="upload" element={<Upload />} />
        <Route path="profile" element={<Profile />} />
        <Route path="file/:fileId" element={<FileDetails />} />
        <Route path="search" element={<Search />} />
        <Route path="category/:category" element={<Category />} />
        <Route path="user/:userId" element={<UserProfile />} />
        <Route path="classes" element={<Classes />} />
        <Route path="class/:classId" element={<ClassDetail />} />
      </Route>
    </Routes>
  )
}

export default App
