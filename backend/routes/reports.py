import sqlite3
import os
import base64
from flask import Blueprint, jsonify, request, send_file
import io
from utils.pdf_generator import generate_report_pdf

reports_bp = Blueprint('reports', __name__)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            content_base64 TEXT NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check if empty, then seed
    c.execute('SELECT COUNT(*) FROM reports')
    if c.fetchone()[0] == 0:
        sample_reports = [
            ("pat_1", "Q3 Blood Test Results", "Lab Result", "Sample encoded lab result content showing elevated cholesterol.", "2023-09-15"),
            ("pat_1", "Annual Physical Notes", "General", "Patient overall healthy, recommended dietary changes.", "2023-10-01"),
            ("pat_2", "MRI Brain Scan Summary", "Imaging", "No abnormalities detected in the frontal lobe.", "2023-10-10")
        ]
        c.executemany('''
            INSERT INTO reports (patient_id, title, type, content_base64, date) 
            VALUES (?, ?, ?, ?, ?)
        ''', sample_reports)
        
    conn.commit()
    conn.close()

init_db()

@reports_bp.route('/', methods=['GET'])
def get_reports():
    patient_id = request.args.get('patient_id')
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if patient_id:
        c.execute('SELECT id, patient_id, title, type, date FROM reports WHERE patient_id = ? ORDER BY date DESC', (patient_id,))
    else:
        c.execute('SELECT id, patient_id, title, type, date FROM reports ORDER BY date DESC')
        
    reports = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({
        "success": True,
        "data": reports
    })

@reports_bp.route('/upload-report', methods=['POST'])
def upload_report():
    data = request.json
    if not data or not data.get('patient_id') or not data.get('title') or not data.get('content_base64'):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO reports (patient_id, title, type, content_base64) 
        VALUES (?, ?, ?, ?)
    ''', (data['patient_id'], data['title'], data.get('type', 'General'), data['content_base64']))
    conn.commit()
    report_id = c.lastrowid
    conn.close()
    
    return jsonify({
        "success": True,
        "message": "Report uploaded successfully",
        "data": {"id": report_id, "title": data['title']}
    }), 201

@reports_bp.route('/download/<int:report_id>', methods=['GET'])
def download_report(report_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM reports WHERE id = ?', (report_id,))
    report = c.fetchone()
    conn.close()
    
    if not report:
        return jsonify({"success": False, "message": "Report not found"}), 404
        
    # Generate PDF using reportlab
    pdf_buffer = generate_report_pdf(dict(report))
    
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"report_{report_id}.pdf",
        mimetype='application/pdf'
    )
