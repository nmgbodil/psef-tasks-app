import eventlet
eventlet.monkey_patch() # Handles multiple requests asynchronously
from flask_socketio import SocketIO

from src import create_app

# Creat app instance
app = create_app()

# Initialize Flask-SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)