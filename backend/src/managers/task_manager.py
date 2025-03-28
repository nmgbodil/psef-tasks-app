from datetime import datetime

from src.models.assignment_model import Status
from src.dals import user_dal, task_dal, assignment_dal
from src.utils import format_response
from src.utils.recommendation import recommend_tasks_for_user
from src.utils.analytics import calculate_task_analytics

def get_all_tasks(user_id):
    results = {'message': None, 'tasks': None, 'sorted_tasks': None}

    try:
        if not user_dal.check_user_exists_by_id(user_id):
            results['message'] = 'DNE'
            return results

        task_list = task_dal.get_all_tasks()
        response = format_response.handleAllAssignments(task_list)
        results['tasks'] = response[0]
        results['sorted_tasks'] = response[1]
        results['message'] = 'tasks successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving all tasks: {str(e)}')
        return 'error'

def get_my_pending_tasks(user_id):
    results = {'message': None, 'task_list': None}

    try:
        if not user_dal.check_user_exists_by_id(user_id):
            results['message'] = 'DNE'
            return results

        task_list = assignment_dal.get_my_pending_assignments(user_id)
        results['task_list'] = format_response.handleMyTasks(task_list)
        results['message'] = 'pending user tasks successfully retrieved'
        return results

    except Exception as e:
        print(f'Error retrieving pending user tasks: {str(e)}')
        return 'error'
    
def update_status(user_id, status, assignment_id):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Ensure assignment is assigned to user
        assignment = assignment_dal.get_assignment_by_id(assignment_id)
        if assignment.user_id != user_id:
            return 'user unauthorized'

        if assignment.status != Status.PENDING:
            return 'task not pending'
        
        task_details = task_dal.get_task_by_id(assignment.task_id)
        if task_details.end_time >= datetime.now():
            return 'task not over'

        assignment_dal.update_status(assignment_id, status)
        return 'task status successfully updated'

    except Exception as e:
        print(f'Error updating task status: {str(e)}')
        return 'error'

def get_task_recommendations(user_id: str):
    results = {'message': None, 'recommended_tasks': None}
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            results['message'] = 'DNE'
            return results
        # Call the hybrid recommendation system
        recommended_tasks = recommend_tasks_for_user(user_id)
        results['recommended_tasks'] = recommended_tasks
        results['message'] = 'tasks successfully recommended'
        return results
    except Exception as e:
        print(f"Error fetching task recommendations: {e}")
        return 'error'

def get_task_analytics(user_id: str):
    results = {'message': None, 'analytics': None}
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            results['message'] = 'DNE'
            return results
        # Call the analytics utility function
        analytics = calculate_task_analytics(user_id)
        results['analytics'] = analytics
        results['message'] = 'analytics successfully retrieved'
        return results
    except Exception as e:
        print(f"Error fetching task analytics: {e}")
        return 'error'