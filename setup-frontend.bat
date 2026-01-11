@echo off
echo ========================================
echo Meal Prep Helper - Frontend Setup
echo ========================================
echo.

echo Creating frontend directory...
if not exist meal-prep-frontend mkdir meal-prep-frontend
cd meal-prep-frontend

echo.
echo Creating project structure...
if not exist screens mkdir screens
if not exist components mkdir components
if not exist assets mkdir assets

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Copy all frontend files from the FRONTEND_FILES folder to meal-prep-frontend\
echo 2. Run: cd meal-prep-frontend
echo 3. Run: npm install
echo 4. Run: npx expo start
echo.
pause
