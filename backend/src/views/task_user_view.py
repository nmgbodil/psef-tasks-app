from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.managers import task_manager, task_user_manager
from src.constants.http_status_codes import *
from src.utils import broadcasts

task_user = Blueprint("task_user", __name__, url_prefix="/api/v1/tasks/user")

@task_user.post("/signup")
@jwt_required()
def signup_task():
    user_id= get_jwt_identity()

    try:
        data = request.get_json()
        required_fields = ['task_id']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing fields: {', '.join(missing_fields)}'}), HTTP_400_BAD_REQUEST
        
        task_id = data.get('task_id')

        result = task_user_manager.signup_task(user_id, task_id)

        if result == 'assignment successfully created':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks()

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)
            
            return jsonify({'message': 'Assignment has been successfully created'}), HTTP_201_CREATED
        elif result == 'assignment already exists':
            return jsonify({'error': 'Assignment already exists'}), HTTP_409_CONFLICT
        elif result == 'user not free':
            return jsonify({'error': 'Task doer not free at this time'}), HTTP_409_CONFLICT
        elif result == 'maximum participants reached':
            return jsonify({'error': 'Maximum participants reached'}), HTTP_400_BAD_REQUEST
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
    
@task_user.delete("/drop_task/<string:assignment_id>")
@jwt_required()
def drop_task(assignment_id):
    user_id = get_jwt_identity()

    try:
        result = task_user_manager.drop_task(user_id, assignment_id)

        if result == 'task successfully dropped':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks()

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)
            
            return jsonify({'message': 'Task successfully dropped'}), HTTP_200_OK
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
    
@task_user.get("/my_tasks")
@jwt_required()
def get_my_tasks():
    user_id = get_jwt_identity()

    try:
        result = task_user_manager.get_my_tasks(user_id)
        message = result.get('message')

        if message == 'user tasks successfully retrieved':
            task_list = result.get('task_list')
            return jsonify({'message': 'User tasks successfully retrieved', 'user_tasks': task_list}), HTTP_200_OK
        elif message == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR