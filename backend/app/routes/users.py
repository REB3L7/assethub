from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(

    prefix="/users",

    tags=["Users"]

)

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()

@router.post("/", response_model=UserResponse)

def create_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:

        raise HTTPException(

            status_code=400,

            detail="A user with this email already exists"

        )

    new_user = User(

        name=user.name,

        email=user.email,

        department=user.department

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user

@router.get("/", response_model=list[UserResponse])

def get_users(db: Session = Depends(get_db)):

    return db.query(User).all()