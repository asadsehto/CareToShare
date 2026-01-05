import express from 'express';
import Device from '../models/Device.js';
import DevicePhoto from '../models/DevicePhoto.js';

const router = express.Router();

// Register/Update device
router.post('/register', async (req, res) => {
  try {
    const { deviceId, deviceName, brand, model, osVersion, platform, syncedCount } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        deviceName,
        brand,
        model,
        osVersion,
        platform,
        syncedCount,
        lastSeen: new Date(),
        isOnline: true,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, device });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// Receive photos with thumbnails
router.post('/photos', async (req, res) => {
  try {
    const { deviceId, photos } = req.body;

    if (!deviceId || !photos || !Array.isArray(photos)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const operations = photos.map(photo => ({
      updateOne: {
        filter: { deviceId, photoId: photo.id },
        update: {
          deviceId,
          photoId: photo.id,
          filename: photo.filename,
          width: photo.width,
          height: photo.height,
          creationTime: photo.creationTime ? new Date(photo.creationTime) : null,
          modificationTime: photo.modificationTime ? new Date(photo.modificationTime) : null,
          mediaType: photo.mediaType,
          duration: photo.duration,
          fileSize: photo.fileSize,
          thumbnail: photo.thumbnail,
        },
        upsert: true,
      },
    }));

    await DevicePhoto.bulkWrite(operations);

    // Update device photo count
    const photoCount = await DevicePhoto.countDocuments({ deviceId });
    await Device.findOneAndUpdate({ deviceId }, { photoCount, lastSeen: new Date() });

    res.json({ success: true, synced: photos.length });
  } catch (error) {
    console.error('Photo sync error:', error);
    res.status(500).json({ error: 'Failed to sync photos' });
  }
});

// Get all devices
router.get('/devices', async (req, res) => {
  try {
    const devices = await Device.find().sort({ lastSeen: -1 });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get photos for a device (thumbnails only)
router.get('/devices/:deviceId/photos', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const photos = await DevicePhoto.find({ deviceId })
      .sort({ creationTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await DevicePhoto.countDocuments({ deviceId });

    res.json({
      photos,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Get single photo thumbnail
router.get('/photo/:photoId', async (req, res) => {
  try {
    const photo = await DevicePhoto.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// Get device stats
router.get('/stats', async (req, res) => {
  try {
    const totalDevices = await Device.countDocuments();
    const onlineDevices = await Device.countDocuments({ isOnline: true });
    const totalPhotos = await DevicePhoto.countDocuments();
    
    const devices = await Device.find().select('deviceName photoCount isOnline lastSeen');

    res.json({
      totalDevices,
      onlineDevices,
      totalPhotos,
      devices,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
