import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MemoriesScreen from './src/screens/MemoriesScreen';
import WalkingScreen from './src/screens/WalkingScreen';
import DrivingScreen from './src/screens/DrivingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {View, Text} from 'react-native';

const Tab = createBottomTabNavigator();

const Placeholder = ({label}: {label: string}) => (
  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
    <Text>{label} is loading...</Text>
  </View>
);

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{headerShown: false}}>
          <Tab.Screen name="Memories" component={MemoriesScreen} />
          <Tab.Screen name="Walking" component={WalkingScreen} />
          <Tab.Screen name="Driving" component={DrivingScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Privacy" component={PrivacyScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
