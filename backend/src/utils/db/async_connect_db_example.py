import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def get_db_info():
    # Get the connection string from the environment variable
    connection_string = os.environ.get("DB_URL")

    if not connection_string:
        raise ValueError("DB_URL environment variable not set")

    # Create a connection pool
    pool = await asyncpg.create_pool(connection_string)

    # Acquire a connection from the pool
    async with pool.acquire() as conn:
        # Execute SQL commands to retrieve the current time and version from PostgreSQL
        current_time = await conn.fetchval('SELECT NOW();')
        postgres_version = await conn.fetchval('SELECT version();')

    # Close the pool
    await pool.close()

    return {
        'current_time': current_time,
        'postgres_version': postgres_version
    }
