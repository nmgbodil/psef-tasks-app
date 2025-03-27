from src.utils.db import sync_db_util
from src.models.task_model import Task

def get_task_by_id(task_id):
    statement = f'''SELECT * FROM tasks WHERE task_id = '{task_id}';'''

    task_id, task_name, task_type, description, start_time, end_time, max_participants, created_at, updated_at = sync_db_util.execute_query_fetchone(statement)

    task = Task(
        task_id=task_id,
        task_name=task_name,
        task_type=task_type,
        description=description,
        start_time=start_time,
        end_time=end_time,
        max_participants=max_participants
    )

    return task

def get_all_tasks():
    statement = f'''SELECT t.task_id AS task_name,
    t.task_name AS task_name,
    t.task_type AS task_type,
    t.description AS description,
    t.start_time AS start_time,
    t.end_time AS end_time,
    t.max_participants AS max_participants,
    string_agg(a.user_id || ':' || a.assignment_id, ',') AS user_assignments
    FROM tasks t
    LEFT JOIN assignments a ON t.task_id = a.task_id
    WHERE t.start_time >= CURRENT_TIMESTAMP
    GROUP BY t.task_id
    ORDER BY t.start_time;
    '''

    tasks = sync_db_util.execute_query_fetchall(statement)

    return tasks

def check_task_exists(task: Task):
    statement = f'''SELECT EXISTS(
    SELECT 1 FROM tasks WHERE task_name = '{task.task_name}'
    AND task_type = '{task.task_type}'
    AND description = '{task.description}'
    AND start_time = '{task.start_time}'
    AND end_time = '{task.end_time}'
    );
    '''

    record = sync_db_util.execute_query_fetchone(statement)

    return record[0]

def create_task(task: Task):
    statement = f'''INSERT INTO tasks (task_name, task_type, description, start_time, end_time, max_participants)
    VALUES('{task.task_name}', '{task.task_type}', '{task.description}', '{task.start_time}', '{task.end_time}', {task.max_participants if task.max_participants is not None else "NULL"});
    '''

    sync_db_util.execute_query_insert(statement)

def delete_task(task_id):
    statement = f'''DELETE FROM tasks WHERE task_id = '{task_id}';'''

    sync_db_util.execute_query_return_row_count(statement)

def update_task(task_id, updates: dict):
    update_query = [f"{key} = '{value}'" for key, value in updates.items()]

    statement = f'''UPDATE tasks SET {', '.join(update_query)} WHERE task_id = '{task_id}';'''

    set_task_updated_at(task_id)

    sync_db_util.execute_query_return_row_count(statement)

def set_task_updated_at(task_id):
    statement = f'''UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE task_id = '{task_id}';'''

    affected_rows = sync_db_util.execute_query_return_row_count(statement)

    # Should return 0 if the task_id does not exist, else should return 1
    return affected_rows

def get_task_metadata():
    """
    Fetch task metadata from the tasks table.
    Only includes tasks with a start time in the future.
    """
    query = """
    SELECT task_id, task_name, task_type, description
    FROM tasks
    WHERE start_time >= CURRENT_TIMESTAMP;
    """
    return sync_db_util.execute_query_fetchall(query)