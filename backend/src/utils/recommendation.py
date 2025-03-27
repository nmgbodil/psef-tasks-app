from src.utils.db.sync_db_util import execute_query_fetchall

def recommend_tasks_for_user(user_id):
    """
    Recommend tasks for a user based on predefined rules.
    Replace this logic with ML-based recommendations if needed.
    """
    try:
        # Example rule-based logic: Recommend tasks with fewer participants
        query = """
        SELECT task_id, task_name, task_type, description, start_time, end_time
        FROM tasks
        WHERE max_participants > (
            SELECT COUNT(*) FROM assignments WHERE assignments.task_id = tasks.task_id
        )
        ORDER BY start_time ASC
        LIMIT 5;
        """
        recommended_tasks = execute_query_fetchall(query)
        return [
            {
                "task_id": task[0],
                "task_name": task[1],
                "task_type": task[2],
                "description": task[3],
                "start_time": task[4],
                "end_time": task[5],
            }
            for task in recommended_tasks
        ]
    except Exception as e:
        print(f"Error fetching recommended tasks: {e}")
        return []

def recommend_tasks_with_ml(user_id):
    """
    Placeholder for ML-based task recommendation.
    Train and load a model to generate recommendations.
    """
    # Example: Load a pre-trained model and make predictions
    # model = load_model("path/to/model.pkl")
    # user_features = get_user_features(user_id)
    # recommendations = model.predict(user_features)
    return []
