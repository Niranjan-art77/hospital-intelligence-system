from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

beds_bp = Blueprint('beds', __name__)

@beds_bp.route('/', methods=['GET'])
def get_beds():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM beds')
    beds = [dict(row) for row in c.fetchall()]
    
    if not beds:
        # Return fallback if empty
        beds = [
            { "id": 1, "bedNumber": "ICU-01", "type": "ICU", "status": "OCCUPIED", "wardName": "ICU Ward" },
            { "id": 2, "bedNumber": "ICU-02", "type": "ICU", "status": "AVAILABLE", "wardName": "ICU Ward" },
            { "id": 3, "bedNumber": "ICU-03", "type": "ICU", "status": "AVAILABLE", "wardName": "ICU Ward" },
            { "id": 4, "bedNumber": "ICU-04", "type": "ICU", "status": "OCCUPIED", "wardName": "ICU Ward" },
            { "id": 5, "bedNumber": "EMG-01", "type": "EMERGENCY", "status": "AVAILABLE", "wardName": "Emergency Ward" },
            { "id": 8, "bedNumber": "A-01", "type": "GENERAL", "status": "AVAILABLE", "wardName": "Ward A" },
        ]
    
    conn.close()
    return jsonify(beds)

@beds_bp.route('/<int:bed_id>/status', methods=['PUT'])
def update_bed_status(bed_id):
    status = request.args.get('status')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE beds SET status = ? WHERE id = ?', (status, bed_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Bed status updated"})
