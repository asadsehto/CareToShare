import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  deviceName: {
    type: String,
    default: 'Unknown Device',
  },
  brand: String,
  model: String,
  osVersion: String,
  platform: String,
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  socketId: String,
  photoCount: {
    type: Number,
    default: 0,
  },
  syncedCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Device', deviceSchema);
