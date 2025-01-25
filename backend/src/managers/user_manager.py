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

def update_first_name(user_id, first_name):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'
        
        user_dal.update_user_first_name(user_id, first_name)
        return 'first name updated successfully'
    
    except Exception as e:
        print(f'Error updating first name: {str(e)}')
        return 'error'

def update_last_name(user_id, last_name):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'
        
        user_dal.update_user_last_name(user_id, last_name)
        return 'last name updated successfully'
    
    except Exception as e:
        print(f'Error updating last name: {str(e)}')
        return 'error'

def delete_user(user_id):
    try:
        if not user_dal.check_user_exists_by_id(user_id):
            return 'DNE'
        
        user_dal.delete_user(user_id)
        return 'user deleted successfully'

    except Exception as e:
        print(f'Error deleting user: {str(e)}')
        return 'error'