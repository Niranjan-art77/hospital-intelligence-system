from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/patient/<patient_id>', methods=['GET'])
def get_patient_appointments(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT a.*, u.fullName as doctorName 
        FROM appointments a 
        JOIN users u ON a.doctorId = u.id 
        WHERE a.patientId = ? 
        ORDER BY a.appointmentTime ASC
    ''', (patient_id,))
    appointments = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": appointments
    })

@appointments_bp.route('/doctor/<doctor_id>', methods=['GET'])
def get_doctor_appointments(doctor_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT a.*, u.fullName as patientName 
        FROM appointments a 
        JOIN users u ON a.patientId = u.id 
        WHERE a.doctorId = ? 
        ORDER BY a.appointmentTime ASC
    ''', (doctor_id,))
    appointments = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": appointments
    })

@appointments_bp.route('/book', methods=['POST'])
def book_appointment():
    data = request.json
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    appt_time = data.get('appointmentTime')
    reason = data.get('reason')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO appointments (patientId, doctorId, appointmentTime, reason) 
        VALUES (?, ?, ?, ?)
    ''', (patient_id, doctor_id, appt_time, reason))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Appointment booked successfully"}), 201

@appointments_bp.route('/<int:appt_id>/status', methods=['PATCH'])
def update_status(appt_id):
    data = request.json
    status = data.get('status')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE appointments SET status = ? WHERE id = ?', (status, appt_id))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": f"Appointment marked as {status}"})
