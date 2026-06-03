import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MapScreen from '../components/MapScreen';

const MemoriesScreen = () => {
  return (
    <View style={styles.container}>
      <MapScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MemoriesScreen;
