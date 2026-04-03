from flask import Blueprint, jsonify, request, send_file
from utils.db import get_db_connection
from utils.pdf_generator import generate_report_pdf

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/patient/<patientId>', methods=['GET'])
def get_reports(patientId):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM timeline WHERE patientId = ? AND eventType = "Lab Result"', (patientId,))
    reports = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({"success": True, "data": reports})

@reports_bp.route('/<reportId>/download', methods=['GET'])
def download_report(reportId):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM timeline WHERE id = ?', (reportId,))
    report = c.fetchone()
    conn.close()
    
    if not report:
        return jsonify({"success": False, "message": "Report not found"}), 404
        
    pdf_buffer = generate_report_pdf({
        "title": report['eventType'],
        "patient_id": report['patientId'],
        "type": "General Report",
        "date": report['timestamp'],
        "content_base64": report['description']
    })
    
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"Report_{reportId}.pdf",
        mimetype='application/pdf'
    )
