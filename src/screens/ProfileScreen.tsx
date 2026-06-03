import React, {useEffect, useState} from 'react';
import {Alert, Button, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {fetchWalks, fetchDrives, initializeDatabase, loadProfile, saveProfile} from '../services/Database';
import HealthCard from '../components/HealthCard';

const ProfileScreen = () => {
  const [profile, setProfile] = useState({name: '', age: '', height: '', weight: '', units: 'metric'});
  const [summary, setSummary] = useState({steps: 0, walkKm: 0, driveKm: 0, calories: 0});

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      const savedProfile = await loadProfile();
      if (savedProfile) {
        setProfile({
          name: savedProfile.name,
          age: String(savedProfile.age),
          height: String(savedProfile.heightCm),
          weight: String(savedProfile.weightKg),
          units: savedProfile.units,
        });
      }
      const walks = await fetchWalks();
      const drives = await fetchDrives();
      const totalWalkKm = walks.reduce((sum, item) => sum + item.distance_meters / 1000, 0);
      const totalDriveKm = drives.reduce((sum, item) => sum + item.distance_meters / 1000, 0);
      setSummary({
        steps: 0,
        walkKm: totalWalkKm,
        driveKm: totalDriveKm,
        calories: walks.reduce((sum, item) => sum + item.calories, 0),
      });
    };
    init();
  }, []);

  const save = async () => {
    if (!profile.name || !profile.age || !profile.height || !profile.weight) {
      Alert.alert('Missing info', 'Please fill out all profile fields.');
      return;
    }
    await saveProfile({
      name: profile.name,
      age: Number(profile.age),
      heightCm: Number(profile.height),
      weightKg: Number(profile.weight),
      units: profile.units as 'metric' | 'imperial',
    });
    Alert.alert('Saved', 'Profile information saved successfully.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <TextInput style={styles.input} placeholder="Name" value={profile.name} onChangeText={(text) => setProfile((prev) => ({...prev, name: text}))} />
      <TextInput style={styles.input} placeholder="Age" keyboardType="number-pad" value={profile.age} onChangeText={(text) => setProfile((prev) => ({...prev, age: text}))} />
      <TextInput style={styles.input} placeholder="Height (cm)" keyboardType="number-pad" value={profile.height} onChangeText={(text) => setProfile((prev) => ({...prev, height: text}))} />
      <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="number-pad" value={profile.weight} onChangeText={(text) => setProfile((prev) => ({...prev, weight: text}))} />
      <View style={styles.radioRow}>
        <Button title="Metric" onPress={() => setProfile((prev) => ({...prev, units: 'metric'}))} />
        <Button title="Imperial" onPress={() => setProfile((prev) => ({...prev, units: 'imperial'}))} />
      </View>
      <Button title="Save profile" onPress={save} />
      <HealthCard totalSteps={summary.steps} totalDistanceKm={summary.walkKm} totalDriveKm={summary.driveKm} totalCalories={summary.calories} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f2f6ff',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default ProfileScreen;
