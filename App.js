import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import MyAccountScreen from './screens/MyAccountScreen';
import SalaryScreen from './screens/SalaryScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import NotificationScreen from './screens/NotificationScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A6BA3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Authenticated Screens
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerStyle: { backgroundColor: '#0A6BA3' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: 'bold' },
                title: 'Dashboard',
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="MyAccount"
              component={MyAccountScreen}
              options={{
                headerStyle: { backgroundColor: '#0A6BA3' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: 'bold' },
                title: 'My Account',
              }}
            />
            <Stack.Screen
              name="Salary"
              component={SalaryScreen}
              options={{
                headerStyle: { backgroundColor: '#0A6BA3' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: 'bold' },
                title: 'My Salary',
              }}
            />
            <Stack.Screen
              name="Attendance"
              component={AttendanceScreen}
              options={{
                headerStyle: { backgroundColor: '#0A6BA3' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: 'bold' },
                title: 'My Attendance',
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationScreen}
              options={{
                headerStyle: { backgroundColor: '#0A6BA3' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: 'bold' },
                title: 'Notifications',
              }}
            />
          </>
        ) : (
          // Auth Screens - Headers Hidden
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFDFD',
  },
});