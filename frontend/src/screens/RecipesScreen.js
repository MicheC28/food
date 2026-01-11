import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RecipeCard from '../components/RecipeCard';
import { getRecipes, updateRecipeSelections } from '../services/api';

const RecipesScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(new Set());
  const [updating, setUpdating] = useState(false);

  const loadRecipes = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const data = await getRecipes();
      // console.log('data from getRecipes:', data);
      const recipesArray = Object.values(data) || [];
      console.log('recepies array:', recipesArray);
      // console.log('type of recipesArray:', typeof recipesArray);
      setRecipes(recipesArray);
      
      const currentlySelected = new Set(
        recipesArray[1].filter(recipe => recipe.in_list).map(recipe => recipe._id)
      );
      setSelectedRecipeIds(currentlySelected);
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert('Error', 'Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes(false);
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
      const result = await updateRecipeSelections(Array.from(selectedRecipeIds));
      
      Alert.alert(
        'Success!',
        `Updated ${result.updated_count} recipes. Your shopping list is ready!`
      );
      
      await loadRecipes(false);
    } catch (error) {
      console.error('Error updating selections:', error);
      Alert.alert('Error', 'Failed to update recipe selections. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  console.log('All recipes:', recipes);
  const thisWeeksRecipes = (recipes[1] ?? []).filter(recipe => {
    const createdAt = new Date(recipe.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt >= weekAgo;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  

    console.log('This week\'s recipes:', thisWeeksRecipes);

  const previousRecipes = recipes
    .filter(recipe => {
      const createdAt = new Date(recipe.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt < weekAgo;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Recipes Yet</Text>
        <Text style={styles.emptySubtitle}>
          Go to "Get Deals" tab to generate recipes based on local grocery deals!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        {thisWeeksRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>This Week's Recipes</Text>
            {thisWeeksRecipes.map(recipe => (
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
            <Text style={styles.sectionHeader}>Previously Saved Recipes</Text>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedRecipeIds.size > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.selectionCount}>
              {selectedRecipeIds.size} recipe{selectedRecipeIds.size !== 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity
              style={[styles.confirmButton, updating && styles.confirmButtonDisabled]}
              onPress={handleConfirmSelection}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Selection</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginBottom: 12,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: -2 },
    boxShadowOpacity: 0.1,
    boxShadowRadius: 4,
    elevation: 8,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionCount: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipesScreen;
