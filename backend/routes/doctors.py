from flask import Blueprint, jsonify, request
import uuid
from utils.db import get_db_connection

doctors_bp = Blueprint('doctors', __name__)

DOCTORS_SEED = [
    {"id": "doc_1", "name": "Dr. Sarah Johnson", "specialization": "Cardiology", "experience": "15", "rating": 4.9, "image": "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random"},
    {"id": "doc_2", "name": "Dr. Michael Chen", "specialization": "Neurology", "experience": "12", "rating": 4.8, "image": "https://ui-avatars.com/api/?name=Michael+Chen&background=random"},
    {"id": "doc_3", "name": "Dr. Emily Davis", "specialization": "Pediatrics", "experience": "8", "rating": 4.7, "image": "https://ui-avatars.com/api/?name=Emily+Davis&background=random"},
    {"id": "doc_4", "name": "Dr. Robert Smith", "specialization": "Orthopedics", "experience": "20", "rating": 4.9, "image": "https://ui-avatars.com/api/?name=Robert+Smith&background=random"},
    {"id": "doc_5", "name": "Dr. Olivia Wilson", "specialization": "Dermatology", "experience": "10", "rating": 4.6, "image": "https://ui-avatars.com/api/?name=Olivia+Wilson&background=random"},
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
    # Map specialty to specialization for frontend compatibility
    for d in doctors:
        if 'specialty' in d:
            d['specialization'] = d['specialty']
    
    return jsonify(doctors)

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
        d_dict = dict(doctor)
        d_dict['specialization'] = d_dict.get('specialty')
        return jsonify(d_dict)
    return jsonify({"error": "Doctor not found"}), 404
