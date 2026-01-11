# Meal Prep Helper - Full Stack Application

## Project Overview
Build a meal preparation helper application with a Flask backend and React Native (Expo) frontend. The app helps users discover recipes based on current grocery flyer deals in their area and manage shopping lists.

## Technology Stack
- **Backend**: Flask (Python)
- **Frontend**: React Native with Expo
- **Database**: MongoDB (using pymongo driver)
- **AI**: Google Gemini API
- **Data Processing**: Pandas

## Application Flow

### Flow 1: Recipe Generation & Selection

1. **Postal Code Entry (Frontend)**
   - User enters their postal code in the mobile app
   - Send postal code to backend API

2. **Flyer Data Retrieval (Backend)**
   - Backend receives postal code via API endpoint
   - Call `get_flyer_data(postal_code)` function (stub for now - returns empty DataFrame)
   - Function signature: `def get_flyer_data(postal_code: str) -> pd.DataFrame`
   - Expected DataFrame columns:
     - `merchant` (str): Store name
     - `flyer_id` (str): Unique flyer identifier
     - `name` (str): Product name
     - `price` (float): Product price
     - `valid_from` (datetime): Deal start date
     - `valid_to` (datetime): Deal end date

3. **Recipe Generation with Gemini (Backend)**
   - Take flyer data DataFrame and construct a detailed prompt for Gemini API
   - **Prompt Engineering Requirements**:
     - Use effective prompt engineering best practices
     - Request exactly 5 recipes
     - Instruct LLM to prioritize items from the flyer deals
     - Recipes don't need to use ALL products, but should mainly use flyer items
     - **CRITICAL**: Emphasize that responses must ALWAYS be consistent, valid JSON
     - Specify exact JSON schema (see below)
     - For ingredient names, use the EXACT product names from flyer when possible (e.g., "Sunkist Oranges" instead of "oranges")
   
   - **Expected JSON Response Schema**:
   ```json
   {
     "recipes": [
       {
         "name": "Recipe Name",
         "ingredients": [
           {
             "name": "Sunkist Oranges",
             "quantity": "3 pieces"
           }
         ],
         "steps": [
           "Step 1 description",
           "Step 2 description"
         ],
         "cook_time": "30 minutes",
         "prep_time": "15 minutes",
         "servings": 4,
         "difficulty": "Easy"
       }
     ]
   }
   ```

4. **Store Recipes in MongoDB (Backend)**
   - Database: MongoDB
   - mongodb+srv://meemz9:dbpass@food-hack.b7nsyy0.mongodb.net/?appName=food-hack
   - Collection: `recipes`
   - Each recipe is a separate document
   - **Document Schema**:
   ```json
   {
     "_id": "auto-generated MongoDB ObjectId",
     "name": "Recipe Name",
     "ingredients": [
       {
         "name": "Sunkist Oranges",
         "quantity": "3 pieces"
       }
     ],
     "steps": ["Step 1", "Step 2"],
     "cook_time": "30 minutes",
     "prep_time": "15 minutes",
     "servings": 4,
     "difficulty": "Easy",
     "postal_code": "M5V2H1",
     "in_list": false,
     "flyer_deals": [
       {
         "merchant": "Store Name",
         "flyer_id": "flyer123",
         "name": "Sunkist Oranges",
         "price": 3.99,
         "valid_from": "2026-01-10",
         "valid_to": "2026-01-17"
       }
     ],
     "created_at": "2026-01-10T21:15:03.709Z"
   }
   ```
   - Return all 5 recipes to frontend

5. **Display Recipes (Frontend)**
   - Show two sections:
     
     **Section 1: "This Week's Recipes"**
     - Display the 5 newly generated recipes
     - Show summarized view (name and ingredients list)
     - Include checkboxes for selection
     
     **Section 2: "Previously Saved Recipes"**
     - Fetch and display older recipes from MongoDB
     - Same format as above
     - Include checkboxes for selection

6. **Recipe Selection & Shopping List Toggle (Frontend & Backend)**
   - User can select/deselect recipes using checkboxes
   - Selection state is maintained locally in frontend
   - **"Confirm Selection" Button**:
     - Displayed at bottom of recipe list
     - When clicked, sends batch update request to backend
     - Request includes array of recipe IDs that should have `in_list = true`
     - Backend updates all recipes in single transaction:
       - Sets `in_list = true` for recipes in the provided array
       - Sets `in_list = false` for all other recipes for this user/postal_code
     - Show loading state during update
     - Show success/error message after update completes

7. **Generate Shopping List (Frontend)**
   - For all selected recipes (where `in_list == true`):
     - Collect all ingredients
     - **Combine duplicate ingredients**: If multiple recipes use the same ingredient, add quantities together
     - Add note showing which recipes need each ingredient
     - Example format:
       ```
       Sunkist Oranges - 5 pieces
       (Used in: Orange Chicken, Citrus Salad)
       [ON SALE] $3.99 at Walmart
       ```
   - Display indicators for items on sale:
     - Show sale price
     - Show merchant name
     - Visual indicator (badge, color, icon) for sale items

### Flow 2: Shopping List Tab

1. **Shopping List View**
   - Tab navigation: "Shopping List" and "Get Latest Deals"
   - When user navigates to Shopping List tab:
     - Fetch all recipes where `in_list == true` from backend
     - Regenerate shopping list using the same logic as Flow 1 step 7
     - Display consolidated shopping list with:
       - Ingredient name and total quantity
       - Recipes that use this ingredient
       - Sale indicators (price, merchant) if applicable

2. **Get Latest Deals Tab**
   - Allows user to re-enter postal code
   - Triggers Flow 1 again to generate new recipes

## API Endpoints (Backend)

### `POST /api/recipes/generate`
- **Body**: `{ "postal_code": "M5V2H1" }`
- **Response**: Array of 5 generated recipes
- **Process**:
  1. Call `get_flyer_data(postal_code)`
  2. Generate Gemini prompt with flyer data
  3. Call Gemini API
  4. Parse JSON response
  5. Save recipes to MongoDB with postal_code, in_list=false, flyer_deals, created_at
  6. Return recipes

### `GET /api/recipes`
- **Query Params**: Optional filters (postal_code, in_list)
- **Response**: Array of recipes from MongoDB

### `POST /api/recipes/update-selections`
- **Body**: `{ "selected_recipe_ids": ["recipe_id_1", "recipe_id_2", ...] }`
- **Response**: `{ "success": true, "updated_count": 5, "message": "Recipe selections updated" }`
- **Process**: 
  1. Set `in_list = true` for all recipe IDs in the array
  2. Set `in_list = false` for all other recipes (to clear previous selections)
  3. Return count of updated recipes

### `GET /api/recipes/shopping-list`
- **Response**: All recipes where `in_list == true`

## Important Notes

- **Spelling**: Use "recipes" not "receipes" throughout the codebase
- **Flyer Data**: Discard flyer data after sending to Gemini (don't store raw flyer DataFrames)
- **Single User**: No authentication/multi-user support needed for MVP
- **Recipe Uniqueness**: Each recipe document has MongoDB's auto-generated `_id` as unique identifier
- **Ingredient Matching**: When showing sale prices in shopping list, match ingredient names from recipes against the flyer_deals stored in each recipe document

## Development Guidelines

1. Follow RESTful API design principles
2. Use proper error handling for API calls and database operations
3. Validate postal code format before processing
4. Handle Gemini API rate limits and errors gracefully
5. Ensure MongoDB connection pooling for efficiency
6. Use environment variables for API keys and database connection strings
7. Keep flyer deals data embedded in recipe documents for easy access during shopping list generation
8. Implement proper loading states in frontend for async operations

## Database Setup

- MongoDB database name: `meal_prep_helper`
- Collection: `recipes`
- Indexes to create:
  - `postal_code` (for filtering recipes by location)
  - `in_list` (for quick shopping list queries)
  - `created_at` (for sorting by newest)

## Implementation Notes

The `get_flyer_data()` function is now implemented and fetches live grocery flyer data:
```python
def get_flyer_data(postal_code: str) -> pd.DataFrame:
    """
    Fetch grocery flyer data for a given postal code and return as DataFrame.
    Uses Flipp API via scraper.py functions (get_grocery_flyer_id, get_flyer_items).
    Returns DataFrame with columns: merchant, flyer_id, name, price, valid_from, valid_to
    """
```

The function:
1. Calls `get_grocery_flyer_id(postal_code)` to retrieve available grocery flyers
2. Iterates through each flyer and fetches items using `get_flyer_items(flyer_id)`
3. Aggregates all items into a pandas DataFrame
4. Returns empty DataFrame with correct columns if no flyers/items found

## Frontend Component Structure Suggestions

```
App
├── Navigation (Tabs)
│   ├── RecipesTab
│   │   ├── ThisWeeksRecipes (list of 5 new recipes)
│   │   ├── PreviouslySavedRecipes (list from DB)
│   │   └── RecipeCard (checkbox, name, ingredients summary)
│   ├── ShoppingListTab
│   │   └── ShoppingListView (consolidated ingredients with recipes notes)
│   └── GetLatestDealsTab
│       └── PostalCodeInput
```

## Next Steps

1. Set up Flask backend with MongoDB connection
2. Implement `get_flyer_data()` stub
3. Create Gemini API integration with proper prompt engineering
4. Build MongoDB schema and CRUD operations
5. Set up Expo React Native project
6. Implement API client in frontend
7. Build UI components for recipe display and selection
8. Implement shopping list generation logic
9. Test end-to-end flows
