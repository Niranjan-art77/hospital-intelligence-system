import uuid
from werkzeug.security import generate_password_hash
from utils.db import get_db_connection

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
    doc_user_id = str(uuid.uuid4())
    doc_id = 'doc_1' # Specific ID for consistency
    c.execute("INSERT OR IGNORE INTO users (id, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)",
              (doc_user_id, 'doctor@nova.com', pwd, 'Dr. Sarah Johnson', 'DOCTOR'))
    c.execute("INSERT OR IGNORE INTO doctors (id, userId, specialty, experience, rating) VALUES (?, ?, ?, ?, ?)",
              (doc_id, doc_user_id, 'Cardiology', '15 years', 4.9))
              
    # 3. PATIENT
    pat_user_id = 'pat_1' # Use pat_1 to match existing hardcoded reports
    c.execute("INSERT OR IGNORE INTO users (id, email, password, fullName, role, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)",
              (pat_user_id, 'patient@nova.com', pwd, 'John Doe', 'PATIENT', 45, 'Male'))
              
    # 4. STAFF
    staff_id = str(uuid.uuid4())
    c.execute("INSERT OR IGNORE INTO users (id, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)",
              (staff_id, 'staff@nova.com', pwd, 'Hospital Staff Alpha', 'STAFF'))
              
    # SAMPLE DATA FOR PATIENT (John Doe)
    # Vitals
    vitals = [
        (pat_user_id, 72, '120/80', 98.6, 98, '2023-11-01 10:00:00'),
        (pat_user_id, 75, '122/82', 98.7, 97, '2023-11-02 10:00:00'),
        (pat_user_id, 70, '118/78', 98.4, 99, '2023-11-03 10:00:00')
    ]
    c.executemany("INSERT INTO vitals (patientId, heartRate, bloodPressure, temperature, oxygenLevel, recordedAt) VALUES (?, ?, ?, ?, ?, ?)", vitals)
    
    # Billing
    bills = [
        (pat_user_id, 1500.0, 'PENDING', 'Consultation Fee - Cardiology'),
        (pat_user_id, 500.0, 'PAID', 'Lab Test - Blood Profile')
    ]
    c.executemany("INSERT INTO billing (patientId, amount, status, description) VALUES (?, ?, ?, ?)", bills)
    
    # Appointments
    appts = [
        (pat_user_id, doc_user_id, '2026-05-10 14:00:00', 'Routine Checkup'),
        (pat_user_id, doc_user_id, '2023-10-15 09:00:00', 'Initial Consultation')
    ]
    # Set status for the past one
    c.execute("INSERT INTO appointments (patientId, doctorId, appointmentTime, status, reason) VALUES (?, ?, ?, ?, ?)",
              (pat_user_id, doc_user_id, '2023-10-15 09:00:00', 'COMPLETED', 'Initial Consultation'))
    c.execute("INSERT INTO appointments (patientId, doctorId, appointmentTime, status, reason) VALUES (?, ?, ?, ?, ?)",
              (pat_user_id, doc_user_id, '2026-05-10 14:00:00', 'PENDING', 'Routine Checkup'))

    # Timeline
    events = [
        (pat_user_id, 'Consultation', 'Completed annual physical with Dr. Johnson'),
        (pat_user_id, 'Lab Result', 'Blood work indicates normal cholesterol levels')
    ]
    c.executemany("INSERT INTO timeline (patientId, eventType, description) VALUES (?, ?, ?)", events)

    # Emergency Contacts for John Doe (pat_1)
    contacts = [
        (pat_user_id, 'Sarah Johnson', 'Spouse', '+1-555-0123', 'sarah@email.com'),
        (pat_user_id, 'Dr. Michael Chen', 'Primary Care', '+1-555-0456', 'dr.chen@hospital.com')
    ]
    c.executemany("INSERT INTO emergency_contacts (patientId, name, relation, phone, email) VALUES (?, ?, ?, ?, ?)", contacts)

    # Hospitals
    hospitals = [
        ('City General Hospital', 12.9716, 77.5946, '2.3 km', '+1-555-1001', '123 Main St', 1),
        ('Apollo Medical Center', 12.9816, 77.6046, '3.7 km', '+1-555-1002', '456 Oak Ave', 1),
        ('St. Mary-s Hospital', 12.9916, 77.6146, '5.1 km', '+1-555-1003', '789 Pine Rd', 0)
    ]
    c.executemany("INSERT INTO hospitals (name, lat, lng, distance, phone, address, emergency) VALUES (?, ?, ?, ?, ?, ?, ?)", hospitals)

    conn.commit()
    conn.close()
    print("Database seeded successfully with test accounts.")

if __name__ == "__main__":
    seed_data()
