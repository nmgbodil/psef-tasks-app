import sync_db_util

def create_user_table():
    statement = f'''
    CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_name VARCHAR(100) not null,
    last_name VARCHAR(100) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id),
    UNIQUE (email)
    );
    '''
    try:
        sync_db_util.execute_query_insert(statement)
        print("Users table created successfully")
    except Exception as e:
        print(f"Error creating users table: {e}")

def create_task_table():
    statement = f'''
    CREATE TABLE IF NOT EXISTS tasks (
    task_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    description VARCHAR(320) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    max_participants INT,
    status task_status DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    '''
    try:
        sync_db_util.execute_query_insert(statement)
        print("tasks table created successfully")
    except Exception as e:
        print(f"Error creating tasks table: {e}")

def create_task_status_type():
    statement = '''
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
            CREATE TYPE task_status AS ENUM ('Pending', 'Completed');
        END IF;
    END $$;
    '''

    try:
        sync_db_util.execute_query_insert(statement)
        print("Enum type 'task_status' created successfully")
    except Exception as e:
        print(f'Error creating enum type: {e}')

def add_status_type():
    statement = '''ALTER TYPE task_status ADD VALUE 'INCOMPLETE';'''

    try:
        sync_db_util.execute_query_insert(statement)
        print("Enum type 'task_status' created successfully")
    except Exception as e:
        print(f'Error creating enum type: {e}')

def create_assignment_table():
    statement = f'''
    CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id INT NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    assigned_by VARCHAR(320) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    '''
    try:
        sync_db_util.execute_query_insert(statement)
        print("assignments table created successfully")
    except Exception as e:
        print(f"Error creating assignments table: {e}")

def add_role():
    statement = f'''
    ALTER TABLE users
    ADD COLUMN role user_roles DEFAULT 'User' NOT NULL;
    '''

    try:
        sync_db_util.execute_query_insert(statement)
        print("Role column successfully added to users table")
    except Exception as e:
        print(f'Error adding role column to users table: {e}')

def make_user_coordinator(email: str):
    statement = f'''
    UPDATE users
    SET role = 'Coordinator'
    WHERE email = '{email}';
    '''

    try:
        sync_db_util.execute_query_insert(statement)
        print(f'User {email} successfully made coordinator')
    except Exception as e:
        print(f'Error making {email} coordinator: {e}')

def create_user_roles_type():
    statement = '''
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_roles') THEN
            CREATE TYPE user_roles AS ENUM ('User', 'Coordinator');
        END IF;
    END $$;
    '''

    try:
        sync_db_util.execute_query_insert(statement)
        print("Enum type 'user_roles' created successfully")
    except Exception as e:
        print(f'Error creating enum type: {e}')

def delete_tasks_task_status():
    statement = f'''ALTER TABLE tasks DROP COLUMN status;'''

    try:
        sync_db_util.execute_query_insert(statement)
        print("Column 'status' in tasks deleted successfully")
    except Exception as e:
        print(f'Error deleting status column: {e}')

def add_assignments_status():
    statement = f'''
    ALTER TABLE assignments
    ADD COLUMN status task_status DEFAULT 'Pending' NOT NULL;
    '''

    try:
        sync_db_util.execute_query_insert(statement)
        print("Status column successfully added to assignments table")
    except Exception as e:
        print(f'Error adding status column to assignments table: {e}')

def alter_time_type():
    statement = f'''
    ALTER TABLE tasks
    ALTER COLUMN start_time SET DATA TYPE TIMESTAMP WITH TIME ZONE
    USING start_time AT TIME ZONE 'UTC';
    ALTER TABLE tasks
    ALTER COLUMN end_time SET DATA TYPE TIMESTAMP WITH TIME ZONE
    USING end_time AT TIME ZONE 'UTC';
    '''

    try:
        sync_db_util.execute_query_insert(statement)
        print("Time columns data type successfully edited")
    except Exception as e:
        print(f'Error editing time column data type: {e}')

if __name__ == "__main__":
    alter_time_type()