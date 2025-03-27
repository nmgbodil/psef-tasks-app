from src.utils.db import sync_db_util
from src.models.assignment_model import Assignment, Status

def get_assignment_by_id(assignment_id):
    statement = f'''SELECT * FROM assignments WHERE assignment_id = '{assignment_id}';'''

    assignment_id, task_id, user_id, assigned_by, updated_at, status = sync_db_util.execute_query_fetchone(statement)

    assignment = Assignment(
        assignment_id=assignment_id,
        task_id=task_id,
        user_id=user_id,
        assigned_by=assigned_by,
        status=status
    )

    return assignment

def get_task_assignment_count(task_id):
    statement = f'''SELECT COUNT(*) FROM assignments WHERE task_id = '{task_id}';'''

    record = sync_db_util.execute_query_fetchone(statement)

    return record[0]

def get_my_assignments(user_id):
    statement = f'''SELECT a.assignment_id, a.task_id, t.task_name, t.task_type, t.description, t.max_participants, t.start_time, t.end_time
    FROM assignments a
    INNER JOIN tasks t ON a.task_id = t.task_id
    WHERE a.user_id = '{user_id}'
    AND t.start_time >= CURRENT_TIMESTAMP
    ORDER BY t.start_time ASC;
    '''

    user_tasks = sync_db_util.execute_query_fetchall(statement)

    return user_tasks

def get_my_pending_assignments(user_id):
    # print(Status.PENDING == 'Pending')
    statement = f'''SELECT a.assignment_id, a.task_id, t.task_name, t.task_type, t.description, t.max_participants, t.start_time, t.end_time
    FROM assignments a
    INNER JOIN tasks t ON a.task_id = t.task_id
    WHERE a.user_id = '{user_id}'
    AND t.end_time < CURRENT_TIMESTAMP
    AND a.status = 'Pending'
    ORDER BY t.start_time ASC;
    '''

    pending_user_tasks = sync_db_util.execute_query_fetchall(statement)

    return pending_user_tasks

def check_assignment_exists(task_id, user_id):
    statement = f'''SELECT EXISTS(SELECT 1 FROM assignments WHERE task_id = '{task_id}' and user_id = '{user_id}');'''

    record = sync_db_util.execute_query_fetchone(statement)

    return record[0]

def check_user_free_at_time(user_id, start_time, end_time):
    statement = f'''SELECT COUNT(*) AS overlap_count FROM assignments as a
    JOIN tasks AS t ON a.task_id = t.task_id
    WHERE a.user_id = '{user_id}' AND (
    t.start_time < '{end_time}'
    AND t.end_time > '{start_time}'
    );
    '''

    record = sync_db_util.execute_query_fetchone(statement)

    return record[0] == 0

def assign_task(assignment: Assignment):
    statement = f'''INSERT INTO assignments (task_id, user_id, assigned_by)
    VALUES('{assignment.task_id}', '{assignment.user_id}', '{assignment.assigned_by}');
    '''

    sync_db_util.execute_query_insert(statement)

def delete_assignment(assignment_id):
    statement = f'''DELETE FROM assignments WHERE assignment_id = '{assignment_id}';'''

    sync_db_util.execute_query_insert(statement)

def update_assignment(assignment_id, user_id):
    statement = f'''UPDATE assignments SET user_id = '{user_id}' WHERE assignment_id = '{assignment_id}';'''

    set_assignment_updated_at(assignment_id)

    sync_db_util.execute_query_return_row_count(statement)

def update_status(assignment_id, status):
    statement = f'''UPDATE assignments SET status = '{status}' WHERE assignment_id = '{assignment_id}';'''

    set_assignment_updated_at(assignment_id)

    sync_db_util.execute_query_return_row_count(statement)

def set_assignment_updated_at(assignment_id):
    statement = f'''UPDATE assignments SET updated_at = CURRENT_TIMESTAMP WHERE assignment_id = '{assignment_id}';'''

    affected_rows = sync_db_util.execute_query_return_row_count(statement)

    return affected_rows

def get_user_task_interactions(user_id=None):
    """
    Fetch user-task interaction data from the assignments table.
    If user_id is provided, fetch interactions for that specific user.
    """
    if user_id:
        query = f"""
        SELECT user_id, task_id
        FROM assignments
        WHERE user_id = '{user_id}';
        """
    else:
        query = """
        SELECT user_id, task_id
        FROM assignments;
        """
    return sync_db_util.execute_query_fetchall(query)