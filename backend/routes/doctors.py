from flask import Blueprint, jsonify, request
import uuid
from utils.db import get_db_connection

doctors_bp = Blueprint('doctors', __name__)

DOCTORS_SEED = [
    {"id": "doc_1", "name": "Dr. Sarah Johnson", "specialization": "Cardiology", "experience": "15", "rating": 4.9, "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"},
    {"id": "doc_2", "name": "Dr. Michael Chen", "specialization": "Neurology", "experience": "12", "rating": 4.8, "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"},
    {"id": "doc_3", "name": "Dr. Emily Davis", "specialization": "Pediatrics", "experience": "8", "rating": 4.7, "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"},
    {"id": "doc_4", "name": "Dr. Robert Smith", "specialization": "Orthopedics", "experience": "20", "rating": 4.9, "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert"},
    {"id": "doc_5", "name": "Dr. Olivia Wilson", "specialization": "Dermatology", "experience": "10", "rating": 4.6, "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia"},
    {"id": "doc_6", "name": "Dr. Alan Grant", "specialization": "Paleopathology", "experience": "25", "rating": 5.0, "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alan"},
    {"id": "doc_7", "name": "Dr. Ellie Sattler", "specialization": "Paleobotany", "experience": "18", "rating": 4.9, "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ellie"},
    # ... Many more can be added, but I will also ensure the system supports dynamic specializations
]

SPECIALIZATIONS = [
    "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology", "Oncology", "Psychiatry", 
    "Gastroenterology", "Endocrinology", "Radiology", "Anesthesiology", "Ophthalmology", "Urology", 
    "Hematology", "Nephrology", "Pulmonology", "Rheumatology", "Infectious Diseases", "Geriatrics", 
    "Physical Medicine", "Emergency Medicine", "Pathology", "Medical Genetics", "Obstetrics", 
    "Gynecology", "Otolaryngology", "Neurosurgery", "Cardiothoracic Surgery", "Vascular Surgery", 
    "Plastic Surgery", "Immunology", "Allergy", "Nuclear Medicine", "Pain Management", "Sleep Medicine", 
    "Sports Medicine", "Hospice", "Palliative Care", "Adolescent Medicine", "Clinical Neurophysiology", 
    "Critical Care Medicine", "Cytopathology", "Developmental-Behavioral Pediatrics", "Forensic Pathology", 
    "Maternal-Fetal Medicine", "Medical Microbiology", "Molecular Genetic Pathology", "Neonatal-Perinatal Medicine", 
    "Neuroradiology", "Orthopedic Sports Medicine", "Pediatric Cardiology", "Pediatric Endocrinology", 
    "Pediatric Hematology-Oncology", "Pediatric Infectious Diseases", "Pediatric Nephrology", 
    "Pediatric Pulmonology", "Pediatric Rheumatology", "Pediatric Surgery", "Pediatric Urology", 
    "Reproductive Endocrinology", "Transplant Hepatology", "Vascular Neurology"
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

@doctors_bp.route('/specializations', methods=['GET'])
def get_specializations():
    return jsonify(SPECIALIZATIONS)

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
