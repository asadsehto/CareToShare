import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { syncService, SyncProgress } from './services/syncService';
import { DeviceInfo, getDeviceInfo } from './services/deviceService';

type Screen = 'permission' | 'home' | 'syncing';

export default function App() {
  const [screen, setScreen] = useState<Screen>('permission');
  const [hasPermission, setHasPermission] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      initializeApp();
    }
  }, [hasPermission]);

  const checkPermission = async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status === 'granted') {
      setHasPermission(true);
      setScreen('home');
    }
  };

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      setHasPermission(true);
      setScreen('home');
    } else {
      Alert.alert(
        'Permission Required',
        'Gallery access is needed to sync your photos.',
        [{ text: 'OK' }]
      );
    }
  };

  const initializeApp = async () => {
    try {
      const info = await syncService.initialize();
      setDeviceInfo(info);
      setIsConnected(syncService.isConnected());
      setSyncedCount(syncService.getSyncedCount());
      
      const lastSyncTime = await syncService.getLastSyncTime();
      setLastSync(lastSyncTime);

      // Get photo count
      const { totalCount } = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: [MediaLibrary.MediaType.photo],
      });
      setPhotoCount(totalCount);

      // Auto-sync
      startSync();
    } catch (error) {
      console.error('Error initializing:', error);
    }
  };

  const startSync = async () => {
    setScreen('syncing');
    
    syncService.setProgressCallback((progress) => {
      setSyncProgress(progress);
      if (progress.phase === 'complete') {
        setSyncedCount(syncService.getSyncedCount());
        setTimeout(() => setScreen('home'), 2000);
      }
    });

    try {
      await syncService.syncPhotos();
    } catch (error) {
      console.error('Sync error:', error);
      setSyncProgress({
        total: 0,
        synced: 0,
        current: 'Sync failed. Please try again.',
        phase: 'error',
      });
    }
  };

  // Permission Screen
  if (screen === 'permission') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📸</Text>
          </View>
          <Text style={styles.title}>Access Your Gallery</Text>
          <Text style={styles.description}>
            CareToShare needs access to your photos to sync and backup your memories.
          </Text>
          <View style={styles.features}>
            <FeatureItem text="View all your photos" />
            <FeatureItem text="Sync to cloud backup" />
            <FeatureItem text="Access from any device" />
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Allow Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Syncing Screen
  if (screen === 'syncing') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>☁️</Text>
          </View>
          <Text style={styles.title}>
            {syncProgress?.phase === 'scanning' ? 'Scanning Gallery' : 
             syncProgress?.phase === 'complete' ? 'Sync Complete!' : 
             syncProgress?.phase === 'error' ? 'Sync Error' : 'Syncing Photos'}
          </Text>
          
          {syncProgress && syncProgress.phase !== 'error' && (
            <>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: syncProgress.total > 0 
                          ? `${(syncProgress.synced / syncProgress.total) * 100}%` 
                          : '0%' 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {syncProgress.synced} / {syncProgress.total}
                </Text>
              </View>
              <Text style={styles.statusText}>{syncProgress.current}</Text>
            </>
          )}

          {syncProgress?.phase !== 'complete' && syncProgress?.phase !== 'error' && (
            <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
          )}

          {syncProgress?.phase === 'complete' && (
            <Text style={styles.successIcon}>✅</Text>
          )}

          {syncProgress?.phase === 'error' && (
            <TouchableOpacity style={styles.primaryButton} onPress={startSync}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Home Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CareToShare</Text>
        <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
      </View>

      <View style={styles.content}>
        <View style={styles.deviceCard}>
          <Text style={styles.deviceIcon}>📱</Text>
          <Text style={styles.deviceName}>{deviceInfo?.deviceName || 'This Device'}</Text>
          <Text style={styles.deviceModel}>{deviceInfo?.brand} {deviceInfo?.model}</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard title="Total Photos" value={photoCount.toString()} icon="🖼️" />
          <StatCard title="Synced" value={syncedCount.toString()} icon="☁️" />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Connection Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, isConnected ? styles.online : styles.offline]} />
            <Text style={styles.statusValue}>
              {isConnected ? 'Connected to Server' : 'Offline'}
            </Text>
          </View>
          {lastSync && (
            <Text style={styles.lastSyncText}>
              Last sync: {new Date(lastSync).toLocaleString()}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.syncButton} onPress={startSync}>
          <Text style={styles.syncButtonText}>🔄 Sync Now</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Photos are synced as thumbnails. Full photos are sent on-demand when requested.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>✓</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  online: {
    backgroundColor: '#22C55E',
  },
  offline: {
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  features: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 40,
  },
  featureIcon: {
    fontSize: 18,
    color: '#4F46E5',
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    marginVertical: 24,
    paddingHorizontal: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
  loader: {
    marginTop: 24,
  },
  successIcon: {
    fontSize: 60,
    textAlign: 'center',
    marginTop: 24,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deviceIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  deviceModel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  syncButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
