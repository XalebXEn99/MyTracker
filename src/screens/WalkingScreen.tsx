import React, {useEffect, useState} from 'react';
import {Button, ScrollView, StyleSheet, Text, View, Alert} from 'react-native';
import {getCurrentRouteBuffer, startLocationTracking, stopLocationTracking, clearRouteBuffer} from '../services/LocationTracker';
import {calculateDistanceMeters, calculateDurationSeconds, calculateElevationGain, calculatePaceSecondsPerKm, calculateCalories} from '../services/Calculations';
import {fetchWalks, insertWalk, initializeDatabase} from '../services/Database';
import WalkDriveHistoryList from '../components/WalkDriveHistoryList';

const WalkingScreen = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [walks, setWalks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({distance: 0, duration: 0, pace: 0, elevation: 0, calories: 0});

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      setWalks(await fetchWalks());
    };
    init();
  }, []);

  useEffect(() => {
    if (!isTracking) {
      return;
    }
    const interval = setInterval(async () => {
      const route = getCurrentRouteBuffer();
      const distance = calculateDistanceMeters(route);
      const duration = calculateDurationSeconds(route[0]?.timestamp ?? 0, route[route.length - 1]?.timestamp ?? 0);
      const elevation = calculateElevationGain(route);
      const calories = calculateCalories(70, duration, distance);
      const pace = calculatePaceSecondsPerKm(distance, duration);
      setMetrics({distance, duration, pace, elevation, calories});
    }, 2000);
    return () => clearInterval(interval);
  }, [isTracking]);

  const startWalk = async () => {
    setIsTracking(true);
    await startLocationTracking();
  };

  const stopWalk = async () => {
    const route = getCurrentRouteBuffer();
    if (route.length < 2) {
      Alert.alert('No route recorded', 'Record a longer route before stopping.');
      return;
    }
    const duration = calculateDurationSeconds(route[0].timestamp, route[route.length - 1].timestamp);
    const distance = calculateDistanceMeters(route);
    const elevation = calculateElevationGain(route);
    const calories = calculateCalories(70, duration, distance);
    const pace = calculatePaceSecondsPerKm(distance, duration);
    const newWalk = {
      startTime: route[0].timestamp,
      endTime: route[route.length - 1].timestamp,
      distanceMeters: distance,
      durationSeconds: duration,
      paceSecondsPerKm: pace,
      elevationGainMeters: elevation,
      calories,
      snapshotUri: '',
    };
    await insertWalk(newWalk);
    setWalks(await fetchWalks());
    stopLocationTracking();
    clearRouteBuffer();
    setIsTracking(false);
    setMetrics({distance: 0, duration: 0, pace: 0, elevation: 0, calories: 0});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Walk tracking</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.value}>{(metrics.distance / 1000).toFixed(2)} km</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{Math.round(metrics.duration / 60)} min</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Pace</Text>
        <Text style={styles.value}>{metrics.pace} s/km</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Elevation gain</Text>
        <Text style={styles.value}>{metrics.elevation.toFixed(1)} m</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Calories</Text>
        <Text style={styles.value}>{metrics.calories}</Text>
      </View>
      <Button title={isTracking ? 'Stop walk' : 'Start walk'} onPress={isTracking ? stopWalk : startWalk} />
      <Text style={styles.historyHeader}>History</Text>
      <WalkDriveHistoryList
        items={walks.map((walk) => ({
          id: walk.id,
          title: `Walk • ${(walk.distance_meters / 1000).toFixed(1)} km`,
          subtitle: new Date(walk.start_time).toLocaleDateString(),
        }))}
        onSelect={(id) => Alert.alert('Walk selected', `Load full details for walk ${id} in a later review.`)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f5f7fb',
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

export default WalkingScreen;
