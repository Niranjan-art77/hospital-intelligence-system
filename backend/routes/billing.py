from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

billing_bp = Blueprint('billing', __name__)

@billing_bp.route('/patient/<patient_id>', methods=['GET'])
def get_patient_bills(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM billing WHERE patientId = ? ORDER BY createdAt DESC', (patient_id,))
    bills = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": bills
    })

@billing_bp.route('/pay/<int:bill_id>', methods=['POST'])
def pay_bill(bill_id):
    data = request.json
    method = data.get('method', 'UPI')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE billing SET status = ? WHERE id = ?', ('PAID', bill_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "message": f"Payment of bill #{bill_id} via {method} successful"
    })

@billing_bp.route('/add', methods=['POST'])
def add_bill():
    data = request.json
    patient_id = data.get('patientId')
    amount = data.get('amount')
    description = data.get('description')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO billing (patientId, amount, description) 
        VALUES (?, ?, ?)
    ''', (patient_id, amount, description))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Bill added successfully"}), 201
