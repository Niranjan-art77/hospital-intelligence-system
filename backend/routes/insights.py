from flask import Blueprint, jsonify
from utils.db import get_db_connection

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/', methods=['GET'])
def get_insights():
    conn = get_db_connection()
    c = conn.cursor()
    # Join with users to get patient name
    c.execute('''
        SELECT i.*, u.fullName as patientName
        FROM insights i
        JOIN users u ON i.patientId = u.id
        ORDER BY i.timestamp DESC
    ''')
    rows = c.fetchall()
    
    insights_list = []
    for row in rows:
        insight = dict(row)
        insight['patient'] = {"name": row['patientName']}
        insights_list.append(insight)
    
    # If empty, return some mock insights for demo purposes
    if not insights_list:
        insights_list = [
            {
                "id": 1,
                "type": "CRITICAL",
                "message": "Patient showing abnormal heart rate variability in the last 2 hours. Recommend immediate ECG.",
                "timestamp": "2026-05-12T10:30:00",
                "patient": {"name": "John Doe"}
            },
            {
                "id": 2,
                "type": "OPTIMAL",
                "message": "Recovery roadmap for surgery recovery is ahead of schedule. Physiotherapy intensity can be increased.",
                "timestamp": "2026-05-12T09:15:00",
                "patient": {"name": "Jane Smith"}
            }
        ]
        
    conn.close()
    return jsonify(insights_list)
