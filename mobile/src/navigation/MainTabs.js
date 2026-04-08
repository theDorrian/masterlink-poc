import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

import SearchResultsScreen from '../screens/SearchResultsScreen';
import FilterScreen from '../screens/FilterScreen';
import TradesmanDetailScreen from '../screens/TradesmanDetailScreen';
import JobRequestScreen from '../screens/JobRequestScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const SearchStack = createStackNavigator();

function SearchNavigator() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'MasterLink', headerTitleStyle: { fontWeight: 'bold' } }}
      />
      <SearchStack.Screen
        name="Filter"
        component={FilterScreen}
        options={{ title: 'Filter Results', headerTintColor: '#E8781A', presentation: 'modal' }}
      />
      <SearchStack.Screen
        name="TradesmanDetail"
        component={TradesmanDetailScreen}
        options={{ title: 'Profile', headerTintColor: '#E8781A' }}
      />
      <SearchStack.Screen
        name="JobRequest"
        component={JobRequestScreen}
        options={{ title: 'Job Request', headerTintColor: '#E8781A' }}
      />
    </SearchStack.Navigator>
  );
}

const ORANGE = '#E8781A';
const GRAY = '#9CA3AF';

function TabIcon({ name, color }) {
  const icons = { Search: '🔍', Jobs: '📋', Profile: '👤' };
  return <Text style={{ fontSize: 20 }}>{icons[name]}</Text>;
}

export default function MainTabs() {
  const { role } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: GRAY,
        tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />,
        tabBarStyle: { paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Search" component={SearchNavigator} />
      <Tab.Screen
        name="Jobs"
        component={MyJobsScreen}
        options={{ title: role === 'tradesman' ? 'Requests' : 'My Jobs' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
