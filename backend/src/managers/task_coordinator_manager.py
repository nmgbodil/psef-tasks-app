from datetime import datetime

from src.models.task_model import Task
from src.models.user_model import UserRole
from src.models.assignment_model import Assignment, Status
from src.dals import task_dal, user_dal, assignment_dal
from src.utils import format_response

def create_task(user_id: str, task: Task):    
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'

        if task_dal.check_task_exists(task):
            return 'task exists'

        task_dal.create_task(task)
        return 'task successfully created'
    
    except Exception as e:
        print(f'Error creating task: {str(e)}')
        return 'error'
    
def assign_task(user_id: str, assignee_id: str, task_id: str):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for coordinators only
        assigner = user_dal.get_user_by_id(user_id)
        if assigner.role != UserRole.COORDINATOR:
            return 'user unauthorized'

        if not user_dal.check_user_exists_by_id(assignee_id):
            return 'task doer does not exist'
        
        if assignment_dal.check_assignment_exists(task_id, assignee_id):
            return 'assignment already exists'
        
        task = task_dal.get_task_by_id(task_id)

        if not assignment_dal.check_user_free_at_time(assignee_id, task.start_time, task.end_time):
            return 'assignee not free'
        
        if not task.max_participants or assignment_dal.get_task_assignment_count(task_id) < task.max_participants:
            assignment = Assignment(
                task_id=task_id,
                user_id=assignee_id,
                assigned_by=assigner.email
            )

            assignment_dal.assign_task(assignment)
            return 'assignment successfully created'
        
        else:
            return 'maximum participants reached'
        
    except Exception as e:
        print(f'Error making assignment: {str(e)}')
        return 'error'
    
def delete_task(user_id: str, task_id: str):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        task_dal.delete_task(task_id)
        return 'task successfully deleted'
    
    except Exception as e:
        print(f'Error deleting task: {str(e)}')
        return 'error'

def delete_assignment(user_id: str, assignment_id: str):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        assignment_dal.delete_assignment(assignment_id)
        return 'assignment successfully deleted'
    
    except Exception as e:
        print(f'Error deleting assignment: {str(e)}')
        return 'error'
    
def update_task(user_id: str, updates: dict, task_id: str):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        updates = format_response.handleUpdates(updates)
        task_dal.update_task(task_id, updates)
        return 'task successfully updated'
    
    except Exception as e:
        print(f'Error updating task: {str(e)}')
        return 'error'

def update_assignment(user_id: str, assignee_id: str, assignment_id: str):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'

        if not user_dal.check_user_exists_by_id(assignee_id):
            return 'task doer does not exist'

        assignment = assignment_dal.get_assignment_by_id(assignment_id)
        if assignment_dal.check_assignment_exists(assignment.task_id, assignee_id):
            return 'assignment already exists'
        
        task = task_dal.get_task_by_id(assignment.task_id)
        if not assignment_dal.check_user_free_at_time(assignee_id, task.start_time, task.end_time):
            return 'assignee not free'
        
        assignment_dal.update_assignment(assignment_id, assignee_id)
        return 'assignment successfully updated'
    
    except Exception as e:
        print(f'Error updating assignment: {str(e)}')
        return 'error'

def get_all_users(user_id):
    results = {'message': None, 'user_list': None}

    try:
        if not user_dal.check_user_exists_by_id(user_id):
            results['message'] = 'DNE'
            return results

        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            results['message'] = 'user unauthorized'
            return results
        
        results['user_list'] = user_dal.get_all_users()
        results['message'] = 'users successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving all users: {str(e)}')
        return 'error'

def override_status(user_id, status, assignment_id):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        assignment = assignment_dal.get_assignment_by_id(assignment_id)
        
        task_details = task_dal.get_task_by_id(assignment.task_id)
        if task_details.end_time >= datetime.now():
            return 'task not over'

        assignment_dal.update_status(assignment_id, status)
        return 'task status successfully overridden'
    
    except Exception as e:
        print(f'Error overriding task status: {str(e)}')
        return 'error'

def delete_user(user_id, user_to_delete):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        if not user_dal.check_user_exists_by_id(user_to_delete):
            return 'user to delete does not exist'
        
        user_dal.delete_user(user_to_delete)
        return 'user deleted successfully'
    
    except Exception as e:
        print(f'Error deleting user: {str(e)}')
        return 'error'