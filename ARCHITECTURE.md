# Meal Prep Helper - System Architecture

## Overview
A full-stack meal preparation helper application that generates recipes based on local grocery flyer deals and manages shopping lists.

## Technology Stack

### Backend
- **Framework**: Flask (Python 3.9+)
- **Database**: MongoDB Atlas
- **AI**: Google Gemini API
- **Data Processing**: Pandas
- **Dependencies**:
  - flask
  - flask-cors
  - pymongo
  - pandas
  - requests
  - python-dotenv
  - google-generativeai

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: AsyncStorage (for postal code persistence)
- **HTTP Client**: fetch API
- **Dependencies**:
  - expo
  - react-native
  - @react-navigation/native
  - @react-navigation/bottom-tabs
  - @react-native-async-storage/async-storage
  - expo-checkbox

## System Architecture

### High-Level Flow
```
User (Mobile App) 
    ↓
React Native Frontend (Expo)
    ↓
Flask REST API
    ↓
├── Flipp API (via scraper.py) → Get grocery deals
├── Google Gemini API → Generate recipes
└── MongoDB Atlas → Store/retrieve recipes
```

## Database Schema

### MongoDB Connection
- **Connection String**: mongodb+srv://meemz9:dbpass@food-hack.b7nsyy0.mongodb.net/?appName=food-hack
- **Database**: meal_prep_helper
- **Collection**: recipes

### Recipe Document Structure
```json
{
  "_id": ObjectId("auto-generated"),
  "name": "Orange Chicken Stir-Fry",
  "ingredients": [
    {
      "name": "Sunkist Oranges",
      "quantity": "3 pieces"
    },
    {
      "name": "Chicken Breast",
      "quantity": "500g"
    }
  ],
  "steps": [
    "Cut chicken into bite-sized pieces",
    "Marinate with orange juice and soy sauce",
    "Stir-fry until golden brown"
  ],
  "cook_time": "25 minutes",
  "prep_time": "15 minutes",
  "servings": 4,
  "difficulty": "Easy",
  "postal_code": "M5V2H1",
  "in_list": false,
  "flyer_deals": [
    {
      "merchant": "Walmart",
      "flyer_id": "12345",
      "name": "Sunkist Oranges",
      "price": 3.99,
      "valid_from": "2026-01-10",
      "valid_to": "2026-01-17"
    }
  ],
  "created_at": "2026-01-10T21:15:03.709Z"
}
```

### Indexes
- `postal_code` (ascending)
- `in_list` (ascending)
- `created_at` (descending)

## API Endpoints

### 1. Generate Recipes
**POST** `/api/recipes/generate`

**Request Body:**
```json
{
  "postal_code": "M5V2H1"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "recipes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Recipe Name",
      "ingredients": [...],
      "steps": [...],
      "cook_time": "30 minutes",
      "prep_time": "15 minutes",
      "servings": 4,
      "difficulty": "Easy",
      "postal_code": "M5V2H1",
      "in_list": false,
      "flyer_deals": [...],
      "created_at": "2026-01-10T21:15:03.709Z"
    }
    // ... 4 more recipes
  ],
  "count": 5
}
```

**Error Response:** (400/500)
```json
{
  "success": false,
  "error": "Error message"
}
```

**Process:**
1. Validate postal code format (A1A1A1)
2. Call `get_flyer_data(postal_code)` to fetch deals
3. Generate Gemini prompt with flyer data
4. Call Gemini API to generate 5 recipes
5. Parse JSON response from Gemini
6. Store recipes in MongoDB with postal_code, in_list=false, flyer_deals, created_at
7. Return all 5 recipes

### 2. Get Recipes
**GET** `/api/recipes`

**Query Parameters:**
- `postal_code` (optional): Filter by postal code
- `in_list` (optional): Filter by shopping list status (true/false)

**Response:** (200 OK)
```json
{
  "success": true,
  "recipes": [...],
  "count": 10
}
```

### 3. Update Recipe Selections
**POST** `/api/recipes/update-selections`

**Request Body:**
```json
{
  "selected_recipe_ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "updated_count": 2,
  "message": "Recipe selections updated"
}
```

**Process:**
1. Set `in_list = true` for all recipe IDs in the array
2. Set `in_list = false` for all other recipes
3. Return count of updated recipes

### 4. Get Shopping List
**GET** `/api/recipes/shopping-list`

**Response:** (200 OK)
```json
{
  "success": true,
  "recipes": [...],
  "count": 3
}
```

Returns all recipes where `in_list == true`

## Frontend Architecture

### Navigation Structure
```
App
├── TabNavigator
    ├── RecipesScreen (Tab 1: "Recipes")
    │   ├── PostalCodeInput (with remembered value)
    │   ├── GenerateButton
    │   ├── ThisWeeksRecipes Section
    │   ├── PreviouslySavedRecipes Section
    │   └── ConfirmSelectionButton
    ├── ShoppingListScreen (Tab 2: "Shopping List")
    │   └── ConsolidatedIngredientsList
    └── GetDealsScreen (Tab 3: "Get Deals")
        ├── PostalCodeInput
        └── GenerateNewRecipesButton
```

### Component Breakdown

#### RecipesScreen
- Displays postal code input (pre-filled with last used)
- Shows "Generate Recipes" button
- Lists "This Week's Recipes" (5 newest)
- Lists "Previously Saved Recipes" (all older ones)
- Each recipe has a checkbox for selection
- "Confirm Selection" button at bottom

#### RecipeCard Component
```jsx
<RecipeCard
  recipe={recipeObject}
  isSelected={boolean}
  onToggle={() => {}}
/>
```
Displays:
- Recipe name
- Ingredients list
- Cook/prep time
- Servings
- Difficulty
- Checkbox for selection

#### ShoppingListScreen
- Fetches recipes where `in_list == true`
- Consolidates ingredients across all selected recipes
- Displays each ingredient with:
  - Total quantity needed
  - List of recipes using this ingredient
  - Sale badge/price if ingredient matches flyer_deals

#### GetDealsScreen
- Simple postal code input
- "Get Latest Deals" button
- Triggers recipe generation flow
- Navigates to Recipes tab after success

### Data Flow

#### Flow 1: Generate Recipes
1. User enters postal code on GetDealsScreen
2. Frontend stores postal code in AsyncStorage
3. Frontend calls `POST /api/recipes/generate`
4. Backend fetches flyer data → calls Gemini → stores in MongoDB
5. Backend returns 5 new recipes
6. Frontend navigates to Recipes tab
7. Recipes tab re-fetches all recipes to display

#### Flow 2: Select Recipes
1. User checks/unchecks recipe checkboxes
2. State maintained locally in RecipesScreen
3. User clicks "Confirm Selection"
4. Frontend calls `POST /api/recipes/update-selections` with selected IDs
5. Backend updates in_list field in MongoDB
6. Frontend shows success message

#### Flow 3: View Shopping List
1. User navigates to Shopping List tab
2. Frontend calls `GET /api/recipes/shopping-list`
3. Backend returns recipes where in_list == true
4. Frontend consolidates ingredients:
   - Group by ingredient name
   - Sum quantities (if possible)
   - Track which recipes use each ingredient
   - Check if ingredient matches flyer_deals for sale badge

### Shopping List Consolidation Logic
```javascript
// Pseudo-code
const consolidateIngredients = (recipes) => {
  const ingredientMap = {};
  
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ing => {
      if (!ingredientMap[ing.name]) {
        ingredientMap[ing.name] = {
          name: ing.name,
          quantities: [],
          recipes: [],
          deals: []
        };
      }
      ingredientMap[ing.name].quantities.push(ing.quantity);
      ingredientMap[ing.name].recipes.push(recipe.name);
      
      // Check if ingredient matches any flyer deals
      recipe.flyer_deals.forEach(deal => {
        if (deal.name.toLowerCase().includes(ing.name.toLowerCase()) ||
            ing.name.toLowerCase().includes(deal.name.toLowerCase())) {
          ingredientMap[ing.name].deals.push(deal);
        }
      });
    });
  });
  
  return Object.values(ingredientMap);
};
```

## Gemini API Integration

### Prompt Engineering Strategy
```
System Context:
You are a helpful meal planning assistant. Generate recipes based on grocery store deals.

Input Data:
- Postal Code: M5V2H1
- Available Flyer Deals:
  [DataFrame converted to formatted text list]
  
Instructions:
1. Generate exactly 5 diverse recipes
2. Prioritize ingredients from the flyer deals provided
3. Recipes should mainly use flyer items but can include common pantry staples
4. Use EXACT product names from flyer when possible (e.g., "Sunkist Oranges" not "oranges")
5. Ensure recipes are practical and family-friendly
6. Include a mix of difficulty levels

CRITICAL: Your response MUST be valid JSON only, no additional text.
Follow this exact schema:
{
  "recipes": [
    {
      "name": "string",
      "ingredients": [{"name": "string", "quantity": "string"}],
      "steps": ["string"],
      "cook_time": "string",
      "prep_time": "string",
      "servings": number,
      "difficulty": "Easy|Medium|Hard"
    }
  ]
}
```

### Error Handling
- Retry logic for API failures (max 3 retries)
- Fallback to empty recipes array if Gemini fails
- Validate JSON structure before saving to database
- Log errors for debugging

## Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_api_key_here
MONGODB_URI=mongodb+srv://meemz9:dbpass@food-hack.b7nsyy0.mongodb.net/?appName=food-hack
MONGODB_DB=meal_prep_helper
FLASK_ENV=development
PORT=5000
```

### Frontend (config in code)
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000' 
  : 'https://your-production-url.com';
```

## Development Setup

### Backend Setup
```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows

# Install dependencies
pip install flask flask-cors pymongo pandas requests python-dotenv google-generativeai

# Create .env file with API keys

# Run backend
python app.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd meal-prep-frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS Simulator
Press 'i' in terminal

# Run on Android Emulator
Press 'a' in terminal
```

## Error Handling & Validation

### Postal Code Validation
- Format: A1A1A1 (letter-digit-letter-digit-letter-digit)
- Case insensitive (convert to uppercase)
- Reject invalid formats with clear error message

### API Error Responses
All errors follow consistent format:
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Common Error Scenarios
1. Invalid postal code format → 400 Bad Request
2. No flyers found for postal code → 200 OK with empty deals
3. Gemini API failure → 500 Internal Server Error
4. MongoDB connection failure → 500 Internal Server Error
5. Invalid recipe IDs in update → 400 Bad Request

## Performance Considerations

### Backend
- Connection pooling for MongoDB
- Cache flyer data for 1 hour (optional future enhancement)
- Async processing for Gemini API calls (optional future enhancement)

### Frontend
- Lazy loading for recipe lists
- Optimistic UI updates for recipe selection
- AsyncStorage for postal code persistence
- Pull-to-refresh for recipe lists

## Security Notes

### Current Implementation (MVP)
- No authentication/authorization
- Single user system
- API keys in .env file (not committed to git)

### Future Enhancements
- User authentication
- Rate limiting on API endpoints
- Input sanitization
- HTTPS for production

## Testing Strategy (Future)

### Backend Tests
- Unit tests for `get_flyer_data()`
- Integration tests for API endpoints
- Mock Gemini API responses
- Database operation tests

### Frontend Tests
- Component rendering tests
- Navigation tests
- API integration tests
- Ingredient consolidation logic tests

## Deployment (Future)

### Backend
- Deploy to Heroku/Railway/Render
- Environment variables via platform
- Production MongoDB Atlas cluster

### Frontend
- Build with EAS Build
- Deploy to Expo Go or standalone apps
- Configure production API URL

## Known Limitations

1. Single user system (no multi-tenancy)
2. No offline support
3. No image uploads for recipes
4. Simple ingredient quantity consolidation (text-based, not unit-aware)
5. No recipe editing after generation
6. No user preferences/dietary restrictions

## Future Enhancements

1. User accounts and authentication
2. Recipe favorites/ratings
3. Meal calendar/planning
4. Nutritional information
5. Recipe sharing
6. Smart ingredient substitutions
7. Price tracking over time
8. Push notifications for new deals
9. Barcode scanning for pantry inventory
10. Integration with grocery delivery services

---

**Last Updated**: 2026-01-10
**Version**: 1.0.0
