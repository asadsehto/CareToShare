import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@device_id';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  brand: string;
  model: string;
  osVersion: string;
  platform: string;
}

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate a unique device ID
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    deviceId = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return {
    deviceId,
    deviceName: Device.deviceName || 'Unknown Device',
    brand: Device.brand || 'Unknown',
    model: Device.modelName || 'Unknown',
    osVersion: Device.osVersion || 'Unknown',
    platform: Device.osName || 'Unknown',
  };
};
