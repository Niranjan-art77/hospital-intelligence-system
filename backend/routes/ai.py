from flask import Blueprint, jsonify, request
import random
from utils.db import get_db_connection

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/recommend-doctor', methods=['POST'])
def recommend_doctor():
    data = request.json
    symptoms = data.get('symptoms', '').lower()
    
    specialty = 'General Medicine'
    if 'heart' in symptoms or 'chest' in symptoms:
        specialty = 'Cardiology'
    elif 'head' in symptoms or 'brain' in symptoms:
        specialty = 'Neurology'
    elif 'skin' in symptoms or 'rash' in symptoms:
        specialty = 'Dermatology'
    elif 'bone' in symptoms or 'joint' in symptoms:
        specialty = 'Orthopedics'
        
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT u.fullName, d.specialty, d.id FROM users u JOIN doctors d ON u.id = d.userId WHERE d.specialty = ? LIMIT 3', (specialty,))
    doctors = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "specialty": specialty,
        "recommendations": doctors
    })

@ai_bp.route('/analyze-symptom', methods=['POST'])
def analyze_symptom():
    data = request.json
    symptoms = data.get('symptoms', '')
    # Mock AI response
    urgency = 'LOW'
    if any(word in symptoms.lower() for word in ['severe', 'pain', 'shortness', 'chest']):
        urgency = 'HIGH'
    
    return jsonify({
        "success": True,
        "urgency": urgency,
        "analysis": f"Based on your symptoms: '{symptoms}', our AI suggests an urgency level of {urgency}. Please consult a {('Cardiologist' if 'chest' in symptoms.lower() else 'General Physician')}."
    })

@ai_bp.route('/chat', methods=['POST'])
def ai_chat():
    data = request.json
    message = data.get('message', '')
    userId = data.get('userId')
    
    # Store user message
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO ai_chat_history (userId, role, content) VALUES (?, ?, ?)', (userId, 'user', message))
    
    # Mock AI response
    responses = [
        "I understand. How long have you been feeling this way?",
        "That's interesting. Do you have any other symptoms?",
        "I recommend tracking your vitals for the next 24 hours.",
        "Based on our records, your last checkup was quite recent. Is this a new development?"
    ]
    ai_response = random.choice(responses)
    
    c.execute('INSERT INTO ai_chat_history (userId, role, content) VALUES (?, ?, ?)', (userId, 'assistant', ai_response))
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "response": ai_response
    })

@ai_bp.route('/chat-history/<userId>', methods=['GET'])
def get_chat_history(userId):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM ai_chat_history WHERE userId = ? ORDER BY timestamp ASC', (userId,))
    history = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({"success": True, "data": history})
