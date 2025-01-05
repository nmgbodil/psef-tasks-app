from src.models.task_model import Task
from src.models.user_model import UserRole
from src.models.assignment_model import Assignment
from src.dals import task_dal
from src.dals import user_dal
from src.dals import assignment_dal

def create_task(user_id: str, task: Task):    
    try:
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
        # Access control for coordinators only
        assigner = user_dal.get_user_by_id(user_id)
        if assigner.role != UserRole.COORDINATOR:
            return 'user unauthorized'
        
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
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        assignment_dal.delete_assignment(assignment_id)
        return 'assignment successfully deleted'
    
    except Exception as e:
        print(f'Error deleting assignment: {str(e)}')
        return 'error'
    
def update_task(user_id: str, updates: dict, task_id: str):
    def handleUpdates(updates):
        new_updates = {key: value for key, value in updates.items() if value}
        return new_updates
    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        updates = handleUpdates(updates)
        task_dal.update_task(task_id, updates)
        return 'task successfully updated'
    
    except Exception as e:
        print(f'Error updating task: {str(e)}')
        return 'error'

def update_assignment(user_id: str, assignee_id: str, assignment_id: str):
    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'

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

def get_all_tasks(user_id: str):
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
            tasks[task_id]['start_time'] = task[4]
            tasks[task_id]['end_time'] = task[5]
            tasks[task_id]['max_participants'] = task[6]
            tasks[task_id]['users'] = []

            sorted_tasks.append(task_id)

            if task[7]:
                pairs = task[7].split(',')
                for pair in pairs:
                    user_id, assignment_id = pair.split(':')
                    tasks[task_id]['users'].append(handleUserData(user_id, assignment_id))
        
        return tasks, sorted_tasks
    

    results = {'message': None, 'task_list': None, 'sorted_tasks': None}

    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            results['message'] = 'user unauthorized'
            return results
        
        task_list = task_dal.get_all_tasks()
        response = handleAllAssignments(task_list)
        results['task_list'] = response[0]
        results['sorted_tasks'] = response[1]
        results['message'] = 'tasks successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving all tasks: {str(e)}')
        return 'error'

# def get_all_assignments(user_id):
#     def handleUserData(assignment):
#         user = user_dal.get_user_by_id(assignment['user_id'])
#         user_data = {
#             'user_id': user.user_id,
#             'first_name': user.first_name,
#             'last_name': user.last_name,
#             'assignment_id': assignment['assignment_id']
#         }
#         return user_data

#     def handleAllAssignments(assignment_list):
#         assignment_by_task = {}
#         sorted_tasks = []

#         for assignment in assignment_list:
#             task_id = assignment['task_id']
#             user_data = handleUserData(assignment)
    
#             if task_id not in assignment_by_task:
#                 assignment_by_task[task_id] = {
#                     'task_name': assignment['task_name'],
#                     'description': assignment['description'],
#                     'users': [],
#                     'start_time': assignment['start_time'],
#                     'end_time': assignment['end_time']
#                 }
#                 sorted_tasks.append(task_id)
    
#             assignment_by_task[task_id]['users'].append(user_data)
        
#         return assignment_by_task, sorted_tasks


#     results = {'message': None, 'assignment_list': None, 'sorted_tasks': None}

#     try:
#         # Access control for coordinators only
#         if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
#             results['message'] = 'user unauthorized'
#             return results
        
#         assignment_list = assignment_dal.get_all_assignments()
#         response = handleAllAssignments(assignment_list)
#         results['assignment_list'] = response[0]
#         results['sorted_tasks'] = response[1]
#         results['message'] = 'assignments successfully retrieved'
#         return results
    
#     except Exception as e:
#         print(f'Error retrieving all assignments: {str(e)}')
#         return 'error'

def get_all_users(user_id):
    results = {'message': None, 'user_list': None}

    try:
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