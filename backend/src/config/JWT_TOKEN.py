from datetime import timedelta

class Config:
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(weeks=2)