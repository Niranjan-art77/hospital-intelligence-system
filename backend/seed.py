import uuid
from werkzeug.security import generate_password_hash
from utils.db import get_db_connection
from datetime import datetime, timedelta

def seed_data():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Common password for all test accounts
    pwd = generate_password_hash('password123')
    
    # 1. ADMIN
    admin_id = str(uuid.uuid4())
    c.execute("INSERT OR IGNORE INTO users (id, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)",
              (admin_id, 'admin@nova.com', pwd, 'System Administrator', 'ADMIN'))
              
    # 2. DOCTOR
    doc_user_id = 'doc_user_1'
    doc_id = 'doc_1'
    c.execute("INSERT OR IGNORE INTO users (id, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)",
              (doc_user_id, 'doctor@nova.com', pwd, 'Dr. Sarah Johnson', 'DOCTOR'))
    c.execute("INSERT OR IGNORE INTO doctors (id, userId, specialty, experience, rating) VALUES (?, ?, ?, ?, ?)",
              (doc_id, doc_user_id, 'Cardiology', '15 years', 4.9))
              
    # 3. PATIENT (John Doe)
    pat_user_id = 'pat_1'
    c.execute("INSERT OR IGNORE INTO users (id, email, password, fullName, role, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)",
              (pat_user_id, 'patient@nova.com', pwd, 'John Doe', 'PATIENT', 45, 'Male'))
              
    # 4. STAFF
    staff_id = str(uuid.uuid4())
    c.execute("INSERT OR IGNORE INTO users (id, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)",
              (staff_id, 'staff@nova.com', pwd, 'Hospital Staff Alpha', 'STAFF'))
              
    # SAMPLE DATA FOR PATIENT (John Doe)
    # Vitals (14 Days of History for Charts)
    vitals_data = []
    for i in range(14):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d %H:%M:%S')
        vitals_data.append((pat_user_id, 70 + (i % 5), '120/80', 98.6, 98, date))
    c.executemany("INSERT INTO vitals (patientId, heartRate, bloodPressure, temperature, oxygenLevel, recordedAt) VALUES (?, ?, ?, ?, ?, ?)", vitals_data)
    
    # Billing
    bills = [
        (pat_user_id, 1500.0, 'PENDING', 'Consultation Fee - Cardiology'),
        (pat_user_id, 500.0, 'PAID', 'Lab Test - Blood Profile')
    ]
    c.executemany("INSERT INTO billing (patientId, amount, status, description) VALUES (?, ?, ?, ?)", bills)
    
    # Appointments
    c.execute("INSERT INTO appointments (patientId, doctorId, appointmentTime, status, reason) VALUES (?, ?, ?, ?, ?)",
              (pat_user_id, doc_user_id, '2023-10-15 09:00:00', 'COMPLETED', 'Initial Consultation'))
    c.execute("INSERT INTO appointments (patientId, doctorId, appointmentTime, status, reason) VALUES (?, ?, ?, ?, ?)",
              (pat_user_id, doc_user_id, '2026-05-10 14:00:00', 'PENDING', 'Routine Checkup'))

    # Timeline & Reports
    events = [
        (pat_user_id, 'Consultation', 'Completed annual physical with Dr. Johnson'),
        (pat_user_id, 'Lab Result', 'Blood work indicates normal cholesterol levels'),
        (pat_user_id, 'Lab Result', 'Cardiology Lipid Profile - All values within normal range.')
    ]
    c.executemany("INSERT INTO timeline (patientId, eventType, description) VALUES (?, ?, ?)", events)

    # Notifications
    notifications = [
        (pat_user_id, 'Welcome', 'Welcome to Nova Health Intelligence System!', 'info'),
        (pat_user_id, 'Appointment Reminder', 'You have an upcoming appointment on May 10th.', 'warning')
    ]
    c.executemany("INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)", notifications)

    # Messages
    msgs = [
        (doc_user_id, pat_user_id, 'Hello John, how are you feeling today?'),
        (pat_user_id, doc_user_id, 'I am feeling much better, thank you doctor.'),
        (doc_user_id, pat_user_id, 'Glad to hear that. Keep tracking your vitals.')
    ]
    c.executemany("INSERT INTO messages (senderId, receiverId, content) VALUES (?, ?, ?)", msgs)

    # Recovery Roadmap
    roadmap = [
        (pat_user_id, 'Phase 1: Initial Recovery', 'Rest and light walking', 'COMPLETED', 100, '2023-10-20'),
        (pat_user_id, 'Phase 2: Strength Training', 'Low impact exercises', 'IN_PROGRESS', 45, '2023-11-15'),
        (pat_user_id, 'Phase 3: Full Activity', 'Return to normal routine', 'PENDING', 0, '2023-12-01')
    ]
    c.executemany("INSERT INTO recovery_roadmap (patientId, phase, description, status, progress, targetDate) VALUES (?, ?, ?, ?, ?, ?)", roadmap)

    # Medication Logs
    meds = [
        (pat_user_id, 'Aspirin', 'TAKEN'),
        (pat_user_id, 'Atorvastatin', 'TAKEN'),
        (pat_user_id, 'Lisinopril', 'MISSED')
    ]
    c.executemany("INSERT INTO medication_logs (patientId, medicineName, status) VALUES (?, ?, ?)", meds)

    # Emergency Contacts & Hospitals
    contacts = [(pat_user_id, 'Sarah Johnson', 'Spouse', '+1-555-0123', 'sarah@email.com')]
    c.executemany("INSERT INTO emergency_contacts (patientId, name, relation, phone, email) VALUES (?, ?, ?, ?, ?)", contacts)
    
    hospitals = [('City General Hospital', 12.9716, 77.5946, '2.3 km', '+1-555-1001', '123 Main St', 1)]
    c.executemany("INSERT INTO hospitals (name, lat, lng, distance, phone, address, emergency) VALUES (?, ?, ?, ?, ?, ?, ?)", hospitals)

    conn.commit()
    conn.close()
    print("Database fully seeded with all feature data.")

if __name__ == "__main__":
    seed_data()
