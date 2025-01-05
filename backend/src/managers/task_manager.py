from src.models.task_model import Task
from src.models.user_model import User, UserRole
from src.dals import task_dal
from src.dals import user_dal

def get_user_data(user_id):
    results = {'message': None, 'user_data': None}

    try:
        if not user_dal.check_user_exists_by_id(user_id):
            results['message'] = 'DNE'
            return results
        
        user_data = user_dal.get_user_by_id(user_id)
        results['user_data'] = user_data.dict(exclude={"password_hash", "verified"})
        results['message'] = 'user data successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving user data: {str(e)}')
        return 'error'

def get_all_tasks():
    def handleUserData(user_id, assignment_id):
        user = user_dal.get_user_by_id(user_id)
        user_data = {
            'user_id': user.user_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'assignment_id': assignment_id
        }
        return user_data

    def handleAllAssignments(task_list):
        tasks = {}
        sorted_tasks = []

        for task in task_list:
            task_id = task[0]
            tasks[task_id] = {}
            tasks[task_id]['task_name'] = task[1]
            tasks[task_id]['task_type'] = task[2]
            tasks[task_id]['description'] = task[3]
            tasks[task_id]['start_time'] = task[4].isoformat()
            tasks[task_id]['end_time'] = task[5].isoformat()
            tasks[task_id]['max_participants'] = task[6]
            tasks[task_id]['users'] = []

            sorted_tasks.append(task_id)

            if task[7]:
                pairs = task[7].split(',')
                for pair in pairs:
                    user_id, assignment_id = pair.split(':')
                    tasks[task_id]['users'].append(handleUserData(user_id, assignment_id))
        
        return tasks, sorted_tasks
    

    results = {'message': None, 'tasks': None, 'sorted_tasks': None}

    try:
        task_list = task_dal.get_all_tasks()
        response = handleAllAssignments(task_list)
        results['tasks'] = response[0]
        results['sorted_tasks'] = response[1]
        results['message'] = 'tasks successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving all tasks: {str(e)}')
        return 'error'

def get_my_past_tasks():
    results = {'message': None, 'task_list': None,}