# ✅ Setup Checklist - Meal Prep Helper

Use this checklist to track your setup progress.

## Prerequisites
- [ ] Python 3.9+ installed and working
- [ ] Node.js 18+ and npm installed
- [ ] Virtual environment created (`.venv` folder exists)
- [ ] Google Gemini API key obtained
- [ ] `.env` file created with GEMINI_API_KEY
- [ ] iOS Simulator or Android Emulator set up

## Backend Setup
- [ ] Virtual environment activated (`.venv\Scripts\activate`)
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Verified these packages installed:
  - [ ] flask
  - [ ] flask-cors
  - [ ] pymongo
  - [ ] pandas
  - [ ] requests
  - [ ] python-dotenv
  - [ ] google-generativeai
- [ ] Backend starts without errors (`python app.py`)
- [ ] See "Connected to MongoDB successfully" message
- [ ] See "Gemini API configured" message
- [ ] Backend running on http://localhost:5000

## Frontend Setup
- [ ] Created Expo project (`npx create-expo-app@latest meal-prep-frontend --template blank`)
- [ ] Navigated to `meal-prep-frontend` directory
- [ ] Installed navigation packages
  - [ ] `npm install @react-navigation/native @react-navigation/bottom-tabs`
  - [ ] `npx expo install react-native-screens`
  - [ ] `npx expo install react-native-safe-area-context`
  - [ ] `npx expo install @react-native-async-storage/async-storage`
  - [ ] `npx expo install expo-checkbox`
  - [ ] `npx expo install @expo/vector-icons`

## File Creation
- [ ] Created `config.js` in root of meal-prep-frontend
- [ ] Replaced `App.js` with new code
- [ ] Created `screens` folder
- [ ] Created `screens/GetDealsScreen.js`
- [ ] Created `screens/RecipesScreen.js`
- [ ] Created `screens/ShoppingListScreen.js`
- [ ] Created `components` folder
- [ ] Created `components/RecipeCard.js`
- [ ] Created `components/ShoppingListItem.js`

## Testing
- [ ] Backend running in one terminal
- [ ] Frontend running in another terminal (`npx expo start`)
- [ ] App opens in simulator/emulator
- [ ] Can navigate between 3 tabs (Recipes, Shopping List, Get Deals)

## Functionality Tests

### Test 1: Generate Recipes
- [ ] Go to "Get Deals" tab
- [ ] Enter postal code: M5V2H1
- [ ] Tap "Generate Recipes"
- [ ] See loading indicator
- [ ] Wait 15-30 seconds
- [ ] See success message "Generated 5 recipes"
- [ ] Navigate to "Recipes" tab
- [ ] See "This Week's Recipes" section with 5 recipes

### Test 2: View Recipe Details
- [ ] Tap on a recipe card to expand
- [ ] See ingredients list
- [ ] See cooking steps
- [ ] See cook time, prep time, servings
- [ ] See difficulty badge
- [ ] See deal count if available

### Test 3: Select Recipes
- [ ] Check boxes for 2-3 recipes
- [ ] See checkbox count update in "Confirm Selection" button
- [ ] Tap "Confirm Selection"
- [ ] See success message
- [ ] Checkboxes remain checked

### Test 4: Shopping List
- [ ] Go to "Shopping List" tab
- [ ] See list of ingredients
- [ ] See total quantities
- [ ] See which recipes use each ingredient
- [ ] See "ON SALE" badges for discounted items
- [ ] See store name and price for sale items

### Test 5: Postal Code Memory
- [ ] Close the app completely
- [ ] Reopen the app
- [ ] Go to "Get Deals" tab
- [ ] See postal code field pre-filled with last used code

### Test 6: Pull to Refresh
- [ ] In "Recipes" tab, pull down to refresh
- [ ] See loading indicator
- [ ] Recipes reload

## Common Issues Checklist

If something doesn't work, check:

### Backend Issues
- [ ] Virtual environment is activated (should see `(.venv)` in terminal)
- [ ] No errors in backend terminal
- [ ] Port 5000 is not in use by another app
- [ ] `.env` file exists and has GEMINI_API_KEY
- [ ] Internet connection is working (for MongoDB and Gemini API)

### Frontend Issues
- [ ] Backend is running (check other terminal)
- [ ] `config.js` has correct API URL (`http://localhost:5000`)
- [ ] All files are created in correct locations
- [ ] No typos in file names (case-sensitive)
- [ ] Expo is not showing any red error screens

### Connection Issues
- [ ] If using physical device, changed `localhost` to computer's IP in config.js
- [ ] Firewall allows connections on port 5000
- [ ] Both terminals are running simultaneously

## Performance Checks
- [ ] Recipe generation takes 15-30 seconds (expected)
- [ ] App doesn't crash when selecting recipes
- [ ] Shopping list loads quickly
- [ ] No lag when navigating between tabs
- [ ] Expanding/collapsing recipes is smooth

## Documentation Review
- [ ] Read through QUICK_START.md
- [ ] Understand system architecture from ARCHITECTURE.md
- [ ] Know where to find all frontend code (FRONTEND_COMPLETE_CODE.md)
- [ ] Understand API endpoints from README.md

## Optional Enhancements (Future)
- [ ] Test with different postal codes (N8P1X2, M5V3L9)
- [ ] Generate multiple sets of recipes
- [ ] Try different recipe selections
- [ ] Monitor backend logs for errors
- [ ] Check MongoDB Atlas to see stored recipes

---

## 🎉 Setup Complete When:
- [ ] All checkboxes above are checked ✅
- [ ] App works smoothly in simulator
- [ ] Can generate recipes, select them, and view shopping list
- [ ] No errors in either terminal

---

**Need Help?**
- QUICK_START.md for fast setup
- SETUP_INSTRUCTIONS.md for detailed steps
- PROJECT_SUMMARY.md for overview
- ARCHITECTURE.md for technical details

**Time to Complete:** 10-15 minutes
**Difficulty:** Beginner-friendly ⭐⭐☆☆☆
