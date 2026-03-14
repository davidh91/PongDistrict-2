from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: EmailStr

    @validator("username")
    def validate_username(cls, value: str) -> str:
        username = value.strip()
        if len(username) < 3 or len(username) > 32:
            raise ValueError("Username must be between 3 and 32 characters")
        return username

    @validator("email")
    def normalize_email(cls, value: str) -> str:
        return value.lower()


class UserRegister(UserBase):
    password: str
    password_repeat: str

    @validator("password", "password_repeat")
    def validate_password_length(cls, value: str) -> str:
        if len(value) < 8 or len(value) > 128:
            raise ValueError("Password must be between 8 and 128 characters")
        return value


class UserLogin(BaseModel):
    username_or_email: str
    password: str

    @validator("username_or_email")
    def validate_identifier(cls, value: str) -> str:
        identifier = value.strip()
        if len(identifier) < 3 or len(identifier) > 320:
            raise ValueError("Username or email is invalid")
        return identifier

    @validator("password")
    def validate_login_password(cls, value: str) -> str:
        if len(value) < 8 or len(value) > 128:
            raise ValueError("Password must be between 8 and 128 characters")
        return value


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class UserUpdate(BaseModel):
    username: str

    @validator("username")
    def validate_updated_username(cls, value: str) -> str:
        username = value.strip()
        if len(username) < 3 or len(username) > 32:
            raise ValueError("Username must be between 3 and 32 characters")
        return username


class User(UserBase):
    id: str
    elo: int

    class Config:
        orm_mode = True


class PublicUser(BaseModel):
    id: str
    username: str
    elo: int

    class Config:
        orm_mode = True


class MatchCreate(BaseModel):
    winner_id: str
    loser_id: str

    @validator("winner_id", "loser_id")
    def validate_user_ids(cls, value: str) -> str:
        user_id = value.strip()
        if not user_id or len(user_id) > 64:
            raise ValueError("User ID is invalid")
        return user_id


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


class PublicMatch(BaseModel):
    id: int
    timestamp: datetime
    winner_id: str
    loser_id: str
    winner_elo_before: int
    winner_elo_after: int
    loser_elo_before: int
    loser_elo_after: int
    winner: PublicUser
    loser: PublicUser

    class Config:
        orm_mode = True
