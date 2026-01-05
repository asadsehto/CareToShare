import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

// Screens
import HomeScreen from './screens/HomeScreen';
import GalleryScreen from './screens/GalleryScreen';
import UploadScreen from './screens/UploadScreen';
import PermissionScreen from './screens/PermissionScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    checkMediaPermission();
  }, []);

  const checkMediaPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        
        // Android 13+ uses granular media permissions
        if (androidVersion >= 33) {
          const imagePermission = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          const videoPermission = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
          
          setHasMediaPermission(
            imagePermission === RESULTS.GRANTED && 
            videoPermission === RESULTS.GRANTED
          );
        } else {
          // Android 12 and below
          const readPermission = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          setHasMediaPermission(readPermission === RESULTS.GRANTED);
        }
      }
      setPermissionChecked(true);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionChecked(true);
    }
  };

  const requestMediaPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        
        // Android 13+ uses granular media permissions
        if (androidVersion >= 33) {
          const imageResult = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          const videoResult = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
          
          if (imageResult === RESULTS.GRANTED && videoResult === RESULTS.GRANTED) {
            setHasMediaPermission(true);
            return true;
          } else if (imageResult === RESULTS.BLOCKED || videoResult === RESULTS.BLOCKED) {
            Alert.alert(
              'Permission Required',
              'Please enable media access in settings to use the gallery feature.',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Open Settings', onPress: () => openSettings()},
              ]
            );
          }
        } else {
          // Android 12 and below
          const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          
          if (result === RESULTS.GRANTED) {
            setHasMediaPermission(true);
            return true;
          } else if (result === RESULTS.BLOCKED) {
            Alert.alert(
              'Permission Required',
              'Please enable storage access in settings to use the gallery feature.',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Open Settings', onPress: () => openSettings()},
              ]
            );
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  if (!permissionChecked) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasMediaPermission ? 'Home' : 'Permission'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4F46E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Permission"
          options={{headerShown: false}}>
          {props => (
            <PermissionScreen
              {...props}
              onPermissionGranted={() => setHasMediaPermission(true)}
              requestPermission={requestMediaPermission}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'CareToShare'}}
        />
        <Stack.Screen
          name="Gallery"
          component={GalleryScreen}
          options={{title: 'My Gallery'}}
        />
        <Stack.Screen
          name="Upload"
          component={UploadScreen}
          options={{title: 'Upload Photo'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
