import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateRecipes = async (postalCode) => {
  const response = await api.post('/recipes/generate', { postal_code: postalCode });
  return response.data;
};

export const getRecipes = async (filters = {}) => {
  const response = await api.get('/recipes', { params: filters });
  // console.log('getRecipes response data:', response.data);
  return response.data;
};

export const updateRecipeSelections = async (selectedRecipeIds) => {
  const response = await api.post('/recipes/update-selections', { 
    selected_recipe_ids: selectedRecipeIds 
  });
  return response.data;
};

export const getShoppingList = async () => {
  const response = await api.get('/recipes/shopping-list');
  return response.data;
};

export default api;
