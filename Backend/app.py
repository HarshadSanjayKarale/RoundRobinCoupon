# app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from datetime import datetime, timedelta
import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import jwt
import bcrypt
from dotenv import load_dotenv
from functools import wraps

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
CORS(app, supports_credentials=True)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'coupon_system')

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
coupons_collection = db.coupons
claims_collection = db.claims
admin_collection = db.admin

# Cooldown period in hours
CLAIM_COOLDOWN = int(os.getenv('CLAIM_COOLDOWN', 24))

# JWT token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_admin = admin_collection.find_one({'username': data['username']})
            
            if not current_admin:
                return jsonify({'message': 'Invalid token!'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(current_admin, *args, **kwargs)
    
    return decorated

# Helper Functions
def get_client_ip():
    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        return request.environ['REMOTE_ADDR']
    else:
        return request.environ['HTTP_X_FORWARDED_FOR']

def get_session_id():
    # First check if session_id is in the request body (from frontend)
    data = request.get_json(silent=True)
    if data and 'sessionId' in data:
        return data['sessionId']
    
    # Fallback to checking cookies
    session_id = request.cookies.get('session_id')
    return session_id

def can_claim_coupon(ip_address, session_id):
    # Check if the IP has claimed within the cooldown period
    cooldown_time = datetime.utcnow() - timedelta(hours=CLAIM_COOLDOWN)
    recent_claim = claims_collection.find_one({
        'ip_address': ip_address,
        'timestamp': {'$gte': cooldown_time}
    })
    
    if recent_claim:
        return False, "You can claim one coupon per day"
    
    # Check if the session has claimed a coupon
    if session_id:
        session_claim = claims_collection.find_one({
            'session_id': session_id
        })
        
        if session_claim:
            return False, "You have already claimed a coupon in this session"
    
    return True, ""

def get_next_available_coupon():
    # Implement round-robin coupon selection
    # Find the oldest available coupon
    available_coupon = coupons_collection.find_one({'status': 'available'})
    
    if available_coupon:
        return available_coupon
    
    return None

# User Endpoints
@app.route('/claim-coupon', methods=['POST'])
def claim_coupon():
    ip_address = get_client_ip()
    session_id = get_session_id()
    
    # If no session ID provided, return error
    if not session_id:
        return jsonify({
            'success': False,
            'message': 'Session ID is required'
        }), 400
    
    # Check if the user can claim a coupon
    can_claim, message = can_claim_coupon(ip_address, session_id)
    
    if not can_claim:
        return jsonify({
            'success': False,
            'message': message
        }), 403
    
    # Get the next available coupon
    coupon = get_next_available_coupon()
    
    if not coupon:
        return jsonify({
            'success': False,
            'message': 'No coupons available at the moment'
        }), 404
    
    # Mark the coupon as claimed
    coupons_collection.update_one(
        {'_id': coupon['_id']},
        {'$set': {
            'status': 'claimed',
            'claimed_by': ip_address
        }}
    )
    
    # Record the claim
    claim = {
        'coupon_id': coupon['_id'],
        'ip_address': ip_address,
        'session_id': session_id,
        'timestamp': datetime.utcnow()
    }
    
    claims_collection.insert_one(claim)
    
    response = make_response(jsonify({
        'success': True,
        'message': 'Coupon claimed successfully',
        'coupon': {
            'code': coupon['code']
        }
    }))
    
    # Set session cookie if it doesn't exist
    if not request.cookies.get('session_id'):
        response.set_cookie('session_id', session_id, httponly=True, samesite='Strict', secure=True)
    
    return response

@app.route('/user-history', methods=['GET'])
def user_history():
    session_id = get_session_id()
    
    if not session_id:
        return jsonify({
            'success': False,
            'message': 'Session ID is required',
            'history': []
        }), 400
    
    # Find all claims by this session
    query = {
        'session_id': session_id
    }
    
    claims = list(claims_collection.find(query).sort('timestamp', -1))
    
    # Get coupon details for each claim
    history = []
    for claim in claims:
        coupon = coupons_collection.find_one({'_id': claim['coupon_id']})
        if coupon:
            history.append({
                'coupon_code': coupon['code'],
                'timestamp': claim['timestamp'].isoformat()
            })
    
    return jsonify({
        'success': True,
        'history': history
    })


# Admin Endpoints
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    admin = admin_collection.find_one({'username': data['username']})
    
    if not admin:
        return jsonify({'message': 'User not found'}), 404
    
    if bcrypt.checkpw(data['password'].encode('utf-8'), admin['password_hash']):
        token = jwt.encode({
            'username': admin['username'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({'token': token})
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/admin/coupons', methods=['GET'])
@token_required
def get_all_coupons(current_admin):
    coupons = list(coupons_collection.find())
    
    # Convert ObjectId to string
    for coupon in coupons:
        coupon['_id'] = str(coupon['_id'])
    
    return jsonify({
        'success': True,
        'coupons': coupons
    })

@app.route('/admin/add-coupon', methods=['POST'])
@token_required
def add_coupon(current_admin):
    data = request.get_json()
    
    if not data or not data.get('code'):
        return jsonify({'message': 'Coupon code is required'}), 400
    
    # Check if coupon already exists
    existing_coupon = coupons_collection.find_one({'code': data['code']})
    if existing_coupon:
        return jsonify({'message': 'Coupon with this code already exists'}), 409
    
    new_coupon = {
        'code': data['code'],
        'status': 'available',
        'claimed_by': None
    }
    
    result = coupons_collection.insert_one(new_coupon)
    
    return jsonify({
        'success': True,
        'message': 'Coupon added successfully',
        'coupon_id': str(result.inserted_id)
    })

@app.route('/admin/update-coupon', methods=['PATCH'])
@token_required
def update_coupon(current_admin):
    data = request.get_json()
    
    if not data or not data.get('coupon_id') or not data.get('code'):
        return jsonify({'message': 'Coupon ID and code are required'}), 400
    
    try:
        coupon_id = ObjectId(data['coupon_id'])
    except:
        return jsonify({'message': 'Invalid coupon ID format'}), 400
    
    # Check if the coupon exists
    coupon = coupons_collection.find_one({'_id': coupon_id})
    if not coupon:
        return jsonify({'message': 'Coupon not found'}), 404
    
    # Update the coupon
    coupons_collection.update_one(
        {'_id': coupon_id},
        {'$set': {'code': data['code']}}
    )
    
    return jsonify({
        'success': True,
        'message': 'Coupon updated successfully'
    })

@app.route('/admin/toggle-coupon', methods=['PATCH'])
@token_required
def toggle_coupon(current_admin):
    data = request.get_json()
    
    if not data or not data.get('coupon_id'):
        return jsonify({'message': 'Coupon ID is required'}), 400
    
    try:
        coupon_id = ObjectId(data['coupon_id'])
    except:
        return jsonify({'message': 'Invalid coupon ID format'}), 400
    
    # Check if the coupon exists
    coupon = coupons_collection.find_one({'_id': coupon_id})
    if not coupon:
        return jsonify({'message': 'Coupon not found'}), 404
    
    # Toggle the status
    new_status = 'available' if coupon['status'] == 'claimed' else 'claimed'
    
    coupons_collection.update_one(
        {'_id': coupon_id},
        {'$set': {
            'status': new_status,
            'claimed_by': None if new_status == 'available' else coupon['claimed_by']
        }}
    )
    
    return jsonify({
        'success': True,
        'message': f'Coupon status changed to {new_status}'
    })

@app.route('/admin/delete-coupon', methods=['DELETE'])
@token_required
def delete_coupon(current_admin):
    data = request.get_json()
    
    if not data or not data.get('coupon_id'):
        return jsonify({'message': 'Coupon ID is required'}), 400
    
    try:
        coupon_id = ObjectId(data['coupon_id'])
    except:
        return jsonify({'message': 'Invalid coupon ID format'}), 400
    
    # Delete related claims first
    claims_collection.delete_many({'coupon_id': coupon_id})
    
    # Delete the coupon
    result = coupons_collection.delete_one({'_id': coupon_id})
    
    if result.deleted_count == 0:
        return jsonify({'message': 'Coupon not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'Coupon deleted successfully'
    })

@app.route('/admin/claims', methods=['GET'])
@token_required
def get_all_claims(current_admin):
    claims = list(claims_collection.find().sort('timestamp', -1))
    
    # Convert ObjectId to string and format timestamp
    claim_history = []
    for claim in claims:
        coupon = coupons_collection.find_one({'_id': claim['coupon_id']})
        
        claim_data = {
            'claim_id': str(claim['_id']),
            'ip_address': claim['ip_address'],
            'session_id': claim['session_id'],
            'timestamp': claim['timestamp'].isoformat()
        }
        
        if coupon:
            claim_data['coupon_code'] = coupon['code']
        else:
            claim_data['coupon_code'] = 'Deleted coupon'
        
        claim_history.append(claim_data)
    
    return jsonify({
        'success': True,
        'claims': claim_history
    })

# Initialize admin user if none exists
def init_admin():
    if admin_collection.count_documents({}) == 0:
        default_password = os.getenv('ADMIN_DEFAULT_PASSWORD', 'admin123')
        hashed_password = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt())
        
        admin_collection.insert_one({
            'username': 'admin',
            'password_hash': hashed_password
        })
        print("Default admin user created")

# CLI command to create an admin user
@app.cli.command('create-admin')
def create_admin_command():
    init_admin()

if __name__ == '__main__':
    init_admin()
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    app.run(host='0.0.0.0', port=port)
