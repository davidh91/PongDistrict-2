from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import re
import uuid

import models, schemas, elo
from database import engine, get_db
from auth import get_current_user_id, verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PongDistrict API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/leaderboard", response_model=List[schemas.User])
def get_leaderboard(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.elo.desc()).offset(skip).limit(limit).all()
    return users

@app.get("/matches", response_model=List[schemas.Match])
def get_matches(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    matches = db.query(models.Match).order_by(models.Match.timestamp.desc()).offset(skip).limit(limit).all()
    return matches

def validate_password(password: str):
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character")
    return True

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    if user.password != user.password_repeat:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    try:
        validate_password(user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    db_user_email = db.query(models.User).filter(models.User.email == user.email).first()
    db_user_username = db.query(models.User).filter(models.User.username == user.username).first()
    
    if db_user_email or db_user_username:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = get_password_hash(user.password)
    # Generate unique UUID for new user
    user_id = str(uuid.uuid4())
    
    new_user = models.User(
        id=user_id, 
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password,
        elo=1200
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # form_data.username can be either username or email in our implementation
    user = db.query(models.User).filter(
        (models.User.username == form_data.username) | (models.User.email == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_current_user(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/me", response_model=schemas.User)
def update_user(update_data: schemas.UserUpdate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing_user = db.query(models.User).filter(models.User.username == update_data.username).first()
    if existing_user and existing_user.id != user_id:
        raise HTTPException(status_code=400, detail="Username already taken")
        
    user.username = update_data.username
    db.commit()
    db.refresh(user)
    return user

@app.post("/matches", response_model=schemas.Match)
def record_match(match: schemas.MatchCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    winner = db.query(models.User).filter(models.User.id == match.winner_id).first()
    loser = db.query(models.User).filter(models.User.id == match.loser_id).first()
    
    if not winner or not loser:
        raise HTTPException(status_code=404, detail="Winner or loser not found")
        
    if winner.id == loser.id:
        raise HTTPException(status_code=400, detail="A user cannot play against themselves")

    winner_elo_before = winner.elo
    loser_elo_before = loser.elo

    # Calculate new ELOs
    new_winner_elo, new_loser_elo = elo.calculate_elo(winner_elo_before, loser_elo_before)

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
        loser_elo_after=new_loser_elo
    )
    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    
    return new_match
