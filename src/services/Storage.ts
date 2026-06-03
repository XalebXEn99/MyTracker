import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {MemoryRecord, WalkRecord, DriveRecord, ProfileRecord} from '../types';

const DATABASE_VERSION_KEY = 'MyTrackerDatabaseVersion';

export const getDocumentsDirectory = async () => {
  return Platform.OS === 'ios' ? 'file:///var/mobile/Containers/Data/Application' : 'file:///data/user/0';
};

export const loadAppVersion = async () => {
  const version = await AsyncStorage.getItem(DATABASE_VERSION_KEY);
  return version ? Number(version) : 1;
};

export const saveAppVersion = async (version: number) => {
  await AsyncStorage.setItem(DATABASE_VERSION_KEY, String(version));
};

export const clearAllAppData = async () => {
  await AsyncStorage.clear();
};

export const exportAppData = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const all = await AsyncStorage.multiGet(keys);
  return JSON.stringify(Object.fromEntries(all), null, 2);
};

export const memoryRecordFromRow = (row: any): MemoryRecord => ({
  id: row.id,
  title: row.title,
  note: row.note,
  photoUri: row.photo_uri,
  latitude: row.latitude,
  longitude: row.longitude,
  createdAt: row.created_at,
});

export const walkRecordFromRow = (row: any): WalkRecord => ({
  id: row.id,
  startTime: row.start_time,
  endTime: row.end_time,
  distanceMeters: row.distance_meters,
  durationSeconds: row.duration_seconds,
  paceSecondsPerKm: row.pace_seconds_per_km,
  elevationGainMeters: row.elevation_gain_meters,
  calories: row.calories,
  snapshotUri: row.snapshot_uri,
});

export const driveRecordFromRow = (row: any): DriveRecord => ({
  id: row.id,
  startTime: row.start_time,
  endTime: row.end_time,
  distanceMeters: row.distance_meters,
  durationSeconds: row.duration_seconds,
  averageSpeedKmh: row.average_speed_kmh,
  fuelLiters: row.fuel_liters,
  snapshotUri: row.snapshot_uri,
  routeName: row.route_name,
});

export const profileRecordFromRow = (row: any): ProfileRecord => ({
  id: row.id,
  name: row.name,
  age: row.age,
  heightCm: row.height_cm,
  weightKg: row.weight_kg,
  units: row.units,
});
