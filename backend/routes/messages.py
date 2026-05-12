from flask import Blueprint, jsonify, request
from utils.db import get_db_connection
import uuid
from datetime import datetime

messages_bp = Blueprint('messages', __name__)

# --- Unified Chat Endpoints (for ChatContext) ---

@messages_bp.route('/conversations/<userId>', methods=['GET'])
def get_conversations(userId):
    conn = get_db_connection()
    c = conn.cursor()
    # Find all users this user has messaged or received messages from
    c.execute('''
        SELECT DISTINCT 
            u.id as participantId, 
            u.fullName as participantName, 
            u.role as participantRole,
            (SELECT content FROM messages 
             WHERE (senderId = ? AND receiverId = u.id) OR (senderId = u.id AND receiverId = ?)
             ORDER BY timestamp DESC LIMIT 1) as lastMessage,
            (SELECT timestamp FROM messages 
             WHERE (senderId = ? AND receiverId = u.id) OR (senderId = u.id AND receiverId = ?)
             ORDER BY timestamp DESC LIMIT 1) as lastMessageTime
        FROM users u
        JOIN messages m ON (m.senderId = u.id AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = u.id)
        WHERE u.id != ?
    ''', (userId, userId, userId, userId, userId, userId, userId))
    
    rows = c.fetchall()
    conversations = []
    for row in rows:
        conv = dict(row)
        # Create a stable roomId/conversationId
        conv['id'] = "-".join(sorted([str(userId), str(conv['participantId'])]))
        conversations.append(conv)
        
    conn.close()
    return jsonify(conversations)

@messages_bp.route('/messages/<conversationId>', methods=['GET'])
def get_messages(conversationId):
    # conversationId is expected to be "user1Id-user2Id"
    ids = conversationId.split('-')
    if len(ids) != 2:
        return jsonify({"error": "Invalid conversation ID"}), 400
    
    u1, u2 = ids
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT * FROM messages 
        WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
        ORDER BY timestamp ASC
    ''', (u1, u2, u2, u1))
    messages = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(messages)

@messages_bp.route('/message', methods=['POST'])
@messages_bp.route('/send', methods=['POST'])
def send_message_unified():
    data = request.json
    senderId = data.get('senderId')
    receiverId = data.get('receiverId')
    content = data.get('content') or data.get('message')
    
    # If conversationId is provided but not receiverId, extract receiverId
    if not receiverId and data.get('conversationId'):
        ids = data['conversationId'].split('-')
        receiverId = [i for i in ids if i != str(senderId)][0]

    if not senderId or not receiverId or not content:
        return jsonify({"error": "Missing required fields"}), 400
        
    conn = get_db_connection()
    c = conn.cursor()
    timestamp = datetime.now().isoformat()
    c.execute('INSERT INTO messages (senderId, receiverId, content, timestamp) VALUES (?, ?, ?, ?)',
              (senderId, receiverId, content, timestamp))
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True, 
        "message": "Message sent",
        "data": {
            "senderId": senderId,
            "receiverId": receiverId,
            "content": content,
            "timestamp": timestamp
        }
    }), 201

@messages_bp.route('/conversation', methods=['POST'])
def start_conversation():
    data = request.json
    participants = data.get('participantIds', [])
    if len(participants) < 2:
        return jsonify({"error": "Need at least 2 participants"}), 400
    
    # In this simple model, a conversation is just a pair of users
    # We return the basic info for the "other" user
    u1, u2 = participants[0], participants[1]
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id as participantId, fullName as participantName, role as participantRole FROM users WHERE id = ?', (u2,))
    user_info = c.fetchone()
    conn.close()
    
    if not user_info:
        return jsonify({"error": "User not found"}), 404
        
    conversation = dict(user_info)
    conversation['id'] = "-".join(sorted([str(u1), str(u2)]))
    conversation['lastMessage'] = ""
    conversation['lastMessageTime'] = datetime.now().isoformat()
    
    return jsonify(conversation)
