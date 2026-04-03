from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/<patient_id>/vitals', methods=['GET'])
def get_vitals(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM vitals WHERE patientId = ? ORDER BY recordedAt DESC', (patient_id,))
    vitals = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": vitals
    })

@patients_bp.route('/<patient_id>/vitals', methods=['POST'])
def add_vitals(patient_id):
    data = request.json
    heartRate = data.get('heartRate')
    bloodPressure = data.get('bloodPressure')
    temperature = data.get('temperature')
    oxygenLevel = data.get('oxygenLevel')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO vitals (patientId, heartRate, bloodPressure, temperature, oxygenLevel) 
        VALUES (?, ?, ?, ?, ?)
    ''', (patient_id, heartRate, bloodPressure, temperature, oxygenLevel))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Vitals recorded successfully"}), 201

@patients_bp.route('/<patient_id>/timeline', methods=['GET'])
def get_timeline(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM timeline WHERE patientId = ? ORDER BY timestamp DESC', (patient_id,))
    timeline = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": timeline
    })

@patients_bp.route('/<patient_id>/timeline', methods=['POST'])
def add_timeline_event(patient_id):
    data = request.json
    eventType = data.get('eventType')
    description = data.get('description')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO timeline (patientId, eventType, description) 
        VALUES (?, ?, ?)
    ''', (patient_id, eventType, description))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Timeline event recorded"}), 201

# Added for SOS Portal
@patients_bp.route('/<patient_id>/emergency-contacts', methods=['GET'])
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
