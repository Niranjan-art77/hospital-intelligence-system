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

@pharmacy_bp.route('/stats', methods=['GET'])
def get_pharmacy_stats():
    conn = get_db_connection()
    c = conn.cursor()
    
    # 1. Inventory Stats
    c.execute('SELECT COUNT(*) as total FROM pharmacy')
    total_meds = c.fetchone()['total']
    
    c.execute('SELECT COUNT(*) as low FROM pharmacy WHERE stock < lowStockThreshold')
    low_stock = c.fetchone()['low']
    
    # 2. Financial Stats (Mocked from billing)
    c.execute('SELECT SUM(amount) as total FROM billing WHERE description LIKE "Pharmacy%"')
    revenue = c.fetchone()['total'] or 0
    
    # 3. Prescription Stats
    c.execute('SELECT COUNT(*) as count FROM prescriptions WHERE status = "VERIFIED"')
    processed = c.fetchone()['count']
    
    c.execute('SELECT COUNT(*) as count FROM prescriptions WHERE status = "PENDING"')
    pending = c.fetchone()['count']

    stats = {
        "inventory": {
            "totalMedicines": total_meds,
            "lowStockItems": low_stock,
            "stockIntegrity": 98.2 # Mocked
        },
        "financials": {
            "dailyRevenue": revenue,
            "monthlyRevenue": revenue * 25, # Mocked
            "pendingPayments": pending * 500 # Mocked
        },
        "operations": {
            "processedToday": processed,
            "pendingQueue": pending,
            "avgProcessingTime": "4.2m"
        }
    }
    conn.close()
    return jsonify(stats)

@pharmacy_bp.route('/inventory', methods=['GET'])
def get_inventory():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM pharmacy ORDER BY medicineName ASC')
    inventory = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(inventory)

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

@pharmacy_bp.route('/update-stock', methods=['POST'])
def update_stock():
    data = request.json
    med_id = data.get('id')
    new_stock = data.get('stock')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE pharmacy SET stock = ? WHERE id = ?', (new_stock, med_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@pharmacy_bp.route('/prescriptions', methods=['GET'])
def get_all_prescriptions():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM prescriptions ORDER BY createdAt DESC')
    prescriptions = []
    for row in c.fetchall():
        p = dict(row)
        c.execute('SELECT * FROM prescriptions_items WHERE prescriptionId = ?', (p['id'],))
        p['items'] = [dict(item) for item in c.fetchall()]
        prescriptions.append(p)
    conn.close()
    return jsonify(prescriptions)

@pharmacy_bp.route('/verify', methods=['POST'])
def verify_prescription():
    data = request.json
    prescription_id = data.get('prescriptionId')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE prescriptions SET status = "VERIFIED" WHERE id = ?', (prescription_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Biometric protocol verified with Doctor HUD."})

@pharmacy_bp.route('/alerts', methods=['GET'])
def get_pharmacy_alerts():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM pharmacy WHERE stock <= lowStockThreshold')
    low_stock = [dict(row) for row in c.fetchall()]
    conn.close()
    
    alerts = []
    for item in low_stock:
        alerts.append({
            "type": "CRITICAL" if item['stock'] == 0 else "WARNING",
            "message": f"Asset {item['medicineName']} level at {item['stock']} units.",
            "timestamp": "JUST NOW"
        })
    return jsonify(alerts)

