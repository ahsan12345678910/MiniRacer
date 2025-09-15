// SIMPLIFIED VERSION - Complex gesture handler commented out
// import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import MenuScreen from './src/screens/MenuScreen';
// Using MultiCarGameScreen for racing with AI cars
import MultiCarGameScreen from './src/screens/MultiCarGameScreen';
import SimpleMultiCarTest from './src/screens/SimpleMultiCarTest';
// SIMPLIFIED: Using simple settings screen instead of complex one
import SimpleSettingsScreen from './src/screens/SimpleSettingsScreen';

// Define navigation types
export type RootStackParamList = {
  Splash: undefined;
  Menu: undefined;
  Game: undefined;
  TestCars: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    // SIMPLIFIED: Removed GestureHandlerRootView wrapper
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Game" component={MultiCarGameScreen} />
        <Stack.Screen name="TestCars" component={SimpleMultiCarTest} />
        <Stack.Screen name="Settings" component={SimpleSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    // <StatusBar style="light" />
  );
}