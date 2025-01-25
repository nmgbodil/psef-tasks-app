from src.models.user_model import UserRole
from src.models.assignment_model import Assignment
from src.dals import task_dal, user_dal, assignment_dal
from src.utils import format_response

def signup_task(user_id: str, task_id: str):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for users only
        user = user_dal.get_user_by_id(user_id)
        if user.role != UserRole.USER:
            return 'user unauthorized'
        
        if assignment_dal.check_assignment_exists(task_id, user_id):
            return 'assignment already exists'
        
        task = task_dal.get_task_by_id(task_id)

        if not assignment_dal.check_user_free_at_time(user_id, task.start_time, task.end_time):
            return 'user not free'
        
        if not task.max_participants or assignment_dal.get_task_assignment_count(task_id) < task.max_participants:
            assignment = Assignment(
                task_id=task_id,
                user_id=user_id,
                assigned_by=user.email
            )

            assignment_dal.assign_task(assignment)
            return 'assignment successfully created'
        
        else:
            return 'maximum participants reached'
    
    except Exception as e:
        print(f'Error signing up for task: {str(e)}')
        return 'error'
    
def drop_task(user_id: str, assignment_id: str):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'

        # Access control for users only
        if user_dal.get_user_role(user_id) != UserRole.USER:
            return 'user unauthorized'
        
        # Ensure assignment is assigned to user
        assignment = assignment_dal.get_assignment_by_id(assignment_id)
        if assignment.user_id != user_id:
            return 'user unauthorized'
        
        assignment_dal.delete_assignment(assignment_id)
        return 'task successfully dropped'
    
    except Exception as e:
        print(f'Error dropping task: {str(e)}')
        return 'error'
    
def get_my_tasks(user_id: str):
    results = {'message': None, 'task_list': None}

    try:
        if not user_dal.check_user_exists_by_id(user_id):
            results['message'] = 'DNE'
            return results
        # Access control for users only
        if user_dal.get_user_role(user_id) != UserRole.USER:
            results['message'] = 'user unauthorized'
            return results
        
        task_list = assignment_dal.get_my_assignments(user_id)
        results['task_list'] = format_response.handleMyTasks(task_list)
        results['message'] = 'user tasks successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving user tasks: {str(e)}')
        return 'error'
