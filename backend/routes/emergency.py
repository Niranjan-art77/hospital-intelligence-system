from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

emergency_bp = Blueprint('emergency', __name__)

@emergency_bp.route('/log', methods=['POST'])
def log_emergency():
    data = request.json
    patient_id = data.get('patientId')
    e_type = data.get('type')
    location = data.get('location', {})
    message = data.get('message')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO emergency_log (patientId, type, location_lat, location_lng, message) 
        VALUES (?, ?, ?, ?, ?)
    ''', (patient_id, e_type, location.get('lat'), location.get('lng'), message))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Emergency event logged successfully"}), 201

@emergency_bp.route('/history/<patient_id>', methods=['GET'])
def get_emergency_history(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM emergency_log WHERE patientId = ? ORDER BY timestamp DESC', (patient_id,))
    history = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": history
    })

# Nearby hospitals endpoint
@emergency_bp.route('/hospitals/nearby', methods=['GET'])
def get_nearby_hospitals():
    # Simple mockup: return default seed hospitals
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM hospitals')
    hospitals = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": hospitals
    })

# Patient-specific emergency contacts
@emergency_bp.route('/contacts/<patient_id>', methods=['GET'])
def get_emergency_contacts(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM emergency_contacts WHERE patientId = ?', (patient_id,))
    contacts = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": contacts
    })
