import os
from flask import Flask, jsonify, request
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"status": "active", "message": "Health Intelligence System Backend Running (Flask)"})
        
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({"status": "ok"})

    # Register blueprints (routes)
    from routes.doctors import doctors_bp
    from routes.billing import billing_bp
    from routes.auth import auth_bp
    from routes.patients_mgmt import patients_bp
    from routes.appointments import appointments_bp
    from routes.prescriptions import prescriptions_bp
    from routes.emergency import emergency_bp
    from routes.messages import messages_bp
    from routes.ai import ai_bp
    from routes.reports import reports_bp
    from routes.notifications import notifications_bp

    app.register_blueprint(doctors_bp, url_prefix='/api/doctors')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(billing_bp, url_prefix='/api/billing')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(prescriptions_bp, url_prefix='/api/prescriptions')
    app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    # Special routes to match frontend expectations exactly
    @app.route('/api/hospitals/nearby', methods=['GET'])
    def root_hospitals():
        from routes.emergency import get_nearby_hospitals
        return get_nearby_hospitals()

    @app.route('/api/emergency/log', methods=['POST'])
    def root_emergency_log():
        from routes.emergency import log_emergency
        return log_emergency()
    
    # Optional: Catch-all to provide a meaningful error for not migrated routes
    @app.errorhandler(404)
    def resource_not_found(e):
        return jsonify(error=str(e), message="Route not found on Flask backend. May not be migrated yet."), 404

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
