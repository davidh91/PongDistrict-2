import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User, Base

# Connect to the local SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./pongdistrict.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_dummies():
    db = SessionLocal()
    
    dummies = [
        {"username": "The Wall", "email": "wall@pongdistrict.dev"},
        {"username": "Spin Doctor", "email": "spin@pongdistrict.dev"},
        {"username": "Paddle Pro", "email": "pro@pongdistrict.dev"}
    ]
    
    print("Checking for existing dummy players...")
    for dummy in dummies:
        existing = db.query(User).filter(User.username == dummy["username"]).first()
        if not existing:
            # Generate a random ID (Zitadel style usually, but UUID works for dummy)
            u_id = "dummy_" + str(uuid.uuid4())[:8]
            user = User(
                id=u_id,
                username=dummy["username"],
                email=dummy["email"],
                elo=1200,
                hashed_password="dummy_password_no_login"
            )
            db.add(user)
            print(f"Added player: {dummy['username']}")
        else:
            print(f"Player already exists: {dummy['username']}")
            
    db.commit()
    db.close()
    print("Done!")

if __name__ == "__main__":
    add_dummies()
