import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

const PrivacyScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Privacy</Text>
      <View style={styles.section}>
        <Text style={styles.title}>Data storage</Text>
        <Text style={styles.text}>
          MyTracker stores memories, routes, and profile data locally in SQLite and app sandbox photo storage. No personal location data is uploaded by default.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Telemetry</Text>
        <Text style={styles.text}>
          Telemetry is disabled by default. The app only uses analytics or diagnostics when the user explicitly opts in.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Export and delete</Text>
        <Text style={styles.text}>
          You can export stored data or clear all local data from Settings. Photos and route snapshots remain in sandbox storage until deleted.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.text}>
          The app asks for location, camera, Bluetooth, motion, and photo permissions to support tracking, memory creation, and car/watch integration.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
});

export default PrivacyScreen;
