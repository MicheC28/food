import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import GetLatestDealsScreen from './src/screens/GetLatestDealsScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';

const Tab = createBottomTabNavigator();

const HeaderTitle = () => (
  <Text style={styles.title}>Recipe Radar</Text>
);

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />

      <Tab.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerTitle: () => <HeaderTitle />,
          tabBarActiveTintColor: '#F4964A',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen
          name="GetDeals"
          component={GetLatestDealsScreen}
          options={{
            tabBarLabel: 'Get Deals',
            // header visibility controlled *inside* the screen
          }}
        />

        <Tab.Screen
          name="Recipes"
          component={RecipesScreen}
          options={{
            title: 'My Recipes',
            tabBarLabel: 'Recipes',
          }}
        />

        <Tab.Screen
          name="ShoppingList"
          component={ShoppingListScreen}
          options={{
            title: 'Shopping List',
            tabBarLabel: 'Shopping List',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F4964A',
    height: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  leftContainer: {
    paddingLeft: 15,
    justifyContent: 'center',
    height: '100%',
  },
  leftText: {
    fontSize: 14,
    color: '#dcedc8',
  },
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
});
