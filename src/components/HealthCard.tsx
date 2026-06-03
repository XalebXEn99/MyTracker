import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface Props {
  totalDistanceKm: number;
  totalDriveKm: number;
  totalCalories: number;
  totalSteps: number;
}

const HealthCard = ({totalDistanceKm, totalDriveKm, totalCalories, totalSteps}: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Health summary</Text>
      <Text style={styles.row}>Total steps: {totalSteps}</Text>
      <Text style={styles.row}>Walking distance: {totalDistanceKm.toFixed(1)} km</Text>
      <Text style={styles.row}>Driving distance: {totalDriveKm.toFixed(1)} km</Text>
      <Text style={styles.row}>Estimated calories: {totalCalories}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: {
    fontSize: 15,
    marginTop: 8,
    color: '#333',
  },
});

export default HealthCard;
