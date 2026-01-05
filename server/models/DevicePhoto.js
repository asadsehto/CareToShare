import mongoose from 'mongoose';

const devicePhotoSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  photoId: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  width: Number,
  height: Number,
  creationTime: Date,
  modificationTime: Date,
  mediaType: String,
  duration: Number,
  fileSize: Number,
  thumbnail: {
    type: String, // Base64 encoded thumbnail
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for unique photo per device
devicePhotoSchema.index({ deviceId: 1, photoId: 1 }, { unique: true });

export default mongoose.model('DevicePhoto', devicePhotoSchema);
