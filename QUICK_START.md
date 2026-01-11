# 🚀 Quick Start Guide - Meal Prep Helper

## Overview
This guide will help you set up and run the Meal Prep Helper application in under 10 minutes.

## ✅ Prerequisites Check

Make sure you have:
- [ ] Python 3.9+ installed
- [ ] Node.js 18+ and npm installed
- [ ] A Google Gemini API key
- [ ] iOS Simulator (Mac) or Android Emulator installed

## 📦 Step 1: Backend Setup (5 minutes)

### 1.1 Install Python Dependencies

```bash
cd C:\Users\miche\Github\food

# Activate virtual environment
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 1.2 Verify .env File

Make sure your `.env` file exists and contains:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 1.3 Test Backend

```bash
python app.py
```

You should see:
```
🚀 Starting Meal Prep Helper Backend on port 5000...
✓ Gemini API configured
✓ MongoDB connected to meal_prep_helper
```

Keep this terminal open!

## 📱 Step 2: Frontend Setup (5 minutes)

### 2.1 Create Expo Project

Open a NEW terminal:

```bash
cd C:\Users\miche\Github\food
npx create-expo-app@latest meal-prep-frontend --template blank
```

Wait for it to complete...

### 2.2 Install Frontend Dependencies

```bash
cd meal-prep-frontend
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-checkbox @expo/vector-icons
```

### 2.3 Copy All Frontend Code

Open the file `FRONTEND_COMPLETE_CODE.md` and copy each code block into the appropriate files:

**Files to create:**
1. `meal-prep-frontend/config.js` ← Copy "File 1" code
2. `meal-prep-frontend/App.js` ← REPLACE with "File 2" code
3. Create folder: `meal-prep-frontend/screens/`
4. `meal-prep-frontend/screens/GetDealsScreen.js` ← Copy "File 3" code
5. `meal-prep-frontend/screens/RecipesScreen.js` ← Copy "File 4" code
6. `meal-prep-frontend/screens/ShoppingListScreen.js` ← Copy "File 5" code
7. Create folder: `meal-prep-frontend/components/`
8. `meal-prep-frontend/components/RecipeCard.js` ← Copy "File 6" code
9. `meal-prep-frontend/components/ShoppingListItem.js` ← Copy "File 7" code

### 2.4 Start Expo

```bash
npx expo start
```

## 🎮 Step 3: Run the App

### For iOS Simulator (Mac only):
Press `i` in the terminal

### For Android Emulator:
Press `a` in the terminal

### For Physical Device:
1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in terminal
3. **IMPORTANT:** Update `config.js` to use your computer's IP address:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000';
   ```

## 🧪 Step 4: Test the App

### Test 1: Generate Recipes
1. Open the app → Go to "Get Deals" tab
2. Enter postal code: `M5V2H1`
3. Tap "Generate Recipes"
4. Wait 15-30 seconds
5. You should see "Success! Generated 5 recipes"

### Test 2: View Recipes
1. Go to "Recipes" tab
2. You should see "This Week's Recipes" with 5 recipes
3. Tap on a recipe to expand and see ingredients/steps

### Test 3: Create Shopping List
1. In "Recipes" tab, check 2-3 recipes
2. Tap "Confirm Selection" at bottom
3. Go to "Shopping List" tab
4. You should see consolidated ingredients with sale badges

## ⚡ Common Issues & Fixes

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID_NUMBER> /F
```

### "Cannot connect to server" in app
- Make sure backend is running (check Terminal 1)
- For iOS Simulator: use `http://localhost:5000`
- For physical device: use `http://YOUR_IP:5000` in config.js

### Gemini API errors
- Check your API key in `.env` file
- Verify API key has access enabled in Google Cloud Console
- Check API quota limits

### Expo cache issues
```bash
npx expo start -c
```

### Dependencies issues
```bash
cd meal-prep-frontend
rm -rf node_modules package-lock.json
npm install
```

## 📂 Project Structure

```
food/
├── app.py                          # Flask backend ✅ CREATED
├── scraper.py                      # Flipp API integration ✅ EXISTS
├── requirements.txt                # Python deps ✅ CREATED
├── .env                            # API keys ✅ YOU CREATED
├── ARCHITECTURE.md                 # System docs ✅ CREATED
├── README.md                       # Main readme ✅ UPDATED
├── FRONTEND_COMPLETE_CODE.md       # All frontend code ✅ CREATED
├── QUICK_START.md                  # This file ✅ CREATED
└── meal-prep-frontend/             # React Native app 👈 CREATE THIS
    ├── App.js
    ├── config.js
    ├── screens/
    │   ├── GetDealsScreen.js
    │   ├── RecipesScreen.js
    │   └── ShoppingListScreen.js
    └── components/
        ├── RecipeCard.js
        └── ShoppingListItem.js
```

## 🎯 Next Steps

Once everything is running:
1. Try different postal codes (M5V2H1, N8P1X2, M5V3L9)
2. Experiment with selecting different recipes
3. Check how ingredients are consolidated in shopping list
4. Notice which items show "ON SALE" badges

## 📞 Need Help?

- Check `ARCHITECTURE.md` for detailed technical documentation
- Check `README.md` for full project documentation
- Review `SETUP_INSTRUCTIONS.md` for alternative setup methods

## 🎉 You're Done!

Your Meal Prep Helper app is now running! Enjoy discovering recipes based on local deals!

---

**Estimated Total Setup Time:** 10-15 minutes
**Difficulty:** Beginner-friendly
