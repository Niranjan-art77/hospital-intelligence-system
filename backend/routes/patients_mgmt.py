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

# Recovery Roadmap
@patients_bp.route('/<patient_id>/recovery', methods=['GET'])
def get_recovery(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM recovery_roadmap WHERE patientId = ?', (patient_id,))
    roadmap = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({"success": True, "data": roadmap})

# Medication Logs
@patients_bp.route('/<patient_id>/medication-logs', methods=['GET'])
def get_medication_logs(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM medication_logs WHERE patientId = ? ORDER BY timestamp DESC', (patient_id,))
    logs = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({"success": True, "data": logs})

# Dashboard Stats (Charts)
@patients_bp.route('/<patient_id>/stats', methods=['GET'])
def get_patient_stats(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    # Fetch 7 days of heart rate
    c.execute('''
        SELECT heartRate as value, recordedAt as date 
        FROM vitals 
        WHERE patientId = ? 
        ORDER BY recordedAt DESC LIMIT 7
    ''', (patient_id,))
    heartRateTrends = [dict(row) for row in c.fetchall()]
    
    # Mock other trends for charts
    stats = {
        "heartRateTrends": heartRateTrends[::-1],
        "weightTrends": [{"date": "Mon", "value": 70}, {"date": "Tue", "value": 70.2}, {"date": "Wed", "value": 69.8}, {"date": "Thu", "value": 69.5}, {"date": "Fri", "value": 69.4}],
        "sleepTrends": [{"date": "Mon", "value": 7}, {"date": "Tue", "value": 6.5}, {"date": "Wed", "value": 8}, {"date": "Thu", "value": 7.5}, {"date": "Fri", "value": 7}],
        "activityMetrics": {"steps": 8432, "calories": 450, "activeMinutes": 45},
        "healthScore": 95
    }
    conn.close()
    return jsonify({"success": True, "data": stats})
