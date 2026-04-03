from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/<userId>', methods=['GET'])
def get_notifications(userId):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC', (userId,))
    notifications = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({"success": True, "data": notifications})

@notifications_bp.route('/<userId>/mark-read', methods=['POST'])
def mark_read(userId):
    data = request.json
    id = data.get('id')
    
    conn = get_db_connection()
    c = conn.cursor()
    if id:
        c.execute('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?', (id, userId))
    else:
        c.execute('UPDATE notifications SET isRead = 1 WHERE userId = ?', (userId,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Notifications marked as read"})

@notifications_bp.route('/add', methods=['POST'])
def add_notification():
    data = request.json
    userId = data.get('userId')
    title = data.get('title')
    message = data.get('message')
    n_type = data.get('type', 'info')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)',
              (userId, title, message, n_type))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Notification added"}), 201
