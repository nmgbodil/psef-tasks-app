from src.models.task_model import Task

def calculate_task_analytics(user_id):
    tasks = Task.query.filter_by(user_id=user_id).all()
    completed_tasks = [task for task in tasks if task.status == "completed"]
    return {
        "total_tasks": len(tasks),
        "completed_tasks": len(completed_tasks),
        "completion_rate": len(completed_tasks) / len(tasks) if tasks else 0,
    }
