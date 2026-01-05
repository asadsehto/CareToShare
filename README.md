# CareToShare 📚

A modern file-sharing platform for students to share study materials with their classmates. Built with React, Node.js, and Google Drive integration.

![CareToShare](https://img.shields.io/badge/CareToShare-File%20Sharing%20Platform-blue)

## ✨ Features

- **🔐 Google Authentication** - Secure login with Google accounts
- **☁️ Google Drive Storage** - Files automatically uploaded to user's Google Drive
- **📁 Multiple File Types** - Support for PDF, DOC, PPT, TXT, ZIP, Images, Videos
- **🔍 Search** - Search files by name, description, or search users by name/username
- **📂 Categories** - Browse files by type (Documents, Presentations, Images, Videos, Archives)
- **👤 User Profiles** - View user profiles and their uploaded files
- **📊 Statistics** - Track downloads, views, and file counts
- **💅 Modern UI** - Clean, responsive design with smooth animations

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Google Drive API for file storage
- JWT for authentication

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- MongoDB installed locally or a MongoDB Atlas account
- A Google Cloud Console account

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd CareToShare

# Install all dependencies (root, client, and server)
npm run install:all
```

### 2. Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Drive API
   - Google+ API (for OAuth)

4. Create OAuth 2.0 Credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Select **Web application**
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - Your production URL
   - Add authorized redirect URIs:
     - `http://localhost:3000` (development)
     - Your production URL
   - Copy the **Client ID**

5. Configure OAuth Consent Screen:
   - Go to **APIs & Services** > **OAuth consent screen**
   - Fill in the required information
   - Add scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `../auth/drive.file`

### 3. Configure Environment Variables

**Client (.env in /client folder):**
```bash
cd client
cp .env.example .env
```
Edit `.env`:
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Server (.env in /server folder):**
```bash
cd server
cp .env.example .env
```
Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/caretoshare
JWT_SECRET=your-super-secret-jwt-key-generate-a-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas and update the `MONGODB_URI` in your `.env` file.

### 5. Run the Application

From the root directory:
```bash
npm run dev
```

This will start both the client (port 3000) and server (port 5000) concurrently.

Or run them separately:
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

Visit `http://localhost:3000` to see the application!

## 📁 Project Structure

```
CareToShare/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── ...
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── index.js           # Server entry point
└── package.json           # Root package.json
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/google/token` - Login with Google

### Files
- `GET /api/files/recent` - Get recent files
- `GET /api/files/popular` - Get popular files
- `GET /api/files/category` - Get files by category
- `GET /api/files/my-files` - Get user's files (auth required)
- `GET /api/files/:id` - Get single file
- `POST /api/files/upload` - Upload file (auth required)
- `POST /api/files/:id/download` - Record download
- `DELETE /api/files/:id` - Delete file (auth required)

### Users
- `PUT /api/users/profile` - Update profile (auth required)
- `GET /api/users/:id` - Get user profile

### Search
- `GET /api/search?q=query` - Search files and users

### Stats
- `GET /api/stats` - Get platform statistics

## 🚀 Deployment

### Frontend (Vercel, Netlify, etc.)
1. Build the client: `cd client && npm run build`
2. Deploy the `dist` folder
3. Set environment variable `VITE_GOOGLE_CLIENT_ID`

### Backend (Railway, Render, Heroku, etc.)
1. Deploy the `server` folder
2. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Free Hosting Options
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Cyclic
- **Database**: MongoDB Atlas (free tier)

## 📝 Usage

1. **Sign In**: Click "Continue with Google" to sign in
2. **Upload**: Click "Upload" and drag/drop or select a file
3. **Browse**: Explore files by category or use search
4. **Download**: Click on any file to view details and download
5. **Profile**: Update your display name and username

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ for students everywhere!
