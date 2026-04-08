import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { ActivityIndicator, View } from 'react-native';

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E8781A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
