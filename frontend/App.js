import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import GetLatestDealsScreen from './src/screens/GetLatestDealsScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#757575',
        }}
      >
        <Tab.Screen 
          name="GetDeals" 
          component={GetLatestDealsScreen}
          options={{ 
            title: 'Get Latest Deals',
            tabBarLabel: 'Get Deals'
          }}
        />
        <Tab.Screen 
          name="Recipes" 
          component={RecipesScreen}
          options={{ 
            title: 'My Recipes',
            tabBarLabel: 'Recipes'
          }}
        />
        <Tab.Screen 
          name="ShoppingList" 
          component={ShoppingListScreen}
          options={{ 
            title: 'Shopping List',
            tabBarLabel: 'Shopping List'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
