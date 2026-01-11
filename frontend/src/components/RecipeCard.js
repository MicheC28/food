import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecipes, updateRecipeSelections, deleteRecipe } from '../services/api';


const RecipeCard = ({ recipe, isSelected, onToggleSelect, onPressCard, onDelete }) => {
  const [showAllIngredients, setShowAllIngredients] = useState(false);

  const ingredientsToShow = showAllIngredients
    ? recipe.ingredients
    : recipe.ingredients.slice(0, 5);

    // const handleDelete = async (event) => {
    //   console.log('del')
    //   event.stopPropagation(); 
    //   const response = confirm(
    //     // 'Delete Recipe',
    //     'Are you sure you want to delete this recipe?'
    //     // [
    //     //   { text: 'Cancel', style: 'cancel' },
    //     //   { text: 'Delete', style: 'destructive', onPress: () => onDelete(recipe._id) },
    //     // ]
    //   );

    //   if(response){
    //     await deleteRecipe(recipe._id);
    //     console.log('deleted');
        
    //   }
    // };
    

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPressCard} // opens modal
    >
      {/* DELETE BUTTON */}
      <TouchableOpacity style={styles.deleteButton} onPress={(e) => onDelete(e)}>
  <Ionicons name="trash-outline" size={22} color="#b33951" />
</TouchableOpacity>

      {/* CHECKBOX */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={onToggleSelect} hitSlop={10}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.recipeName}>{recipe.name}</Text>

        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>
            ⏱️ {recipe.prep_time} prep • {recipe.cook_time} cook
          </Text>
          <Text style={styles.metaText}>
            🍽️ {recipe.servings} servings • {recipe.difficulty}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Ingredients:</Text>
        {ingredientsToShow.map((ingredient, index) => (
          <Text key={index} style={styles.ingredientText}>
            • {ingredient.name} - {ingredient.quantity}
          </Text>
        ))}

        {recipe.ingredients.length > 5 && !showAllIngredients && (
          <TouchableOpacity onPress={() => setShowAllIngredients(true)}>
            <Text style={styles.moreText}>
              + {recipe.ingredients.length - 5} more ingredients...
            </Text>
          </TouchableOpacity>
        )}

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
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
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
    borderColor: '#F4964A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#F4964A',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  metaInfo: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  ingredientText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
    lineHeight: 18,
  },
  moreText: {
    fontSize: 13,
    color: '#F4964A',
    fontStyle: 'italic',
    marginTop: 4,
  },
  dealBadge: {
    backgroundColor: '#F5DCC7',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  dealText: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '600',
  },
});

export default RecipeCard;
