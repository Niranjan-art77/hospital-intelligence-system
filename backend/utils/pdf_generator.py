import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_report_pdf(report_data):
    """
    Generates a PDF file from a dictionary containing report data.
    """
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 750, f"Medical Report: {report_data.get('title', 'Unknown')}")
    
    p.setFont("Helvetica", 12)
    p.drawString(100, 720, f"Patient ID: {report_data.get('patient_id', 'N/A')}")
    p.drawString(100, 700, f"Type: {report_data.get('type', 'N/A')}")
    p.drawString(100, 680, f"Date: {report_data.get('date', 'N/A')}")
    
    p.line(100, 670, 500, 670)
    
    p.setFont("Helvetica", 10)
    p.drawString(100, 650, "Data/Notes:")
    
    notes = report_data.get('content_base64', 'No content specified.')
    # Truncate notes if they are too long for one line (simplified formatting for this script)
    if len(notes) > 300:
        notes = "Report data present (stored in DB base64). Too long to print fully."
        
    y = 630
    # Simple un-wrapping
    for word in [notes[i:i+80] for i in range(0, len(notes), 80)]:
        p.drawString(100, y, word)
        y -= 15
        
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer
