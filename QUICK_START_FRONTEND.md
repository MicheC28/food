# Quick Start - Meal Prep Helper

## Start Backend (Terminal 1)
```bash
python app.py
```
Expected output: `* Running on http://127.0.0.1:5000`

## Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

## Open App
- **Phone**: Scan QR code with Expo Go app
- **Android Emulator**: Press `a` in terminal
- **iOS Simulator**: Press `i` in terminal
- **Web**: Press `w` in terminal

## Using Physical Device?
Update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP:5000/api';
```
Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

## Test the App
1. **Get Deals Tab**: Enter postal code `M5V2H1` → Generate Recipes
2. **Recipes Tab**: Select 2-3 recipes → Confirm Selection
3. **Shopping List Tab**: View consolidated ingredients with sale prices

## Troubleshooting
- Backend not connecting? Check if `python app.py` is running
- App crashes? Run `cd frontend && npx expo start -c` to clear cache
- Dependencies issue? Run `cd frontend && npm install`

That's it! 🎉
