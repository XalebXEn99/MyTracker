import {Alert, Platform} from 'react-native';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';

const messages = {
  location: 'MyTracker needs location access to record walks, drives, and map position.',
  bluetooth: 'MyTracker uses Bluetooth to detect car connections and BLE watch services.',
  camera: 'MyTracker needs camera access to capture new memories.',
  photo: 'MyTracker saves captured photos to app storage so memories can be replayed later.',
};

export const getPermissionName = (permission: string) => {
  switch (permission) {
    case 'location':
      return Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });
    case 'bluetooth':
      return Platform.select({
        ios: PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
        android: PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      });
    case 'camera':
      return Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });
    case 'photo':
      return Platform.select({
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      });
    default:
      return null;
  }
};

export const requestPermission = async (type: 'location' | 'bluetooth' | 'camera' | 'photo') => {
  const permission = getPermissionName(type);
  if (!permission) {
    return false;
  }

  Alert.alert(`${type.charAt(0).toUpperCase() + type.slice(1)} permission`, messages[type], [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Allow', onPress: async () => await request(permission)},
  ]);

  const result = await request(permission);
  return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
};

export const checkPermission = async (type: 'location' | 'bluetooth' | 'camera' | 'photo') => {
  const permission = getPermissionName(type);
  if (!permission) {
    return false;
  }
  const status = await check(permission);
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
};
