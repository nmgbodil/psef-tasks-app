from src.dals import user_dal

def handleUpdates(updates):
        new_updates = {key: value for key, value in updates.items() if value}
        return new_updates

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

def handleMyTasks(task_list):
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