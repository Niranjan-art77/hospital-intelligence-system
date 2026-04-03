from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/rooms/<userId>', methods=['GET'])
def get_rooms(userId):
    conn = get_db_connection()
    c = conn.cursor()
    # Simple mockup: Return a list of doctors the patient has appointments with
    c.execute('''
        SELECT DISTINCT u.id, u.fullName, d.specialty 
        FROM users u 
        JOIN doctors d ON u.id = d.userId
        JOIN appointments a ON d.userId = a.doctorId
        WHERE a.patientId = ?
    ''', (userId,))
    rooms = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({"success": True, "data": rooms})

@messages_bp.route('/history/<senderId>/<receiverId>', methods=['GET'])
def get_history(senderId, receiverId):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT * FROM messages 
        WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
        ORDER BY timestamp ASC
    ''', (senderId, receiverId, receiverId, senderId))
    history = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({"success": True, "data": history})

@messages_bp.route('/send', methods=['POST'])
def send_message():
    data = request.json
    senderId = data.get('senderId')
    receiverId = data.get('receiverId')
    content = data.get('content')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO messages (senderId, receiverId, content) VALUES (?, ?, ?)',
              (senderId, receiverId, content))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Message sent"}), 201
