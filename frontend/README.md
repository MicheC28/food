# Meal Prep Helper - React Native Frontend

This is the React Native (Expo) frontend for the Meal Prep Helper application.

## Features

- **Get Latest Deals**: Enter your postal code to generate recipes based on local grocery flyer deals
- **Recipes**: View and select from generated recipes (this week's and previously saved)
- **Shopping List**: Consolidated shopping list with sale indicators and recipe associations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, but recommended for easier development)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Development Server

Start the Expo development server:
```bash
npm start
```

This will open Expo DevTools in your browser. You can then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan QR code with Expo Go app on your physical device

### Platform-Specific Commands

```bash
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run in web browser
```

## Configuration

### Backend API URL

The default backend URL is set to `http://localhost:5000/api` in `src/services/api.js`.

For testing on physical devices, update the API base URL:

```javascript
// src/services/api.js
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

Replace `YOUR_COMPUTER_IP` with your computer's local IP address (e.g., `192.168.1.100`).

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── RecipeCard.js          # Reusable recipe card component
│   ├── screens/
│   │   ├── GetLatestDealsScreen.js  # Postal code input and recipe generation
│   │   ├── RecipesScreen.js         # Recipe selection screen
│   │   └── ShoppingListScreen.js    # Consolidated shopping list
│   └── services/
│       └── api.js                   # API client for backend communication
├── App.js                           # Main app with navigation
└── package.json
```

## Usage Flow

1. **Generate Recipes**:
   - Go to "Get Deals" tab
   - Enter your postal code (e.g., M5V 2H1)
   - Tap "Generate Recipes"
   - Wait for AI to create recipes based on local deals

2. **Select Recipes**:
   - Navigate to "Recipes" tab
   - Browse "This Week's Recipes" and "Previously Saved Recipes"
   - Tap on recipe cards to select/deselect
   - Tap "Confirm Selection" to update your shopping list

3. **View Shopping List**:
   - Go to "Shopping List" tab
   - See consolidated ingredients with quantities
   - Items on sale are highlighted with price and store info
   - Pull down to refresh

## Key Features

### Recipe Cards
- Checkbox selection
- Recipe name, prep/cook time, servings, difficulty
- Ingredient preview (first 5 ingredients)
- Sale indicator badge

### Shopping List
- Consolidated ingredients (duplicates combined)
- Recipe associations (which recipes use each ingredient)
- Sale indicators with price and merchant
- Separate sections for items on sale vs regular items

## Dependencies

- **@react-navigation/native** & **@react-navigation/bottom-tabs**: Tab-based navigation
- **axios**: HTTP client for API calls
- **expo**: Expo framework
- **react-native**: React Native framework

## Troubleshooting

### Cannot connect to backend
- Ensure the Flask backend is running (`python app.py`)
- Check that the API_BASE_URL in `src/services/api.js` is correct
- On physical devices, use your computer's IP address, not `localhost`

### Expo DevTools not opening
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### App crashes on startup
- Check console logs for error messages
- Ensure all dependencies are installed
- Try running `npm install` again

## Development Notes

- The app uses React Navigation for tab-based navigation
- State management is handled with React hooks (useState, useEffect)
- The `useFocusEffect` hook ensures screens refresh when navigated to
- Pull-to-refresh is implemented on Recipes and Shopping List screens
