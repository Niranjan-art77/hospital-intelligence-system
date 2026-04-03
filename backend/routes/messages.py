import sqlite3
import os
from flask import Blueprint, jsonify, request

messages_bp = Blueprint('messages', __name__)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB on load
init_db()

@messages_bp.route('/', methods=['GET'])
def get_messages():
    sender_id = request.args.get('sender_id')
    receiver_id = request.args.get('receiver_id')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if sender_id and receiver_id:
        c.execute('''
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC
        ''', (sender_id, receiver_id, receiver_id, sender_id))
    else:
        c.execute('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 100')
        
    messages = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": messages
    })

@messages_bp.route('/', methods=['POST'])
def send_message():
    data = request.json
    if not data or not data.get('sender_id') or not data.get('receiver_id') or not data.get('content'):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO messages (sender_id, receiver_id, content) 
        VALUES (?, ?, ?)
    ''', (data['sender_id'], data['receiver_id'], data['content']))
    conn.commit()
    msg_id = c.lastrowid
    
    c.execute('SELECT * FROM messages WHERE id = ?', (msg_id,))
    conn.row_factory = sqlite3.Row
    new_message = dict(c.fetchone())
    conn.close()
    
    return jsonify({
        "success": True,
        "message": "Message sent",
        "data": new_message
    }), 201
