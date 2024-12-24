from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = 'Pending'
    COMPLETED = 'Completed'

class Task(BaseModel):
    task_id: Optional[int] = None
    task_name: Optional[str] = None
    task_type: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    max_participants: Optional[int] = None
    status: Optional[TaskStatus] = None