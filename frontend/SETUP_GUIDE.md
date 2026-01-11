# Frontend Setup Guide

This guide will help you set up and run the React Native frontend for the Meal Prep Helper application.

## Quick Start

### 1. Ensure Backend is Running

Before starting the frontend, make sure the Flask backend is running:

```bash
# In the root directory
python app.py
```

The backend should be running on `http://localhost:5000`

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start the Development Server

```bash
npm start
```

This will start the Expo development server and open Expo DevTools in your browser.

### 4. Run on Device/Emulator

Choose one of the following options:

**Option A: Physical Device (Recommended for Testing)**
1. Install Expo Go app on your phone (iOS or Android)
2. Scan the QR code shown in the terminal/browser
3. The app will load on your device

**Important**: If testing on a physical device, update the API URL:
- Open `frontend/src/services/api.js`
- Change `http://localhost:5000/api` to `http://YOUR_IP:5000/api`
- Replace `YOUR_IP` with your computer's local IP (e.g., 192.168.1.100)

**Option B: Android Emulator**
```bash
npm run android
```

**Option C: iOS Simulator** (macOS only)
```bash
npm run ios
```

**Option D: Web Browser**
```bash
npm run web
```

## Testing the Application

### Test Flow 1: Generate Recipes

1. Open the app
2. You should see the "Get Latest Deals" tab
3. Enter a Canadian postal code (e.g., `M5V 2H1`)
4. Tap "Generate Recipes"
5. Wait for the API to fetch flyer data and generate recipes (may take 30-60 seconds)
6. You should see a success message
7. Navigate to "Recipes" tab to view generated recipes

### Test Flow 2: Select Recipes and Create Shopping List

1. Go to "Recipes" tab
2. You should see recipes under "This Week's Recipes"
3. Tap on recipe cards to select them (checkbox will appear checked)
4. Select 2-3 recipes
5. Tap "Confirm Selection" button at the bottom
6. Wait for confirmation
7. Navigate to "Shopping List" tab
8. You should see consolidated ingredients with sale indicators

### Test Flow 3: Shopping List

1. Go to "Shopping List" tab
2. See items grouped into:
   - "Items on Sale" (with price and merchant info)
   - "Other Items" (regular items not on sale)
3. Each item shows:
   - Quantity needed
   - Which recipes use it
   - Sale price and store (if applicable)
4. Pull down to refresh the list

## Troubleshooting

### "Network Error" or "Cannot connect to backend"

**Solution**: Check API URL configuration
- If using physical device: Use your computer's IP address
- Find your IP:
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac/Linux: `ifconfig` or `ip addr`
- Update `frontend/src/services/api.js`:
  ```javascript
  const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Your IP here
  ```

### Backend not responding

**Solution**: Ensure Flask is running
```bash
# In root directory
python app.py
```

Look for: `* Running on http://127.0.0.1:5000`

### "Expo DevTools not opening"

**Solution**: Clear cache and restart
```bash
cd frontend
npx expo start -c
```

### App crashes or blank screen

**Solution**: Check console for errors
1. Open browser DevTools (F12)
2. Check the console for error messages
3. Common issues:
   - Missing dependencies: Run `npm install` again
   - Cached files: Run `npx expo start -c`

### Dependencies installation fails

**Solution**: Clear and reinstall
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

## Development Tips

### Hot Reload
- Changes to JS/JSX files will automatically reload
- If changes don't appear, shake device and select "Reload"
- Or press `r` in the terminal

### Debug Mode
- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
- Select "Debug Remote JS"
- Open Chrome DevTools to see console logs

### Viewing API Responses
- API calls are logged to console
- Check browser DevTools or React Native debugger

## Project Structure Overview

```
frontend/
├── App.js                          # Main navigation setup
├── src/
│   ├── components/
│   │   └── RecipeCard.js          # Recipe card with checkbox
│   ├── screens/
│   │   ├── GetLatestDealsScreen.js  # Postal code input
│   │   ├── RecipesScreen.js         # Recipe selection
│   │   └── ShoppingListScreen.js    # Shopping list view
│   └── services/
│       └── api.js                   # Backend API client
├── package.json
└── README.md
```

## API Endpoints Used

The frontend communicates with these backend endpoints:

- `POST /api/recipes/generate` - Generate recipes from postal code
- `GET /api/recipes` - Fetch all recipes
- `POST /api/recipes/update-selections` - Update selected recipes
- `GET /api/recipes/shopping-list` - Get recipes for shopping list

## Next Steps

Once the app is running successfully:

1. Test with different postal codes
2. Try selecting multiple recipes
3. Verify shopping list consolidation works correctly
4. Check that sale indicators appear for flyer items

## Support

If you encounter issues not covered here, check:
1. Backend logs in the terminal running `python app.py`
2. Frontend console logs in Expo DevTools
3. Network tab in browser DevTools for API call details
