import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function DevicePhotos() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      fetchPhotos(selectedDevice.deviceId)
    }
  }, [selectedDevice])

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/device-sync/stats`)
      const data = await res.json()
      setStats(data)
      setDevices(data.devices || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setLoading(false)
    }
  }

  const fetchPhotos = async (deviceId) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/device-sync/devices/${deviceId}/photos?limit=100`)
      const data = await res.json()
      setPhotos(data.photos || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching photos:', error)
      setLoading(false)
    }
  }

  const downloadThumbnail = (photo) => {
    if (!photo.thumbnail) return
    
    const link = document.createElement('a')
    link.href = `data:image/jpeg;base64,${photo.thumbnail}`
    link.download = photo.filename || 'photo.jpg'
    link.click()
  }

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📱 Device Photos</h1>
          <p className="text-gray-600 mt-2">View synced photo thumbnails from connected devices</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalDevices || 0}</div>
            <div className="text-gray-500 text-sm">Total Devices</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="text-2xl font-bold text-indigo-600">{stats?.totalPhotos || 0}</div>
            <div className="text-gray-500 text-sm">Total Photos</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl mb-2">☁️</div>
            <div className="text-2xl font-bold text-blue-600">
              {((stats?.totalPhotos || 0) * 0.1).toFixed(1)} MB
            </div>
            <div className="text-gray-500 text-sm">Storage Used</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-2xl font-bold text-green-600">Auto</div>
            <div className="text-gray-500 text-sm">Sync Status</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Device List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Connected Devices</h2>
              <div className="space-y-2">
                {devices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No devices synced yet. Install the APK on a device to start syncing.</p>
                ) : (
                  devices.map((device) => (
                    <button
                      key={device._id || device.deviceId}
                      onClick={() => setSelectedDevice(device)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedDevice?.deviceId === device.deviceId
                          ? 'bg-indigo-100 border-indigo-500 border'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📱</span>
                        <span className="font-medium text-gray-900 truncate">
                          {device.deviceName || 'Unknown Device'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {device.photoCount || 0} photos synced
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={fetchStats}
                className="w-full mt-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              {!selectedDevice ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <span className="text-6xl mb-4">📱</span>
                  <p>Select a device to view photos</p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <span className="text-6xl mb-4">📷</span>
                  <p>No photos synced from this device yet</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900">
                      {selectedDevice.deviceName} - {photos.length} Photos
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {photos.map((photo) => (
                      <button
                        key={photo._id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80 transition relative group"
                      >
                        {photo.thumbnail ? (
                          <img
                            src={`data:image/jpeg;base64,${photo.thumbnail}`}
                            alt={photo.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🖼️
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPhoto.filename}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedPhoto.width} x {selectedPhoto.height} • 
                    {selectedPhoto.creationTime && new Date(selectedPhoto.creationTime).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4 flex items-center justify-center bg-gray-100">
                {selectedPhoto.thumbnail ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedPhoto.thumbnail}`}
                    alt={selectedPhoto.filename}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="text-6xl">🖼️</div>
                )}
              </div>

              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => downloadThumbnail(selectedPhoto)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  ⬇️ Download Thumbnail
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
