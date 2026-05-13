from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['GET'])
def get_all_patients():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE role = "PATIENT"')
    rows = c.fetchall()
    patients = []
    for row in rows:
        p = dict(row)
        p['name'] = row['fullName']
        patients.append(p)
    conn.close()
    return jsonify(patients)

@patients_bp.route('/', methods=['POST'])
def add_patient():
    import uuid
    from werkzeug.security import generate_password_hash
    data = request.json
    name = data.get('name')
    age = data.get('age')
    bloodGroup = data.get('bloodGroup')
    chronicConditions = data.get('chronicConditions')
    
    patient_id = str(uuid.uuid4())
    # Default password for new patients
    pwd = generate_password_hash('password123')
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Ensure unique email
    base_email = f"{name.lower().replace(' ', '')}"
    email = f"{base_email}@nova.com"
    counter = 1
    
    c.execute('SELECT id FROM users WHERE email = ?', (email,))
    while c.fetchone():
        email = f"{base_email}{counter}@nova.com"
        counter += 1
        c.execute('SELECT id FROM users WHERE email = ?', (email,))

    try:
        c.execute('''
            INSERT INTO users (id, email, password, fullName, role, age, bloodGroup, chronicConditions) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (patient_id, email, pwd, name, 'PATIENT', age, bloodGroup, chronicConditions))
        conn.commit()
        return jsonify({"success": True, "id": patient_id, "message": "Patient created", "email": email}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

@patients_bp.route('/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE id = ?', (patient_id,))
    patient = c.fetchone()
    conn.close()
    if patient:
        p = dict(patient)
        p['name'] = p['fullName']
        return jsonify(p)
    return jsonify({"error": "Patient not found"}), 404

@patients_bp.route('/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.json
    name = data.get('name')
    age = data.get('age')
    bloodGroup = data.get('bloodGroup')
    allergies = data.get('allergies')
    chronicConditions = data.get('chronicConditions')
    insuranceProvider = data.get('insuranceProvider')
    photoUrl = data.get('photoUrl')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        UPDATE users 
        SET fullName = ?, age = ?, bloodGroup = ?, allergies = ?, chronicConditions = ?, insuranceProvider = ?, photoUrl = ?
        WHERE id = ?
    ''', (name, age, bloodGroup, allergies, chronicConditions, insuranceProvider, photoUrl, patient_id))
    conn.commit()
    
    c.execute('SELECT * FROM users WHERE id = ?', (patient_id,))
    patient = c.fetchone()
    conn.close()
    return jsonify({"success": True, "data": dict(patient)})

@patients_bp.route('/<patient_id>/vitals', methods=['GET'])
def get_vitals(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM vitals WHERE patientId = ? ORDER BY recordedAt DESC', (patient_id,))
    vitals = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(vitals)

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
        INSERT INTO vitals (patientId, heartRate, bloodPressure, temperature, oxygenLevel, sugarLevel, weight, height) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (patient_id, heartRate, bloodPressure, temperature, oxygenLevel, data.get('sugarLevel'), data.get('weight'), data.get('height')))
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
    return jsonify(timeline)

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
    return jsonify(roadmap)

# Medication Logs
@patients_bp.route('/<patient_id>/medication-logs', methods=['GET'])
def get_medication_logs(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM medication_logs WHERE patientId = ? ORDER BY timestamp DESC', (patient_id,))
    logs = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(logs)

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
    return jsonify(stats)

@patients_bp.route('/<patient_id>/emergency-contacts', methods=['GET'])
def get_patient_emergency_contacts(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM emergency_contacts WHERE patientId = ?', (patient_id,))
    contacts = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(contacts)
