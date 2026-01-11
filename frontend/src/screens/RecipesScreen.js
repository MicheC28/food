import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import RecipeCard from '../components/RecipeCard';
import { getRecipes, updateRecipeSelections, deleteRecipe } from '../services/api';

const RecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(new Set());
  const [updating, setUpdating] = useState(false);

  const [activeRecipe, setActiveRecipe] = useState(null);

  const loadRecipes = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    console.log('loading recipes');
    try {
      const data = await getRecipes();
      const recipesArray = Object.values(data) || [];
      setRecipes(recipesArray);

      const selected = new Set(
        (recipesArray[1] ?? [])
          .filter(r => r.in_list)
          .map(r => r._id)
      );

      setSelectedRecipeIds(selected);
    } catch (error) {
      Alert.alert('Error', 'Failed to load recipes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecipes();
    console.log('useeffect');
  }, []);
  

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes(false);
  };
  

  const toggleRecipeSelection = (id) => {
    setSelectedRecipeIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirmSelection = async () => {
    setUpdating(true);
    try {
      const result = await updateRecipeSelections(Array.from(selectedRecipeIds));
      await loadRecipes(false);
      navigation.navigate('ShoppingList'); // Navigate on alert OK press
    } catch (error) {
      console.error('Error updating selections:', error);
      Alert.alert('Error', 'Failed to update recipe selections. Please try again.');
    } finally {
      setUpdating(false);
    }
  };


  const handleDeleteRecipe = async (recipeId) => {
    console.log('deleting in screen', recipeId);
    try {
      await deleteRecipe(recipeId);
      console.log('just deleted recipe');
      setActiveRecipe(null);
      loadRecipes();
    } catch {
      Alert.alert('Error', 'Failed to delete recipe.');
    }
    // Alert.alert(
    //   'Delete Recipe',
    //   'Are you sure you want to delete this recipe?',
    //   [
    //     { text: 'Cancel', style: 'cancel' },
    //     {
    //       text: 'Delete',
    //       style: 'destructive',
    //       onPress: async () => {
    //         try {
    //           await deleteRecipe(recipeId);
    //           console.log('just deleted recipe');
    //           setActiveRecipe(null);
    //           loadRecipes();
    //         } catch {
    //           Alert.alert('Error', 'Failed to delete recipe.');
    //         }
    //       },
    //     },
    //   ]
    // );
  };
  

  const allRecipes = recipes[1] ?? [];

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
        <Text style={styles.emptyTitle}>No Recipes Yet</Text>
        <Text style={styles.emptySubtitle}>
          Go to "Get Deals" tab to generate recipes based on local grocery deals!
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F4964A']} />
        }
        persistentScrollbar={true}          // Always show scrollbar
        showsVerticalScrollIndicator={true} // Ensure vertical scroll indicator is visible
      >
        {allRecipes.map(recipe => (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            isSelected={selectedRecipeIds.has(recipe._id)}
            onToggleSelect={() => toggleRecipeSelection(recipe._id)}
            onPressCard={() => setActiveRecipe(recipe)}
            onDelete={() => handleDeleteRecipe(recipe._id)}
            />
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>


      {selectedRecipeIds.size > 0 && (
        <View style={styles.footer}>
          <Text>{selectedRecipeIds.size} selected</Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmSelection}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ===== MODAL ===== */}
      <Modal visible={!!activeRecipe} animationType="slide">
        {activeRecipe && (
          <View style={styles.modalContainer}>
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeRecipe.name}</Text>
              {/* <TouchableOpacity onPress={() => handleDeleteRecipe(activeRecipe._id)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity> */}
            </View>

            {/* SCROLLABLE CONTENT */}
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={true} // Show scrollbar
              persistentScrollbar={true}          // Make scrollbar persistent (Android)
            >
              {/* META INFO */}
              <View style={styles.metaContainer}>
                <Text style={styles.metaText}>⏱️ Prep: {activeRecipe.prep_time} • Cook: {activeRecipe.cook_time}</Text>
                <Text style={styles.metaText}>🍽️ Servings: {activeRecipe.servings} • Difficulty: {activeRecipe.difficulty}</Text>
                <Text style={styles.metaText}>📍 Postal Code: {activeRecipe.postal_code || 'N/A'}</Text>
              </View>

              {/* INGREDIENTS */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                {activeRecipe.ingredients.map((ing, i) => (
                  <Text key={i} style={styles.listItem}>
                    • {ing.name} - {ing.quantity}
                  </Text>
                ))}
              </View>

              {/* STEPS */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Steps</Text>
                {activeRecipe.steps.map((step, i) => (
                  <Text key={i} style={styles.listItem}>
                    {i + 1}. {step}
                  </Text>
                ))}
              </View>

              {/* FLYER DEALS */}
              {activeRecipe.flyer_deals && activeRecipe.flyer_deals.length > 0 && (
                <View style={styles.dealBadge}>
                  <Text style={styles.dealText}>🏷️ {activeRecipe.flyer_deals.length} items on sale!</Text>
                </View>
              )}
            </ScrollView>

            {/* CLOSE BUTTON */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setActiveRecipe(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#SFEDBBE',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#F4964A',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b33951',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#F4964A',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 16,
  },
  recipeWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5DCC7',
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerContent: {
    backgroundColor: '#fefefe',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 12,
  },
  selectionCount: {
    fontSize: 16,
    color: '#b33951',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#F4964A',
    paddingHorizontal: 28,
  },
    confirmButtonDisabled: {
      backgroundColor: '#E98883',
    },
    confirmButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  modalScroll: {
    marginTop: 16,
  },
  metaContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  listItem: {
    fontSize: 16,  // Increased from 14 for better readability
    color: '#333',  // Darker color for better contrast
    lineHeight: 24,  // Increased for better line spacing
    marginBottom: 8,  // Increased from 4 for more space between items
    paddingLeft: 16,
  },
  dealBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  dealText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f69d55',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  // Footer styles for main screen
footer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  paddingVertical: 16,
  paddingHorizontal: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: '#e0e0e0',
  elevation: 8, // Android shadow
  shadowColor: '#000', // iOS shadow
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
confirmButton: {
  backgroundColor: '#f69d55',
  paddingHorizontal: 28,
  paddingVertical: 12,
  borderRadius: 8,
  minWidth: 120,
  alignItems: 'center',
},
confirmButtonDisabled: {
  backgroundColor: '#e98883',
},
selectionCount: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
},
confirmText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

});

export default RecipesScreen;
