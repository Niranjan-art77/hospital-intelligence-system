from flask import Blueprint, jsonify, request
import uuid
from utils.db import get_db_connection

doctors_bp = Blueprint('doctors', __name__)

DOCTORS_SEED = [
    {"id": "doc_1", "name": "Dr. Sarah Johnson", "specialty": "Cardiology", "experience": "15 years", "rating": 4.9, "image": "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random"},
    {"id": "doc_2", "name": "Dr. Michael Chen", "specialty": "Neurology", "experience": "12 years", "rating": 4.8, "image": "https://ui-avatars.com/api/?name=Michael+Chen&background=random"},
    {"id": "doc_3", "name": "Dr. Emily Davis", "specialty": "Pediatrics", "experience": "8 years", "rating": 4.7, "image": "https://ui-avatars.com/api/?name=Emily+Davis&background=random"},
    {"id": "doc_4", "name": "Dr. Robert Smith", "specialty": "Orthopedics", "experience": "20 years", "rating": 4.9, "image": "https://ui-avatars.com/api/?name=Robert+Smith&background=random"},
    {"id": "doc_5", "name": "Dr. Olivia Wilson", "specialty": "Dermatology", "experience": "10 years", "rating": 4.6, "image": "https://ui-avatars.com/api/?name=Olivia+Wilson&background=random"},
]

@doctors_bp.route('/', methods=['GET'])
def get_doctors():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT d.*, u.fullName as name, u.email 
        FROM doctors d 
        JOIN users u ON d.userId = u.id
    ''')
    rows = c.fetchall()
    doctors = [dict(row) for row in rows]
    
    # Fallback to seed if empty for testing
    if not doctors:
        doctors = DOCTORS_SEED
        
    conn.close()
    
    return jsonify({
        "success": True,
        "count": len(doctors),
        "data": doctors
    })

@doctors_bp.route('/<doctor_id>', methods=['GET'])
def get_doctor_profile(doctor_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT d.*, u.fullName as name, u.email, u.phone, u.address 
        FROM doctors d 
        JOIN users u ON d.userId = u.id 
        WHERE d.id = ? OR d.userId = ?
    ''', (doctor_id, doctor_id))
    doctor = c.fetchone()
    conn.close()
    
    if doctor:
        return jsonify({"success": True, "data": dict(doctor)})
    return jsonify({"success": False, "message": "Doctor not found"}), 404
