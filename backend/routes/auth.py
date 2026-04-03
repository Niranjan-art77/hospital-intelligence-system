import uuid
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password') or not data.get('fullName') or not data.get('role'):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
        
    email = data['email']
    password = data['password']
    fullName = data['fullName']
    role = data['role']
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Check if user already exists
    c.execute('SELECT id FROM users WHERE email = ?', (email,))
    if c.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "User with this email already exists"}), 409
        
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = generate_password_hash(password)
    
    try:
        c.execute('''
            INSERT INTO users (id, email, password, fullName, role, age, gender, bloodGroup, phone, address) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, email, hashed_password, fullName, role, 
            data.get('age'), data.get('gender'), data.get('bloodGroup'), 
            data.get('phone'), data.get('address')
        ))
        
        # If doctor, also insert into doctors table
        if role == 'DOCTOR':
            c.execute('INSERT INTO doctors (id, userId, specialty) VALUES (?, ?, ?)', (str(uuid.uuid4()), user_id, 'General Medicine'))
            
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True, 
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "email": email,
                "fullName": fullName,
                "role": role
            }
        }), 201
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"success": False, "message": "Missing email or password"}), 400
        
    email = data['email']
    password = data['password']
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE email = ?', (email,))
    user_row = c.fetchone()
    conn.close()
    
    if not user_row:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401
        
    user = dict(user_row)
    if not check_password_hash(user['password'], password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401
        
    # Remove password before returning
    del user['password']
    
    # Return user data (frontend expects this structure)
    return jsonify({
        "success": True,
        "user": user
    })
