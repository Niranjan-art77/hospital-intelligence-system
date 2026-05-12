from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

symptoms_bp = Blueprint('symptoms', __name__)

@symptoms_bp.route('/analyze', methods=['POST'])
def analyze_symptoms():
    data = request.json
    symptoms_text = data.get('symptoms', '')
    
    # Mock AI logic for symptoms analysis
    conditions = ["Common Cold", "Seasonal Allergies", "Mild Dehydration"]
    severity = "Low Risk"
    is_emergency = False
    precautions = ["Rest well", "Drink plenty of fluids", "Monitor temperature"]
    medicines = ["Paracetamol 500mg", "Antihistamine"]
    recommended_specialization = "General Physician"
    follow_up_questions = ["Do you have a fever?", "How long have you had these symptoms?"]
    
    symptoms_lower = symptoms_text.lower()
    
    if any(word in symptoms_lower for word in ['chest', 'heart', 'arm pain']):
        conditions = ["Possible Cardiac Issue", "Severe Angina", "Muscle Strain"]
        severity = "High Risk"
        is_emergency = True
        precautions = ["Sit down and rest immediately", "Chew aspirin if available", "Do not drive yourself to hospital"]
        medicines = ["Aspirin (Emergency)"]
        recommended_specialization = "Cardiologist"
        follow_up_questions = ["Is the pain radiating to your jaw or left arm?", "Are you experiencing shortness of breath?"]
        
    elif any(word in symptoms_lower for word in ['headache', 'dizzy', 'nausea']):
        conditions = ["Migraine", "Vertigo", "Dehydration"]
        severity = "Moderate Risk"
        precautions = ["Rest in a dark, quiet room", "Stay hydrated", "Avoid screens"]
        medicines = ["Ibuprofen", "Ondansetron (if prescribed)"]
        recommended_specialization = "Neurologist"
        follow_up_questions = ["Is the headache on one side of your head?", "Does light or sound bother you?"]
        
    return jsonify({
        "success": True,
        "conditions": conditions,
        "severity": severity,
        "isEmergency": is_emergency,
        "precautions": precautions,
        "medicines": medicines,
        "recommendedSpecialization": recommended_specialization,
        "followUpQuestions": follow_up_questions
    })
