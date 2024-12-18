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

if __name__ == "__main__":
    create_user_table()