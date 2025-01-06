from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.managers import task_manager
from src.models.assignment_model import Status
from src.constants.http_status_codes import *

task = Blueprint("task", __name__, url_prefix="/api/v1/tasks")

@task.get("/user")
@jwt_required()
def get_user_data():
    user_id = get_jwt_identity()

    try:
        result = task_manager.get_user_data(user_id)
        message = result.get('message')

        if message == 'user data successfully retrieved':
            user_data = result.get('user_data')
            return jsonify({'message': 'User data successfully retrieved', 'user': user_data}), HTTP_200_OK
        elif message == 'DNE':
            return jsonify({'error': 'This user does not exist'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@task.get("/all_tasks")
@jwt_required()
def get_all_tasks():
    try:
        result = task_manager.get_all_tasks()
        message = result.get('message')

        if message == 'tasks successfully retrieved':
            tasks = result.get('tasks')
            sorted_tasks = result.get('sorted_tasks')
            return jsonify({'message': 'Tasks successfully retrieved', 'tasks': tasks, 'sorted_tasks': sorted_tasks}), HTTP_200_OK
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@task.get("/my_pending_tasks")
@jwt_required()
def get_my_pending_tasks():
    user_id = get_jwt_identity()

    try:
        result = task_manager.get_my_pending_tasks(user_id)
        message = result.get('message')

        if message == 'pending user tasks successfully retrieved':
            task_list = result.get('task_list')
            return jsonify({'message': 'Pending user tasks successfully retrieved', 'pending_user_tasks': task_list}), HTTP_200_OK
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@task.patch("/update_status/<string:assignment_id>")
@jwt_required()
def update_status(assignment_id):
    user_id = get_jwt_identity()

    try:
        data = request.get_json()
        required_fields = ['status']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing fields: {', '.join(missing_fields)}'}), HTTP_400_BAD_REQUEST
        
        status = data.get('status')
        if status != Status.COMPLETED and status != Status.INCOMPLETED:
            return jsonify({'error': f'Invalid status data: {status}'}), HTTP_400_BAD_REQUEST

        result = task_manager.update_status(user_id, status, assignment_id)
        
        if result == 'task status successfully updated':
            return jsonify({'message': 'Task status successfully updated'}), HTTP_200_OK
        elif result == 'task not pending':
            return jsonify({'error': 'Task status already updated'}), HTTP_208_ALREADY_REPORTED
        elif result == 'task not over':
            return jsonify({'message': 'Task is not over yet'}), HTTP_400_BAD_REQUEST
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR