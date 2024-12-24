import os
from flask import current_app
from datetime import datetime

from src.models.task_model import Task, TaskStatus
from src.models.user_model import User, UserRole
from src.models.assignment_model import Assignment
from src.dals import task_dal
from src.dals import user_dal
from src.dals import assignment_dal

def create_task(user_id: str, task: Task):    
    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'

        if task_dal.check_task_exists(task):
            return 'task exists'

        task.status = TaskStatus.PENDING

        task_dal.create_task(task)
        return 'task successfully created'
    
    except Exception as e:
        print(f'Error creating task: {str(e)}')
        return 'error'
    
def assign_task(user_id: str, assignee_id: str, task_id: str):
    try:
        # Access control for coordinators only
        assigner = user_dal.get_user_by_id(user_id)
        if assigner.role != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        if assignment_dal.check_assignment_exists(task_id, assignee_id):
            return 'assignment already exists'
        
        task = task_dal.get_task_by_id(task_id)

        if not assignment_dal.check_user_free_at_time(assignee_id, task.start_time, task.end_time):
            return 'assignee not free'
        
        if not task.max_participants or assignment_dal.get_task_assignment_count(task_id) < task.max_participants:
            assignment = Assignment(
                task_id=task_id,
                user_id=assignee_id,
                assigned_by=assigner.email
            )

            assignment_dal.assign_task(assignment)
            return 'assignment successfully created'
        
        else:
            return 'maximum participants reached'
        
    except Exception as e:
        print(f'Error making assignment: {str(e)}')
        return 'error'
    
def delete_task(user_id: str, task_id: str):
    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        task_dal.delete_task(task_id)
        return 'task successfully deleted'
    
    except Exception as e:
        print(f'Error deleting task: {str(e)}')
        return 'error'

def delete_assignment(user_id: str, assignment_id: str):
    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        assignment_dal.delete_assignment(assignment_id)
        return 'assignment successfully deleted'
    
    except Exception as e:
        print(f'Error deleting assignment: {str(e)}')
        return 'error'
    
def update_task(user_id: str, updates: dict, task_id: str):
    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'
        
        task_dal.update_task(task_id, updates)
        return 'task successfully updated'
    
    except Exception as e:
        print(f'Error updating task: {str(e)}')
        return 'error'

def update_assignment(user_id: str, assignee_id: str, assignment_id: str):
    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            return 'user unauthorized'

        assignment = assignment_dal.get_assignment_by_id(assignment_id)
        if assignment_dal.check_assignment_exists(assignment.task_id, assignee_id):
            return 'assignment already exists'
        
        task = task_dal.get_task_by_id(assignment.task_id)
        if not assignment_dal.check_user_free_at_time(assignee_id, task.start_time, task.end_time):
            return 'assignee not free'
        
        assignment_dal.update_assignment(assignment_id, assignee_id)
        return 'assignment successfully updated'
    
    except Exception as e:
        print(f'Error updating assignment: {str(e)}')
        return 'error'

def get_all_tasks(user_id: str):
    results = {'message': None, 'task_list': None}

    try:
        # Access control for coordinators only
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            results['message'] = 'user_unauthorized'
            return results
        
        results['task_list'] = task_dal.get_all_tasks()
        results['message'] = 'tasks successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving all tasks: {str(e)}')
        return 'error'

def get_all_assignments(user_id):
    results = {'message': None, 'assignment_list': None}

    try:
        # Access control (Only coordinators can drop others tasks)
        if user_dal.get_user_role(user_id) != UserRole.COORDINATOR:
            results['message'] = 'user_unauthorized'
            return results
        
        results['assignment_list'] = assignment_dal.get_all_assignments()
        results['message'] = 'assignments successfully retrieved'
        return results
    
    except Exception as e:
        print(f'Error retrieving all assignments: {str(e)}')
        return 'error'