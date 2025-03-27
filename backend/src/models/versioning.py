from datetime import datetime
from src.utils.db.sync_db_util import execute_query_insert

class TaskVersion:
    @staticmethod
    def create_version(task_id, data):
        """
        Creates a new version of a task by inserting it into the task_versions table.
        """
        query = f"""
        INSERT INTO task_versions (task_id, version_data, created_at)
        VALUES ('{task_id}', '{data}', '{datetime.utcnow()}');
        """
        try:
            execute_query_insert(query)
        except Exception as e:
            print(f"Error creating task version: {e}")
