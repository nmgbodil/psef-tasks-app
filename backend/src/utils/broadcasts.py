from flask import current_app, jsonify
from flask_socketio import emit

def broadcast_tasks_update(updated_tasks):
    # Broadcast updated tasks to all connected clients
    socketio = current_app.extensions['socketio']
    socketio.emit('tasks_updated', updated_tasks)