from flask import Blueprint, request, jsonify, Response
from pydantic import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.managers import task_manager
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
    user_id = get_jwt_identity()

    try:
        result = task_manager.get_all_tasks()
        message = result.get('message')

        if message == 'tasks successfully retrieved':
            task_list = result.get('task_list')
            sorted_tasks = result.get('sorted_tasks')
            return jsonify({'message': 'Tasks successfully retrieved', 'tasks': task_list, 'sorted_tasks': sorted_tasks}), HTTP_200_OK
        elif message == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR