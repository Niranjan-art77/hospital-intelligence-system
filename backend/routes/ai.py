from flask import Blueprint, jsonify, request

ai_bp = Blueprint('ai', __name__)

SYMPTOM_RULES = {
    "headache": "Possible causes include tension, migraine, or dehydration. Rest and drink fluids. If severe, consult a doctor.",
    "fever": "Could be a viral or bacterial infection. Rest, stay hydrated. If over 103°F (39.4°C), seek immediate medical attention.",
    "cough": "Common with colds, flu, or allergies. Try honey/tea. If coughing persists for weeks or produces blood, see a physician.",
    "stomach ache": "May indicate indigestion, virus, or food poisoning. Stick to bland foods. Seek help if pain is severe or continuous.",
    "chest pain": "WARNING: Could indicate a heart condition. Please seek EMERGENCY medical care immediately."
}

@ai_bp.route('/check-symptoms', methods=['POST'])
def check_symptoms():
    data = request.json
    if not data or not data.get('symptoms'):
        return jsonify({"success": False, "message": "No symptoms provided."}), 400
        
    user_symptoms = str(data['symptoms']).lower()
    
    # Generic rule-based matching
    detected_analysis = []
    for keyword, advice in SYMPTOM_RULES.items():
        if keyword in user_symptoms:
            detected_analysis.append(f"- {keyword.title()}: {advice}")
            
    if not detected_analysis:
        response_text = "I couldn't match your symptoms to a specific common condition. Please monitor your symptoms and consult a healthcare professional if they persist."
    else:
        response_text = "Based on your symptoms:\n" + "\n".join(detected_analysis) + "\n\nNote: I am an AI and this is not a clinical diagnosis."
        
    return jsonify({
        "success": True,
        "advice": response_text
    })

# Add chatbot route specifically for the generic chat, to avoid using an external LLM
@ai_bp.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = str(data.get('message', '')).lower()
    
    if 'symptom' in message or 'feel' in message or 'pain' in message or 'sick' in message:
        return check_symptoms()
        
    return jsonify({
        "success": True,
        "advice": "I am your Nova Health AI assistant. I can help assess basic symptoms or guide you. Please describe any symptoms you are feeling."
    })
