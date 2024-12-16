import os
from psycopg2 import pool
from dotenv import load_dotenv

# Initialize connection pool globally
connection_pool = None

# Load variables from the .env file
load_dotenv()

def init_db_pool():
    global connection_pool
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
    else:
        print("Connection pool created successfully")

def get_connection():
    global connection_pool
    if connection_pool is None:
        init_db_pool()
    return connection_pool.getconn()

def release_connection(conn):
    global connection_pool
    if connection_pool:
        connection_pool.putconn(conn)

def execute_query_fetchall(query):
    conn = None
    try:
        conn = get_connection()

        # Create a cursor object
        cur = conn.cursor()

        cur.execute(query)
        conn.commit()
        records = cur.fetchall()

        release_connection(conn)

        return records
    
    except Exception as e:
        print(f"An error occurred: {e}")

        if conn:
            release_connection(conn)
        raise

def execute_query_fetchone(query):
    conn = None
    try:
        conn = get_connection()

        cur = conn.cursor()
        
        cur.execute(query)
        conn.commit()
        record = cur.fetchone()
        release_connection(conn)

        return record
    
    except Exception as e:
        print(f"An error occurred while trying to execute the query: {e}")
       
        if conn:
            release_connection(conn)
        raise

def execute_query_return_row_count(query):
    conn = None
    try:
        conn = get_connection()

        cur = conn.cursor()
        print(f"Executing query: {query}")
        cur.execute(query)
        conn.commit()
        affected_rows = cur.rowcount
        release_connection(conn)

        return affected_rows
    
    except Exception as e:
        print(f"An error occurred while trying to execute the query: {e}")
       
        if conn:
            release_connection(conn)
        raise

def execute_query_insert(query):
    conn = None
    try:
        conn = get_connection()

        cur = conn.cursor()
        print(f"Executing query: {query}")
        cur.execute(query)
        conn.commit()
        release_connection(conn)

        return
    
    except Exception as e:
        print(f"An error occurred while trying to execute the query: {e}")
       
        if conn:
            release_connection(conn)
        raise

# Close all connections in the pool when the application exits
def close_all_connections():
    print("Closing all database connections in the pool")
    global connection_pool
    if connection_pool:
        connection_pool.closeall()
