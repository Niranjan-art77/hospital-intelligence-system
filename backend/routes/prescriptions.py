from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

prescriptions_bp = Blueprint('prescriptions', __name__)

@prescriptions_bp.route('/recent/<patient_id>', methods=['GET'])
def get_recent_prescriptions(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    # Get last 5 prescriptions
    c.execute('''
        SELECT p.*, u.fullName as doctorName 
        FROM prescriptions p 
        JOIN users u ON p.doctorId = u.id 
        WHERE p.patientId = ? 
        ORDER BY p.createdAt DESC LIMIT 5
    ''', (patient_id,))
    
    prescriptions = []
    for p_row in c.fetchall():
        p = dict(p_row)
        # Fetch items for each prescription
        c.execute('SELECT * FROM prescriptions_items WHERE prescriptionId = ?', (p['id'],))
        p['items'] = [dict(item) for item in c.fetchall()]
        prescriptions.append(p)
        
    conn.close()
    
    return jsonify({
        "success": True,
        "data": prescriptions
    })

@prescriptions_bp.route('/add', methods=['POST'])
def add_prescription():
    data = request.json
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    diagnosis = data.get('diagnosis')
    notes = data.get('notes')
    items = data.get('items', [])
    
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO prescriptions (patientId, doctorId, diagnosis, notes) 
            VALUES (?, ?, ?, ?)
        ''', (patient_id, doctor_id, diagnosis, notes))
        prescription_id = c.lastrowid
        
        for item in items:
            c.execute('''
                INSERT INTO prescriptions_items (prescriptionId, medicineName, dosage, morning, afternoon, night) 
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (prescription_id, item['medicineName'], item.get('dosage'), item.get('morning', 0), item.get('afternoon', 0), item.get('night', 0)))
            
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Prescription added successfully"}), 201
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500
