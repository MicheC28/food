import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getShoppingList } from '../services/api';

const ShoppingListScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadShoppingList = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const data = await getShoppingList();
      setRecipes(Object.values(data));
    } catch (error) {
      console.error('Error loading shopping list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadShoppingList();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadShoppingList(false);
  };

  const consolidateIngredients = () => {
    const ingredientMap = new Map();
    const recipesArray = Object.values(recipes[1]);

        recipesArray.forEach(recipe => {
        if (Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach(ingredient => {
            const name = ingredient.name.toLowerCase();
            
            if (!ingredientMap.has(name)) {
              ingredientMap.set(name, {
                name: ingredient.name,
                quantity: ingredient.quantity,
                quantities: [ingredient.quantity],
                recipes: [recipe.name],
                deals: [],
              });
            } else {
              const existing = ingredientMap.get(name);
              existing.quantities.push(ingredient.quantity);
              existing.recipes.push(recipe.name);
            }
          });
        }
      });

      recipesArray.forEach(recipe => {
        if (recipe.flyer_deals && Array.isArray(recipe.flyer_deals)) {
          recipe.flyer_deals.forEach(deal => {
            const name = deal.name.toLowerCase();
            if (ingredientMap.has(name)) {
              const existing = ingredientMap.get(name);
              const dealExists = existing.deals.some(d => d.flyer_id === deal.flyer_id);
              if (!dealExists) {
                existing.deals.push(deal);
              }
            }
          });
        }
      });
    

    return Array.from(ingredientMap.values());
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading shopping list...</Text>
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Items in Shopping List</Text>
        <Text style={styles.emptySubtitle}>
          Select recipes from the "Recipes" tab to build your shopping list
        </Text>
      </View>
    );
  }

  const consolidatedIngredients = consolidateIngredients();
  const itemsOnSale = consolidatedIngredients.filter(item => item.deals.length > 0);
  const regularItems = consolidatedIngredients.filter(item => item.deals.length === 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping List</Text>
        <Text style={styles.headerSubtitle}>
          {consolidatedIngredients.length} items • {itemsOnSale.length} on sale
        </Text>
      </View>

      {itemsOnSale.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>🏷️ Items on Sale</Text>
          {itemsOnSale.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.saleBadge}>
                  <Text style={styles.saleBadgeText}>SALE</Text>
                </View>
              </View>

              <Text style={styles.quantityText}>
                Quantity: {item.quantities.join(', ')}
              </Text>

              <Text style={styles.recipesText}>
                Used in: {item.recipes.join(', ')}
              </Text>

              {item.deals.map((deal, dealIndex) => (
                <View key={dealIndex} style={styles.dealInfo}>
                  <Text style={styles.dealPrice}>${deal.price.toFixed(2)}</Text>
                  <Text style={styles.dealMerchant}> at {deal.merchant}</Text>
                  {deal.valid_to && (
                    <Text style={styles.dealValid}>
                      {' '}• Valid until {new Date(deal.valid_to).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {regularItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>🛒 Other Items</Text>
          {regularItems.map((item, index) => (
            <View key={index} style={[styles.itemCard, styles.regularItemCard]}>
              <Text style={styles.itemName}>{item.name}</Text>
              
              <Text style={styles.quantityText}>
                Quantity: {item.quantities.join(', ')}
              </Text>

              <Text style={styles.recipesText}>
                Used in: {item.recipes.join(', ')}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Total Recipes Selected: {recipes.length}
        </Text>
      </View>
    </ScrollView>
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
  scrollContent: {
    paddingVertical: 16,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F5E9',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: 2 },
    boxShadowOpacity: 0.1,
    boxShadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  regularItemCard: {
    borderLeftColor: '#9E9E9E',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  saleBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  saleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  recipesText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  dealInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
  },
  dealMerchant: {
    fontSize: 14,
    color: '#E65100',
  },
  dealValid: {
    fontSize: 12,
    color: '#BF360C',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export default ShoppingListScreen;
