from src.utils.db import sync_db_util
from src.models.user_model import User

def get_user_by_id(user_id):
    statement = f'''SELECT * FROM users WHERE user_id = '{user_id}';'''

    user_id, email, password_hash, created_at, updated_at, first_name, last_name, verified, role = sync_db_util.execute_query_fetchone(statement)

    user = User(
        user_id=user_id,
        email=email,
        password_hash=password_hash,
        first_name=first_name,
        last_name=last_name,
        verified=verified,
        role=role
    )

    # returns None if no record is found
    return user


def get_user_by_email(email):
    statement = f'''SELECT * FROM users WHERE email = '{email}';'''

    user_id, email, password_hash, created_at, updated_at, first_name, last_name, verified, role = sync_db_util.execute_query_fetchone(statement)

    user = User(
        user_id=user_id,
        email=email,
        password_hash=password_hash,
        first_name=first_name,
        last_name=last_name,
        verified=verified,
        role=role
    )

    # returns None if no record is found
    return user

def get_user_role(user_id):
    statement = f'''SELECT role FROM users WHERE user_id = '{user_id}';'''

    record = sync_db_util.execute_query_fetchone(statement)

    return record[0]

def get_all_users():
    statement = f'''SELECT user_id, first_name, last_name, email, role FROM users WHERE verified = TRUE ORDER BY first_name ASC;'''

    users = sync_db_util.execute_query_fetchall(statement)
    user_list = []

    for user in users:
        user_obj = User(
            user_id=user[0],
            first_name=user[1],
            last_name=user[2],
            email=user[3],
            role=user[4]
        )
        user_list.append(user_obj.dict(exclude={"password_hash", "verified"}))
    
    return user_list

def check_user_exists_by_id(user_id):
    statement = f'''SELECT EXISTS(SELECT 1 FROM users WHERE user_id = '{user_id}');'''

    record = sync_db_util.execute_query_fetchone(statement)

    return record[0]

def check_user_exists_by_email(email):
    statement = f'''SELECT EXISTS(SELECT 1 FROM users WHERE email = '{email}');'''

    record = sync_db_util.execute_query_fetchone(statement)

    return record[0]

def set_user_updated_at(user_id):
    statement = f'''UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = '{user_id}';'''
    
    affected_rows = sync_db_util.execute_query_return_row_count(statement)

    # Should return 0 if the user_id does not exist, else should return 1
    return affected_rows

def register(user: User):
    statement = f'''INSERT INTO users (user_id, password_hash, email, created_at, updated_at, first_name, last_name, verified) 
                    VALUES('{user.user_id}', '{user.password_hash}', '{user.email}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{user.first_name}', '{user.last_name}', FALSE);
                '''
    
    sync_db_util.execute_query_insert(statement)

def delete_user(user_id):
    statement = f'''DELETE FROM users WHERE user_id = '{user_id}';'''

    sync_db_util.execute_query_return_row_count(statement)

def verify_user(user_id):
    statement = f'''UPDATE users SET verified = TRUE WHERE user_id = '{user_id}';'''

    set_user_updated_at(user_id)

    sync_db_util.execute_query_return_row_count(statement)

def update_user_password(user_id, password_hash):
    statement = f'''UPDATE users SET password_hash = '{password_hash}' WHERE user_id = '{user_id}';'''

    set_user_updated_at(user_id)

    sync_db_util.execute_query_return_row_count(statement)