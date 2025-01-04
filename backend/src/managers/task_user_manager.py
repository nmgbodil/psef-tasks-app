from src.models.task_model import Task, TaskStatus
from src.models.user_model import User, UserRole
from src.models.assignment_model import Assignment
from src.dals import task_dal
from src.dals import user_dal
from src.dals import assignment_dal

def signup_task(user_id: str, task_id: str):
    try:
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
        # Access control for users only
        if user_dal.get_user_role(user_id) != UserRole.USER:
            return 'user unauthorized'
        
        print('checkpoint')
        assignment = assignment_dal.get_assignment_by_id(assignment_id)
        if assignment.user_id != user_id:
            return 'user unauthorized'
        
        assignment_dal.delete_assignment(assignment_id)
        return 'task successfully dropped'
    
    except Exception as e:
        print(f'Error dropping task: {str(e)}')
        return 'error'
    
def get_my_tasks(user_id: str):
    def handleTasks(task_list):
        formatted_task_list = []

        for task in task_list:
            formatted_task = {}
            formatted_task['assignment_id'] = task[0]
            formatted_task['task_id'] = task[1]
            formatted_task['task_name'] = task[2]
            formatted_task['task_type'] = task[3]
            formatted_task['description'] = task[4]
            formatted_task['max_participants'] = task[5]
            formatted_task['start_time'] = task[6]
            formatted_task['end_time'] = task[7]

            formatted_task_list.append(formatted_task)
        
        return formatted_task_list

    results = {'message': None, 'task_list': None}

    try:
        # Access control for users only
        if user_dal.get_user_role(user_id) != UserRole.USER:
            results['message'] = 'user unauthorized'
            return results
        
        task_list = assignment_dal.get_my_assignments(user_id)
        results['task_list'] = handleTasks(task_list)
        results['message'] = 'user tasks successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving user tasks: {str(e)}')
        return 'error'
