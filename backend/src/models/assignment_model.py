from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class Status(str, Enum):
    PENDING = 'Pending'
    COMPLETED = 'Completed'
    INCOMPLETED = 'Incompleted'

class Assignment(BaseModel):
    assignment_id: Optional[int] = None
    task_id: Optional[int] = None
    task_name: Optional[str] = None
    description: Optional[str] = None
    user_id: Optional[str] = None
    assigned_by: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[Status] = None