import React, {useEffect, useState} from 'react';
import {Alert, Button, ScrollView, StyleSheet, Switch, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {clearAllAppData, exportAppData} from '../services/Storage';

const TELEMETRY_KEY = 'MyTrackerTelemetryOptOut';

const SettingsScreen = () => {
  const [telemetryOptOut, setTelemetryOptOut] = useState(true);

  useEffect(() => {
    const load = async () => {
      const value = await AsyncStorage.getItem(TELEMETRY_KEY);
      setTelemetryOptOut(value !== 'false');
    };
    load();
  }, []);

  const toggleTelemetry = async () => {
    const newValue = !telemetryOptOut;
    setTelemetryOptOut(newValue);
    await AsyncStorage.setItem(TELEMETRY_KEY, String(newValue));
  };

  const handleExport = async () => {
    const exportData = await exportAppData();
    Alert.alert('Export data scaffold', exportData.slice(0, 300));
  };

  const handleClear = async () => {
    await clearAllAppData();
    Alert.alert('Clear data', 'All local storage data has been deleted. Reinstall may still preserve sandbox media files.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.item}>
        <Text style={styles.label}>Telemetry opt-out</Text>
        <Switch value={telemetryOptOut} onValueChange={toggleTelemetry} />
      </View>
      <View style={styles.item}> 
        <Text style={styles.label}>Export data</Text>
        <Button title="Export" onPress={handleExport} />
      </View>
      <View style={styles.item}> 
        <Text style={styles.label}>Clear all data</Text>
        <Button title="Clear" color="#d32f2f" onPress={handleClear} />
      </View>
      <Text style={styles.note}>
        Export currently shows a scaffold preview. For production, wire a file share or cloud upload provider.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  item: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  note: {
    color: '#666',
    marginTop: 16,
    lineHeight: 22,
  },
});

export default SettingsScreen;
