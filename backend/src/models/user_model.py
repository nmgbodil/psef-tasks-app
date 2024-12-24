from typing import Optional
from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    USER = 'User'
    COORDINATOR = 'Coordinator'

class User(BaseModel):
    user_id: Optional[str] = None
    password_hash: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    verified: Optional[bool] = None
    role: Optional[UserRole] = None