import React, {useEffect, useState} from 'react';
import {Alert, Button, ScrollView, StyleSheet, Text, View} from 'react-native';
import {addCarConnectionListener, queryConnectedCar} from '../services/CarConnectionManager';
import {getCurrentRouteBuffer, startLocationTracking, stopLocationTracking, clearRouteBuffer} from '../services/LocationTracker';
import {calculateDistanceMeters, calculateDurationSeconds, calculateFuelLiters} from '../services/Calculations';
import {fetchDrives, insertDrive, initializeDatabase} from '../services/Database';
import WalkDriveHistoryList from '../components/WalkDriveHistoryList';

const DrivingScreen = () => {
  const [driveActive, setDriveActive] = useState(false);
  const [drives, setDrives] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({distance: 0, duration: 0, speed: 0, fuel: 0});

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      setDrives(await fetchDrives());
      const connectedCar = await queryConnectedCar();
      if (connectedCar) {
        Alert.alert('Car connection detected', `Detected ${connectedCar}. Start a driving session?`, [
          {text: 'Later'},
          {text: 'Start drive', onPress: startDrive},
        ]);
      }
    };
    init();
    const listener = addCarConnectionListener((event) => {
      if (event.connected) {
        Alert.alert('Car Bluetooth connected', `Connected to ${event.deviceName}`);
      }
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!driveActive) {
      return;
    }
    const interval = setInterval(() => {
      const route = getCurrentRouteBuffer();
      const distance = calculateDistanceMeters(route);
      const duration = calculateDurationSeconds(route[0]?.timestamp ?? 0, route[route.length - 1]?.timestamp ?? 0);
      const speed = duration > 0 ? (distance / 1000) / (duration / 3600) : 0;
      const fuel = calculateFuelLiters(distance);
      setMetrics({distance, duration, speed, fuel});
    }, 3000);
    return () => clearInterval(interval);
  }, [driveActive]);

  const startDrive = async () => {
    setDriveActive(true);
    await startLocationTracking();
  };

  const stopDrive = async () => {
    const route = getCurrentRouteBuffer();
    if (route.length < 2) {
      Alert.alert('No route recorded', 'Record a longer drive before stopping.');
      return;
    }
    const duration = calculateDurationSeconds(route[0].timestamp, route[route.length - 1].timestamp);
    const distance = calculateDistanceMeters(route);
    const speed = duration > 0 ? (distance / 1000) / (duration / 3600) : 0;
    const fuel = calculateFuelLiters(distance);
    const driveRecord = {
      startTime: route[0].timestamp,
      endTime: route[route.length - 1].timestamp,
      distanceMeters: distance,
      durationSeconds: duration,
      averageSpeedKmh: speed,
      fuelLiters: fuel,
      snapshotUri: '',
      routeName: 'Drive route',
    };
    await insertDrive(driveRecord);
    setDrives(await fetchDrives());
    stopLocationTracking();
    clearRouteBuffer();
    setDriveActive(false);
    setMetrics({distance: 0, duration: 0, speed: 0, fuel: 0});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Driving</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.value}>{(metrics.distance / 1000).toFixed(1)} km</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{Math.round(metrics.duration / 60)} min</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Avg speed</Text>
        <Text style={styles.value}>{metrics.speed.toFixed(1)} km/h</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fuel estimate</Text>
        <Text style={styles.value}>{metrics.fuel.toFixed(2)} L</Text>
      </View>
      <Button title={driveActive ? 'Stop drive' : 'Start drive'} onPress={driveActive ? stopDrive : startDrive} />
      <Text style={styles.historyHeader}>Recent drives</Text>
      <WalkDriveHistoryList
        items={drives.map((drive) => ({
          id: drive.id,
          title: `Drive • ${(drive.distance_meters / 1000).toFixed(1)} km`,
          subtitle: new Date(drive.start_time).toLocaleDateString(),
        }))}
        onSelect={(id) => Alert.alert('Drive selected', `Preview details for drive ${id} in a later review.`)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f9fbff',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    color: '#555',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  historyHeader: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});

export default DrivingScreen;
