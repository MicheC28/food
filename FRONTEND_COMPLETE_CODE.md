# Complete Frontend Code for Meal Prep Helper

## Setup Instructions

1. **Create the Expo project:**
   ```bash
   cd C:\Users\miche\Github\food
   npx create-expo-app@latest meal-prep-frontend --template blank
   ```

2. **Install dependencies:**
   ```bash
   cd meal-prep-frontend
   npm install @react-navigation/native @react-navigation/bottom-tabs
   npx expo install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-checkbox @expo/vector-icons
   ```

3. **Create the following files:**

---

## File 1: config.js (ROOT of meal-prep-frontend)

```javascript
// Configuration file for the Meal Prep Helper app
const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  GENERATE_RECIPES: `${API_BASE_URL}/api/recipes/generate`,
  GET_RECIPES: `${API_BASE_URL}/api/recipes`,
  UPDATE_SELECTIONS: `${API_BASE_URL}/api/recipes/update-selections`,
  GET_SHOPPING_LIST: `${API_BASE_URL}/api/recipes/shopping-list`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
```

---

## File 2: App.js (REPLACE existing App.js)

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import RecipesScreen from './screens/RecipesScreen';
import ShoppingListScreen from './screens/ShoppingListScreen';
import GetDealsScreen from './screens/GetDealsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Recipes') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Shopping List') {
              iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name === 'Get Deals') {
              iconName = focused ? 'pricetag' : 'pricetag-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#F4964A',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#F4964A',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Recipes" 
          component={RecipesScreen}
          options={{ title: 'My Recipes' }}
        />
        <Tab.Screen 
          name="Shopping List" 
          component={ShoppingListScreen}
          options={{ title: 'Shopping List' }}
        />
        <Tab.Screen 
          name="Get Deals" 
          component={GetDealsScreen}
          options={{ title: 'Get Latest Deals' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

---

## File 3: screens/GetDealsScreen.js

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config';

const POSTAL_CODE_KEY = '@meal_prep_postal_code';

export default function GetDealsScreen({ navigation }) {
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedPostalCode();
  }, []);

  const loadSavedPostalCode = async () => {
    try {
      const saved = await AsyncStorage.getItem(POSTAL_CODE_KEY);
      if (saved) {
        setPostalCode(saved);
      }
    } catch (error) {
      console.error('Error loading postal code:', error);
    }
  };

  const validatePostalCode = (code) => {
    const cleaned = code.toUpperCase().replace(/\s/g, '');
    if (cleaned.length !== 6) return false;
    
    const pattern = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;
    return pattern.test(cleaned);
  };

  const handleGenerateRecipes = async () => {
    const cleaned = postalCode.toUpperCase().replace(/\s/g, '');
    
    if (!validatePostalCode(cleaned)) {
      Alert.alert(
        'Invalid Postal Code',
        'Please enter a valid Canadian postal code (e.g., M5V2H1)'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.GENERATE_RECIPES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postal_code: cleaned }),
      });

      const data = await response.json();

      if (data.success) {
        // Save postal code
        await AsyncStorage.setItem(POSTAL_CODE_KEY, cleaned);
        
        Alert.alert(
          'Success!',
          `Generated ${data.count} recipes based on deals in ${cleaned}`,
          [
            {
              text: 'View Recipes',
              onPress: () => navigation.navigate('Recipes'),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to generate recipes');
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Get Latest Deals</Text>
        <Text style={styles.subtitle}>
          Enter your postal code to discover recipes based on local grocery deals
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="e.g., M5V2H1"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            maxLength={6}
            editable={!loading}
          />
          <Text style={styles.hint}>Format: A1A1A1</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerateRecipes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate Recipes</Text>
          )}
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F4964A" />
            <Text style={styles.loadingText}>
              Fetching deals and generating recipes...
            </Text>
            <Text style={styles.loadingSubtext}>This may take 15-30 seconds</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    letterSpacing: 2,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#F4964A',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
```

---

## File 4: screens/RecipesScreen.js

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { API_ENDPOINTS } from '../config';

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(new Set());
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_RECIPES);
      const data = await response.json();

      if (data.success) {
        setRecipes(data.recipes);
        
        // Set initial selections based on in_list field
        const selected = new Set();
        data.recipes.forEach(recipe => {
          if (recipe.in_list) {
            selected.add(recipe._id);
          }
        });
        setSelectedRecipeIds(selected);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'Could not load recipes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipes();
  };

  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const handleConfirmSelection = async () => {
    setUpdating(true);

    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_SELECTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_recipe_ids: Array.from(selectedRecipeIds),
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success',
          `Updated ${data.updated_count} recipe(s) in your shopping list`
        );
        fetchRecipes(); // Refresh to show updated in_list status
      } else {
        Alert.alert('Error', data.error || 'Failed to update selections');
      }
    } catch (error) {
      console.error('Error updating selections:', error);
      Alert.alert('Error', 'Could not update selections');
    } finally {
      setUpdating(false);
    }
  };

  // Separate recipes into this week's and previous
  const thisWeekRecipes = recipes.slice(0, 5);
  const previousRecipes = recipes.slice(5);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F4964A" />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No recipes yet!</Text>
        <Text style={styles.emptySubtext}>
          Go to "Get Deals" tab to generate your first recipes
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {thisWeekRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week's Recipes</Text>
            {thisWeekRecipes.map(recipe => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                isSelected={selectedRecipeIds.has(recipe._id)}
                onToggle={() => toggleRecipeSelection(recipe._id)}
              />
            ))}
          </View>
        )}

        {previousRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previously Saved Recipes</Text>
            {previousRecipes.map(recipe => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                isSelected={selectedRecipeIds.has(recipe._id)}
                onToggle={() => toggleRecipeSelection(recipe._id)}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, updating && styles.buttonDisabled]}
          onPress={handleConfirmSelection}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirm Selection ({selectedRecipeIds.size})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  bottomPadding: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#F4964A',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

---

## File 5: screens/ShoppingListScreen.js

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import ShoppingListItem from '../components/ShoppingListItem';
import { API_ENDPOINTS } from '../config';

export default function ShoppingListScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [consolidatedIngredients, setConsolidatedIngredients] = useState([]);

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_SHOPPING_LIST);
      const data = await response.json();

      if (data.success) {
        const consolidated = consolidateIngredients(data.recipes);
        setConsolidatedIngredients(consolidated);
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const consolidateIngredients = (recipes) => {
    const ingredientMap = {};

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase();
        
        if (!ingredientMap[key]) {
          ingredientMap[key] = {
            name: ing.name,
            quantities: [],
            recipes: [],
            deals: [],
          };
        }

        ingredientMap[key].quantities.push(ing.quantity);
        
        if (!ingredientMap[key].recipes.includes(recipe.name)) {
          ingredientMap[key].recipes.push(recipe.name);
        }

        // Check if ingredient matches any flyer deals
        recipe.flyer_deals.forEach(deal => {
          const dealName = deal.name.toLowerCase();
          const ingName = ing.name.toLowerCase();
          
          if (dealName.includes(ingName) || ingName.includes(dealName)) {
            const existingDeal = ingredientMap[key].deals.find(
              d => d.name === deal.name && d.merchant === deal.merchant
            );
            
            if (!existingDeal) {
              ingredientMap[key].deals.push(deal);
            }
          }
        });
      });
    });

    return Object.values(ingredientMap);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShoppingList();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F4964A" />
        <Text style={styles.loadingText}>Loading shopping list...</Text>
      </View>
    );
  }

  if (consolidatedIngredients.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No items in shopping list</Text>
        <Text style={styles.emptySubtext}>
          Select recipes from the "Recipes" tab to build your shopping list
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        <Text style={styles.subtitle}>
          {consolidatedIngredients.length} ingredient(s)
        </Text>
      </View>

      {consolidatedIngredients.map((item, index) => (
        <ShoppingListItem key={index} item={item} />
      ))}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  bottomPadding: {
    height: 20,
  },
});
```

---

## File 6: components/RecipeCard.js

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Checkbox from 'expo-checkbox';

export default function RecipeCard({ recipe, isSelected, onToggle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Checkbox
          value={isSelected}
          onValueChange={onToggle}
          color={isSelected ? '#F4964A' : undefined}
          style={styles.checkbox}
        />
        <TouchableOpacity
          style={styles.headerContent}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              ⏱️ {recipe.prep_time} prep, {recipe.cook_time} cook
            </Text>
            <Text style={styles.metaText}>
              👥 {recipe.servings} servings
            </Text>
            <Text style={[styles.badge, styles[recipe.difficulty.toLowerCase()]]}>
              {recipe.difficulty}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.sectionTitle}>Ingredients:</Text>
          {recipe.ingredients.map((ing, idx) => (
            <Text key={idx} style={styles.ingredientItem}>
              • {ing.name} - {ing.quantity}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Steps:</Text>
          {recipe.steps.map((step, idx) => (
            <Text key={idx} style={styles.stepItem}>
              {idx + 1}. {step}
            </Text>
          ))}

          {recipe.flyer_deals && recipe.flyer_deals.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Deals Available:</Text>
              <Text style={styles.dealsText}>
                {recipe.flyer_deals.length} item(s) on sale
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginTop: 2,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  easy: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  medium: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  hard: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  ingredientItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
    paddingLeft: 10,
  },
  stepItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  dealsText: {
    fontSize: 14,
    color: '#F4964A',
    fontWeight: '600',
  },
});
```

---

## File 7: components/ShoppingListItem.js

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ShoppingListItem({ item }) {
  const { name, quantities, recipes, deals } = item;

  return (
    <View style={styles.card}>
      <Text style={styles.ingredientName}>{name}</Text>
      
      <Text style={styles.quantity}>
        {quantities.join(' + ')}
      </Text>

      <Text style={styles.recipesUsed}>
        Used in: {recipes.join(', ')}
      </Text>

      {deals.length > 0 && (
        <View style={styles.dealContainer}>
          {deals.map((deal, idx) => (
            <View key={idx} style={styles.dealBadge}>
              <Text style={styles.dealText}>
                ON SALE ${deal.price.toFixed(2)} at {deal.merchant}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  quantity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  recipesUsed: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  dealContainer: {
    marginTop: 5,
  },
  dealBadge: {
    backgroundColor: '#F4964A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 5,
  },
  dealText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

---

## Running the App

1. **Start Backend:**
   ```bash
   cd C:\Users\miche\Github\food
   .venv\Scripts\activate
   python app.py
   ```

2. **Start Frontend:**
   ```bash
   cd C:\Users\miche\Github\food\meal-prep-frontend
   npx expo start
   ```

3. **Run on Simulator:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

---

That's all the code! Copy each section into the appropriate files.
