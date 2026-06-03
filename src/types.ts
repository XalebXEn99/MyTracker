export type LocationPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number;
};

export type MemoryRecord = {
  id: number;
  title: string;
  note: string;
  photoUri: string;
  latitude: number;
  longitude: number;
  createdAt: number;
};

export type WalkRecord = {
  id: number;
  startTime: number;
  endTime: number;
  distanceMeters: number;
  durationSeconds: number;
  paceSecondsPerKm: number;
  elevationGainMeters: number;
  calories: number;
  snapshotUri: string;
};

export type DriveRecord = {
  id: number;
  startTime: number;
  endTime: number;
  distanceMeters: number;
  durationSeconds: number;
  averageSpeedKmh: number;
  fuelLiters: number;
  snapshotUri: string;
  routeName?: string;
};

export type ProfileRecord = {
  id: number;
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  units: 'metric' | 'imperial';
};
