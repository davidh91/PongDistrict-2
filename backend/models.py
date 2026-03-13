from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) 
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    elo = Column(Integer, default=1200)
    
    matches_won = relationship("Match", foreign_keys="[Match.winner_id]", back_populates="winner")
    matches_lost = relationship("Match", foreign_keys="[Match.loser_id]", back_populates="loser")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    winner_id = Column(String, ForeignKey('users.id'))
    loser_id = Column(String, ForeignKey('users.id'))
    
    winner_elo_before = Column(Integer)
    winner_elo_after = Column(Integer)
    loser_elo_before = Column(Integer)
    loser_elo_after = Column(Integer)
    
    winner = relationship("User", foreign_keys=[winner_id], back_populates="matches_won")
    loser = relationship("User", foreign_keys=[loser_id], back_populates="matches_lost")
