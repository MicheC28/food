# Meal Prep Helper - Manual Setup Instructions

## Frontend Setup (Since automated setup failed)

### Step 1: Create Frontend Project Manually

Open Command Prompt or PowerShell and run:

```bash
cd C:\Users\miche\Github\food
npx create-expo-app@latest meal-prep-frontend --template blank
```

Wait for the project to be created.

### Step 2: Install Additional Dependencies

```bash
cd meal-prep-frontend
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npx expo install expo-checkbox
```

### Step 3: Copy Frontend Code

I've created all the necessary files below. Create these files in your `meal-prep-frontend` directory:

#### File Structure:
```
meal-prep-frontend/
├── App.js                          (Main app file - REPLACE existing)
├── app.json                        (Already exists)
├── package.json                    (Already exists - will be modified by npm install)
├── babel.config.js                 (Already exists)
├── screens/
│   ├── RecipesScreen.js           (CREATE THIS)
│   ├── ShoppingListScreen.js      (CREATE THIS)
│   └── GetDealsScreen.js          (CREATE THIS)
├── components/
│   ├── RecipeCard.js              (CREATE THIS)
│   └── ShoppingListItem.js        (CREATE THIS)
└── config.js                       (CREATE THIS)
```

### Step 4: Start the App

```bash
# Make sure backend is running first
cd C:\Users\miche\Github\food
.venv\Scripts\activate
python app.py

# In another terminal, start frontend
cd C:\Users\miche\Github\food\meal-prep-frontend
npx expo start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator

---

## All Frontend Code Files

### 1. config.js
Create this file in the root of meal-prep-frontend folder.

### 2. App.js  
Replace the existing App.js with this code.

### 3. screens/RecipesScreen.js
Create this file in the screens folder.

### 4. screens/ShoppingListScreen.js
Create this file in the screens folder.

### 5. screens/GetDealsScreen.js
Create this file in the screens folder.

### 6. components/RecipeCard.js
Create this file in the components folder.

### 7. components/ShoppingListItem.js
Create this file in the components folder.

---

See the individual files created in the repository for the complete code.

## Troubleshooting

### Cannot connect to backend
- Make sure backend is running on http://localhost:5000
- Check that your .env file has the GEMINI_API_KEY
- For iOS Simulator: use localhost
- For physical device: update API_BASE_URL in config.js to your computer's IP address

### Port already in use
```bash
# Kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Expo issues
```bash
# Clear cache
npx expo start -c
```
