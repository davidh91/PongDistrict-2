from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: str

class UserRegister(UserBase):
    password: str
    password_repeat: str

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
class UserUpdate(BaseModel):
    username: str

class User(UserBase):
    id: str
    elo: int
    
    class Config:
        orm_mode = True

class MatchCreate(BaseModel):
    winner_id: str
    loser_id: str

class Match(BaseModel):
    id: int
    timestamp: datetime
    winner_id: str
    loser_id: str
    winner_elo_before: int
    winner_elo_after: int
    loser_elo_before: int
    loser_elo_after: int
    winner: User
    loser: User
    
    class Config:
        orm_mode = True
