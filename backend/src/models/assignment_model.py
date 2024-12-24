from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class Assignment(BaseModel):
    assignment_id: Optional[int] = None
    task_id: Optional[str] = None
    user_id: Optional[str] = None
    assigned_by: Optional[str] = None