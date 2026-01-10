from flask import Flask, request, jsonify
from datetime import datetime
import pandas as pd
import os
from scraper import get_grocery_flyer_id, get_flyer_items

app = Flask(__name__)

# In-memory storage
items = []

# Item counter for unique IDs
item_counter = 1

@app.route('/newdeals', methods=['POST'])
def fetch_new_deals():
    """Fetch new deals from Flipp API for a given postal code"""
    data = request.get_json()
    
    if not data or 'postal_code' not in data:
        return jsonify({
            'success': False,
            'message': 'Postal code is required'
        }), 400
    
    postal_code = data['postal_code'].strip().upper()
    
    # Validate postal code format (A1A1A1)
    if len(postal_code) != 6 or \
       not postal_code[0].isalpha() or not postal_code[1].isdigit() or \
       not postal_code[2].isalpha() or not postal_code[3].isdigit() or \
       not postal_code[4].isalpha() or not postal_code[5].isdigit():
        return jsonify({
            'success': False,
            'message': 'Invalid postal code format. Use format A1A1A1 (e.g., M5V2H1)'
        }), 400
    
    try:
        # Get grocery flyers for the postal code
        grocery_flyers = get_grocery_flyer_id(postal_code)
        
        if not grocery_flyers:
            return jsonify({
                'success': True,
                'message': 'No grocery flyers found for this postal code',
                'deals_found': 0,
                'postal_code': postal_code
            }), 200
        
        # Fetch items from all flyers
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
                # Continue with other flyers if one fails
                continue
        
        # Save to CSV if items found
        if csv_data:
            filename = f'flyer_items_{postal_code}.csv'
            df = pd.DataFrame(csv_data)
            df.to_csv(filename, index=False)
            
            return jsonify({
                'success': True,
                'message': f'Successfully fetched deals for {postal_code}',
                'deals_found': len(csv_data),
                'postal_code': postal_code,
                'csv_file': filename,
                'flyers_processed': len(grocery_flyers)
            }), 200
        else:
            return jsonify({
                'success': True,
                'message': 'No items found in flyers',
                'deals_found': 0,
                'postal_code': postal_code,
                'flyers_processed': len(grocery_flyers)
            }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching deals: {str(e)}'
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
