from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.managers import user_manager
from src.managers import task_manager
from src.utils import broadcasts
from src.constants.http_status_codes import *

user = Blueprint("user", __name__, url_prefix="/api/v1/user")

@user.get("/my_user")
@jwt_required()
def get_user_data():
    user_id = get_jwt_identity()

    try:
        result = user_manager.get_user_data(user_id)
        message = result.get('message')

        if message == 'user data successfully retrieved':
            user_data = result.get('user_data')
            return jsonify({'message': 'User data successfully retrieved', 'user': user_data}), HTTP_200_OK
        elif message == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@user.patch("/update_first_name")
@jwt_required()
def update_first_name():
    user_id = get_jwt_identity()

    try:
        data = request.get_json()
        required_fields = ['first_name']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing fields: {', '.join(missing_fields)}'}), HTTP_400_BAD_REQUEST
        
        first_name = data.get("first_name")
        
        result = user_manager.update_first_name(user_id, first_name)

        if result == 'first name updated successfully':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)
        
            return jsonify({'message': 'First name updated successfully'}), HTTP_200_OK
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@user.patch("/update_last_name")
@jwt_required()
def update_last_name():
    user_id = get_jwt_identity()

    try:
        data = request.get_json()
        required_fields = ['last_name']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing fields: {', '.join(missing_fields)}'}), HTTP_400_BAD_REQUEST
        
        last_name = data.get("last_name")
        
        result = user_manager.update_last_name(user_id, last_name)

        if result == 'last name updated successfully':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)
        
            return jsonify({'message': 'Last name updated successfully'}), HTTP_200_OK
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@user.delete("/delete_user")
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()

    try:
        result = user_manager.delete_user(user_id)

        if result == 'user deleted successfully':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)

            return jsonify({'message': 'User deleted successfully'}), HTTP_200_OK
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR