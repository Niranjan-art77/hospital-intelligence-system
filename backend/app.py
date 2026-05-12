import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            "status": "active",
            "message": "Health Intelligence System Backend Running (Flask)"
        })

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
    from routes.analytics import analytics_bp
    from routes.pharmacy import pharmacy_bp
    from routes.insights import insights_bp
    from routes.beds import beds_bp
    from routes.symptoms import symptoms_bp

    # Blueprint registrations
    app.register_blueprint(doctors_bp, url_prefix='/api/doctors')
    app.register_blueprint(messages_bp, url_prefix='/api/chat')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(billing_bp, url_prefix='/api/billing')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(prescriptions_bp, url_prefix='/api/prescriptions')
    app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(pharmacy_bp, url_prefix='/api/pharmacy')
    app.register_blueprint(insights_bp, url_prefix='/api/insights')
    app.register_blueprint(beds_bp, url_prefix='/api/beds')
    app.register_blueprint(symptoms_bp, url_prefix='/api/symptoms')

    # Special routes
    @app.route('/api/hospitals/nearby', methods=['GET'])
    def root_hospitals():
        from routes.emergency import get_nearby_hospitals
        return get_nearby_hospitals()

    @app.route('/api/emergency/log', methods=['POST'])
    def root_emergency_log():
        from routes.emergency import log_emergency
        return log_emergency()

    # 404 Handler
    @app.errorhandler(404)
    def resource_not_found(e):
        return jsonify(
            error=str(e),
            message="Route not found on Flask backend. May not be migrated yet."
        ), 404

    # SocketIO Handlers
    @socketio.on('connect')
    def handle_connect():
        print('Client connected:', request.sid)

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected:', request.sid)

    @socketio.on('join-room')
    def on_join(room):
        join_room(room)
        print(f'User joined room: {room}')

    @socketio.on('leave-room')
    def on_leave(room):
        leave_room(room)
        print(f'User left room: {room}')

    @socketio.on('send-message')
    def handle_send_message(data):
        room = data.get('conversationId')
        emit('new-message', data, room=room)
        print(f'Message sent to room {room}: {data.get("content")}')

    @socketio.on('typing')
    def handle_typing(data):
        room = data.get('conversationId')
        emit('user-typing', data, room=room, include_self=False)

    # Initialize database
    from utils.db import init_db
    init_db()

    return app, socketio


app, socketio = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))

    # IMPORTANT: use socketio.run()
    socketio.run(
        app,
        host="0.0.0.0",
        port=port,
        debug=True
    )