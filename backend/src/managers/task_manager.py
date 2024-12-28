from src.models.task_model import Task, TaskStatus
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