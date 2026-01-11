# Recipe Radar

A full-stack mobile application that helps users discover recipes based on current grocery flyer deals in their area and manage shopping lists. Built with Flask backend and React Native (Expo) frontend.

## Features

- 🛒 **Smart Recipe Generation**: AI-powered recipe suggestions based on local grocery deals
- 📍 **Postal Code Based**: Get deals specific to your location
- 📝 **Shopping List Management**: Automatically generate shopping lists from selected recipes
- 💰 **Deal Tracking**: See which ingredients are on sale and where
- 📱 **Mobile First**: Native mobile experience with Expo
- 🔄 **Recipe Selection**: Choose which recipes to cook and automatically update your shopping list

## Technology Stack

### Backend
- Flask (Python 3.9+)
- MongoDB Atlas
- Google Gemini API
- Pandas
- Flipp API Integration

### Frontend
- React Native
- Expo
- React Navigation
- AsyncStorage

## Prerequisites

- Python 3.9 or higher
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator
- Google Gemini API Key
- MongoDB Atlas account (connection string provided)

## Project Structure

```
food/
├── app.py                      # Flask backend server
├── scraper.py                  # Flipp API integration
├── meal-prep-frontend/         # React Native app
│   ├── App.js
│   ├── screens/
│   ├── components/
│   └── package.json
├── .env                        # Environment variables (not committed)
├── ARCHITECTURE.md             # Detailed system architecture
├── README.md                   # This file
└── requirements.txt            # Python dependencies
```

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to project root
cd food

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Mac/Linux

# Install Python dependencies
pip install flask flask-cors pymongo pandas requests python-dotenv google-generativeai

# Create .env file
# Add your Google Gemini API key:
echo GEMINI_API_KEY=your_api_key_here > .env
```

**Your .env file should contain:**
```
GEMINI_API_KEY=your_actual_api_key
MONGODB_URI=mongodb+srv://meemz9:dbpass@food-hack.b7nsyy0.mongodb.net/?appName=food-hack
MONGODB_DB=meal_prep_helper
FLASK_ENV=development
PORT=5000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd meal-prep-frontend

# Install dependencies
npm install

# Install additional required packages
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npx expo install expo-checkbox
```

## Running the Application

### Start Backend Server

```bash
# In project root, with virtual environment activated
python app.py
```

The backend will start on `http://localhost:5000`

### Start Frontend App

```bash
# In meal-prep-frontend directory
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

## Usage Guide

### 1. Generate Recipes
1. Open the app and go to "Get Deals" tab
2. Enter your postal code (format: A1A1A1, e.g., M5V2H1)
3. Tap "Get Latest Deals"
4. Wait for AI to generate 5 recipes based on local deals
5. When AI generation is complete you will be taken to the recipes page
6. You can view generated recipes in "Recipes" tab

### 2. Select Recipes for Shopping List
1. Go to "Recipes" tab
2. Browse "This Week's Recipes" and "Previously Saved Recipes"
3. Check the boxes next to recipes you want to cook
4. Tap "Confirm Selection" at the bottom to update shopping list and move to shopping list page

### 3. View Shopping List
1. Go to "Shopping List" tab
2. See all ingredients needed for selected recipes
3. Ingredients are consolidated (duplicates combined)
4. Sale items are highlighted with price and store info
5. See which recipes use each ingredient

## API Endpoints

### POST /api/recipes/generate
Generate 5 new recipes based on postal code
```json
Request: { "postal_code": "M5V2H1" }
Response: { "success": true, "recipes": [...], "count": 5 }
```

### GET /api/recipes
Get all recipes with optional filters
```
Query Params: ?postal_code=M5V2H1&in_list=true
Response: { "success": true, "recipes": [...], "count": 10 }
```

### POST /api/recipes/update-selections
Update which recipes are in shopping list
```json
Request: { "selected_recipe_ids": ["id1", "id2"] }
Response: { "success": true, "updated_count": 2 }
```

### GET /api/recipes/shopping-list
Get recipes currently in shopping list
```
Response: { "success": true, "recipes": [...], "count": 3 }
```

## How It Works

1. **Flyer Data Collection**: The app scrapes current deals from major grocery stores (No Frills, FreshCo, Walmart, Loblaws) using the Flipp API

2. **AI Recipe Generation**: Google Gemini AI analyzes the deals and generates 5 practical recipes that primarily use items currently on sale

3. **Recipe Storage**: Recipes are stored in MongoDB with associated deal information, postal code, and shopping list status

4. **Smart Shopping Lists**: When you select recipes, the app consolidates all ingredients, highlights which are on sale, and shows where to buy them

5. **Persistent Data**: Your postal code is remembered, and all recipes are saved for future reference

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system architecture, database schema, API documentation, and technical implementation details.

## Database Schema

Recipes are stored in MongoDB with the following structure:
- Recipe details (name, ingredients, steps, cook/prep time, servings, difficulty)
- Postal code association
- Shopping list status (in_list: true/false)
- Associated flyer deals with prices and validity dates
- Creation timestamp

## Configuration

### Supported Grocery Stores
- No Frills
- FreshCo
- Walmart
- Loblaws

### Postal Code Format
Canadian postal codes in format: A1A1A1 (e.g., M5V2H1, N8P1X2)

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change PORT in .env file or:
python app.py --port 5001
```

**MongoDB connection error:**
- Check internet connection
- Verify MONGODB_URI in .env file
- Ensure MongoDB Atlas cluster is running

**Gemini API errors:**
- Verify API key in .env file
- Check API quota/billing in Google Cloud Console
- Review error logs for rate limiting

### Frontend Issues

**Cannot connect to backend:**
- Ensure backend is running on localhost:5000
- Check API_BASE_URL in frontend code
- For physical device: use your computer's IP address instead of localhost

**Expo issues:**
```bash
# Clear cache and restart
npx expo start -c
```

**Dependencies issues:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

Feel free to submit issues and enhancement requests!

## Future Enhancements

- User authentication and multi-user support
- Recipe favorites and ratings
- Meal calendar planning
- Nutritional information
- Recipe sharing
- Dietary restriction filters
- Price tracking over time
- Barcode scanning for pantry inventory

## Disclaimer

This project is for educational purposes only. Please note:
- This is an unofficial tool and is not affiliated with Flipp or Google
- All grocery deal information is sourced from publicly accessible pages available online
- Use responsibly and respect website terms of service
- Grocery deal data is owned by Flipp and their partners

## Credits

This project uses code adapted from the public project “flippscrape” by Kiizon  
(https://github.com/Kiizon/flippscrape).

We modified and extended the original code to fit our use case, integrated it into our backend
pipeline, and built additional application logic and UI during the hackathon.

## AI Tools

- This project uses the Google Gemini API to generate recipes based on extracted grocery deal data.
- We also used AI-assisted coding tools during development for productivity and debugging.

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: January 2026
