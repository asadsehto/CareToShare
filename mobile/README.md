# CareToShare Mobile App

React Native (Expo) mobile app that syncs device gallery photos to your server.

## 🚀 Quick Start (Test on Your Phone in 5 Minutes)

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Update Server URL

Edit `src/config.ts` and set your server IP:

```typescript
export const API_URL = 'http://YOUR_COMPUTER_IP:5000';
export const SOCKET_URL = 'http://YOUR_COMPUTER_IP:5000';
```

Find your IP:
- Windows: `ipconfig` → Look for IPv4 Address
- Mac/Linux: `ifconfig` or `ip addr`

### Step 3: Start the Server

```bash
cd ../server
npm install
npm run dev
```

### Step 4: Start the Client (Optional - for viewing photos)

```bash
cd ../client
npm install
npm run dev
```

### Step 5: Run the Mobile App

```bash
cd mobile
npx expo start
```

### Step 6: Scan QR Code

1. Install **Expo Go** from Play Store on your Android phone
2. Scan the QR code shown in terminal
3. App will open on your phone!

## 📱 How It Works

1. **Grant Permission** - App asks for gallery access
2. **Auto Sync** - Thumbnails + metadata sent to your server
3. **View on Dashboard** - Go to `http://localhost:5173/devices`
4. **On-Demand Full Photos** - Click any thumbnail to fetch full resolution

## 🔧 Server Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/device-sync/devices` | List all connected devices |
| `GET /api/device-sync/devices/:id/photos` | Get thumbnails for a device |
| `GET /api/device-sync/stats` | Get sync statistics |
| `POST /api/device-sync/photos` | Receive photos from device |

## 📊 Storage Usage

- **Thumbnails**: ~100KB per photo
- **1000 photos** = ~100MB server storage
- **Full photos**: Only downloaded on-demand

## 🔒 Sync Policy

- ✅ Thumbnails auto-sync on permission grant
- ✅ Metadata (filename, date, size) synced
- ✅ Full photos stay on device
- ✅ Full photos sent only when you request
- ✅ Works even when device goes offline (thumbnails cached)

## 📁 Project Structure

```
mobile/
├── App.tsx                     # Main app component
├── app.json                    # Expo configuration
├── package.json
├── src/
│   ├── config.ts               # Server URL configuration
│   └── services/
│       ├── deviceService.ts    # Device ID management
│       └── syncService.ts      # Photo sync logic
└── assets/                     # App icons
```

## 🛠️ Troubleshooting

### "Network request failed"
- Ensure phone and computer are on same WiFi
- Check firewall isn't blocking port 5000
- Verify server is running

### "Permission denied"
- Uninstall and reinstall app
- Check phone settings for app permissions

### Photos not syncing
- Check server console for errors
- Ensure MongoDB is running
- Check network connectivity
