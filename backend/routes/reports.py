from flask import Blueprint, jsonify, request, send_file
from utils.db import get_db_connection
from utils.pdf_generator import generate_report_pdf

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/patient/<patientId>', methods=['GET'])
def get_reports(patientId):
    conn = get_db_connection()
    c = conn.cursor()
    # Fetch reports from timeline where eventType is Lab Result or Medical Report
    c.execute('SELECT * FROM timeline WHERE patientId = ? AND (eventType = "Lab Result" OR eventType = "Medical Report") ORDER BY timestamp DESC', (patientId,))
    reports = [dict(row) for row in c.fetchall()]
    conn.close()
    
    # Map fields for frontend consistency
    formatted_reports = []
    for r in reports:
        formatted_reports.append({
            "id": r['id'],
            "reportName": r['description'].split('|')[0] if '|' in r['description'] else r['description'],
            "fileUrl": r['description'].split('|')[1] if '|' in r['description'] else None,
            "fileType": r['description'].split('|')[2] if '|' in r['description'] else 'PDF',
            "createdAt": r['timestamp'],
            "patientId": r['patientId']
        })
        
    return jsonify(formatted_reports)

@reports_bp.route('/upload/<patientId>', methods=['POST'])
def upload_report(patientId):
    # In a real app, we'd handle the file here. 
    # Frontend handles Cloudinary, so we just save the metadata.
    data = request.form
    report_name = data.get('reportName')
    file_url = data.get('fileUrl')
    file_type = data.get('fileType')
    
    if not report_name or not file_url:
        return jsonify({"success": False, "message": "Missing report data"}), 400
        
    conn = get_db_connection()
    c = conn.cursor()
    # Store encoded metadata in description
    description = f"{report_name}|{file_url}|{file_type}"
    c.execute('INSERT INTO timeline (patientId, eventType, description) VALUES (?, ?, ?)',
              (patientId, "Medical Report", description))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Report uploaded successfully"})
