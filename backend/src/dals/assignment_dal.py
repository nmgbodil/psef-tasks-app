from src.utils.db import sync_db_util
from src.models.assignment_model import Assignment

def get_assignment_by_id(assignment_id):
    statement = f'''SELECT * FROM assignments WHERE assignment_id = '{assignment_id}';'''

    assignment_id, task_id, user_id, assigned_by, updated_at = sync_db_util.execute_query_fetchone(statement)

    assignment = Assignment(
        assignment_id=assignment_id,
        task_id=task_id,
        user_id=user_id,
        assigned_by=assigned_by
    )

    return assignment

def get_task_assignment_count(task_id):
    statement = f'''SELECT COUNT(*) FROM assignments WHERE task_id = '{task_id}';'''

    record = sync_db_util.execute_query_fetchone(statement)

    return record[0]

def get_all_assignments():
    statement = f'''SELECT a.assignment_id, a.task_id, t.task_name, t.description, a.user_id, a.assigned_by, t.start_time, t.end_time
    FROM assignments a
    INNER JOIN tasks t ON a.task_id = t.task_id
    WHERE t.start_time >= CURRENT_TIMESTAMP
    ORDER BY t.start_time ASC;
    '''

    assignments = sync_db_util.execute_query_fetchall(statement)
    assignment_list = []

    for assignment in assignments:
        assignment_obj = Assignment(
            assignment_id=assignment[0],
            task_id=assignment[1],
            task_name=assignment[2],
            description=assignment[3],
            user_id=assignment[4],
            assigned_by=assignment[5],
            start_time=assignment[6],
            end_time=assignment[7]
        )
        assignment_list.append(assignment_obj.dict())
    
    return assignment_list

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

def set_assignment_updated_at(assignment_id):
    statement = f'''UPDATE assignments SET updated_at = CURRENT_TIMESTAMP WHERE assignment_id = '{assignment_id}';'''

    affected_rows = sync_db_util.execute_query_return_row_count(statement)

    return affected_rows