// Server configuration
// UPDATE THIS after deploying to Vercel!
// Example: https://caretoshare-server.vercel.app
export const API_URL = 'https://YOUR_VERCEL_URL.vercel.app';

// Sync settings
export const SYNC_CONFIG = {
  // Thumbnail size (width in pixels)
  THUMBNAIL_SIZE: 200,
  // Thumbnail quality (0-1)
  THUMBNAIL_QUALITY: 0.6,
  // Batch size for syncing (keep small for Vercel limits)
  BATCH_SIZE: 10,
  // Delay between batches (ms)
  BATCH_DELAY: 500,
  // Auto-sync on app open
  AUTO_SYNC: true,
};
