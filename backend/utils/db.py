import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullName TEXT NOT NULL,
            role TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            bloodGroup TEXT,
            phone TEXT,
            address TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Doctors table
    c.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            id TEXT PRIMARY KEY,
            userId TEXT,
            specialty TEXT,
            experience TEXT,
            rating REAL,
            image TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
        )
    ''')
    
    # Patients table (additional info)
    c.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            userId TEXT,
            emergencyContact TEXT,
            medicalHistory TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
        )
    ''')
    
    # Appointments table
    c.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT NOT NULL,
            doctorId TEXT NOT NULL,
            appointmentTime DATETIME NOT NULL,
            status TEXT DEFAULT 'PENDING',
            reason TEXT,
            type TEXT DEFAULT 'Consultation',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Vitals table
    c.execute('''
        CREATE TABLE IF NOT EXISTS vitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT NOT NULL,
            heartRate INTEGER,
            bloodPressure TEXT,
            temperature REAL,
            oxygenLevel INTEGER,
            recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Messages table (already exists in some form)
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Reports table
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

    # Billing table
    c.execute('''
        CREATE TABLE IF NOT EXISTS billing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'PENDING',
            description TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Prescriptions table
    c.execute('''
        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT NOT NULL,
            doctorId TEXT NOT NULL,
            diagnosis TEXT,
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Prescription Items table
    c.execute('''
        CREATE TABLE IF NOT EXISTS prescriptions_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prescriptionId INTEGER NOT NULL,
            medicineName TEXT NOT NULL,
            dosage TEXT,
            morning BOOLEAN DEFAULT 0,
            afternoon BOOLEAN DEFAULT 0,
            night BOOLEAN DEFAULT 0,
            FOREIGN KEY (prescriptionId) REFERENCES prescriptions (id)
        )
    ''')

    # Emergency Contacts table
    c.execute('''
        CREATE TABLE IF NOT EXISTS emergency_contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT NOT NULL,
            name TEXT NOT NULL,
            relation TEXT,
            phone TEXT NOT NULL,
            email TEXT
        )
    ''')

    # Hospitals table
    c.execute('''
        CREATE TABLE IF NOT EXISTS hospitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            lat REAL,
            lng REAL,
            distance TEXT,
            phone TEXT,
            address TEXT,
            emergency BOOLEAN DEFAULT 1
        )
    ''')

    # Emergency Log table
    c.execute('''
        CREATE TABLE IF NOT EXISTS emergency_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT NOT NULL,
            type TEXT,
            location_lat REAL,
            location_lng REAL,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Timeline table

    c.execute('''
        CREATE TABLE IF NOT EXISTS timeline (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT NOT NULL,
            eventType TEXT NOT NULL,
            description TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
