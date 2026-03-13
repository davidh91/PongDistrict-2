import random
import string
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User, Match, Base

# Connect to the local SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./pongdistrict.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Create 15 dummy users
    users = []
    print("Creating dummy users...")
    for i in range(15):
        # Generate random Zitadel-like ID
        u_id = "dummy_" + ''.join(random.choices(string.digits, k=15))
        username = f"Player_{i+1}"
        email = f"player{i+1}@example.com"
        
        # Give them random starting ELOs for variety
        start_elo = random.randint(1000, 1600)
        
        user = User(id=u_id, username=username, email=email, elo=start_elo)
        db.add(user)
        users.append(user)
    
    db.commit()
    print(f"Added {len(users)} users.")

    # Create 50 dummy matches
    print("Creating dummy matches...")
    for _ in range(50):
        # Pick two random unique players
        p1, p2 = random.sample(users, 2)
        
        # Random outcome
        winner = p1 if random.choice([True, False]) else p2
        loser = p2 if winner == p1 else p1
        
        winner_elo_before = winner.elo
        loser_elo_before = loser.elo
        
        # Calculate new Elo (simple version of the internal logic)
        expected_winner = 1 / (1 + 10 ** ((loser_elo_before - winner_elo_before) / 400))
        expected_loser = 1 / (1 + 10 ** ((winner_elo_before - loser_elo_before) / 400))
        
        new_winner_elo = int(winner_elo_before + 32 * (1 - expected_winner))
        new_loser_elo = int(loser_elo_before + 32 * (0 - expected_loser))
        
        # Update user dicts
        winner.elo = new_winner_elo
        loser.elo = new_loser_elo
        
        # Random past date within the last 30 days
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        match_time = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)
        
        match = Match(
            timestamp=match_time,
            winner_id=winner.id,
            loser_id=loser.id,
            winner_elo_before=winner_elo_before,
            winner_elo_after=new_winner_elo,
            loser_elo_before=loser_elo_before,
            loser_elo_after=new_loser_elo
        )
        db.add(match)
        
    db.commit()
    db.close()
    print("Successfully seeded database with users and matches!")

if __name__ == "__main__":
    seed_db()
