from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

pharmacy_bp = Blueprint('pharmacy', __name__)

@pharmacy_bp.route('/', methods=['GET'])
def get_pharmacy():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM pharmacy')
    items = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(items)

@pharmacy_bp.route('/', methods=['POST'])
def add_medicine():
    data = request.json
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO pharmacy (medicineName, stock, price, description, status, lowStockThreshold, expiryDate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('medicineName'),
        data.get('stock', 0),
        data.get('price', 0.0),
        data.get('description'),
        data.get('status', 'In Stock'),
        data.get('lowStockThreshold', 100),
        data.get('expiryDate')
    ))
    conn.commit()
    new_id = c.lastrowid
    conn.close()
    return jsonify({"id": new_id, "message": "Medicine added successfully"}), 201

@pharmacy_bp.route('/<int:id>', methods=['DELETE'])
def delete_medicine(id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM pharmacy WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Medicine deleted successfully"})
