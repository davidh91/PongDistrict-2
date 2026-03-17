from fastapi import FastAPI, Depends, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from typing import List
import os
import re
import secrets
import uuid

import elo
import models
import schemas
from database import engine, get_db
from auth import (
    get_current_user_id,
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from datetime import timedelta

# Create all database tables
models.Base.metadata.create_all(bind=engine)

FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = "none" if COOKIE_SECURE else "lax"
RATE_LIMIT_STORAGE_URI = os.getenv("RATE_LIMIT_STORAGE_URI", "memory://")

limiter = Limiter(key_func=get_remote_address, storage_uri=RATE_LIMIT_STORAGE_URI)
app = FastAPI(title="PongDistrict API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _validate_origin(request: Request) -> None:
    # Enforce exact origin allow-list on state-changing requests.
    origin = request.headers.get("origin")
    if not origin or origin not in FRONTEND_ORIGINS:
        raise HTTPException(status_code=403, detail="Origin not allowed")


def _validate_csrf(request: Request) -> None:
    csrf_cookie = request.cookies.get("csrf_token")
    csrf_header = request.headers.get("x-csrf-token")
    if not csrf_cookie or not csrf_header:
        raise HTTPException(status_code=403, detail="CSRF token missing")
    if not secrets.compare_digest(csrf_cookie, csrf_header):
        raise HTTPException(status_code=403, detail="CSRF token invalid")


def require_csrf(request: Request) -> None:
    _validate_origin(request)
    _validate_csrf(request)


@app.get("/leaderboard", response_model=List[schemas.PublicUser])
def get_leaderboard(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = (
        db.query(models.User)
        .order_by(models.User.elo.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return users


@app.get("/matches", response_model=List[schemas.PublicMatch])
def get_matches(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    matches = (
        db.query(models.Match)
        .order_by(models.Match.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return matches


def validate_password(password: str):
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character")
    return True


@app.post("/register", response_model=schemas.User)
@limiter.limit("5/minute")
def register_user(
    request: Request, user: schemas.UserRegister, db: Session = Depends(get_db)
):
    if user.password != user.password_repeat:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    try:
        validate_password(user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    db_user_email = (
        db.query(models.User).filter(models.User.email == user.email).first()
    )
    db_user_username = (
        db.query(models.User).filter(models.User.username == user.username).first()
    )

    if db_user_email or db_user_username:
        raise HTTPException(
            status_code=400, detail="Username or email already registered"
        )

    hashed_password = get_password_hash(user.password)
    # Generate unique UUID for new user
    user_id = str(uuid.uuid4())

    new_user = models.User(
        id=user_id,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        elo=1200,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/token")
@limiter.limit("10/minute")
def login_for_access_token(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # form_data.username can be either username or email in our implementation
    user = (
        db.query(models.User)
        .filter(
            (models.User.username == form_data.username)
            | (models.User.email == form_data.username)
        )
        .first()
    )

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {"message": "Login successful"}


@app.post("/logout")
def logout(response: Response, _: None = Depends(require_csrf)):
    response.delete_cookie("access_token")
    response.delete_cookie("csrf_token")
    return {"message": "Logged out"}


@app.get("/users/me", response_model=schemas.User)
def read_current_user(
    user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/users/me", response_model=schemas.User)
def update_user(
    update_data: schemas.UserUpdate,
    _: None = Depends(require_csrf),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = (
        db.query(models.User)
        .filter(models.User.username == update_data.username)
        .first()
    )
    if existing_user and existing_user.id != user_id:
        raise HTTPException(status_code=400, detail="Username already taken")

    user.username = update_data.username
    db.commit()
    db.refresh(user)
    return user


@app.post("/matches", response_model=schemas.Match)
def record_match(
    match: schemas.MatchCreate,
    _: None = Depends(require_csrf),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if user_id not in {match.winner_id, match.loser_id}:
        raise HTTPException(
            status_code=403,
            detail="You can only record matches involving your own account",
        )

    winner = db.query(models.User).filter(models.User.id == match.winner_id).first()
    loser = db.query(models.User).filter(models.User.id == match.loser_id).first()

    if not winner or not loser:
        raise HTTPException(status_code=404, detail="Winner or loser not found")

    if winner.id == loser.id:
        raise HTTPException(
            status_code=400, detail="A user cannot play against themselves"
        )

    winner_elo_before = winner.elo
    loser_elo_before = loser.elo

    # Calculate new ELOs
    new_winner_elo, new_loser_elo = elo.calculate_elo(
        winner_elo_before, loser_elo_before
    )

    # Update users
    winner.elo = new_winner_elo
    loser.elo = new_loser_elo

    # Record match
    new_match = models.Match(
        winner_id=winner.id,
        loser_id=loser.id,
        winner_elo_before=winner_elo_before,
        winner_elo_after=new_winner_elo,
        loser_elo_before=loser_elo_before,
        loser_elo_after=new_loser_elo,
    )
    db.add(new_match)
    db.commit()
    db.refresh(new_match)

    return new_match
