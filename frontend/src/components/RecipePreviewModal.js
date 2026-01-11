import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { saveRecipes } from '../services/api';

const RecipePreviewModal = ({ visible, recipes, onClose, onSaveSuccess }) => {
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const toggleRecipeSelection = (index) => {
    setSelectedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (selectedRecipes.size === 0) {
      Alert.alert('No Selection', 'Please select at least one recipe to save.');
      return;
    }

    setSaving(true);
    try {
      const recipesToSave = Array.from(selectedRecipes).map(index => recipes[index]);
      const response = await saveRecipes(recipesToSave);
      
      if (response.success) {
        // Close modal and notify parent immediately so UI updates without waiting for Alert button press
        setSelectedRecipes(new Set());
        onClose();
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        Alert.alert('Success!', `Saved ${response.count} recipe(s) successfully!`);
      } else {
        Alert.alert('Error', response.error || 'Failed to save recipes. Please try again.');
      }
    } catch (error) {
      console.error('Error saving recipes:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to save recipes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedRecipes(new Set());
    onClose();
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎉 Recipes Generated!</Text>
            <Text style={styles.modalSubtitle}>
              Here are your {recipes.length} new recipes based on local deals
            </Text>
          </View>

          <ScrollView 
            style={styles.recipesList} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            {recipes.map((recipe, index) => {
              const isSelected = selectedRecipes.has(index);
              return (
                <TouchableOpacity
                  key={recipe._id || index}
                  style={[
                    styles.recipeCard,
                    isSelected && styles.recipeCardSelected
                  ]}
                  onPress={() => toggleRecipeSelection(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </View>

                  <View style={styles.recipeContent}>
                    <View style={styles.recipeHeader}>
                      <Text style={styles.recipeNumber}>#{index + 1}</Text>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                    </View>
                
                <View style={styles.metaInfo}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      ⏱️ {recipe.prep_time} prep
                    </Text>
                    <Text style={styles.metaText}>
                      🔥 {recipe.cook_time} cook
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      🍽️ {recipe.servings} servings
                    </Text>
                    <Text style={styles.metaText}>
                      📊 {recipe.difficulty}
                    </Text>
                  </View>
                </View>

                <View style={styles.ingredientsSection}>
                  <Text style={styles.sectionTitle}>Key Ingredients:</Text>
                  <View style={styles.ingredientsList}>
                    {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                      <View key={idx} style={styles.ingredientItem}>
                        <Text style={styles.ingredientBullet}>•</Text>
                        <Text style={styles.ingredientText}>
                          {ingredient.name} <Text style={styles.ingredientQuantity}>
                            ({ingredient.quantity})
                          </Text>
                        </Text>
                      </View>
                    ))}
                    {recipe.ingredients.length > 5 && (
                      <Text style={styles.moreText}>
                        + {recipe.ingredients.length - 5} more ingredients
                      </Text>
                    )}
                  </View>
                </View>

                {recipe.flyer_deals && recipe.flyer_deals.length > 0 && (
                  <View style={styles.dealBadge}>
                    <Text style={styles.dealText}>
                      🏷️ {recipe.flyer_deals.length} items on sale!
                    </Text>
                  </View>
                )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.saveButton,
                (selectedRecipes.size === 0 || saving) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={selectedRecipes.size === 0 || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save {selectedRecipes.size > 0 ? `(${selectedRecipes.size})` : ''}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#F1F8F4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  recipesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  recipeCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeContent: {
    flex: 1,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipeNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
    minWidth: 32,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  metaInfo: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  ingredientsSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  ingredientsList: {
    marginLeft: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  ingredientBullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    fontWeight: 'bold',
  },
  ingredientText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  ingredientQuantity: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  moreText: {
    fontSize: 13,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 4,
    fontWeight: '500',
  },
  dealBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  dealText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipePreviewModal;

