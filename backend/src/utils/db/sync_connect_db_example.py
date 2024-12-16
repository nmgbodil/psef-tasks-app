import os
from psycopg2 import pool
from dotenv import load_dotenv

# Load variables from the .env file
load_dotenv()

def get_db_info():
    # Get the connection string from the environment variable
    connection_string = os.environ.get("DB_URL")

    if not connection_string:
        raise ValueError("DB_URL environment variable not set")
    
    # Create a connection pool
    connection_pool = pool.SimpleConnectionPool(
        1,  # Minimum number of connections in the pool
        10,  # Maximum number of connections in the pool
        connection_string
    )

    # Check if the pool was created successfully
    if not connection_pool:
        raise Exception("Connection pool creation failed")

    try:
        print("Connection pool created successfully")

        # Get a connection from the pool
        conn = connection_pool.getconn()

        # Create a cursor object
        cur = conn.cursor()

        # Execute SQL commands to retrieve the current time and version from PostgreSQL
        cur.execute('SELECT NOW();')
        current_time = cur.fetchone()[0]

        cur.execute('SELECT version();')
        postgres_version = cur.fetchone()

        # Close the cursor and return the connection to the pool
        cur.close()
        connection_pool.putconn(conn)
    finally:
        # Close all connections in the pool
        connection_pool.closeall()

    return {
        'current_time': current_time,
        'postgres_version': postgres_version
    }
