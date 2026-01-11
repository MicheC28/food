import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const RecipeCard = ({ recipe, isSelected, onToggle }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </View>
      
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
        {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
          <Text key={index} style={styles.ingredientText}>
            • {ingredient.name} - {ingredient.quantity}
          </Text>
        ))}
        {recipe.ingredients.length > 5 && (
          <Text style={styles.moreText}>
            + {recipe.ingredients.length - 5} more ingredients...
          </Text>
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
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: 2 },
    boxShadowOpacity: 0.1,
    boxShadowRadius: 4,
    elevation: 3,
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
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 4,
  },
  dealBadge: {
    backgroundColor: '#FFF3E0',
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
