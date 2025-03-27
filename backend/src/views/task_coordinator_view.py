from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.models.task_model import Task
from src.managers import task_manager, task_coordinator_manager
from src.constants.http_status_codes import *
from src.utils import broadcasts
from src.models.assignment_model import Status
from src.utils.audit_logger import log_action
from src.utils.analytics import calculate_task_analytics
from src.models.versioning import TaskVersion

task_coordinator = Blueprint("task_coordinator", __name__, url_prefix="/api/v1/tasks/coordinator")

@task_coordinator.post("/create")
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    
    try:
        data = request.get_json()
        required_fields = ['task_name', 'task_type', 'description', 'start_time', 'end_time']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing fields: {', '.join(missing_fields)}'}), HTTP_400_BAD_REQUEST
        
        
        task = Task(
            task_name=data.get('task_name'),
            task_type=data.get('task_type'),
            description=data.get('description'),
            start_time=data.get('start_time'),
            end_time=data.get('end_time'),
            max_participants=data.get('max_participants')
        )

        # Attempt to create the task
        result = task_coordinator_manager.create_task(user_id, task)

        if result == 'task successfully created':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)

            log_action(user_id, "create_task", data)  # Log action

            return jsonify({'message': 'Task successfully created'}), HTTP_201_CREATED
        elif result == 'task exists':
            return jsonify({'error': 'Task has already been created'}), HTTP_409_CONFLICT
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR


@task_coordinator.post("/assign")
@jwt_required()
def assign_task():
    user_id = get_jwt_identity()

    try:
        data = request.get_json()
        required_fields = ['assignee_id', 'task_id']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing fields: {', '.join(missing_fields)}'}), HTTP_400_BAD_REQUEST
        
        task_id = data.get('task_id')
        assignee_id = data.get('assignee_id')

        result = task_coordinator_manager.assign_task(user_id, assignee_id, task_id)

        if result == 'assignment successfully created':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)

            return jsonify({'message': 'Assignment has been successfully created'}), HTTP_201_CREATED
        elif result == 'assignment already exists':
            return jsonify({'error': 'Assignment already exists'}), HTTP_409_CONFLICT
        elif result == 'assignee not free':
            return jsonify({'error': 'Task doer not free at this time'}), HTTP_409_CONFLICT
        elif result == 'maximum participants reached':
            return jsonify({'error': 'Maximum participants reached'}), HTTP_400_BAD_REQUEST
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        elif result == 'task doer does not exist':
            return jsonify({'error': 'Task doer does not exist'}), HTTP_400_BAD_REQUEST
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
    
@task_coordinator.delete("delete_task/<string:task_id>")
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()

    try:
        result = task_coordinator_manager.delete_task(user_id, task_id)

        if result == 'task successfully deleted':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)
            
            return jsonify({'message': 'Task successfully deleted'}), HTTP_200_OK
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
    
@task_coordinator.delete("/delete_assignment/<string:assignment_id>")
@jwt_required()
def delete_assignment(assignment_id):
    user_id = get_jwt_identity()

    try:
        result = task_coordinator_manager.delete_assignment(user_id, assignment_id)

        if result == 'assignment successfully deleted':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)
            
            return jsonify({'message': 'Assignment successfully deleted'}), HTTP_200_OK
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
    
@task_coordinator.patch("/update_task/<string:task_id>")
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No fields to update"}), HTTP_400_BAD_REQUEST
        
        misplaced_fields = [field for field in data if field not in Task.__fields__]
        if misplaced_fields:
            return jsonify({"error": f"Following fields are not valid: {', '.join(misplaced_fields)}"}), HTTP_400_BAD_REQUEST

        # Fetch the current state of the task from the database
        current_task = task_manager.get_task_by_id(task_id)
        if not current_task:
            return jsonify({"error": "Task not found"}), HTTP_404_NOT_FOUND

        # Create a version using the current state of the task
        TaskVersion.create_version(task_id, current_task)

        # Proceed with updating the task
        result = task_coordinator_manager.update_task(user_id, data, task_id)

        if result == 'task successfully updated':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)
            
            return jsonify({'message': 'Task successfully updated'}), HTTP_200_OK
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
    
@task_coordinator.patch("/update_assignment/<string:assignment_id>")
@jwt_required()
def update_assignment(assignment_id):
    user_id = get_jwt_identity()

    try:
        data = request.get_json()
        required_fields = ["assignee_id"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), HTTP_400_BAD_REQUEST
        
        assignee_id = data.get('assignee_id')
        result = task_coordinator_manager.update_assignment(user_id, assignee_id, assignment_id)

        if result == 'assignment successfully updated':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)
            
            return jsonify({'message': 'Assignment successfully updated'}), HTTP_200_OK
        elif result == 'assignment already exists':
            return jsonify({'error': 'Assignment already exists'}), HTTP_409_CONFLICT
        elif result == 'assignee not free':
            return jsonify({'error': 'Task doer not free at this time'}), HTTP_409_CONFLICT
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        elif result == 'task doer does not exist':
            return jsonify({'error': 'Task doer does not exist'}), HTTP_400_BAD_REQUEST
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@task_coordinator.get("/all_users")
@jwt_required()
def get_all_users():
    user_id = get_jwt_identity()

    try:
        result = task_coordinator_manager.get_all_users(user_id)
        message = result.get('message')

        if message == 'users successfully retrieved':
            user_list = result.get('user_list')
            return jsonify({'message': 'Users successfully retrieved', 'users': user_list}), HTTP_200_OK
        elif message == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        elif message == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@task_coordinator.patch("/override_status/<string:assignment_id>")
@jwt_required()
def override_status(assignment_id):
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
        
        result = task_coordinator_manager.override_status(user_id, status, assignment_id)

        if result == 'task status successfully overridden':
            return jsonify({'message': 'Task status successfully overriden'}), HTTP_200_OK
        elif result == 'task not over':
            return jsonify({'message': 'Task is not over yet'}), HTTP_400_BAD_REQUEST
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        elif result == 'DNE':
            return jsonify({'error': 'Account deleted'}), HTTP_403_FORBIDDEN
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@task_coordinator.delete("/delete_user/<string:user_to_delete>")
@jwt_required()
def delete_user(user_to_delete):
    user_id = get_jwt_identity()

    try:
        result = task_coordinator_manager.delete_user(user_id, user_to_delete)

        if result == 'user deleted successfully':
            # Retrieve the updated task list to broadcast
            updated_tasks = task_manager.get_all_tasks(user_id)

            # Broadcast updated task list
            broadcasts.broadcast_tasks_update(updated_tasks)

            return jsonify({'message': 'User deleted successfully'}), HTTP_200_OK
        elif result == 'DNE':
            return jsonify({'error': 'This user no longer exists'}), HTTP_403_FORBIDDEN
        elif result == 'user to delete does not exist':
            return jsonify({'error': 'The user you tried to delete does not exist'}), HTTP_400_BAD_REQUEST
        elif result == 'user unauthorized':
            return jsonify({'error': 'Unauthorized'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR

    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@task_coordinator.get("/analytics")
@jwt_required()
def get_task_analytics():
    user_id = get_jwt_identity()
    try:
        analytics = calculate_task_analytics(user_id)
        return jsonify({'analytics': analytics}), HTTP_200_OK
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR