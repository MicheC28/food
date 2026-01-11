from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import pandas as pd
import os
import json
from dotenv import load_dotenv
from google import genai
from scraper import get_grocery_flyer_id, get_flyer_items
from flask import request, jsonify
from bson.objectid import ObjectId

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# genai.configure(api_key=GEMINI_API_KEY)
# model = genai.GenerativeModel('gemini-2.5-flash')

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_DB = os.getenv('MONGODB_DB', 'meal_prep_helper')

# Initialize MongoDB client
try:
    mongo_client = MongoClient(MONGODB_URI)
    db = mongo_client['food-hack']
    recipes_collection = db['Recipes']
    
    # Create indexes
    recipes_collection.create_index('postal_code')
    recipes_collection.create_index('in_list')
    recipes_collection.create_index([('created_at', -1)])
    
    print("✓ Connected to MongoDB successfully")
except Exception as e:
    print(f"✗ MongoDB connection error: {e}")
    raise


def get_flyer_data(postal_code: str) -> pd.DataFrame:
    """
    Fetch grocery flyer data for a given postal code and return as DataFrame.
    
    Args:
        postal_code: Canadian postal code in format A1A1A1
        
    Returns:
        DataFrame with columns: merchant, flyer_id, name, price, valid_from, valid_to
    """
    grocery_flyers = get_grocery_flyer_id(postal_code)
    
    if not grocery_flyers:
        return pd.DataFrame(columns=['merchant', 'flyer_id', 'name', 'price', 'valid_from', 'valid_to'])
    
    csv_data = []
    for flyer in grocery_flyers:
        flyer_id = flyer['id']
        merchant = flyer['merchant']
        
        try:
            items_response = get_flyer_items(flyer_id)
            
            for item in items_response:
                csv_data.append({
                    'merchant': merchant,
                    'flyer_id': flyer_id,
                    'name': item.get('name', ''),
                    'price': item.get('price', ''),
                    'valid_from': item.get('valid_from', ''),
                    'valid_to': item.get('valid_to', '')
                })
        except Exception as e:
            print(f"Error fetching items for flyer {flyer_id}: {e}")
            continue
    
    if csv_data:
        return pd.DataFrame(csv_data)
    else:
        return pd.DataFrame(columns=['merchant', 'flyer_id', 'name', 'price', 'valid_from', 'valid_to'])


def validate_postal_code(postal_code: str) -> tuple:
    """Validate Canadian postal code format"""
    postal_code = postal_code.strip().upper()
    
    if len(postal_code) != 6:
        return False, "Postal code must be 6 characters"
    
    if not (postal_code[0].isalpha() and postal_code[1].isdigit() and
            postal_code[2].isalpha() and postal_code[3].isdigit() and
            postal_code[4].isalpha() and postal_code[5].isdigit()):
        return False, "Invalid postal code format. Use format A1A1A1 (e.g., M5V2H1)"
    
    return True, postal_code


def generate_gemini_prompt(flyer_data: pd.DataFrame, postal_code: str) -> str:
    """Generate detailed prompt for Gemini API"""
    
    # Format flyer data for the prompt
    if flyer_data.empty:
        deals_text = "No specific deals available. Generate creative, budget-friendly recipes."
    else:
        deals_text = "Available grocery deals:\n\n"
        for _, row in flyer_data.head(50).iterrows():  # Limit to 50 items to keep prompt manageable
            deals_text += f"- {row['name']} - ${row['price']} at {row['merchant']}\n"
    
    prompt = f"""You are a helpful meal planning assistant. Generate recipes based on grocery store deals.

Postal Code: {postal_code}

{deals_text}

Instructions:
1. Generate exactly 5 diverse, practical recipes
2. Prioritize ingredients from the flyer deals provided above
3. Recipes should mainly use items from the flyer, but can include common pantry staples (salt, pepper, oil, etc.)
4. When using flyer items, use the EXACT product names from the list (e.g., "Sunkist Oranges" not just "oranges")
5. Ensure recipes are family-friendly and easy to follow
6. Include a mix of difficulty levels (Easy, Medium, Hard)
7. Make recipes diverse (different cuisines, cooking methods)

CRITICAL: Your response MUST be ONLY valid JSON, with no additional text before or after.
Follow this EXACT schema:

{{
  "recipes": [
    {{
      "name": "Recipe Name Here",
      "ingredients": [
        {{
          "name": "Exact Ingredient Name",
          "quantity": "Amount with units"
        }}
      ],
      "steps": [
        "First step description",
        "Second step description"
      ],
      "cook_time": "Time in minutes",
      "prep_time": "Time in minutes",
      "servings": 4,
      "difficulty": "Easy"
    }}
  ]
}}

Generate exactly 5 recipes in this format. Respond ONLY with the JSON, nothing else."""

    return prompt


def generate_recipes_with_gemini(flyer_data: pd.DataFrame, postal_code: str) -> list:
    """Call Gemini API to generate recipes"""
    
    prompt = generate_gemini_prompt(flyer_data, postal_code)
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            client = genai.Client()
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
                )
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON response
            recipes_data = json.loads(response_text)
            
            if 'recipes' not in recipes_data or not isinstance(recipes_data['recipes'], list):
                raise ValueError("Invalid response structure from Gemini")
            
            return recipes_data['recipes']
            
        except json.JSONDecodeError as e:
            print(f"Attempt {attempt + 1}: JSON parsing error: {e}")
            if attempt == max_retries - 1:
                raise ValueError(f"Failed to parse Gemini response after {max_retries} attempts")
        except Exception as e:
            print(f"Attempt {attempt + 1}: Error calling Gemini API: {e}")
            if attempt == max_retries - 1:
                raise
    
    return []


@app.route('/api/recipes/generate', methods=['POST'])
def generate_recipes():
    """Generate new recipes based on postal code and flyer deals"""
    try:
        data = request.get_json()
        
        if not data or 'postal_code' not in data:
            return jsonify({
                'success': False,
                'error': 'Postal code is required'
            }), 400
        
        # Validate postal code
        is_valid, result = validate_postal_code(data['postal_code'])
        if not is_valid:
            return jsonify({
                'success': False,
                'error': result
            }), 400
        
        postal_code = result
        
        # Get flyer data
        print(f"Fetching flyer data for {postal_code}...")
        flyer_df = get_flyer_data(postal_code)
        print(f"Found {len(flyer_df)} deals")
        
        # Generate recipes with Gemini
        print("Generating recipes with Gemini AI...")
        recipes = generate_recipes_with_gemini(flyer_df, postal_code)
        
        if not recipes or len(recipes) == 0:
            return jsonify({
                'success': False,
                'error': 'Failed to generate recipes'
            }), 500
        
        # Prepare recipes for return (without saving to database)
        recipe_previews = recipes
        
        print(f"Successfully generated {len(recipe_previews)} recipes (not saved yet)")
        
        return jsonify({
            'success': True,
            'recipes': recipe_previews,
            'count': len(recipe_previews)
        }), 200
        
    except Exception as e:
        print(f"Error in generate_recipes: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/recipes/save', methods=['POST'])
def save_recipes():
    """Save selected recipes to database"""
    try:
        data = request.get_json()
        
        if not data or 'recipes' not in data:
            return jsonify({
                'success': False,
                'error': 'recipes array is required'
            }), 400
        
        recipes_to_save = data['recipes']
        
        if not isinstance(recipes_to_save, list) or len(recipes_to_save) == 0:
            return jsonify({
                'success': False,
                'error': 'recipes must be a non-empty array'
            }), 400
        
        # Store recipes in MongoDB
        stored_recipes = []
        for recipe in recipes_to_save:
            recipe_doc = {
                'name': recipe['name'],
                'ingredients': recipe['ingredients'],
                'steps': recipe['steps'],
                'cook_time': recipe.get('cook_time', '30 minutes'),
                'prep_time': recipe.get('prep_time', '15 minutes'),
                'servings': recipe.get('servings', 4),
                'difficulty': recipe.get('difficulty', 'Easy'),
                'postal_code': recipe.get('postal_code'),
                'in_list': False,
                'flyer_deals': recipe.get('flyer_deals'),
                'created_at': datetime.now()
            }
            
            result = recipes_collection.insert_one(recipe_doc)
            recipe_doc['_id'] = str(result.inserted_id)
            stored_recipes.append(recipe_doc)
        
        print(f"Successfully generated and stored {len(stored_recipes)} recipes")
        
        return jsonify({
            'success': True,
            'recipes': stored_recipes,
            'count': len(stored_recipes)
        }), 200
        
    except Exception as e:
        print(f"Error in generate_recipes: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """Get recipes with optional filters"""
    try:
        # Get query parameters
        postal_code = request.args.get('postal_code')
        in_list = request.args.get('in_list')
        
        # Build query
        query = {}
        if postal_code:
            query['postal_code'] = postal_code.strip().upper()
        if in_list is not None:
            query['in_list'] = in_list.lower() == 'true'
        
        # Fetch recipes
        recipes = list(recipes_collection.find(query))
        
        # Convert ObjectId to string
        for recipe in recipes:
            recipe['_id'] = str(recipe['_id'])
        
        return jsonify({
            'success': True,
            'recipes': recipes,
            'count': len(recipes)
        }), 200
        
    except Exception as e:
        print(f"Error in get_recipes: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/recipes/update-selections', methods=['POST'])
def update_selections():
    """Update which recipes are in shopping list"""
    try:
        data = request.get_json()
        
        if not data or 'selected_recipe_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'selected_recipe_ids array is required'
            }), 400
        
        selected_ids = data['selected_recipe_ids']
        
        # Convert string IDs to ObjectId
        try:
            selected_object_ids = [ObjectId(id_str) for id_str in selected_ids]
        except Exception as e:
            return jsonify({
                'success': False,
                'error': 'Invalid recipe ID format'
            }), 400
        
        # Set in_list = false for all recipes
        recipes_collection.update_many({}, {'$set': {'in_list': False}})
        
        # Set in_list = true for selected recipes
        if selected_object_ids:
            result = recipes_collection.update_many(
                {'_id': {'$in': selected_object_ids}},
                {'$set': {'in_list': True}}
            )
            updated_count = result.modified_count
        else:
            updated_count = 0
        
        return jsonify({
            'success': True,
            'updated_count': updated_count,
            'message': 'Recipe selections updated'
        }), 200
        
    except Exception as e:
        print(f"Error in update_selections: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/recipes/shopping-list', methods=['GET'])
def get_shopping_list():
    """Get recipes currently in shopping list"""
    try:
        recipes = list(recipes_collection.find({'in_list': True}))
        
        # Convert ObjectId to string
        for recipe in recipes:
            recipe['_id'] = str(recipe['_id'])
        
        return jsonify({
            'success': True,
            'recipes': recipes,
            'count': len(recipes)
        }), 200
        
    except Exception as e:
        print(f"Error in get_shopping_list: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recipes/<recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    """
    Delete a recipe by its ID.
    URL: DELETE /api/recipes/<recipe_id>
    """
    try:
        # Convert the string ID to a Mongo ObjectId
        obj_id = ObjectId(recipe_id)

        # Attempt to delete the recipe
        result = recipes_collection.delete_one({'_id': obj_id})

        if result.deleted_count == 1:
            return jsonify({
                'success': True,
                'message': f'Recipe {recipe_id} deleted successfully.'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Recipe not found.'
            }), 404

    except Exception as e:
        print(f"Error in delete_recipe: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
      

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'mongodb': 'connected' if mongo_client else 'disconnected'
    }), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n🚀 Starting Meal Prep Helper Backend on port {port}...")
    print(f"✓ Gemini API configured")
    print(f"✓ MongoDB connected to {MONGODB_DB}")
    print(f"\nAPI Endpoints:")
    print(f"  POST   http://localhost:{port}/api/recipes/generate")
    print(f"  POST   http://localhost:{port}/api/recipes/save")
    print(f"  GET    http://localhost:{port}/api/recipes")
    print(f"  POST   http://localhost:{port}/api/recipes/update-selections")
    print(f"  GET    http://localhost:{port}/api/recipes/shopping-list")
    print(f"  GET    http://localhost:{port}/api/health")
    print(f"\n")
    
    app.run(debug=True, host='0.0.0.0', port=port)
