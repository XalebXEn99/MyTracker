import SQLite, {ResultSet, Transaction} from 'react-native-sqlite-storage';
import {DriveRecord, MemoryRecord, ProfileRecord, WalkRecord} from '../types';

const DB_NAME = 'MyTracker.db';
const DB_VERSION = '1.0';
const DB_DISPLAY_NAME = 'MyTrackerDatabase';
const DB_SIZE = 200000;

const db = SQLite.openDatabase({name: DB_NAME, location: 'default'}, () => {
  console.log('SQLite database opened');
}, (error) => {
  console.error('SQLite open error', error);
});

const executeSql = async (sql: string, params: any[] = []) => {
  return new Promise<ResultSet>((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(sql, params, (_tx, result) => resolve(result), (_tx, err) => reject(err));
    });
  });
};

const createTables = async () => {
  await executeSql(`CREATE TABLE IF NOT EXISTS memories (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, note TEXT, photo_uri TEXT, latitude REAL, longitude REAL, created_at INTEGER);`);
  await executeSql(`CREATE TABLE IF NOT EXISTS walks (id INTEGER PRIMARY KEY AUTOINCREMENT, start_time INTEGER, end_time INTEGER, distance_meters REAL, duration_seconds INTEGER, pace_seconds_per_km INTEGER, elevation_gain_meters REAL, calories INTEGER, snapshot_uri TEXT);`);
  await executeSql(`CREATE TABLE IF NOT EXISTS drives (id INTEGER PRIMARY KEY AUTOINCREMENT, start_time INTEGER, end_time INTEGER, distance_meters REAL, duration_seconds INTEGER, average_speed_kmh REAL, fuel_liters REAL, snapshot_uri TEXT, route_name TEXT);`);
  await executeSql(`CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER, height_cm REAL, weight_kg REAL, units TEXT);`);
};

export const initializeDatabase = async () => {
  await createTables();
};

export const insertMemory = async (memory: Omit<MemoryRecord, 'id'>) => {
  const result = await executeSql(
    `INSERT INTO memories (title, note, photo_uri, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, ?);`,
    [memory.title, memory.note, memory.photoUri, memory.latitude, memory.longitude, memory.createdAt],
  );
  return result.insertId;
};

export const fetchMemories = async (): Promise<MemoryRecord[]> => {
  const result = await executeSql(`SELECT * FROM memories ORDER BY created_at DESC;`);
  const rows: MemoryRecord[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    rows.push(result.rows.item(i));
  }
  return rows;
};

export const insertWalk = async (walk: Omit<WalkRecord, 'id'>) => {
  const result = await executeSql(
    `INSERT INTO walks (start_time, end_time, distance_meters, duration_seconds, pace_seconds_per_km, elevation_gain_meters, calories, snapshot_uri) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [walk.startTime, walk.endTime, walk.distanceMeters, walk.durationSeconds, walk.paceSecondsPerKm, walk.elevationGainMeters, walk.calories, walk.snapshotUri],
  );
  return result.insertId;
};

export const fetchWalks = async (): Promise<WalkRecord[]> => {
  const result = await executeSql(`SELECT * FROM walks ORDER BY start_time DESC;`);
  const rows: WalkRecord[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    rows.push(result.rows.item(i));
  }
  return rows;
};

export const insertDrive = async (drive: Omit<DriveRecord, 'id'>) => {
  const result = await executeSql(
    `INSERT INTO drives (start_time, end_time, distance_meters, duration_seconds, average_speed_kmh, fuel_liters, snapshot_uri, route_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [drive.startTime, drive.endTime, drive.distanceMeters, drive.durationSeconds, drive.averageSpeedKmh, drive.fuelLiters, drive.snapshotUri, drive.routeName],
  );
  return result.insertId;
};

export const fetchDrives = async (): Promise<DriveRecord[]> => {
  const result = await executeSql(`SELECT * FROM drives ORDER BY start_time DESC;`);
  const rows: DriveRecord[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    rows.push(result.rows.item(i));
  }
  return rows;
};

export const loadProfile = async (): Promise<ProfileRecord | null> => {
  const result = await executeSql(`SELECT * FROM profile LIMIT 1;`);
  if (result.rows.length > 0) {
    return result.rows.item(0);
  }
  return null;
};

export const saveProfile = async (profile: Omit<ProfileRecord, 'id'>) => {
  const existing = await loadProfile();
  if (existing) {
    await executeSql(`UPDATE profile SET name=?, age=?, height_cm=?, weight_kg=?, units=? WHERE id=?;`, [
      profile.name,
      profile.age,
      profile.heightCm,
      profile.weightKg,
      profile.units,
      existing.id,
    ]);
    return existing.id;
  }
  const result = await executeSql(
    `INSERT INTO profile (name, age, height_cm, weight_kg, units) VALUES (?, ?, ?, ?, ?);`,
    [profile.name, profile.age, profile.heightCm, profile.weightKg, profile.units],
  );
  return result.insertId;
};

export const resetDatabase = async () => {
  await executeSql(`DROP TABLE IF EXISTS memories;`);
  await executeSql(`DROP TABLE IF EXISTS walks;`);
  await executeSql(`DROP TABLE IF EXISTS drives;`);
  await executeSql(`DROP TABLE IF EXISTS profile;`);
  await createTables();
};
